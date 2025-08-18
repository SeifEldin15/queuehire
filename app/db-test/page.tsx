'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DatabaseTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      // Test 1: Check if we can connect to the database
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      setResult({
        test: 'Database Connection',
        success: !error,
        data,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Database Connection',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testProfileCreation = async () => {
    setLoading(true);
    try {
      // First get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Profile Creation',
          success: false,
          error: 'No authenticated user found',
          userError: userError?.message,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Try to create a profile
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || 'Test User',
        user_type: user.user_metadata?.user_type || 'job_seeker',
        plan_type: 'Free'
      };

      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();
      
      setResult({
        test: 'Profile Creation',
        success: !error,
        data,
        error: error?.message,
        profileData,
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Profile Creation',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testProfileFetch = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Profile Fetch',
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
        .eq('id', user.id)
        .single();
      
      setResult({
        test: 'Profile Fetch',
        success: !error,
        data,
        error: error?.message,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Profile Fetch',
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
      <h1>Database Test Page</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={testDatabaseConnection}
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
          Test DB Connection
        </button>
        
        <button
          onClick={testProfileFetch}
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
          Test Profile Fetch
        </button>
        
        <button
          onClick={testProfileCreation}
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
          Test Profile Creation
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

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>First, make sure you're logged in (go to /login if needed)</li>
          <li>Test DB Connection to verify database access</li>
          <li>Test Profile Fetch to see if a profile already exists</li>
          <li>Test Profile Creation to manually create a profile</li>
        </ol>
      </div>
    </div>
  );
}
