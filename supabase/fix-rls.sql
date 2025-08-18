-- Fix for RLS policy issue
-- Run this in your Supabase SQL Editor

-- First, let's see what's causing the RLS issue by temporarily disabling it for testing
-- WARNING: This temporarily removes security - only for testing!

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Recreate policies with better conditions
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow users to view all profiles (for public display)
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT 
    USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Alternative: If the above still doesn't work, temporarily disable RLS for testing
-- UNCOMMENT THESE LINES ONLY FOR TESTING:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- After testing works, re-enable with:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
