'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function DashboardDebugPage() {
  const [manualCheck, setManualCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkDashboardAccess = async () => {
      try {
        // Check session directly
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Check user directly  
        const { data: { user: directUser }, error: userError } = await supabase.auth.getUser();
        
        // Try to fetch profile directly
        let directProfile = null;
        let profileError = null;
        if (directUser) {
          const { data: profileData, error: profError } = await supabase
            .from('users')
            .select('*')
            .eq('id', directUser.id)
            .single();
          directProfile = profileData;
          profileError = profError;
        }

        setManualCheck({
          session: {
            exists: !!session,
            user_id: session?.user?.id,
            email: session?.user?.email,
            error: sessionError?.message
          },
          directUser: {
            exists: !!directUser,
            id: directUser?.id,
            email: directUser?.email,
            error: userError?.message
          },
          directProfile: {
            exists: !!directProfile,
            data: directProfile,
            error: profileError?.message,
            code: profileError?.code
          },
          authHook: {
            user: !!user,
            profile: !!profile,
            loading: authLoading
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setManualCheck({
          error: String(error),
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    checkDashboardAccess();
  }, [user, profile, authLoading]);

  const tryCreateProfile = async () => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (!currentUser) {
        alert('No user found. Please login first.');
        return;
      }

      // Try creating with minimal data that should work
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: currentUser.id,
          email: currentUser.email!,
          user_type: currentUser.user_metadata?.user_type || 'job_seeker'
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        alert(`Profile creation failed: ${error.message}`);
      } else {
        alert('Profile created successfully! Try accessing dashboard now.');
        window.location.reload();
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '1rem' }}>Checking dashboard access...</div>
        <div style={{ width: '2rem', height: '2rem', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard Access Debug</h1>
      
      <div style={{ 
        padding: '1rem', 
        background: '#f3f4f6', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <h3>Current Auth State:</h3>
        <pre>{JSON.stringify(manualCheck, null, 2)}</pre>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={goToDashboard}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🎯 Try Dashboard Now
        </button>
        
        <button
          onClick={tryCreateProfile}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🔧 Create Profile
        </button>
        
        <Link 
          href="/login" 
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f59e0b',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            display: 'inline-block'
          }}
        >
          🔑 Go to Login
        </Link>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ 
        padding: '1rem', 
        background: manualCheck?.session?.exists ? '#d1fae5' : '#fee2e2',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h3>Quick Diagnosis:</h3>
        {manualCheck?.session?.exists ? (
          <div>
            ✅ <strong>You are logged in!</strong><br/>
            User ID: {manualCheck.session.user_id}<br/>
            Email: {manualCheck.session.email}
          </div>
        ) : (
          <div>
            ❌ <strong>You are NOT logged in</strong><br/>
            You need to login first before accessing the dashboard.
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1rem', 
        background: manualCheck?.directProfile?.exists ? '#d1fae5' : '#fee2e2',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h3>Profile Status:</h3>
        {manualCheck?.directProfile?.exists ? (
          <div>
            ✅ <strong>Profile exists!</strong><br/>
            You should be able to access the dashboard.
          </div>
        ) : (
          <div>
            ❌ <strong>No profile found</strong><br/>
            {manualCheck?.directProfile?.error && (
              <>Error: {manualCheck.directProfile.error}<br/></>
            )}
            Try clicking "Create Profile" button above.
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1rem', 
        background: '#fef3c7',
        borderRadius: '8px'
      }}>
        <h3>🎯 What to Do Next:</h3>
        <ol>
          <li><strong>If you're NOT logged in:</strong> Click "Go to Login" and sign in</li>
          <li><strong>If you're logged in but no profile:</strong> Click "Create Profile"</li>
          <li><strong>If both exist:</strong> Click "Try Dashboard Now" - it should work!</li>
          <li><strong>If dashboard still redirects:</strong> There might be middleware issues</li>
        </ol>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
