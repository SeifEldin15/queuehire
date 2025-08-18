-- Fix for email verification issue
-- This updates the trigger to handle missing metadata gracefully

-- Drop the existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create improved function to handle new user registration
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

-- Recreate trigger to automatically create user profile on signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
