'use client';

import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function AuthDebugPage() {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Debug Information</h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h2>Current Auth State</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
        <p><strong>Profile Exists:</strong> {profile ? 'Yes' : 'No'}</p>
        
        {user && (
          <div>
            <h3>User Info:</h3>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
          </div>
        )}
        
        {profile && (
          <div>
            <h3>Profile Info:</h3>
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>User Type:</strong> {profile.user_type}</p>
            <p><strong>Plan:</strong> {profile.plan_type}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link 
          href="/dashboard" 
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#3b82f6', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px' 
          }}
        >
          Go to Dashboard
        </Link>
        
        <Link 
          href="/login" 
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#10b981', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px' 
          }}
        >
          Go to Login
        </Link>
        
        <Link 
          href="/register" 
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#f59e0b', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px' 
          }}
        >
          Go to Register
        </Link>
        
        {user && (
          <button 
            onClick={signOut}
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        )}
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <h3>Debug Instructions:</h3>
        <ol>
          <li>If not logged in, register/login first</li>
          <li>Check if user and profile are both present</li>
          <li>Try accessing dashboard - should work if authenticated</li>
          <li>Try accessing login while logged in - should redirect to dashboard</li>
        </ol>
      </div>
    </div>
  );
}
