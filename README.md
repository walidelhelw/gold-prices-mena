# Gold Prices MENA

Arabic-first gold price platform for GCC + Egypt. Focused on real buyers (not traders) with clean UI, RTL-first layouts, and fast country/city pages optimized for SEO.

## Features
- Country + city pages with per‑gram pricing, buy/sell spreads, bars, and coins.
- Market signals (FX rate, local premium, daily trend) + 30‑day history chart.
- Daily analysis articles and WhatsApp/share actions.
- Dynamic pricing pipeline with Supabase caching + cron refresh.
- Arabic-first i18n and RTL-safe UI.
- Dealer leaderboard pages with freshness and reliability signals.
- Internal ingestion + content guardrail APIs for scalable SEO content operations.
- QStash-style Data Router fanout with lock-safe entity sync runs.

## Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000/ar/eg`.

## Build
```bash
npm run build
npm run start
```

## Environment Variables
Copy `.env.example` → `.env.local` and fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `METALS_API_KEY` (spot), `FX_API_KEY` (FX), `NEXT_PUBLIC_GOOGLE_ADS_CLIENT`
- Optional: `CRON_SECRET` (protect `/api/cron/refresh`)
- Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` for distributed cache/rate-limit
- Optional: `INTERNAL_API_SECRET` for signed internal APIs
- Optional: `QSTASH_TOKEN`, `QSTASH_URL` for queued fanout execution

## Supabase Setup
Run the migration in Supabase SQL Editor:
- `supabase/migrations/20260204220000_init_gold_prices.sql`
This creates:
- `market_rates`, `fx_rates`, `price_snapshots`, `premium_rules`, `articles`
- dealer + ingestion + SEO/content moat tables (see `20260206163000_killer_moat_foundation.sql`)

## Cron Refresh
A Vercel cron hits `/api/cron/refresh` every 5 minutes (see `vercel.json`).
If `CRON_SECRET` is set, requests must include `Authorization: Bearer <secret>` (Vercel cron also sends `x-vercel-cron: 1`).

## Key API Endpoints
- `GET /api/prices?country=eg&city=cairo`
- `GET /api/prices/latest?country=eg`
- `GET /api/prices/history?country=eg&days=30`
- `GET /api/spot`
- `GET /api/fx?quote=EGP`
- `GET /api/articles` and `/api/articles/{slug}`
- `GET /api/dealers?country=eg&city=cairo`
- `GET /api/dealers/{dealerId}/quotes?days=30`
- `GET /api/signals?country=eg&city=cairo`
- `GET /api/freshness?country=eg&city=cairo`
- `GET /api/compare?country=eg&city=cairo&targetCity=alexandria`
- `GET /api/seo/pages?template=city|dealer|comparison&country=eg`
- `POST /api/internal/ingestion/run` (signed)
- `POST /api/internal/ingestion/fanout` (signed)
- `POST /api/internal/ingestion/source/validate` (signed)
- `POST /api/internal/content/generate` (signed)
- `POST /api/internal/content/publish` (signed)
- `POST /api/qstash/data-run` (QStash or signed)

## Project Structure
- `app/`: routes, API, layouts, metadata
- `components/`: UI sections (prices, layout, calculator)
- `lib/`: pricing logic, Supabase, Redis cache
- `messages/`: translations (Arabic primary)
- `supabase/`: migrations and seeds
