-- TEMPORARY PROFILES TABLE FOR REGISTRATION FLOW
-- This stores profile data before email verification completes

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

-- Function to clean up expired temporary profiles
create or replace function public.cleanup_expired_temp_profiles()
returns void as $$
begin
    delete from public.temp_profiles 
    where expires_at < now();
end;
$$ language plpgsql security definer;

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
