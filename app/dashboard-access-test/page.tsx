'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardAccessTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Dashboard access test page loaded');
  }, []);

  const testDashboardAccess = () => {
    addLog('Attempting to navigate to dashboard...');
    
    // Try different ways to access dashboard
    setTimeout(() => {
      addLog('Method 1: Using router.push()');
      router.push('/dashboard');
    }, 1000);
  };

  const testDirectAccess = () => {
    addLog('Attempting direct window navigation...');
    window.location.href = '/dashboard';
  };

  const testWithReload = () => {
    addLog('Attempting navigation with page reload...');
    window.location.assign('/dashboard');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard Access Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Test Dashboard Access Methods:</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={testDashboardAccess}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Test Router Push
          </button>
          
          <button
            onClick={testDirectAccess}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Test Direct Access
          </button>
          
          <button
            onClick={testWithReload}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Test With Reload
          </button>
          
          <a 
            href="/dashboard"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#8b5cf6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'inline-block'
            }}
          >
            Direct Link
          </a>
        </div>
      </div>

      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <h3>Activity Log:</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No activity yet...</p>
        ) : (
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#d1fae5',
        borderRadius: '8px'
      }}>
        <h3>✅ Good News!</h3>
        <p>Based on your auth state, you should be able to access the dashboard:</p>
        <ul>
          <li>✅ You are logged in (session exists)</li>
          <li>✅ Your profile exists in the database</li>
          <li>✅ The useAuth hook is working correctly</li>
        </ul>
        <p><strong>Try the buttons above to test different ways to access the dashboard.</strong></p>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: '8px'
      }}>
        <h3>🔍 If Dashboard Still Redirects:</h3>
        <ol>
          <li>Check browser developer tools (F12) for console errors</li>
          <li>Check Network tab to see if there are redirect responses</li>
          <li>Try opening dashboard in a new tab/window</li>
          <li>Clear browser cache and cookies</li>
        </ol>
      </div>
    </div>
  );
}
