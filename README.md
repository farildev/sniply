# 🔗 Sniply — URL Shortener Service

A high-performance, production-ready URL shortening service built with a Redis cache-first strategy and atomic click analytics.

## Tech Stack

* **Runtime:** Node.js + TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL
* **Cache:** Redis
* **Short code:** nanoid

## Architecture

```text
Client → Express API → Redis (cache-first)
                    ↘ PostgreSQL (cache miss)

Background Job (5 min) → Redis clicks → PostgreSQL sync
```

## Project Structure

```text
src/
├── config/
│   ├── db.ts               # PostgreSQL pool
│   └── redis.ts            # Redis client
├── controllers/
│   └── url.controller.ts   # HTTP req/res handling
├── services/
│   └── url.service.ts      # Business logic, cache strategy
├── repositories/
│   └── url.repository.ts   # SQL queries
├── middlewares/
│   └── errorHandler.ts     # Centralized error handling
├── jobs/
│   └── clickFlush.job.ts   # Redis → PostgreSQL sync
├── routes/
│   └── url.routes.ts       # Route definitions
├── types/
│   └── index.ts            # TypeScript interfaces
├── app.ts                  # Express setup
└── server.ts               # Entry point
```

## Getting Started

### Requirements

* Node.js 20+
* PostgreSQL 16+
* Redis 7+

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp .env.example .env
# Fill in the .env file with your own values

# 3. Start PostgreSQL
# macOS:
brew services start postgresql@16
# Linux:
sudo systemctl start postgresql

# 4. Start Redis
# macOS:
brew services start redis
# Linux:
sudo systemctl start redis

# 5. Create the database
psql -U postgres
```

```sql
CREATE USER sniply WITH PASSWORD 'secret';
CREATE DATABASE sniply OWNER sniply;
\q
```

```bash
# 6. Run the migration
psql -U sniply -d sniply -f migration.sql

# 7. Start the development server
npm run dev
```

### Using Docker

```bash
# Build and start everything with one command
docker compose up --build

# Run in the background
docker compose up --build -d

# Stop the services
docker compose down

# Stop the services and remove all data
docker compose down -v
```

## API Endpoints

### `POST /api/shorten` — Shorten a URL

**Request:**

```json
{
  "originalUrl": "https://example.com/very/long/url"
}
```

**Response `201`:**

```json
{
  "shortCode": "xK3mP9q",
  "shortUrl": "http://localhost:3000/xK3mP9q",
  "originalUrl": "https://example.com/very/long/url"
}
```

---

### `GET /:shortCode` — Redirect to the original URL

**Response:** `302 Found` → `originalUrl`

**Error:** `404 Not Found` — if the short code does not exist

---

### `GET /health` — Service health status

**Response `200`:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing

```bash
# Shorten a URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://google.com"}'

# Test the redirect
curl -L http://localhost:3000/xK3mP9q

# Health check
curl http://localhost:3000/health
```

## Cache Strategy

| Operation     | Redis Key            | TTL      |
| ------------- | -------------------- | -------- |
| URL cache     | `url:<shortCode>`    | 24 hours |
| Click counter | `clicks:<shortCode>` | —        |

**Cache Hit:** Redis → `INCR clicks` → `302 redirect`

**Cache Miss:** PostgreSQL → repopulate Redis → `INCR clicks` → `302 redirect`

**Click Flush:** Every 5 minutes, `clicks:*` keys are synchronized to PostgreSQL using atomic `GETDEL` operations.

## Scripts

```bash
npm run dev      # Start the development server with ts-node-dev
npm run build    # Compile TypeScript → JavaScript (dist/)
npm start        # Start the production server (dist/server.js)
```
