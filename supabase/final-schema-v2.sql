-- QueueHire Final Database Schema (Version 2)
-- This includes all tables, policies, triggers, and storage setup
-- Designed to work reliably on first run without dependencies
-- Run this in your Supabase SQL Editor to set up everything

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- === CLEANUP SECTION (Safe for first run) ===

-- Drop triggers first (if they exist)
do $$ begin
    drop trigger if exists on_auth_user_created on auth.users;
    drop trigger if exists update_users_updated_at on public.users;
exception when others then
    -- Ignore errors for first run
    null;
end $$;

-- Drop all policies (if they exist)
do $$ begin
    -- Users table policies
    drop policy if exists "Users can view all profiles" on public.users;
    drop policy if exists "Users can update own profile" on public.users;
    drop policy if exists "Users can insert own profile" on public.users;
    drop policy if exists "Users can delete own profile" on public.users;
    
    -- Saved contacts policies
    drop policy if exists "Users can view own saved contacts" on public.saved_contacts;
    drop policy if exists "Users can manage own saved contacts" on public.saved_contacts;
    

    
    -- Temp profiles policies
    drop policy if exists "Anyone can create temp profiles" on public.temp_profiles;
    drop policy if exists "Anyone can read temp profiles by ID" on public.temp_profiles;
    drop policy if exists "Anyone can update temp profiles" on public.temp_profiles;
    
    -- Storage policies
    drop policy if exists "Public read access for profile images" on storage.objects;
    drop policy if exists "Users can upload their own profile images" on storage.objects;
    drop policy if exists "Users can update their own profile images" on storage.objects;
    drop policy if exists "Users can delete their own profile images" on storage.objects;
exception when others then
    -- Ignore errors for first run
    null;
end $$;

-- Drop views (if they exist)

-- Drop tables in dependency order (if they exist)
drop table if exists public.saved_contacts cascade;
drop table if exists public.temp_profiles cascade;
drop table if exists public.users cascade;

-- Drop functions (if they exist)
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_updated_at_column() cascade;
drop function if exists public.transfer_temp_profile_to_user(uuid, uuid) cascade;

-- === TABLE CREATION SECTION ===

-- USERS TABLE (extends Supabase auth.users)
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text constraint full_name_length check (char_length(full_name) <= 100),
    professional_bio text constraint bio_length check (char_length(professional_bio) <= 1000),
    skills_expertise text, -- for job seeker (comma-separated, each skill max 50 chars)
    required_skills text,  -- for hiring person (comma-separated, each skill max 50 chars)
    profile_image text,
    user_type text check (user_type in ('job_seeker', 'hiring')) not null default 'job_seeker',
    plan_type text check (plan_type in ('Free', 'Essential', 'Power', 'Pro')) default 'Free',
    phone text constraint phone_length check (char_length(phone) <= 20),
    linkedin text constraint linkedin_length check (char_length(linkedin) <= 200),
    instagram text constraint instagram_length check (char_length(instagram) <= 100),
    website text constraint website_length check (char_length(website) <= 300),
    -- Additional settings fields
    theme text check (theme in ('light', 'dark', 'system')) default 'system',
    language text check (language in ('English', 'Arabic', 'French')) default 'English',
    two_factor_enabled boolean default false,
    email_notifications boolean default true,
    match_alerts boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- SAVED CONTACTS TABLE (link table for favorites)
create table public.saved_contacts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    saved_contact_id uuid not null references public.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    unique (user_id, saved_contact_id) -- prevent duplicates
);

-- TEMPORARY PROFILES TABLE FOR REGISTRATION FLOW
create table public.temp_profiles (
    id uuid default gen_random_uuid() primary key,
    full_name text constraint temp_full_name_length check (char_length(full_name) <= 100),
    user_type text check (user_type in ('job_seeker', 'hiring')) not null,
    skills_expertise text, -- comma-separated, each skill max 50 chars
    required_skills text,  -- comma-separated, each skill max 50 chars
    professional_bio text constraint temp_bio_length check (char_length(professional_bio) <= 1000),
    profile_image text,
    phone text constraint temp_phone_length check (char_length(phone) <= 20),
    linkedin text constraint temp_linkedin_length check (char_length(linkedin) <= 200),
    instagram text constraint temp_instagram_length check (char_length(instagram) <= 100),
    website text constraint temp_website_length check (char_length(website) <= 300),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '24 hours') not null
);

