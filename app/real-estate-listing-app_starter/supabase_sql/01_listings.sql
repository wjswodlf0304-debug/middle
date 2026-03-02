-- Run in Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid(),
  category text not null,
  address text not null,
  area_m2 numeric,
  floor text,
  price text,
  fee text,
  options text,
  use_type text,
  phone text,
  note text,
  contract_date date,
  expiry_date date,
  status text
);

alter table public.listings enable row level security;

create policy "select_own" on public.listings
for select to authenticated
using (auth.uid() = user_id);

create policy "insert_own" on public.listings
for insert to authenticated
with check (auth.uid() = user_id);

create policy "update_own" on public.listings
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "delete_own" on public.listings
for delete to authenticated
using (auth.uid() = user_id);
