-- Add reviews/ratings system to QueueHire database
-- Run this in your Supabase SQL Editor

-- REVIEWS TABLE (for user ratings and reviews)
create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    reviewer_id uuid not null references public.users(id) on delete cascade,
    reviewed_user_id uuid not null references public.users(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    review_text text,
    meeting_context text, -- context about where they met (e.g., "Met through QueueHire matching")
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Prevent duplicate reviews from same user
    unique (reviewer_id, reviewed_user_id)
);

-- Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- RLS POLICIES FOR REVIEWS TABLE

-- Anyone can view reviews (public ratings)
create policy "Anyone can view reviews" on public.reviews
    for select using (true);

-- Users can only create reviews if they are the reviewer
create policy "Users can create own reviews" on public.reviews
    for insert with check (auth.uid() = reviewer_id);

-- Users can only update their own reviews
create policy "Users can update own reviews" on public.reviews
    for update using (auth.uid() = reviewer_id);

-- Users can delete their own reviews
create policy "Users can delete own reviews" on public.reviews
    for delete using (auth.uid() = reviewer_id);

-- CREATE INDEXES FOR PERFORMANCE
create index if not exists idx_reviews_reviewed_user_id on public.reviews(reviewed_user_id);
create index if not exists idx_reviews_reviewer_id on public.reviews(reviewer_id);
create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_reviews_created_at on public.reviews(created_at);

-- CREATE VIEW FOR USER RATING STATS
create or replace view public.user_rating_stats as
select 
    u.id as user_id,
    u.email,
    u.full_name,
    coalesce(round(avg(r.rating), 1), 0) as average_rating,
    coalesce(count(r.id), 0) as total_reviews,
    coalesce(count(r.id) filter (where r.rating = 5), 0) as five_star_count,
    coalesce(count(r.id) filter (where r.rating = 4), 0) as four_star_count,
    coalesce(count(r.id) filter (where r.rating = 3), 0) as three_star_count,
    coalesce(count(r.id) filter (where r.rating = 2), 0) as two_star_count,
    coalesce(count(r.id) filter (where r.rating = 1), 0) as one_star_count
from public.users u
left join public.reviews r on u.id = r.reviewed_user_id
group by u.id, u.email, u.full_name;

-- ADD SAMPLE REVIEWS (optional - for testing)
-- You can uncomment and modify these after you have real user IDs

-- INSERT INTO public.reviews (reviewer_id, reviewed_user_id, rating, review_text, meeting_context)
-- VALUES 
--   ('reviewer-user-id-1', 'reviewed-user-id', 5, 'Great professional to work with! Very skilled and communicative.', 'Met through QueueHire matching'),
--   ('reviewer-user-id-2', 'reviewed-user-id', 4, 'Good experience overall. Would recommend.', 'Met through QueueHire matching'),
--   ('reviewer-user-id-3', 'reviewed-user-id', 5, 'Excellent collaboration. Looking forward to working together again.', 'Met through QueueHire matching');

-- VERIFICATION QUERIES

-- Check if reviews table was created
select 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
from information_schema.columns 
where table_schema = 'public' 
    and table_name = 'reviews'
order by ordinal_position;

-- Check if view was created
select * from information_schema.views 
where table_schema = 'public' 
    and table_name = 'user_rating_stats';

-- Check if indexes were created
select indexname, indexdef 
from pg_indexes 
where tablename = 'reviews' 
    and schemaname = 'public';

-- SUCCESS MESSAGE
select 'Reviews system setup completed successfully! 🎉' as status;
