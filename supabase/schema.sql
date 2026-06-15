create extension if not exists pgcrypto;

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_otps_phone_created_at_idx
  on public.whatsapp_otps(phone, created_at desc);

create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.customer_profiles(id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  address text not null,
  district text not null,
  pincode text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_addresses_user_id_idx
  on public.saved_addresses(user_id);

alter table public.customer_profiles enable row level security;
alter table public.whatsapp_otps enable row level security;
alter table public.saved_addresses enable row level security;

-- These tables are accessed through server API routes with SUPABASE_SERVICE_ROLE_KEY.
-- No anon/auth RLS policies are added, so browser clients cannot read or write them directly.
