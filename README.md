# 🔗 Sniply — URL Shortener Service

Yüksək performanslı, production-ready URL qısaltma servisi. Redis cache-first strategiyası və atomik klik analitikası ilə işləyir.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Cache:** Redis
- **Short code:** nanoid

## Arxitektura

```
Client → Express API → Redis (cache-first)
                    ↘ PostgreSQL (cache miss)

Background Job (5 dəq) → Redis clicks → PostgreSQL sync
```

## Qovluq Strukturu

```
src/
├── config/
│   ├── db.ts               # PostgreSQL pool
│   └── redis.ts            # Redis client
├── controllers/
│   └── url.controller.ts   # HTTP req/res
├── services/
│   └── url.service.ts      # Biznes məntiqi, cache strategiyası
├── repositories/
│   └── url.repository.ts   # SQL sorğular
├── middlewares/
│   └── errorHandler.ts     # Mərkəzi xəta idarəetməsi
├── jobs/
│   └── clickFlush.job.ts   # Redis → PostgreSQL sync
├── routes/
│   └── url.routes.ts       # Route tərifləri
├── types/
│   └── index.ts            # TypeScript interfaceləri
├── app.ts                  # Express setup
└── server.ts               # Entry point
```

## Başlamaq

### Tələblər

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Local Dev

```bash
# 1. Asılılıqları qur
npm install

# 2. Environment faylını hazırla
cp .env.example .env
# .env faylını öz dəyərlərinlə doldur

# 3. PostgreSQL servisini başlat
# macOS:
brew services start postgresql@16
# Linux:
sudo systemctl start postgresql

# 4. Redis servisini başlat
# macOS:
brew services start redis
# Linux:
sudo systemctl start redis

# 5. Verilənlər bazasını yarat
psql -U postgres
```

```sql
CREATE USER sniply WITH PASSWORD 'secret';
CREATE DATABASE sniply OWNER sniply;
\q
```

```bash
# 6. Migration-u işlət
psql -U sniply -d sniply -f migration.sql

# 7. Dev server-i başlat
npm run dev
```

### Docker ilə

```bash
# Hamısını bir əmrlə qur və başlat
docker compose up --build

# Arxa planda
docker compose up --build -d

# Dayandır
docker compose down

# Məlumatları da sil
docker compose down -v
```

## API Endpointləri

### `POST /api/shorten` — Link qısalt

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

### `GET /:shortCode` — Yönləndir

**Response:** `302 Found` → `originalUrl`

**Xəta:** `404 Not Found` — shortCode mövcud deyilsə

---

### `GET /health` — Servis statusu

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Test

```bash
# Link qısalt
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://google.com"}'

# Redirect
curl -L http://localhost:3000/xK3mP9q

# Health check
curl http://localhost:3000/health
```

## Cache Strategiyası

| Əməliyyat | Redis Key | TTL |
|---|---|---|
| URL cache | `url:<shortCode>` | 24 saat |
| Klik sayğacı | `clicks:<shortCode>` | — |

**Cache Hit:** Redis → `INCR clicks` → `302 redirect`

**Cache Miss:** PostgreSQL → Redis repopulate → `INCR clicks` → `302 redirect`

**Click Flush:** Hər 5 dəqiqədən bir `clicks:*` keyləri PostgreSQL-ə yazılır (`GETDEL` ilə atomik)

## Scripts

```bash
npm run dev      # ts-node-dev ilə development server
npm run build    # TypeScript → JavaScript (dist/)
npm start        # Production server (dist/server.js)
```
