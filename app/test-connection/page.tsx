'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      console.log('Testing Supabase connection...');
      
      // Test the connection by getting the current session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setStatus(`Error: ${error.message}`);
        console.error('Connection error:', error);
      } else {
        setStatus('✅ Connection successful!');
        console.log('Connection successful:', data);
      }
    } catch (error) {
      setStatus(`❌ Connection failed: ${error}`);
      console.error('Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Supabase Connection Test</h1>
      <p>Current environment variables:</p>
      <ul>
        <li>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
        <li>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
      </ul>
      
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          backgroundColor: '#0066ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      <p style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        Status: {status}
      </p>
    </div>
  );
}
