'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SchemaTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTableSchema = async () => {
    setLoading(true);
    try {
      // Try to get table information from information_schema
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'users' })
        .single();
      
      if (error) {
        // Fallback: try a different approach
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select('*')
          .limit(0); // Don't get any rows, just the structure
        
        setResult({
          method: 'Fallback query',
          success: !fallbackError,
          error: fallbackError?.message,
          hint: fallbackError?.hint,
          details: fallbackError?.details,
          message: 'Could not get schema info, but this tells us about the current table structure',
          timestamp: new Date().toISOString()
        });
      } else {
        setResult({
          method: 'Schema query',
          success: true,
          data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setResult({
        method: 'Schema query',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testMinimalInsert = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Minimal Insert',
          success: false,
          error: 'No authenticated user found',
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Try inserting with only the minimum required fields
      const minimalData = {
        id: user.id,
        email: user.email!,
        user_type: 'job_seeker' // Required field based on schema
      };

      const { data, error } = await supabase
        .from('users')
        .insert(minimalData)
        .select()
        .single();
      
      setResult({
        test: 'Minimal Insert',
        success: !error,
        data,
        error: error?.message,
        hint: error?.hint,
        details: error?.details,
        code: error?.code,
        insertedData: minimalData,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Minimal Insert',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testCurrentProfile = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Current Profile',
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
        test: 'Current Profile',
        success: !error,
        data,
        error: error?.message,
        count: data?.length || 0,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Current Profile',
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
      <h1>Database Schema Test</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={checkTableSchema}
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
          Check Table Schema
        </button>
        
        <button
          onClick={testCurrentProfile}
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
          Check Current Profile
        </button>
        
        <button
          onClick={testMinimalInsert}
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
          Try Minimal Insert
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
          <h3>{result.test || result.method} Result:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#fef3c7', 
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        <h3>🔧 How to Fix the Schema Issue:</h3>
        <ol>
          <li>Go to your Supabase dashboard: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener">https://supabase.com/dashboard</a></li>
          <li>Navigate to your project → SQL Editor</li>
          <li>Copy the contents of <code>supabase/migration.sql</code> and run it</li>
          <li>This will add the missing <code>full_name</code> column and other required fields</li>
          <li>Come back here and test again</li>
        </ol>
        
        <p><strong>Or:</strong> Use "Try Minimal Insert" to create a profile with just the required fields that exist.</p>
      </div>
    </div>
  );
}
