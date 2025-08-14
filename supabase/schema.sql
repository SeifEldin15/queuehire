-- Enable required extensions
create extension if not exists "uuid-ossp";

-- USERS TABLE (extends Supabase auth.users)
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    professional_bio text,
    skills_expertise text, -- for job seeker
    required_skills text,  -- for hiring person
    email text unique not null,
    plan_type text check (plan_type in ('Free', 'Essential', 'Power', 'Pro')) default 'Free',
    user_type text check (user_type in ('job_seeker', 'hiring')) not null,
    phone text,
    full_name text,
    profile_image text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- SAVED CONTACTS TABLE (link table)
create table public.saved_contacts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    saved_contact_id uuid not null references public.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    unique (user_id, saved_contact_id) -- prevent duplicates
);

-- Row Level Security (RLS) policies
alter table public.users enable row level security;
alter table public.saved_contacts enable row level security;

-- Users can read their own profile and other users' public profiles
create policy "Users can view all profiles" on public.users
    for select using (true);

-- Users can only update their own profile
create policy "Users can update own profile" on public.users
    for update using (auth.uid() = id);

-- Users can only insert their own profile
create policy "Users can insert own profile" on public.users
    for insert with check (auth.uid() = id);

-- Saved contacts policies
create policy "Users can view own saved contacts" on public.saved_contacts
    for select using (auth.uid() = user_id);

create policy "Users can manage own saved contacts" on public.saved_contacts
    for all using (auth.uid() = user_id);

-- Function to handle new user registration
create or replace function public.handle_new_user() 
returns trigger as $$
begin
    insert into public.users (id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile on signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column() 
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_users_updated_at
    before update on public.users
    for each row execute procedure public.update_updated_at_column();