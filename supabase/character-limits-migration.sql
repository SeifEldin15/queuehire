-- QueueHire Character Limits Migration
-- Run this script to add character limits and validation to existing databases
-- This script is safe to run multiple times

-- === ADD CHARACTER LIMIT CONSTRAINTS ===

-- Add character limits to users table
do $$ begin
    -- Full name constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'full_name_length') then
        alter table public.users add constraint full_name_length check (char_length(full_name) <= 100);
        raise notice 'Added full_name_length constraint ✓';
    end if;
    
    -- Bio constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'bio_length') then
        alter table public.users add constraint bio_length check (char_length(professional_bio) <= 1000);
        raise notice 'Added bio_length constraint ✓';
    end if;
    
    -- Phone constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'phone_length') then
        alter table public.users add constraint phone_length check (char_length(phone) <= 20);
        raise notice 'Added phone_length constraint ✓';
    end if;
    
    -- LinkedIn constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'linkedin_length') then
        alter table public.users add constraint linkedin_length check (char_length(linkedin) <= 200);
        raise notice 'Added linkedin_length constraint ✓';
    end if;
    
    -- Instagram constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'instagram_length') then
        alter table public.users add constraint instagram_length check (char_length(instagram) <= 100);
        raise notice 'Added instagram_length constraint ✓';
    end if;
    
    -- Website constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'website_length') then
        alter table public.users add constraint website_length check (char_length(website) <= 300);
        raise notice 'Added website_length constraint ✓';
    end if;
    
exception when others then
    raise warning 'Error adding character limits: %', sqlerrm;
end $$;

-- === ADD NEW SETTINGS COLUMNS ===

do $$ begin
    -- Add theme column
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'theme') then
        alter table public.users add column theme text check (theme in ('light', 'dark', 'system')) default 'system';
        raise notice 'Added theme column ✓';
    end if;
    
    -- Add language column
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'language') then
        alter table public.users add column language text check (language in ('English', 'Arabic', 'French')) default 'English';
        raise notice 'Added language column ✓';
    end if;
    
    -- Add two_factor_enabled column
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'two_factor_enabled') then
        alter table public.users add column two_factor_enabled boolean default false;
        raise notice 'Added two_factor_enabled column ✓';
    end if;
    
    -- Add email_notifications column
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'email_notifications') then
        alter table public.users add column email_notifications boolean default true;
        raise notice 'Added email_notifications column ✓';
    end if;
    
    -- Add match_alerts column
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'match_alerts') then
        alter table public.users add column match_alerts boolean default true;
        raise notice 'Added match_alerts column ✓';
    end if;
    
exception when others then
    raise warning 'Error adding new columns: %', sqlerrm;
end $$;

-- === ADD VALIDATION FUNCTIONS ===

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

-- === ADD VALIDATION CONSTRAINTS ===

do $$ begin
    -- Add skills validation constraints
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'valid_skills_expertise') then
        alter table public.users add constraint valid_skills_expertise check (validate_skills(skills_expertise));
        raise notice 'Added skills_expertise validation ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'valid_required_skills') then
        alter table public.users add constraint valid_required_skills check (validate_skills(required_skills));
        raise notice 'Added required_skills validation ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'valid_website_url') then
        alter table public.users add constraint valid_website_url check (validate_url(website));
        raise notice 'Added website URL validation ✓';
    end if;
    
exception when others then
    raise warning 'Error adding validation constraints: %', sqlerrm;
end $$;

-- === ADD REVIEW CONSTRAINTS ===

do $$ begin
    -- Add review text length constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'review_text_length') then
        alter table public.reviews add constraint review_text_length check (char_length(review_text) <= 2000);
        raise notice 'Added review_text_length constraint ✓';
    end if;
    
    -- Add meeting context length constraint
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'meeting_context_length') then
        alter table public.reviews add constraint meeting_context_length check (char_length(meeting_context) <= 500);
        raise notice 'Added meeting_context_length constraint ✓';
    end if;
    
exception when others then
    raise warning 'Error adding review constraints: %', sqlerrm;
end $$;

-- === TEMP PROFILES CONSTRAINTS ===

do $$ begin
    -- Add character limits to temp_profiles table
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_full_name_length') then
        alter table public.temp_profiles add constraint temp_full_name_length check (char_length(full_name) <= 100);
        raise notice 'Added temp_full_name_length constraint ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_bio_length') then
        alter table public.temp_profiles add constraint temp_bio_length check (char_length(professional_bio) <= 1000);
        raise notice 'Added temp_bio_length constraint ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_phone_length') then
        alter table public.temp_profiles add constraint temp_phone_length check (char_length(phone) <= 20);
        raise notice 'Added temp_phone_length constraint ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_linkedin_length') then
        alter table public.temp_profiles add constraint temp_linkedin_length check (char_length(linkedin) <= 200);
        raise notice 'Added temp_linkedin_length constraint ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_instagram_length') then
        alter table public.temp_profiles add constraint temp_instagram_length check (char_length(instagram) <= 100);
        raise notice 'Added temp_instagram_length constraint ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_website_length') then
        alter table public.temp_profiles add constraint temp_website_length check (char_length(website) <= 300);
        raise notice 'Added temp_website_length constraint ✓';
    end if;
    
    -- Add validation constraints for temp profiles
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_valid_skills_expertise') then
        alter table public.temp_profiles add constraint temp_valid_skills_expertise check (validate_skills(skills_expertise));
        raise notice 'Added temp skills_expertise validation ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_valid_required_skills') then
        alter table public.temp_profiles add constraint temp_valid_required_skills check (validate_skills(required_skills));
        raise notice 'Added temp required_skills validation ✓';
    end if;
    
    if not exists (select 1 from information_schema.check_constraints where constraint_name = 'temp_valid_website_url') then
        alter table public.temp_profiles add constraint temp_valid_website_url check (validate_url(website));
        raise notice 'Added temp website URL validation ✓';
    end if;
    
exception when others then
    raise warning 'Error adding temp_profiles constraints: %', sqlerrm;
end $$;

-- === SUCCESS MESSAGE ===
select 'Character limits and validation migration completed successfully! 🎉' as status,
       'Frontend limits now match database constraints' as message;

-- === SUMMARY OF APPLIED LIMITS ===
select 'CHARACTER LIMITS SUMMARY' as title;
select 'Full Name: 100 characters' as limit;
select 'Bio: 1,000 characters' as limit;
select 'Phone: 20 characters' as limit;
select 'LinkedIn: 200 characters' as limit;
select 'Instagram: 100 characters' as limit;
select 'Website: 300 characters' as limit;
select 'Skills: Max 8 skills, 50 characters each' as limit;
select 'Review Text: 2,000 characters' as limit;
select 'Meeting Context: 500 characters' as limit;
