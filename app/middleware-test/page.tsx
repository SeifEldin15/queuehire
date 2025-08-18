'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MiddlewareTestPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const testMiddlewareLogic = async () => {
      try {
        // Simulate exactly what middleware does
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setResult({
          session: {
            exists: !!session,
            user_id: session?.user?.id,
            email: session?.user?.email,
            access_token: session?.access_token ? 'Present' : 'Missing',
            expires_at: session?.expires_at
          },
          error: error?.message,
          shouldRedirect: !session, // This is what middleware checks
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        setResult({
          error: String(err),
          timestamp: new Date().toISOString()
        });
      }
    };

    testMiddlewareLogic();
  }, []);

  const testDashboardAccess = async () => {
    try {
      // Try to fetch the dashboard page directly
      const response = await fetch('/dashboard', {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: {
          'Accept': 'text/html',
        }
      });
      
      console.log('Dashboard fetch response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        redirected: response.redirected
      });
      
      alert(`Dashboard fetch: ${response.status} - ${response.redirected ? 'Redirected to: ' + response.url : 'Success'}`);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      alert('Dashboard fetch failed: ' + String(err));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Middleware Logic Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={testDashboardAccess}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Test Dashboard Fetch
        </button>
        
        <a 
          href="/dashboard"
          target="_blank"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            display: 'inline-block'
          }}
        >
          Open Dashboard (New Tab)
        </a>
      </div>

      {result && (
        <div style={{
          padding: '1rem',
          background: result.shouldRedirect ? '#fee2e2' : '#d1fae5',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <h3>Middleware Logic Simulation:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          
          <div style={{ marginTop: '1rem', fontFamily: 'sans-serif' }}>
            {result.shouldRedirect ? (
              <p><strong>❌ Middleware would REDIRECT to login</strong></p>
            ) : (
              <p><strong>✅ Middleware would ALLOW access to dashboard</strong></p>
            )}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: '8px'
      }}>
        <h3>🔧 Troubleshooting Steps:</h3>
        <ol>
          <li><strong>Check the middleware result above</strong> - should show "ALLOW access"</li>
          <li><strong>Try "Open Dashboard (New Tab)"</strong> - opens in new tab to avoid cache</li>
          <li><strong>Check browser console</strong> (F12) for errors when accessing dashboard</li>
          <li><strong>Clear cookies</strong> for localhost:3000 and try again</li>
          <li><strong>Restart development server</strong> if middleware seems stuck</li>
        </ol>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#e0e7ff',
        borderRadius: '8px'
      }}>
        <h3>💡 Quick Fix Options:</h3>
        <p>If middleware keeps redirecting even with valid session:</p>
        <ol>
          <li><strong>Hard refresh dashboard page</strong> (Ctrl+F5)</li>
          <li><strong>Open incognito window</strong> and login fresh</li>
          <li><strong>Check if multiple Next.js processes</strong> are running</li>
        </ol>
      </div>
    </div>
  );
}
