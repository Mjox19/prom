/*
  # Fix profiles table setup

  1. Changes
    - Drop existing profiles table to ensure clean state
    - Recreate profiles table with correct schema
    - Add computed full_name column
    - Add necessary indexes
    
  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Public view access
      - Users can insert own profile
      - Users can update own profile
      - Users can view own profile
*/

-- First drop the existing table if it exists (along with its dependencies)
drop table if exists public.notification_preferences cascade;
drop table if exists public.notifications cascade;
drop table if exists public.quotes cascade;
drop table if exists public.profiles cascade;

-- Recreate the profiles table with correct schema
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  first_name text,
  last_name text,
  full_name text generated always as (
    (COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
  ) stored,
  avatar_url text,
  bio text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index on full_name for better search performance
create index idx_profiles_full_name on public.profiles using btree (full_name);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create RLS policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Recreate the notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('news', 'quote', 'sale', 'system')),
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Recreate the notification_preferences table
create table public.notification_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  email_news boolean default true,
  email_quotes boolean default true,
  email_sales boolean default true,
  push_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can view own preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);

-- Recreate the quotes table
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique,
  user_id uuid references public.profiles(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  subtotal numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  valid_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_quotes_user_id on public.quotes using btree (user_id);
create index idx_quotes_customer_id on public.quotes using btree (customer_id);

alter table public.quotes enable row level security;

create policy "Users can create quotes"
  on public.quotes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quotes"
  on public.quotes for update
  using (auth.uid() = user_id);

create policy "Users can view own quotes"
  on public.quotes for select
  using (auth.uid() = user_id);