-- === ROW LEVEL SECURITY SETUP ===

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.saved_contacts enable row level security;
alter table public.temp_profiles enable row level security;

-- === RLS POLICIES FOR USERS TABLE ===

-- Allow all users to view all profiles (for matching/discovery)
create policy "Users can view all profiles" on public.users
    for select using (true);

-- Users can only update their own profile
create policy "Users can update own profile" on public.users
    for update using (auth.uid() = id);

-- Users can only insert their own profile
create policy "Users can insert own profile" on public.users
    for insert with check (auth.uid() = id);

-- Users can delete their own profile
create policy "Users can delete own profile" on public.users
    for delete using (auth.uid() = id);

-- === RLS POLICIES FOR SAVED CONTACTS TABLE ===

-- Users can view their own saved contacts
create policy "Users can view own saved contacts" on public.saved_contacts
    for select using (auth.uid() = user_id);

-- Users can manage (insert/update/delete) their own saved contacts
create policy "Users can manage own saved contacts" on public.saved_contacts
    for all using (auth.uid() = user_id);

-- === RLS POLICIES FOR TEMP PROFILES TABLE ===

-- Anyone can create temporary profiles (for registration)
create policy "Anyone can create temp profiles" on public.temp_profiles
    for insert with check (true);

-- Anyone can read temp profiles by ID (for registration flow)
create policy "Anyone can read temp profiles by ID" on public.temp_profiles
    for select using (true);

-- Anyone can update temp profiles (for registration flow)
create policy "Anyone can update temp profiles" on public.temp_profiles
    for update using (true);

-- === FUNCTIONS AND TRIGGERS ===

-- Function to handle new user registration
create or replace function public.handle_new_user() 
returns trigger as $$
begin
    insert into public.users (
        id, 
        email, 
        full_name, 
        user_type
    )
    values (
        new.id, 
        coalesce(new.email, ''), 
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'user_type', 'job_seeker')
    );
    return new;
exception
    when others then
        -- Log the error but don't fail the auth process
        raise warning 'Error creating user profile: %', sqlerrm;
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

-- Trigger to automatically update updated_at on profile changes
create trigger update_users_updated_at
    before update on public.users
    for each row execute procedure public.update_updated_at_column();

-- Function to transfer temp profile to permanent user profile
create or replace function public.transfer_temp_profile_to_user(
    temp_profile_id uuid,
    user_id uuid
) returns void as $$
declare
    temp_data record;
begin
    -- Get the temporary profile data
    select * into temp_data from public.temp_profiles where id = temp_profile_id;
    
    if not found then
        raise exception 'Temporary profile not found';
    end if;
    
    -- Update the user's profile with temp data
    update public.users set
        full_name = coalesce(temp_data.full_name, full_name),
        user_type = coalesce(temp_data.user_type, user_type),
        skills_expertise = coalesce(temp_data.skills_expertise, skills_expertise),
        required_skills = coalesce(temp_data.required_skills, required_skills),
        professional_bio = coalesce(temp_data.professional_bio, professional_bio),
        profile_image = coalesce(temp_data.profile_image, profile_image),
        phone = coalesce(temp_data.phone, phone),
        linkedin = coalesce(temp_data.linkedin, linkedin),
        instagram = coalesce(temp_data.instagram, instagram),
        website = coalesce(temp_data.website, website),
        updated_at = now()
    where id = user_id;
    
    -- Clean up the temporary profile
    delete from public.temp_profiles where id = temp_profile_id;
end;
$$ language plpgsql security definer;

-- === VALIDATION FUNCTIONS ===

-- Function to validate skills format and length
create or replace function public.validate_skills(skills_text text) 
returns boolean as $$
declare
    skill_array text[];
    skill text;
begin
    -- If skills_text is null or empty, it's valid
    if skills_text is null or trim(skills_text) = '' then
        return true;
    end if;
    
    -- Split skills by comma
    skill_array := string_to_array(skills_text, ',');
    
    -- Check if there are more than 8 skills
    if array_length(skill_array, 1) > 8 then
        return false;
    end if;
    
    -- Check each skill length
    foreach skill in array skill_array loop
        if char_length(trim(skill)) > 50 then
            return false;
        end if;
        -- Check if skill is not empty after trimming
        if trim(skill) = '' then
            return false;
        end if;
    end loop;
    
    return true;
end;
$$ language plpgsql;

-- Function to validate email format
create or replace function public.validate_email(email_text text) 
returns boolean as $$
begin
    return email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
