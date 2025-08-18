'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SessionTestPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check:', { session, error });
        
        // Check user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User check:', { user, userError });

        // Check profile if user exists
        let profile = null;
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          console.log('Profile check:', { profileData, profileError });
          profile = profileData;
        }

        setSessionInfo({
          session,
          user,
          profile,
          sessionError: error,
          userError,
          cookies: document.cookie
        });
      } catch (error) {
        console.error('Session check error:', error);
        setSessionInfo({ error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Checking session...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>Session Test Page</h1>
      
      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2>Raw Session Data:</h2>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/login" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Login
        </Link>
        <Link href="/register" style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Register
        </Link>
        <Link href="/dashboard" style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Dashboard
        </Link>
        <Link href="/auth-debug" style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Auth Debug
        </Link>
      </div>

      {sessionInfo?.session && (
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
