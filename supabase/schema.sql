-- Create profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    mobile text,
    email text unique,
    avatar_url text,
    is_email_verified boolean default false,
    is_mobile_verified boolean default false,
    updated_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row-Level Security (RLS)
alter table public.profiles enable row level security;

-- Grant permissions to authenticated users
grant usage on schema public to authenticated;
grant all privileges on table public.profiles to authenticated;

-- Policies

-- Allow everyone to view profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

-- Allow the system (Postgres) to insert profiles
create policy "System can insert profiles."
  on profiles for insert
  to postgres
  with check (true);

-- Allow users to update their own profile
create policy "Users can update their own profile."
  on profiles for update
  using (auth.uid() = id);

-- Create indexes
create index profiles_full_name_idx on public.profiles using btree (full_name);
create index profiles_mobile_idx on public.profiles using btree (mobile);
create index profiles_email_idx on public.profiles using btree (email);

-- Create function for handling new users
create or replace function public.handle_new_user()
returns trigger
security definer
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    mobile,
    is_email_verified,
    is_mobile_verified,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'mobile',
    false,
    false,
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger to insert a new profile when a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
