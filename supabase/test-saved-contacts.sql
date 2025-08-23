-- Test function to add some sample saved contacts
-- You can run this in your Supabase SQL Editor to test the favorites functionality

-- First, let's see if there are any users to save as contacts
SELECT id, full_name, email, user_type FROM public.users LIMIT 5;

-- Example: Add a saved contact (replace the UUIDs with actual user IDs from your database)
-- INSERT INTO public.saved_contacts (user_id, saved_contact_id)
-- VALUES 
--   ('your-user-id-here', 'contact-user-id-here');

-- To test with sample data, you can create test users first:
-- INSERT INTO public.users (id, email, full_name, user_type, plan_type)
-- VALUES 
--   (gen_random_uuid(), 'test.seeker@example.com', 'John Doe', 'job_seeker', 'Free'),
--   (gen_random_uuid(), 'test.recruiter@example.com', 'Jane Smith', 'hiring', 'Essential');

-- Then add them as saved contacts:
-- INSERT INTO public.saved_contacts (user_id, saved_contact_id)
-- SELECT 
--   (SELECT id FROM public.users WHERE email = 'your-actual-email@example.com'),
--   (SELECT id FROM public.users WHERE email = 'test.seeker@example.com');
