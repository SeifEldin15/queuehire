-- Add this to your Supabase SQL editor to automatically create user profiles
-- This trigger will create a user profile automatically when a new user signs up

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, user_type, plan_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'user_type', 'job_seeker'),
    'Free'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
