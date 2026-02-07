create table if not exists public.dealers (
  id text primary key,
  country_code text not null,
  city_slug text not null,
  name text not null,
  slug text not null,
  source_url text not null,
  phone text,
  verification_state text not null default 'unverified',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, city_slug, slug)
);

create table if not exists public.dealer_quotes (
  id uuid primary key default gen_random_uuid(),
  dealer_id text not null references public.dealers(id) on delete cascade,
  country_code text not null,
  city_slug text not null,
  karat integer not null default 21,
  buy_per_gram numeric not null,
  sell_per_gram numeric not null,
  spread_pct numeric not null,
  source_url text not null,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists dealer_quotes_lookup_idx
  on public.dealer_quotes (country_code, city_slug, observed_at desc);

create index if not exists dealer_quotes_dealer_idx
  on public.dealer_quotes (dealer_id, observed_at desc);

create table if not exists public.dealer_sources (
  id uuid primary key default gen_random_uuid(),
  dealer_id text not null references public.dealers(id) on delete cascade,
  source_url text not null,
  robots_reachable boolean not null default false,
  robots_allowed boolean not null default false,
  crawl_policy text not null default 'public_robots_respect',
  blocked boolean not null default false,
  block_reason text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dealer_id, source_url)
);

create table if not exists public.crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  country_code text,
  city_slug text,
  status text not null default 'pending',
  started_at timestamptz,
  finished_at timestamptz,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.crawl_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.crawl_jobs(id) on delete cascade,
  dealer_id text,
  level text not null,
  message text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists crawl_events_job_idx
  on public.crawl_events (job_id, created_at desc);

create table if not exists public.data_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  job_type text not null,
  country_code text,
  city_slug text,
  status text not null default 'pending',
  records_upserted integer not null default 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_sources (
  id text primary key,
  display_name text not null,
  enabled boolean not null default true,
  job_types text[] not null default '{window-poll,daily-sync,reconcile-all,health-scan,manual-refresh}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_entities (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.data_sources(id) on delete cascade,
  entity_key text not null,
  display_name text not null,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, entity_key)
);

create table if not exists public.data_run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.data_runs(id) on delete cascade,
  level text not null default 'info',
  message text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists data_run_steps_run_idx
  on public.data_run_steps (run_id, created_at desc);

create table if not exists public.data_alerts (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  country_code text,
  city_slug text,
  severity text not null default 'warning',
  alert_type text not null,
  message text not null,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.reliability_scores (
  dealer_id text primary key references public.dealers(id) on delete cascade,
  score numeric not null default 0.75,
  confidence numeric not null default 0.7,
  reasons text[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  template text not null,
  slug text not null unique,
  locale text not null default 'ar',
  country_code text,
  city_slug text,
  dealer_id text,
  canonical_url text,
  is_indexable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keyword_clusters (
  id uuid primary key default gen_random_uuid(),
  country_code text,
  city_slug text,
  cluster_name text not null,
  keyword text not null,
  search_intent text,
  priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.serp_rankings (
  id uuid primary key default gen_random_uuid(),
  keyword_cluster_id uuid references public.keyword_clusters(id) on delete set null,
  keyword text not null,
  rank integer,
  page_url text,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists serp_rankings_keyword_idx
  on public.serp_rankings (keyword, observed_at desc);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  locale text not null default 'ar',
  country_code text,
  city_slug text,
  template text not null default 'guide',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  title text not null,
  excerpt text not null,
  body text not null,
  source_refs jsonb not null default '[]',
  numeric_claims jsonb not null default '[]',
  qa_status text not null default 'pending',
  duplicate_score numeric not null default 0,
  numeric_score numeric not null default 0,
  source_count integer not null default 0,
  rollback_of_version_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists content_versions_item_idx
  on public.content_versions (content_item_id, created_at desc);

create trigger dealers_updated_at
before update on public.dealers
for each row execute function public.set_updated_at();

create trigger dealer_sources_updated_at
before update on public.dealer_sources
for each row execute function public.set_updated_at();

create trigger seo_pages_updated_at
before update on public.seo_pages
for each row execute function public.set_updated_at();

create trigger keyword_clusters_updated_at
before update on public.keyword_clusters
for each row execute function public.set_updated_at();

create trigger content_items_updated_at
before update on public.content_items
for each row execute function public.set_updated_at();

create trigger data_runs_updated_at
before update on public.data_runs
for each row execute function public.set_updated_at();

create trigger data_sources_updated_at
before update on public.data_sources
for each row execute function public.set_updated_at();

create trigger data_entities_updated_at
before update on public.data_entities
for each row execute function public.set_updated_at();

alter table public.dealers enable row level security;
alter table public.dealer_quotes enable row level security;
alter table public.dealer_sources enable row level security;
alter table public.crawl_jobs enable row level security;
alter table public.crawl_events enable row level security;
alter table public.reliability_scores enable row level security;
alter table public.seo_pages enable row level security;
alter table public.keyword_clusters enable row level security;
alter table public.serp_rankings enable row level security;
alter table public.content_items enable row level security;
alter table public.content_versions enable row level security;
alter table public.data_runs enable row level security;
alter table public.data_run_steps enable row level security;
alter table public.data_alerts enable row level security;
alter table public.data_sources enable row level security;
alter table public.data_entities enable row level security;

create policy "Public read dealers" on public.dealers
  for select using (true);

create policy "Public read dealer quotes" on public.dealer_quotes
  for select using (true);

create policy "Public read reliability scores" on public.reliability_scores
  for select using (true);

create policy "Public read SEO pages" on public.seo_pages
  for select using (true);

create policy "Public read serp rankings" on public.serp_rankings
  for select using (true);

create policy "Public read content items" on public.content_items
  for select using (true);

create policy "Public read content versions" on public.content_versions
  for select using (true);

create policy "Public read data runs" on public.data_runs
  for select using (true);

create policy "Public read data run steps" on public.data_run_steps
  for select using (true);

create policy "Public read data alerts" on public.data_alerts
  for select using (true);

create policy "Public read data sources" on public.data_sources
  for select using (true);

create policy "Public read data entities" on public.data_entities
  for select using (true);

insert into public.dealers (id, country_code, city_slug, name, slug, source_url, verification_state, last_seen_at)
values
  ('eg-cairo-nagib', 'eg', 'cairo', 'نجيب جولد', 'nagib-gold', 'https://example.com/dealers/nagib', 'trusted', now()),
  ('eg-cairo-masr', 'eg', 'cairo', 'مصر للمجوهرات', 'masr-jewels', 'https://example.com/dealers/masr', 'verified', now()),
  ('sa-riyadh-riyadh-gold', 'sa', 'riyadh', 'ذهب الرياض', 'riyadh-gold', 'https://example.com/dealers/riyadh-gold', 'trusted', now()),
  ('ae-dubai-burj-gold', 'ae', 'dubai', 'برج الذهب', 'burj-gold', 'https://example.com/dealers/burj-gold', 'verified', now())
on conflict do nothing;

insert into public.data_sources (id, display_name, enabled)
values ('dealer-quotes', 'Dealer Quotes Router', true)
on conflict do nothing;

insert into public.data_entities (source_id, entity_key, display_name, enabled)
values
  ('dealer-quotes', 'eg:cairo', 'Egypt - Cairo', true),
  ('dealer-quotes', 'sa:riyadh', 'Saudi Arabia - Riyadh', true),
  ('dealer-quotes', 'ae:dubai', 'UAE - Dubai', true)
on conflict do nothing;
