# Gold Prices MENA

Arabic-first gold price platform for GCC + Egypt. Focused on real buyers (not traders) with clean UI, RTL-first layouts, and fast country/city pages optimized for SEO.

## Features
- Country + city pages with per‑gram pricing, buy/sell spreads, bars, and coins.
- Market signals (FX rate, local premium, daily trend) + 30‑day history chart.
- Daily analysis articles and WhatsApp/share actions.
- Dynamic pricing pipeline with Supabase caching + cron refresh.
- Arabic-first i18n and RTL-safe UI.

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

## Supabase Setup
Run the migration in Supabase SQL Editor:
- `supabase/migrations/20260204220000_init_gold_prices.sql`
This creates:
- `market_rates`, `fx_rates`, `price_snapshots`, `premium_rules`, `articles`

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

## Project Structure
- `app/`: routes, API, layouts, metadata
- `components/`: UI sections (prices, layout, calculator)
- `lib/`: pricing logic, Supabase, Redis cache
- `messages/`: translations (Arabic primary)
- `supabase/`: migrations and seeds
