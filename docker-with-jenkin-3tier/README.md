# 3-Tier E-Commerce Starter

Stack:
- Presentation tier: React + Vite
- Application tier: Node.js + Express
- Data tier: PostgreSQL

## Requirements
- Node.js 20+
- Docker + Docker Compose (recommended), or PostgreSQL 15+

## Quick start with Docker
1. Create `.env` and add the secrets.
2. Run:
   ```bash
   docker compose up --build
   ```
3. Open:
   - Frontend: http://localhost:5173
   - Backend health: http://localhost:4000/api/health

The API creates the schema and seeds sample products on startup.

## Run without Docker
1. Create a PostgreSQL database, e.g. `ecommerce`.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
3. Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Frontend in another terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Included features
- Product catalog and product details
- Register / login using bcrypt password hashing and JWT
- Cart stored in browser localStorage
- Checkout creates an order and order items in a DB transaction
- Authenticated order history
- Server-side price lookup and stock validation
- Basic input validation and security middleware

## API endpoints
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/orders` (Bearer token)
- `GET /api/orders/my` (Bearer token)

## Production checklist
This is a learning/starter project, not a complete production commerce platform. Before production:
- Use HTTPS and managed secrets; rotate all sample secrets.
- Add email verification, password reset, rate limiting, audit logs, monitoring, backups and migrations.
- Integrate a payment provider (Stripe/Adyen/etc.) with signed webhooks. Do not store card numbers or CVVs.
- Add admin roles and protected product/inventory management.
- Add shipping, tax, refund, cancellation, idempotency, and order status workflows.
- Use a production frontend host and managed PostgreSQL.
- Review privacy, consumer, tax, and payment requirements for your jurisdiction.
