# 🚀 Testing Dashboard Access - Complete Guide

## Current Status ✅
- **Authentication System**: Fully implemented
- **Dashboard**: Updated to work with new auth system  
- **Route Protection**: Both middleware and client-side protection active
- **Database Connection**: Configured and ready

## 🔧 To Test Dashboard Access, Follow These Steps:

### Step 1: Ensure Database Schema is Set Up
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mqahcqbffhbxayepbpqg
2. Navigate to **SQL Editor**
3. Copy the entire content from `supabase/schema.sql`
4. Paste and **Execute** the SQL

### Step 2: Test Connection
1. Visit: http://localhost:3000/test-connection
2. Click "Test Connection" button
3. Should show "✅ Connection successful!"

### Step 3: Register a New User
1. Go to: http://localhost:3000/register
2. Select "Job Seeker" or "Recruiter" 
3. Fill out profile information
4. Go to: http://localhost:3000/register/confirm
5. Enter email and password
6. Complete registration

### Step 4: Verify Email (Important!)
1. Check your email inbox
2. Click the verification link from Supabase
3. This step is **required** for login

### Step 5: Login and Access Dashboard
1. Go to: http://localhost:3000/login
2. Enter your email and password
3. Should automatically redirect to: http://localhost:3000/dashboard

## 🛠️ If Dashboard Access Still Doesn't Work:

### Check Authentication State
Add this to any page to debug:
```jsx
import { useAuth } from '@/lib/useAuth';

function DebugAuth() {
  const { user, profile, loading } = useAuth();
  
  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h3>Auth Debug Info:</h3>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      <p>User: {user ? user.email : 'Not logged in'}</p>
      <p>Profile: {profile ? 'Exists' : 'Missing'}</p>
      <pre>{JSON.stringify({ user: !!user, profile }, null, 2)}</pre>
    </div>
  );
}
```

### Verify Middleware is Working
1. Try accessing http://localhost:3000/dashboard without being logged in
2. Should redirect to login page
3. If it doesn't redirect, check browser console for errors

### Check Database Tables
In Supabase SQL Editor, run:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if user was created
SELECT * FROM auth.users LIMIT 5;

-- Check if profile was created
SELECT * FROM public.users LIMIT 5;
```

## 🔄 Alternative Testing Method (Create Test User via SQL)

If you want to test immediately without email verification:
```sql
-- In Supabase SQL Editor, run this to create a test user:
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Then create corresponding profile
INSERT INTO public.users (
  id,
  email,
  full_name,
  user_type,
  plan_type
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  'Test User',
  'job_seeker',
  'Free'
);
```

Then login with:
- Email: test@example.com  
- Password: password123

## 🎯 Expected Flow:
1. **Not Logged In** → Trying to access /dashboard → **Redirects to /login**
2. **Logged In** → Accessing /login or /register → **Redirects to /dashboard**  
3. **Logged In** → Accessing /dashboard → **Shows dashboard with user info**

## 🆘 Common Issues:

### Issue: "User logged in but no profile"
**Solution:** The auth hook now automatically creates a profile if missing

### Issue: "Infinite redirect loop"
**Solution:** Check browser console, usually a middleware configuration issue

### Issue: "Failed to fetch" errors
**Solution:** Verify environment variables and Supabase project is active

### Issue: "Dashboard shows loading forever"
**Solution:** Check if user has email_confirmed_at set in auth.users table

## ✅ Success Indicators:
- User can register → receive email → verify → login → access dashboard
- Dashboard shows user's name, plan, and profile information
- Protected routes work (can't access dashboard when logged out)
- Auth redirects work (logged in users can't access login page)

Let me know if you encounter any specific issues!
