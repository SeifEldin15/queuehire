# Database Setup Instructions

## Step 1: Run the Schema in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: `queuehire`
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the entire contents of `supabase/schema.sql` into the SQL editor
5. Click **Run** to execute the schema

This will create:
- The `public.users` table with all required columns
- The `public.saved_contacts` table
- All the required policies and triggers
- The automatic user profile creation function

## Step 2: Verify the Setup

After running the schema, test with this query:
```sql
SELECT * FROM public.users WHERE id = '2221c29d-5393-4649-9b8a-0d66246554b0';
```

## Step 3: Test the Registration

Once the schema is created, the registration page should work properly.
