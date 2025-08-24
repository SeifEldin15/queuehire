-- QueueHire Final Database Schema
-- This includes all tables, policies, triggers, and storage setup
-- Run this in your Supabase SQL Editor to set up everything

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing objects if they exist (for clean setup)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists update_users_updated_at on public.users;
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at_column();
drop policy if exists "Users can view all profiles" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can view own saved contacts" on public.saved_contacts;
drop policy if exists "Users can manage own saved contacts" on public.saved_contacts;
drop table if exists public.saved_contacts;
drop table if exists public.users;

-- USERS TABLE (extends Supabase auth.users)
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    professional_bio text,
    skills_expertise text, -- for job seeker
    required_skills text,  -- for hiring person
    profile_image text,
    user_type text check (user_type in ('job_seeker', 'hiring')) not null default 'job_seeker',
    plan_type text check (plan_type in ('Free', 'Essential', 'Power', 'Pro')) default 'Free',
    phone text,
    linkedin text,
    instagram text,
    website text,
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

-- REVIEWS TABLE (for user ratings and reviews)
create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    reviewer_id uuid not null references public.users(id) on delete cascade,
    reviewed_user_id uuid not null references public.users(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    review_text text,
    meeting_context text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (reviewer_id, reviewed_user_id) -- prevent duplicate reviews
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.saved_contacts enable row level security;
alter table public.reviews enable row level security;

-- RLS POLICIES FOR USERS TABLE

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

-- RLS POLICIES FOR SAVED CONTACTS TABLE

-- Users can view their own saved contacts
create policy "Users can view own saved contacts" on public.saved_contacts
    for select using (auth.uid() = user_id);

-- Users can manage (insert/update/delete) their own saved contacts
create policy "Users can manage own saved contacts" on public.saved_contacts
    for all using (auth.uid() = user_id);

-- RLS POLICIES FOR REVIEWS TABLE

-- Anyone can view reviews (public ratings)
create policy "Anyone can view reviews" on public.reviews
    for select using (true);

-- Users can only create reviews if they are the reviewer
create policy "Users can create own reviews" on public.reviews
    for insert with check (auth.uid() = reviewer_id);

-- Users can only update their own reviews
create policy "Users can update own reviews" on public.reviews
    for update using (auth.uid() = reviewer_id);

-- Users can delete their own reviews
create policy "Users can delete own reviews" on public.reviews
    for delete using (auth.uid() = reviewer_id);

-- FUNCTIONS AND TRIGGERS

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
        new.email, 
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

-- STORAGE SETUP FOR PROFILE IMAGES

-- Create storage bucket for profile images
insert into storage.buckets (id, name, public) 
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

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

-- INDEXES FOR PERFORMANCE

-- Index for user lookups by type
create index if not exists idx_users_user_type on public.users(user_type);

-- Index for user lookups by email
create index if not exists idx_users_email on public.users(email);

-- Index for saved contacts lookups
create index if not exists idx_saved_contacts_user_id on public.saved_contacts(user_id);
create index if not exists idx_saved_contacts_saved_contact_id on public.saved_contacts(saved_contact_id);

-- Indexes for reviews
create index if not exists idx_reviews_reviewed_user_id on public.reviews(reviewed_user_id);
create index if not exists idx_reviews_reviewer_id on public.reviews(reviewer_id);
create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_reviews_created_at on public.reviews(created_at);

-- TEMPORARY PROFILES TABLE FOR REGISTRATION FLOW
create table if not exists public.temp_profiles (
    id uuid default gen_random_uuid() primary key,
    full_name text,
    user_type text check (user_type in ('job_seeker', 'hiring')) not null,
    skills_expertise text,
    required_skills text,
    professional_bio text,
    profile_image text,
    phone text,
    linkedin text,
    instagram text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '24 hours') not null
);

-- Index for faster lookups
create index if not exists idx_temp_profiles_created_at on public.temp_profiles(created_at);
create index if not exists idx_temp_profiles_expires_at on public.temp_profiles(expires_at);

-- RLS Policies for temp_profiles (no auth required since users aren't logged in yet)
alter table public.temp_profiles enable row level security;

-- Anyone can create temporary profiles (for registration)
create policy "Anyone can create temp profiles" on public.temp_profiles
    for insert with check (true);

-- Anyone can read temp profiles by ID (for registration flow)
create policy "Anyone can read temp profiles by ID" on public.temp_profiles
    for select using (true);

-- Anyone can update temp profiles (for registration flow)
create policy "Anyone can update temp profiles" on public.temp_profiles
    for update using (true);

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

-- CREATE VIEW FOR USER RATING STATS
create or replace view public.user_rating_stats as
select 
    u.id as user_id,
    u.email,
    u.full_name,
    coalesce(round(avg(r.rating), 1), 0) as average_rating,
    coalesce(count(r.id), 0) as total_reviews,
    coalesce(count(r.id) filter (where r.rating = 5), 0) as five_star_count,
    coalesce(count(r.id) filter (where r.rating = 4), 0) as four_star_count,
    coalesce(count(r.id) filter (where r.rating = 3), 0) as three_star_count,
    coalesce(count(r.id) filter (where r.rating = 2), 0) as two_star_count,
    coalesce(count(r.id) filter (where r.rating = 1), 0) as one_star_count
from public.users u
left join public.reviews r on u.id = r.reviewed_user_id
group by u.id, u.email, u.full_name;

-- SAMPLE DATA (optional - remove if not needed)

-- Insert some sample users for testing (only if table is empty)
-- do $$
-- begin
--     if not exists (select 1 from public.users limit 1) then
--         insert into public.users (id, email, full_name, user_type, professional_bio, skills_expertise, required_skills) values
--         (gen_random_uuid(), 'john.seeker@example.com', 'John Doe', 'job_seeker', 'Experienced software developer', 'JavaScript, React, Node.js', null),
--         (gen_random_uuid(), 'jane.recruiter@example.com', 'Jane Smith', 'hiring', 'Tech recruiter at StartupCorp', null, 'Full-stack development, React');
--     end if;
-- end $$;

-- VERIFICATION QUERIES (run these to check everything is set up correctly)

-- Check if tables exist and have correct structure
select 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
from information_schema.columns 
where table_schema = 'public' 
    and table_name in ('users', 'saved_contacts')
order by table_name, ordinal_position;

-- Check if RLS is enabled
select 
    tablename, 
    rowsecurity as rls_enabled
from pg_tables 
where schemaname = 'public' 
    and tablename in ('users', 'saved_contacts');

-- Check if storage bucket exists
select 
    id, 
    name, 
    public
from storage.buckets 
where id = 'profile-images';

-- Check if triggers exist
select 
    trigger_name, 
    event_manipulation, 
    event_object_table
from information_schema.triggers 
where trigger_schema = 'public'
    or (trigger_schema = 'auth' and trigger_name = 'on_auth_user_created');

-- SUCCESS MESSAGE
select 'QueueHire database schema setup completed successfully! 🎉' as status;
