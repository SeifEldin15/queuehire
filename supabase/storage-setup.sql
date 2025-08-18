-- Storage setup for profile images
-- This should be run in the Supabase dashboard SQL editor or via migrations

-- Create profile-images storage bucket
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true);

-- Set up RLS policies for profile-images bucket
create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'profile-images');

create policy "Anyone can view profile images" on storage.objects
  for select using (bucket_id = 'profile-images');

create policy "Users can upload profile images" on storage.objects
  for insert with check (
    bucket_id = 'profile-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update own profile images" on storage.objects
  for update using (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own profile images" on storage.objects
  for delete using (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
