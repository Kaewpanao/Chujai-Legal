-- Chujai Legal — Database Schema
-- Run in Supabase SQL Editor or via migration tool.
-- Applies to: https://kwyhpuzfbjviwzboifus.supabase.co

-- ─────────────────────────────────────────────
-- profiles — user profiles (extends auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'consumer',  -- consumer | lawyer | admin
  package text not null default 'free',    -- free | action_pack | case_plus | sme
  phone text,
  province text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- cases — legal cases (concierge flow)
-- ─────────────────────────────────────────────
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null,            -- e.g. online_fraud
  sub_problem text,                  -- e.g. 1.1
  narrative text,
  answers jsonb default '{}'::jsonb, -- diagnosis question answers
  path text,                         -- self | lawyer | mediation
  province text,
  status text not null default 'active', -- active | filed | resolved
  phase int not null default 0,      -- 0-7 concierge phase
  ai_analysis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- documents — generated legal documents
-- ─────────────────────────────────────────────
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  template text not null,
  title text,
  content text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- lawyers — lawyer profiles
-- ─────────────────────────────────────────────
create table if not exists public.lawyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text[] default '{}',
  rating numeric default 0,
  reviews int default 0,
  price numeric default 0,
  verified boolean default false,
  languages text[] default '{th}',
  province text,
  bio text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- payments — payment records
-- ─────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric not null,
  package text not null,
  method text default 'promptpay',   -- promptpay | card
  status text not null default 'pending', -- pending | paid | failed
  reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ─────────────────────────────────────────────
-- notifications — user notifications
-- ─────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null default 'case',  -- case | document | system | lawyer
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
create index if not exists idx_cases_user on public.cases(user_id);
create index if not exists idx_cases_status on public.cases(status);
create index if not exists idx_documents_case on public.documents(case_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- ─────────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.documents enable row level security;
alter table public.lawyers enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- profiles: users can read/update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- cases: users manage their own cases
create policy "cases_select_own" on public.cases
  for select using (auth.uid() = user_id);
create policy "cases_insert_own" on public.cases
  for insert with check (auth.uid() = user_id);
create policy "cases_update_own" on public.cases
  for update using (auth.uid() = user_id);
create policy "cases_delete_own" on public.cases
  for delete using (auth.uid() = user_id);

-- documents: users manage their own documents
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- lawyers: public read
create policy "lawyers_select_public" on public.lawyers
  for select using (true);

-- payments: users read their own
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- notifications: users read their own
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Trigger: auto-create profile on signup
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'consumer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