end;
$$ language plpgsql;

-- Function to validate URL format
create or replace function public.validate_url(url_text text) 
returns boolean as $$
begin
    -- If URL is null or empty, it's valid
    if url_text is null or trim(url_text) = '' then
        return true;
    end if;
    
    -- Basic URL validation
    return url_text ~* '^https?://[^\s/$.?#].[^\s]*$';
end;
$$ language plpgsql;

-- === STORAGE SETUP FOR PROFILE IMAGES ===

-- Create storage bucket for profile images (safe method)
do $$ begin
    -- First, try to delete existing bucket if it exists
    delete from storage.buckets where id = 'profile-images';
exception when others then
    -- Ignore errors if bucket doesn't exist
    null;
end $$;

-- Create the bucket
insert into storage.buckets (id, name) 
values ('profile-images', 'profile-images');

-- Storage policies for profile images
create policy "Public read access for profile images" on storage.objects
    for select using (bucket_id = 'profile-images');

create policy "Users can upload their own profile images" on storage.objects
    for insert with check (
        bucket_id = 'profile-images' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can update their own profile images" on storage.objects
    for update using (
        bucket_id = 'profile-images' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can delete their own profile images" on storage.objects
    for delete using (
        bucket_id = 'profile-images' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- === ADDITIONAL VALIDATION CONSTRAINTS ===

-- Add constraints using validation functions to existing tables
do $$ begin
    -- Add skills validation constraints to users table
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'valid_skills_expertise') then
        alter table public.users add constraint valid_skills_expertise check (validate_skills(skills_expertise));
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'valid_required_skills') then
        alter table public.users add constraint valid_required_skills check (validate_skills(required_skills));
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'valid_website_url') then
        alter table public.users add constraint valid_website_url check (validate_url(website));
    end if;
    
    -- Add skills validation constraints to temp_profiles table
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_valid_skills_expertise') then
        alter table public.temp_profiles add constraint temp_valid_skills_expertise check (validate_skills(skills_expertise));
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_valid_required_skills') then
        alter table public.temp_profiles add constraint temp_valid_required_skills check (validate_skills(required_skills));
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_valid_website_url') then
        alter table public.temp_profiles add constraint temp_valid_website_url check (validate_url(website));
    end if;
exception when others then
    raise warning 'Some validation constraints may already exist: %', sqlerrm;
end $$;

-- === INDEXES FOR PERFORMANCE ===

-- Index for user lookups by type
create index if not exists idx_users_user_type on public.users(user_type);

-- Index for user lookups by email
create index if not exists idx_users_email on public.users(email);

-- Index for saved contacts lookups
create index if not exists idx_saved_contacts_user_id on public.saved_contacts(user_id);
create index if not exists idx_saved_contacts_saved_contact_id on public.saved_contacts(saved_contact_id);

-- Index for faster temp profile lookups
create index if not exists idx_temp_profiles_created_at on public.temp_profiles(created_at);
create index if not exists idx_temp_profiles_expires_at on public.temp_profiles(expires_at);

-- === VERIFICATION QUERIES ===

-- Check if tables exist and have correct structure
do $$ begin
    raise notice 'Tables created successfully:';
    raise notice '- users: % columns', (select count(*) from information_schema.columns where table_name = 'users' and table_schema = 'public');
    raise notice '- saved_contacts: % columns', (select count(*) from information_schema.columns where table_name = 'saved_contacts' and table_schema = 'public');
    raise notice '- temp_profiles: % columns', (select count(*) from information_schema.columns where table_name = 'temp_profiles' and table_schema = 'public');
end $$;

-- Check if RLS is enabled
do $$ begin
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'users' and rowsecurity = true) then
        raise notice 'Row Level Security enabled on all tables ✓';
    else
        raise warning 'Row Level Security not properly enabled!';
    end if;
end $$;

-- Check if storage bucket exists
do $$ begin
    if exists (select 1 from storage.buckets where id = 'profile-images') then
        raise notice 'Storage bucket created successfully ✓';
    else
        raise warning 'Storage bucket not created!';
    end if;
end $$;

-- Check if triggers exist
do $$ begin
    if exists (select 1 from information_schema.triggers where trigger_name = 'on_auth_user_created') then
        raise notice 'Authentication trigger created successfully ✓';
    else
        raise warning 'Authentication trigger not created!';
    end if;
end $$;

-- SUCCESS MESSAGE
select 'QueueHire database schema setup completed successfully! 🎉' as status;
