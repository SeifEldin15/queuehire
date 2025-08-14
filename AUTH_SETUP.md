# QueueHire Authentication Setup

This document explains how to set up authentication with Supabase for the QueueHire application.

## Prerequisites

1. A Supabase account and project
2. Node.js and npm installed

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema

Run the SQL schema in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the SQL

The schema creates:
- `users` table (extends Supabase auth.users)
- `saved_contacts` table for user connections
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

### 3. Authentication Flow

The application supports:

#### Registration
1. User selects role (job seeker or hiring manager)
2. Fills out profile information
3. Creates account with email/password or Google OAuth
4. Email verification required
5. Profile data automatically created after verification

#### Login
1. Email/password or Google OAuth
2. Automatic profile completion if pending data exists
3. Redirect to dashboard upon successful login

#### Protected Routes
- Dashboard routes require authentication
- Automatic redirect to login if not authenticated
- Automatic redirect to dashboard if already authenticated and accessing auth pages

### 4. Key Features

- **Supabase Auth Integration**: Uses Supabase's built-in authentication
- **Row Level Security**: Database policies ensure users can only access their own data
- **Profile Management**: Automatic profile creation and updates
- **OAuth Support**: Google sign-in integration
- **Email Verification**: Required before account activation
- **Protected Routes**: Middleware and client-side route protection

### 5. Important Files

- `lib/useAuth.tsx` - Authentication context and hooks
- `lib/supabaseClient.ts` - Supabase client configuration
- `lib/types.ts` - TypeScript interfaces
- `middleware.ts` - Route protection middleware
- `components/ProtectedRoute.tsx` - Client-side route protection
- `supabase/schema.sql` - Database schema

### 6. Usage in Components

```tsx
import { useAuth } from '@/lib/useAuth';

function MyComponent() {
  const { user, profile, signIn, signOut, updateProfile } = useAuth();
  
  // Component logic here
}
```

### 7. Database Schema Details

#### Users Table
- Extends Supabase's `auth.users` with additional profile fields
- Stores user type (job_seeker or hiring)
- Profile information, skills, bio, etc.

#### Saved Contacts Table
- Links users to their saved contacts
- Prevents duplicate relationships
- Cascading deletes when users are removed

### 8. Security

- All database operations use Row Level Security
- Users can only access their own data
- Authentication required for all dashboard routes
- CSRF protection via Supabase's built-in security

### 9. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 10. Troubleshooting

- Ensure environment variables are set correctly
- Check Supabase project settings and RLS policies
- Verify database schema is properly installed
- Check browser console for authentication errors
