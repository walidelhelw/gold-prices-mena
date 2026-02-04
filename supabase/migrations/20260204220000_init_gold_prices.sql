create extension if not exists "pgcrypto";

create table if not exists public.market_rates (
  id uuid primary key default gen_random_uuid(),
  spot_usd numeric not null,
  observed_at timestamptz not null default now(),
  source text,
  created_at timestamptz not null default now()
);

create index if not exists market_rates_observed_at_idx on public.market_rates (observed_at desc);

create table if not exists public.fx_rates (
  base text not null,
  quote text not null,
  rate numeric not null,
  observed_at timestamptz not null default now(),
  source text,
  created_at timestamptz not null default now(),
  primary key (base, quote)
);

create index if not exists fx_rates_observed_at_idx on public.fx_rates (observed_at desc);

create table if not exists public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  city_slug text,
  currency text not null,
  spot_usd numeric not null,
  am_fix_usd numeric not null,
  pm_fix_usd numeric not null,
  fx_rate numeric not null,
  local_per_gram numeric not null,
  premium_pct numeric not null default 0,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists price_snapshots_lookup_idx on public.price_snapshots (country_code, city_slug, created_at desc);

create table if not exists public.premium_rules (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  city_slug text,
  premium_bps integer not null default 0,
  buy_spread_bps integer not null default -40,
  sell_spread_bps integer not null default 90,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, city_slug)
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  excerpt_ar text not null,
  body_ar text not null,
  country_codes text[] not null default '{}',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger premium_rules_updated_at
before update on public.premium_rules
for each row execute function public.set_updated_at();

create trigger articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

alter table public.market_rates enable row level security;
alter table public.fx_rates enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.premium_rules enable row level security;
alter table public.articles enable row level security;

create policy "Public read market rates" on public.market_rates
  for select using (true);
create policy "Public read fx rates" on public.fx_rates
  for select using (true);
create policy "Public read snapshots" on public.price_snapshots
  for select using (true);
create policy "Public read premium rules" on public.premium_rules
  for select using (true);
create policy "Public read articles" on public.articles
  for select using (true);

insert into public.premium_rules (country_code, city_slug, premium_bps, buy_spread_bps, sell_spread_bps)
values
  ('eg', null, 25, -45, 110),
  ('sa', null, 15, -40, 95),
  ('ae', null, 10, -35, 90),
  ('kw', null, 18, -40, 100),
  ('qa', null, 12, -38, 95),
  ('bh', null, 8, -35, 90),
  ('om', null, 12, -38, 95),
  ('eg', 'cairo', 35, -45, 115),
  ('eg', 'alexandria', 20, -42, 105),
  ('sa', 'riyadh', 20, -40, 95),
  ('sa', 'jeddah', 24, -40, 100),
  ('ae', 'dubai', 22, -35, 90),
  ('ae', 'abu-dhabi', 18, -35, 90)
on conflict do nothing;

insert into public.articles (slug, title_ar, excerpt_ar, body_ar, country_codes, published_at)
values
  (
    'gold-today-demand-shift',
    'لماذا زاد طلب الذهب في الأسواق المحلية اليوم؟',
    'نظرة سريعة على حركة الطلب في أسواق التجزئة وتأثير سعر الصرف.',
    'يشهد السوق المحلي موجة شراء جديدة مع اقتراب مناسبات اجتماعية وتغيرات سعر الصرف. في هذا التقرير القصير نوضح كيف يؤثر الدولار على سعر الجرام محليًا، ولماذا تختلف المصنعية بين المدن. تابع التحليل مع نصائح عملية للمشتري غير المستثمر.',
    array['eg','sa','ae'],
    now()
  ),
  (
    'gold-spot-vs-local',
    'ما الفرق بين السعر العالمي والسعر المحلي للذهب؟',
    'توضيح مبسط لفروقات السعر العالمي مقابل التسعير المحلي.',
    'السعر العالمي يُقاس بالأونصة بالدولار، بينما السعر المحلي يعتمد على سعر الصرف وتكاليف السوق المحلي. نعرض مثالًا عمليًا لتحويل الأونصة إلى جرام وتأثير فرق العملة والمصنعية على السعر النهائي للمستهلك.',
    array['eg','qa','kw','bh'],
    now() - interval '1 day'
  ),
  (
    'daily-fix-guide',
    'كيف تقرأ حركة السعر خلال اليوم؟',
    'توضيح سريع لأفضل توقيتات الشراء عند تغير السعر.',
    'التغير اللحظي في السعر لا يعني دائمًا فرصة شراء فورية. نوضح كيف تراقب فرق الافتتاح/الإغلاق، وكيف تقارن سعر الصرف المحلي بالسعر العالمي للوصول لقرار شراء أفضل.',
    array['sa','ae','qa','kw'],
    now() - interval '2 days'
  )
on conflict do nothing;
