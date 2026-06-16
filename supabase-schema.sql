-- Run this in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('coach', 'athlete')),
  created_at timestamptz default now()
);

-- Nutrition logs
create table if not exists nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  log_date date not null,
  meal_name text not null,
  calories integer not null default 0,
  protein numeric(6,1) not null default 0,
  carbs numeric(6,1) not null default 0,
  fat numeric(6,1) not null default 0,
  entry_method text not null check (entry_method in ('search', 'manual')),
  created_at timestamptz default now()
);

-- Supplement logs
create table if not exists supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  log_date date not null,
  supplement_name text not null,
  taken boolean not null default true,
  created_at timestamptz default now(),
  unique(user_id, log_date, supplement_name)
);

-- Macro targets (one row per athlete, set by coach)
create table if not exists macro_targets (
  user_id uuid primary key references profiles(id) on delete cascade,
  calories integer not null default 2500,
  protein numeric(6,1) not null default 150,
  carbs numeric(6,1) not null default 300,
  fat numeric(6,1) not null default 80,
  supplements text[] not null default '{}',
  updated_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table nutrition_logs enable row level security;
alter table supplement_logs enable row level security;
alter table macro_targets enable row level security;

-- Profiles: users see their own; coaches see all
create policy "users can view own profile" on profiles for select using (auth.uid() = id);
create policy "coaches can view all profiles" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach'));

-- Nutrition logs: athletes only see their own; coaches see all
create policy "athletes view own logs" on nutrition_logs for select using (auth.uid() = user_id);
create policy "athletes insert own logs" on nutrition_logs for insert with check (auth.uid() = user_id);
create policy "athletes delete own logs" on nutrition_logs for delete using (auth.uid() = user_id);
create policy "coaches view all logs" on nutrition_logs for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach'));

-- Supplement logs
create policy "athletes view own supp logs" on supplement_logs for select using (auth.uid() = user_id);
create policy "athletes insert own supp logs" on supplement_logs for insert with check (auth.uid() = user_id);
create policy "athletes delete own supp logs" on supplement_logs for delete using (auth.uid() = user_id);
create policy "coaches view all supp logs" on supplement_logs for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach'));

-- Macro targets: athletes read their own; coaches read/write all
create policy "athletes view own targets" on macro_targets for select using (auth.uid() = user_id);
create policy "coaches manage all targets" on macro_targets for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach'));

-- Auto-create profile on signup (for coach account created manually in Supabase)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
