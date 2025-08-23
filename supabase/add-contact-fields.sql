-- Add social media and contact fields to users table
ALTER TABLE public.users 
ADD COLUMN linkedin text,
ADD COLUMN instagram text,
ADD COLUMN website text;

-- Add comment for documentation
COMMENT ON COLUMN public.users.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.users.instagram IS 'Instagram handle or URL';
COMMENT ON COLUMN public.users.website IS 'Personal or company website URL';
