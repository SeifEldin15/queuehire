'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DatabaseInspectorPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const inspectUsersTable = async () => {
    setLoading(true);
    try {
      // Try to get one row to see what columns exist
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      // Also try to insert with an empty object to see what's required
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({})
        .select()
        .single();
      
      setResult({
        test: 'Database Structure Inspection',
        selectQuery: {
          success: !error,
          data,
          error: error?.message,
          columns: data && data.length > 0 ? Object.keys(data[0]) : 'No data to inspect columns'
        },
        insertTest: {
          success: !insertError,
          data: insertData,
          error: insertError?.message,
          code: insertError?.code,
          hint: insertError?.hint,
          details: insertError?.details
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Database Structure Inspection',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkRequiredColumns = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Required Columns Check',
          success: false,
          error: 'No authenticated user found',
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Try inserting with different combinations of fields to see what's required
      const testCombinations = [
        // Test 1: Minimal fields
        {
          name: 'Minimal fields',
          data: {
            id: user.id,
            email: user.email
          }
        },
        // Test 2: Add user_type
        {
          name: 'With user_type',
          data: {
            id: user.id,
            email: user.email,
            user_type: 'job_seeker'
          }
        },
        // Test 3: Add password_hash (empty)
        {
          name: 'With empty password_hash',
          data: {
            id: user.id,
            email: user.email,
            user_type: 'job_seeker',
            password_hash: ''
          }
        },
        // Test 4: Add password_hash (dummy value)
        {
          name: 'With dummy password_hash',
          data: {
            id: user.id,
            email: user.email,
            user_type: 'job_seeker',
            password_hash: 'dummy_hash_for_testing'
          }
        }
      ];

      const results = [];
      
      for (const test of testCombinations) {
        try {
          const { data, error } = await supabase
            .from('users')
            .insert(test.data)
            .select()
            .single();
          
          results.push({
            ...test,
            success: !error,
            data,
            error: error?.message,
            code: error?.code
          });
          
          // If one succeeds, break and clean up
          if (!error) {
            // Delete the test record
            await supabase.from('users').delete().eq('id', user.id);
            break;
          }
        } catch (err) {
          results.push({
            ...test,
            success: false,
            error: String(err)
          });
        }
      }
      
      setResult({
        test: 'Required Columns Check',
        userId: user.id,
        testResults: results,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      setResult({
        test: 'Required Columns Check',
        success: false,
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfProfileExists = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          test: 'Profile Existence Check',
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
        test: 'Profile Existence Check',
        success: !error,
        profileExists: data && data.length > 0,
        profileData: data,
        error: error?.message,
        userId: user.id,
        authUser: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setResult({
        test: 'Profile Existence Check',
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
      <h1>Database Inspector</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={checkIfProfileExists}
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
          Check If Profile Exists
        </button>
        
        <button
          onClick={inspectUsersTable}
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
          Inspect Table Structure
        </button>
        
        <button
          onClick={checkRequiredColumns}
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
          Test Required Columns
        </button>
      </div>

      {loading && (
        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '4px' }}>
          Running database inspection...
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
        background: '#fef3c7', 
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        <h3>🔍 Database Issue Analysis</h3>
        <p>The error <code>"null value in column \"password_hash\" violates not-null constraint"</code> means:</p>
        
        <ol>
          <li><strong>Good news:</strong> RLS is working! We got past the security policy issue.</li>
          <li><strong>Issue:</strong> Your database has a required <code>password_hash</code> column that our schema doesn't include.</li>
          <li><strong>Solution:</strong> We need to either provide a value for <code>password_hash</code> or make it optional.</li>
        </ol>
        
        <h4>Try this order:</h4>
        <ol>
          <li><strong>"Check If Profile Exists"</strong> - You might already have a profile!</li>
          <li><strong>"Inspect Table Structure"</strong> - See what columns exist</li>
          <li><strong>"Test Required Columns"</strong> - Find the exact requirements</li>
        </ol>
      </div>
    </div>
  );
}
