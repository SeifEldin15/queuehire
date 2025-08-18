-- Migration to add missing columns to users table
-- Run this in your Supabase SQL Editor

-- Add missing columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS professional_bio text,
ADD COLUMN IF NOT EXISTS skills_expertise text,
ADD COLUMN IF NOT EXISTS required_skills text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS profile_image text;

-- Update the plan_type constraint if needed
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_plan_type_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_plan_type_check 
CHECK (plan_type in ('Free', 'Essential', 'Power', 'Pro'));

-- Update the user_type constraint if needed  
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_user_type_check 
CHECK (user_type in ('job_seeker', 'hiring'));

-- Set default values
ALTER TABLE public.users 
ALTER COLUMN plan_type SET DEFAULT 'Free';

-- Ensure timestamps exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();
