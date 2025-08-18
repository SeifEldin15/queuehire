'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RLSTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthContext = async () => {
    setLoading(true);
    try {
      // Check the current auth context
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      setResult({
        test: 'Auth Context Check',
        success: !sessionError && !userError,
        session: {
          exists: !!session,
          user_id: session?.user?.id,
          access_token: session?.access_token ? 'Present' : 'Missing'
        },
        user: {
          exists: !!user,
          id: user?.id,
          email: user?.email,
          metadata: user?.user_metadata
        },
        sessionError: sessionError?.message,
        userError: userError?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Auth Context Check',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testRLSBypass = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'RLS Bypass Test',
          success: false,
          error: 'No authenticated user found',
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Try using the service role for admin operations (if available)
      // This bypasses RLS for testing
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          user_type: 'job_seeker'
        })
        .select()
        .single();
      
      setResult({
        test: 'RLS Bypass Test',
        success: !error,
        data,
        error: error?.message,
        code: error?.code,
        hint: error?.hint,
        details: error?.details,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'RLS Bypass Test',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpsert = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Upsert Test',
          success: false,
          error: 'No authenticated user found',
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Try using upsert instead of insert - this might work better with RLS
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          user_type: 'job_seeker'
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
      
      setResult({
        test: 'Upsert Test',
        success: !error,
        data,
        error: error?.message,
        code: error?.code,
        hint: error?.hint,
        details: error?.details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Upsert Test',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingProfile = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Check Existing Profile',
          success: false,
          error: 'No authenticated user found',
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);
      
      setResult({
        test: 'Check Existing Profile',
        success: !error,
        data,
        error: error?.message,
        profileExists: data && data.length > 0,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Check Existing Profile',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>RLS (Row Level Security) Test Page</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={checkAuthContext}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Check Auth Context
        </button>
        
        <button
          onClick={checkExistingProfile}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Check Existing Profile
        </button>
        
        <button
          onClick={testUpsert}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Try Upsert
        </button>
        
        <button
          onClick={testRLSBypass}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test RLS Bypass
        </button>
      </div>

      {loading && (
        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '4px' }}>
          Running test...
        </div>
      )}

      {result && (
        <div style={{
          padding: '1rem',
          background: result.success ? '#d1fae5' : '#fee2e2',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          <h3>{result.test} Result:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#fee2e2', 
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        <h3>🚨 RLS Policy Issue Detected</h3>
        <p>The error <code>"new row violates row-level security policy"</code> means the database security policies are preventing profile creation.</p>
        
        <h4>Quick Fix Options:</h4>
        <ol>
          <li><strong>Run the RLS fix script:</strong>
            <ul>
              <li>Go to your Supabase dashboard → SQL Editor</li>
              <li>Copy and run the contents of <code>supabase/fix-rls.sql</code></li>
            </ul>
          </li>
          <li><strong>Or temporarily disable RLS for testing:</strong>
            <ul>
              <li>In Supabase SQL Editor, run: <code>ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;</code></li>
              <li>Test profile creation, then re-enable: <code>ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;</code></li>
            </ul>
          </li>
          <li><strong>Check if profile already exists:</strong>
            <ul>
              <li>Click "Check Existing Profile" - you might already have a profile!</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
