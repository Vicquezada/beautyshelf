-- User profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  business_type text not null check (business_type in ('freelance', 'salone')),
  country text not null check (country in ('IT', 'CH')),
  city text,
  specializations text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "Users manage own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Add country column to normative (IT | CH | ALL)
alter table public.normative
  add column if not exists country text check (country in ('IT', 'CH', 'ALL')) default 'ALL';

-- Tag existing sample normative
update public.normative set country = 'IT'
  where source ilike '%EU%' or source ilike '%ECHA%' or title ilike '%EU%' or title ilike '%(UE)%';

update public.normative set country = 'CH'
  where source ilike '%Swissmedic%' or title ilike '%svizzera%' or title ilike '%CH%';

-- Default remaining to ALL
update public.normative set country = 'ALL' where country is null;

-- Updated_at trigger for profiles
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
