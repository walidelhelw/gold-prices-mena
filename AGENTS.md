# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, API endpoints, and metadata (`robots.ts`, `sitemap.ts`).
- `components/`: UI components grouped by feature (e.g., `components/prices`, `components/calculator`, `components/layout`).
- `lib/`: shared logic (pricing, geo, i18n, Supabase client, Redis cache/middleware).
- `messages/`: locale JSON files. Arabic is primary; keep keys in sync across languages.
- `supabase/migrations/`: SQL migrations and seed data.
- `vercel.json`: cron schedule for price refresh.

## Build, Test, and Development Commands
- `npm run dev`: start local Next.js dev server.
- `npm run build`: production build + type check (use this as the main validation step).
- `npm run start`: run the production build locally.
- `npm run lint`: Next.js linting (if configured).

## Coding Style & Naming Conventions
- TypeScript + React with Next.js App Router.
- Prefer small, focused components and server-only data access in `lib/data/*-server.ts`.
- Use logical CSS utilities and RTL-safe patterns (Arabic-first UI).
- Naming: components `PascalCase.tsx`, hooks `useX`, utilities `camelCase`.

## Testing Guidelines
- No dedicated test framework yet. Validation is via `npm run build` and manual UI checks.
- If you add tests later, document the framework and update this file.

## Commit & Pull Request Guidelines
- Commits are short, imperative, and scoped (e.g., "Add dynamic pricing and history").
- PRs should include:
  - Summary of changes and affected routes/components.
  - Screenshots for UI changes (especially RTL or layout updates).
  - Notes on env vars or migrations (e.g., `supabase/migrations/...`).

## Security & Configuration Tips
- Copy `.env.example` to `.env.local` for local use.
- Do not commit secrets. Use Vercel env vars for `SUPABASE_SERVICE_ROLE_KEY`, `METALS_API_KEY`, and `FX_API_KEY`.
- Cron endpoint expects `CRON_SECRET` or Vercel cron header.
