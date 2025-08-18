'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function RegistrationTestPage() {
    const { user, profile, signUp, signIn } = useAuth();
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('TestPassword123!');
    const [fullName, setFullName] = useState('John Doe');
    const [bio, setBio] = useState('I am a passionate software developer with 5 years of experience in React and Node.js.');
    const [skills, setSkills] = useState('React, TypeScript, Node.js, Python');
    const [userType, setUserType] = useState<'job_seeker' | 'hiring'>('job_seeker');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const testRegistration = async () => {
        setLoading(true);
        setMessage('');
        
        try {
            // First save profile data to localStorage like the registration flow does
            const pendingProfile = {
                fullName,
                role: userType,
                skills: userType === 'job_seeker' ? skills : undefined,
                skills_needed: userType === 'hiring' ? skills : undefined,
                bio,
                profile_image: '',
            };
            
            localStorage.setItem('pendingProfile', JSON.stringify(pendingProfile));
            setMessage('Step 1: Saved profile data to localStorage');
            
            // Now attempt signup
            const { error } = await signUp(email, password, {
                full_name: fullName,
                user_type: userType,
            });
            
            if (error) {
                setMessage(`Registration failed: ${error.message}`);
            } else {
                setMessage('Registration successful! Check your email for verification.');
            }
        } catch (err) {
            setMessage(`Error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const testLogin = async () => {
        setLoading(true);
        setMessage('');
        
        try {
            const { error } = await signIn(email, password);
            
            if (error) {
                setMessage(`Login failed: ${error.message}`);
            } else {
                setMessage('Login successful!');
            }
        } catch (err) {
            setMessage(`Error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const checkProfile = async () => {
        if (!user) {
            setMessage('No user logged in');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                setMessage(`Profile check failed: ${error.message}`);
            } else {
                setMessage(`Profile found: ${JSON.stringify(data, null, 2)}`);
            }
        } catch (err) {
            setMessage(`Error: ${err}`);
        }
    };

    const clearData = () => {
        localStorage.removeItem('pendingProfile');
        setMessage('Cleared localStorage');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Registration & Database Test</h1>
            
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                <h3>Current State:</h3>
                <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
                <p><strong>Profile:</strong> {profile ? JSON.stringify(profile, null, 2) : 'No profile'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Test Registration</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email: </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Full Name: </label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Bio: </label>
                    <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Skills: </label>
                    <input 
                        type="text" 
                        value={skills} 
                        onChange={(e) => setSkills(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>User Type: </label>
                    <select 
                        value={userType} 
                        onChange={(e) => setUserType(e.target.value as 'job_seeker' | 'hiring')}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="job_seeker">Job Seeker</option>
                        <option value="hiring">Hiring Manager</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testRegistration} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    {loading ? 'Processing...' : 'Test Registration'}
                </button>
                <button 
                    onClick={testLogin} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    {loading ? 'Processing...' : 'Test Login'}
                </button>
                <button 
                    onClick={checkProfile}
                    style={{ marginRight: '10px', padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    Check Profile
                </button>
                <button 
                    onClick={clearData}
                    style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    Clear Data
                </button>
            </div>

            {message && (
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: message.includes('failed') || message.includes('Error') ? '#f8d7da' : '#d4edda',
                    border: `1px solid ${message.includes('failed') || message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}
