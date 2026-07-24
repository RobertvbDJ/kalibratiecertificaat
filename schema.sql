-- ═══════════════════════════════════════════════════════════
--  Kalibratiecertificaat — Supabase Schema
--  Voer dit SQL uit in de Supabase SQL Editor (http://supabase.com)
--  Nadat je een nieuw project hebt aangemaakt.
-- ═══════════════════════════════════════════════════════════

-- 1. Companies — één rij per auth-gebruiker (bedrijf)
create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  name text default '',
  short_name text default '',
  address1 text default '',
  address2 text default '',
  website text default '',
  logo_url text default '',
  stempel_url text default '',
  sig_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Technicians — meerdere technici per bedrijf
create table if not exists technicians (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

-- 3. Certificates — certificaat-historie per bedrijf
create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  certnr text,
  client text,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
--  Row Level Security (RLS)
--  Elke gebruiker ziet alleen z'n eigen data.
-- ═══════════════════════════════════════════════════════════

alter table companies enable row level security;
alter table technicians enable row level security;
alter table certificates enable row level security;

-- Companies policies
create policy "users can view own company"
  on companies for select
  using (auth.uid() = user_id);

create policy "users can insert own company"
  on companies for insert
  with check (auth.uid() = user_id);

create policy "users can update own company"
  on companies for update
  using (auth.uid() = user_id);

-- Technicians policies
create policy "users can view own technicians"
  on technicians for select
  using (auth.uid() = user_id);

create policy "users can insert own technicians"
  on technicians for insert
  with check (auth.uid() = user_id);

create policy "users can update own technicians"
  on technicians for update
  using (auth.uid() = user_id);

create policy "users can delete own technicians"
  on technicians for delete
  using (auth.uid() = user_id);

-- Certificates policies
create policy "users can view own certificates"
  on certificates for select
  using (auth.uid() = user_id);

create policy "users can insert own certificates"
  on certificates for insert
  with check (auth.uid() = user_id);

create policy "users can update own certificates"
  on certificates for update
  using (auth.uid() = user_id);

create policy "users can delete own certificates"
  on certificates for delete
  using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
--  Storage bucket voor afbeeldingen
-- ═══════════════════════════════════════════════════════════

-- Maak bucket aan via Supabase Dashboard:
-- 1. Ga naar Storage > Create bucket
-- 2. Bucket name: company-images
-- 3. Public bucket: aan
-- 4. Zet daarna dit RLS-beleid:

create policy "users can view company-images"
  on storage.objects for select
  using ( bucket_id = 'company-images' );

create policy "users can upload own company-images"
  on storage.objects for insert
  with check (
    bucket_id = 'company-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update own company-images"
  on storage.objects for update
  using (
    bucket_id = 'company-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can delete own company-images"
  on storage.objects for delete
  using (
    bucket_id = 'company-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
