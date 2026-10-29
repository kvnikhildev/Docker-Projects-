import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, initializeDatabase } from './db.js';
import { requireAuth } from './auth.js';

const app = express();
const port = Number(process.env.PORT || 4000);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random string of at least 32 characters');
}

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/api/products', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, price_cents, image_url, stock FROM products WHERE stock > 0 ORDER BY id'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

app.get('/api/products/:id', async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid product id' });
    const { rows } = await pool.query(
      'SELECT id, name, description, price_cents, image_url, stock FROM products WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 120) return res.status(400).json({ error: 'Name must be 2–120 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return res.status(400).json({ error: 'Valid email required' });
    if (password.length < 10 || password.length > 128) return res.status(400).json({ error: 'Password must be 10–128 characters' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email is already registered' });
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const { rows } = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.post('/api/orders', requireAuth, async (req, res, next) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
    return res.status(400).json({ error: 'Order must contain 1–50 line items' });
  }

  const normalized = new Map();
  for (const item of items) {
    const id = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({ error: 'Each item needs a valid productId and quantity (1–99)' });
    }
    normalized.set(id, (normalized.get(id) || 0) + quantity);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let total = 0;
    const orderLines = [];

    for (const [productId, quantity] of normalized) {
      const { rows } = await client.query(
        'SELECT id, name, price_cents, stock FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );
      const product = rows[0];
      if (!product) throw Object.assign(new Error(`Product ${productId} not found`), { status: 400 });
      if (product.stock < quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { status: 409 });

      total += product.price_cents * quantity;
      orderLines.push({ ...product, quantity });
    }

    const { rows: orderRows } = await client.query(
      'INSERT INTO orders (user_id, total_cents) VALUES ($1, $2) RETURNING id, status, total_cents, created_at',
      [req.user.id, total]
    );
    const order = orderRows[0];

    for (const line of orderLines) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price_cents) VALUES ($1, $2, $3, $4, $5)',
        [order.id, line.id, line.name, line.quantity, line.price_cents]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [line.quantity, line.id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Could not create order' });
  } finally {
    client.release();
  }
});

app.get('/api/orders/my', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.status, o.total_cents, o.created_at,
              COALESCE(json_agg(json_build_object(
                'productId', oi.product_id, 'name', oi.product_name,
                'quantity', oi.quantity, 'unitPriceCents', oi.unit_price_cents
              )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

await initializeDatabase();
app.listen(port, () => console.log(`API listening on port ${port}`));
