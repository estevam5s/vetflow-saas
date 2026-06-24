-- ============================================================
-- VetFlow — Schema (perfis, SaaS e domínio veterinário)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  clinic_name text,
  trial_ends_at timestamptz,
  plan_slug text default 'inicial',
  is_demo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

-- ── app_plans ─────────────────────────────────────────────
create table if not exists public.app_plans (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null, name text not null, description text,
  price_month integer not null default 0, price_year integer not null default 0,
  stripe_price_month text, stripe_price_year text,
  features jsonb not null default '[]'::jsonb, limits jsonb not null default '{}'::jsonb,
  highlighted boolean default false, active boolean default true, sort_order integer default 0
);
alter table public.app_plans enable row level security;
drop policy if exists app_plans_sel on public.app_plans;
create policy app_plans_sel on public.app_plans for select using (true);

-- ── app_subscriptions ─────────────────────────────────────
create table if not exists public.app_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_slug text not null default 'inicial', status text not null default 'trialing',
  cycle text default 'month', stripe_customer_id text, stripe_subscription_id text,
  current_period_end timestamptz, cancel_at_period_end boolean default false,
  refund_eligible_until timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.app_subscriptions enable row level security;
drop policy if exists app_subs_own on public.app_subscriptions;
create policy app_subs_own on public.app_subscriptions for select using (user_id = auth.uid());

-- ── app_payment_events ─────────────────────────────────────
create table if not exists public.app_payment_events (
  id text primary key, type text, payload jsonb, created_at timestamptz default now()
);
alter table public.app_payment_events enable row level security;

-- ── Domínio veterinário (por usuário/clínica, RLS) ────────
create table if not exists public.owners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, email text, phone text, cpf text, address text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.owners enable row level security;
drop policy if exists owners_own on public.owners;
create policy owners_own on public.owners for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_owners_user on public.owners(user_id);

create table if not exists public.pets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid references public.owners(id) on delete set null,
  name text not null, species text default 'Cão', breed text, sex text,
  birth_date date, weight numeric, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.pets enable row level security;
drop policy if exists pets_own on public.pets;
create policy pets_own on public.pets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_pets_user on public.pets(user_id);

create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text default 'agendada' check (status in ('agendada','confirmada','concluida','cancelada')),
  reason text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.appointments enable row level security;
drop policy if exists appts_own on public.appointments;
create policy appts_own on public.appointments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_appts_user on public.appointments(user_id);

-- ── updated_at helper ─────────────────────────────────────
create or replace function public.app_touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_app_subs on public.app_subscriptions;
create trigger trg_app_subs before update on public.app_subscriptions for each row execute function public.app_touch_updated_at();
drop trigger if exists trg_owners on public.owners;
create trigger trg_owners before update on public.owners for each row execute function public.app_touch_updated_at();
drop trigger if exists trg_pets on public.pets;
create trigger trg_pets before update on public.pets for each row execute function public.app_touch_updated_at();
drop trigger if exists trg_appts on public.appointments;
create trigger trg_appts before update on public.appointments for each row execute function public.app_touch_updated_at();

-- ── handle_new_user: profile + trial 7d + subscription ────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, clinic_name, trial_ends_at, is_demo, plan_slug)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'clinic_name',''), now() + interval '7 days', true, 'inicial')
  on conflict (id) do nothing;
  insert into public.app_subscriptions (user_id, plan_slug, status, current_period_end)
  values (new.id, 'inicial', 'trialing', now() + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ── Seed dos planos ───────────────────────────────────────
insert into public.app_plans (slug,name,description,price_month,price_year,stripe_price_month,stripe_price_year,features,limits,highlighted,sort_order) values
('inicial','Inicial','Testar / autônomo',0,0,null,null,
 '["1 usuário","Até 50 pets","Agenda de consultas","Prontuário básico","Histórico de 30 dias","Suporte da comunidade"]'::jsonb,
 '{"users":1,"pets":50,"history_days":30,"reminders":"none","financial":false,"reports":"none","units":1,"api":false,"sso":false}'::jsonb,
 false,0),
('starter','Starter','Consultório',4900,47000,'price_1TlgjlJ6zI3LognzRd3PAKAe','price_1TlgjlJ6zI3Lognz8WRSVUfJ',
 '["Até 3 usuários","Até 500 pets","Prontuário eletrônico completo","Histórico completo","Lembretes por e-mail","Financeiro básico","Relatórios básicos","Suporte por e-mail"]'::jsonb,
 '{"users":3,"pets":500,"history_days":-1,"reminders":"email","financial":"basic","reports":"basic","units":1,"api":false,"sso":false}'::jsonb,
 false,1),
('pro','Pro','Clínica',11900,114200,'price_1TlgjmJ6zI3LognzITpzbqoZ','price_1TlgjnJ6zI3LognzSEVPVzx7',
 '["Até 10 usuários","Pets ilimitados","Lembretes por e-mail + WhatsApp","Financeiro completo","Relatórios avançados","Papéis e permissões","API + integrações","Suporte prioritário"]'::jsonb,
 '{"users":10,"pets":-1,"history_days":-1,"reminders":"whatsapp","financial":"full","reports":"advanced","units":1,"api":true,"sso":false}'::jsonb,
 true,2),
('enterprise','Enterprise','Rede de clínicas',29900,287000,'price_1TlgjoJ6zI3Lognzer2nj5iQ','price_1TlgjpJ6zI3LognzOZTe7lCa',
 '["Usuários ilimitados","Múltiplas unidades","Papéis e permissões avançados","SSO e auditoria completa","Exportação de relatórios","Integrações personalizadas","Suporte dedicado (SLA)"]'::jsonb,
 '{"users":-1,"pets":-1,"history_days":-1,"reminders":"whatsapp","financial":"full","reports":"advanced","units":-1,"api":true,"sso":true}'::jsonb,
 false,3)
on conflict (slug) do update set
  name=excluded.name, description=excluded.description, price_month=excluded.price_month, price_year=excluded.price_year,
  stripe_price_month=excluded.stripe_price_month, stripe_price_year=excluded.stripe_price_year,
  features=excluded.features, limits=excluded.limits, highlighted=excluded.highlighted, sort_order=excluded.sort_order;
