'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ data?: any; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: unknown }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If no profile exists, create a basic one
      if (!data && userId) {
        console.log('No profile found, creating basic profile for user:', userId);
        
        // Get user info from auth
        const { data: authUser, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting auth user:', userError);
          return null;
        }
        
        if (authUser.user) {
          console.log('Auth user data:', authUser.user);
          console.log('User metadata:', authUser.user.user_metadata);
          
          // Check for pending profile data from registration
          let pendingProfile = null;
          try {
            const pendingData = localStorage.getItem('pendingProfile');
            if (pendingData) {
              pendingProfile = JSON.parse(pendingData);
              console.log('Found pending profile data:', pendingProfile);
            }
          } catch (err) {
            console.error('Error parsing pending profile:', err);
          }
          
          // Start with minimal required fields that should exist
          const profileData = {
            id: userId,
            email: authUser.user.email!,
            user_type: authUser.user.user_metadata?.user_type || pendingProfile?.role || 'job_seeker'
          };
          
          // Add optional fields from auth metadata or pending profile
          const optionalFields: any = {};
          
          if (authUser.user.user_metadata?.full_name || pendingProfile?.fullName) {
            optionalFields.full_name = authUser.user.user_metadata.full_name || pendingProfile?.fullName;
          }

          if (pendingProfile?.bio) {
            optionalFields.professional_bio = pendingProfile.bio;
          }

          if (pendingProfile?.skills) {
            optionalFields.skills_expertise = pendingProfile.skills;
          }

          if (pendingProfile?.skills_needed) {
            optionalFields.required_skills = pendingProfile.skills_needed;
          }

          if (pendingProfile?.profile_image) {
            console.log('🖼️ Adding profile image from pending profile:', pendingProfile.profile_image);
            optionalFields.profile_image = pendingProfile.profile_image;
          } else {
            console.log('❌ No profile image in pending profile:', pendingProfile?.profile_image);
          }

          // Default plan type
          optionalFields.plan_type = 'Free';
          
          const finalProfileData = { ...profileData, ...optionalFields };
          
          console.log('🏗️ Creating profile with final data:', finalProfileData);
          console.log('🖼️ Profile image in final data:', finalProfileData.profile_image);
          
          console.log('Creating profile with data:', finalProfileData);
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert(finalProfileData)
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            console.error('Profile data that failed:', profileData);
            return null;
          }

          console.log('Successfully created profile:', newProfile);
          
          // Clean up pending profile data after successful creation
          try {
            localStorage.removeItem('pendingProfile');
            console.log('Cleared pending profile data from localStorage');
          } catch (err) {
            console.error('Error clearing pending profile:', err);
          }
          
          return newProfile;
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      console.log('🔐 useAuth.signUp called with:', {
        email,
        hasPassword: !!password,
        metadata
      });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      console.log('🔄 Supabase signup response:', {
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          confirmation_sent_at: data.user.confirmation_sent_at
        } : null,
        session: data?.session ? 'Session created' : 'No session',
        error: error ? {
          message: error.message,
          status: error.status,
          code: error.code
        } : null
      });
      
      return { data, error };
    } catch (error) {
      console.error('💥 Signup error:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setProfile(null);
      }
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        console.error('❌ updateProfile: No user logged in');
        return { error: new Error('No user logged in') };
      }

      console.log('🔄 updateProfile: Updating user profile...', {
        userId: user.id,
        updates: updates
      });

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select();

      console.log('📊 updateProfile: Database update result:', { data, error });

      if (error) {
        console.error('❌ updateProfile: Database error:', error);
        return { error };
      }

      console.log('✅ updateProfile: Successfully updated profile');
      await refreshProfile();

      return { error: null };
    } catch (error) {
      console.error('❌ updateProfile: Unexpected error:', error);
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}