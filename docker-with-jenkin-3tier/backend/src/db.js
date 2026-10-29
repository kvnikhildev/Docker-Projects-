import pg from 'pg';

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      image_url TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(id),
      product_name VARCHAR(180) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count === 0) {
    await pool.query(`
      INSERT INTO products (name, description, price_cents, image_url, stock) VALUES
      ('Everyday Backpack', 'A durable everyday backpack with a padded laptop sleeve.', 4999, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900', 25),
      ('Wireless Headphones', 'Comfortable over-ear headphones for work and travel.', 7999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900', 18),
      ('Classic Watch', 'A clean, versatile watch for everyday wear.', 10999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900', 12),
      ('Ceramic Mug', 'A simple ceramic mug for your morning coffee.', 1599, 'https://images.unsplash.com/photo-1514228742587-6b1558f0e?auto=format&fit=crop&w=900', 40)
    `);
  }
}
