-- Migration to fix profile image issue
-- This updates the handle_new_user function to include profile image and other metadata

-- Drop and recreate the function with enhanced metadata handling
create or replace function public.handle_new_user() 
returns trigger as $$
begin
    insert into public.users (
        id, 
        email, 
        full_name, 
        user_type,
        profile_image,
        skills_expertise,
        required_skills,
        professional_bio
    )
    values (
        new.id, 
        coalesce(new.email, ''), 
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'user_type', 'job_seeker'),
        new.raw_user_meta_data->>'profile_image',
        new.raw_user_meta_data->>'skills',
        new.raw_user_meta_data->>'skills_needed',
        new.raw_user_meta_data->>'bio'
    );
    return new;
exception
    when others then
        -- Log the error but don't fail the auth process
        raise warning 'Error creating user profile: %', sqlerrm;
        return new;
end;
$$ language plpgsql security definer;
