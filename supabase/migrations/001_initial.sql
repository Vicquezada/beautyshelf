-- Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  brand text,
  category text,
  expiry_date date,
  quantity text check (quantity in ('alta', 'media', 'bassa')) default 'alta' not null,
  flagged boolean default false not null,
  flag_reason text,
  ingredients text[],
  image_urls text[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Quantity history (consumption tracking)
create table if not exists public.quantity_history (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity text check (quantity in ('alta', 'media', 'bassa')) not null,
  recorded_at timestamptz default now() not null
);

-- Normative
create table if not exists public.normative (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date not null,
  summary text,
  category text,
  severity text check (severity in ('urgente', 'attenzione', 'info')) default 'info' not null,
  affected_ingredients text[],
  source text,
  created_at timestamptz default now() not null
);

-- User suppliers (for price monitoring)
create table if not exists public.user_suppliers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  created_at timestamptz default now() not null
);

-- Price alerts
create table if not exists public.price_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  supplier_id uuid references public.user_suppliers(id) on delete cascade not null,
  original_price numeric,
  discounted_price numeric,
  url text,
  found_at timestamptz default now() not null
);

-- RLS
alter table public.products enable row level security;
alter table public.quantity_history enable row level security;
alter table public.normative enable row level security;
alter table public.user_suppliers enable row level security;
alter table public.price_alerts enable row level security;

create policy "Users manage own products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own quantity history"
  on public.quantity_history for all
  using (
    exists (
      select 1 from public.products
      where products.id = quantity_history.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Authenticated users read normative"
  on public.normative for select
  using (auth.role() = 'authenticated');

create policy "Users manage own suppliers"
  on public.user_suppliers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own price alerts"
  on public.price_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_expiry_date_idx on public.products(expiry_date);
create index if not exists quantity_history_product_id_idx on public.quantity_history(product_id);
create index if not exists normative_date_idx on public.normative(date desc);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- Sample normative data
insert into public.normative (title, date, summary, category, severity, affected_ingredients, source) values
(
  'Restrizione PFAS nei cosmetici EU – Regolamento (UE) 2023/2055',
  '2024-03-01',
  'Il regolamento limita l''uso di sostanze PFAS (acidi perfluoroalchilici e loro sali) in formulazioni cosmetiche. I prodotti contenenti PFAS superiori alla soglia devono essere riformulati entro 18 mesi. Verificare la presenza di ingredienti INCI come PTFE, Perfluorononyl Dimethicone e simili.',
  'Tutti',
  'urgente',
  ARRAY['PTFE', 'Perfluorononyl Dimethicone', 'Perfluorodecalin', 'Perfluorooctyl Triethoxysilane'],
  'EUR-Lex'
),
(
  'Swissmedic – Aggiornamento lista ingredienti vietati CH 2024',
  '2024-01-15',
  'La Svizzera aggiorna l''Allegato 2 dell''OPCos con nuove restrizioni su filtri UV e conservanti. In particolare il Benzophenone-3 (Oxybenzone) è soggetto a nuovi limiti di concentrazione nei prodotti leave-on.',
  'SPF / Solari',
  'attenzione',
  ARRAY['Benzophenone-3', 'Oxybenzone', 'Homosalate'],
  'Swissmedic'
),
(
  'EU Cosmetics Regulation – Aggiornamento lista coloranti ammessi',
  '2023-11-20',
  'Aggiornamento dell''Annex IV del Regolamento (CE) n.1223/2009 con modifiche ai limiti di utilizzo per alcuni coloranti azoici nei prodotti per capelli e pelle.',
  'Colorazione',
  'info',
  ARRAY['CI 12010', 'CI 15510', 'CI 15985', 'p-Phenylenediamine'],
  'EUR-Lex'
),
(
  'Restrizione Titanium Dioxide – Uso in polveri inalabili',
  '2023-10-01',
  'La Commissione Europea vieta l''uso di biossido di titanio (TiO2) in forma di polvere inalabile nei cosmetici. I prodotti in polvere (cipria, ombretto, fard) devono rimuovere TiO2 dalle formulazioni entro il periodo transitorio.',
  'Make-up / Polveri',
  'urgente',
  ARRAY['Titanium Dioxide', 'CI 77891', 'Titanium Oxide'],
  'ECHA'
);
