// src/contexts/AuthContext.tsx - SMART TIMEOUT VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

export interface AuthUser extends User {
  username?: string;
  avatar_url?: string;
  level?: number;
  bio?: string;
  location?: string;
  website?: string;
  favorite_anime?: string[];
  interests?: string[];
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  ispremium?: boolean;
  email?: string;
  created_at?: string;
  updated_at?: string;
  profile_completed?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  needsProfileSetup: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
  completeProfileSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // ✅ Fetch user profile with SMART timeout (5 seconds)
  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      
      // Create timeout promise (5 seconds - longer for slower connections)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      // Race between fetch and timeout
      const profile = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
          .then(({ data, error }) => {
            if (error) {
              if (error.code === 'PGRST116') {
                console.log('⚠️ User profile not found in DB');
                return null;
              }
              throw error;
            }
            return data;
          }),
        timeoutPromise
      ]);

      if (profile) {
        console.log('✅ User profile loaded:', profile.username);
      }
      
      return profile;
    } catch (error: any) {
      // Only log actual errors, not "not found" cases
      if (error.message === 'Profile fetch timeout') {
        console.warn('⚠️ Profile fetch timed out - will use auth data');
      } else {
        console.error('❌ Failed to fetch user profile:', error);
      }
      return null;
    }
  };

  // ✅ Enrich user with smart handling
  const enrichUser = async (authUser: User): Promise<AuthUser | null> => {
    try {
      console.log('🔄 Enriching user data...');
      
      const profile = await fetchUserProfile(authUser.id);
      
      // No profile = needs setup
      if (!profile) {
        console.log('⚠️ No profile found - user needs profile setup');
        setNeedsProfileSetup(true);
        
        return {
          ...authUser,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || undefined,
          email: authUser.email,
          level: 1,
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          profile_completed: false,
        };
      }

      // ✅ Check if profile is ACTUALLY complete
      const isProfileComplete = !!(
        profile.username && 
        profile.username.trim().length > 0 &&
        !profile.username.startsWith('temp_') &&
        profile.profile_completed === true
      );

      console.log('📊 Profile check:', {
        username: profile.username,
        profile_completed: profile.profile_completed,
        isComplete: isProfileComplete
      });

      setNeedsProfileSetup(!isProfileComplete);

      return {
        ...authUser,
        ...profile,
        username: profile.username,
        avatar_url: profile.avatar_url,
        level: profile.level || 1,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        favorite_anime: profile.favorite_anime,
        interests: profile.interests,
        followers_count: profile.followers_count || 0,
        following_count: profile.following_count || 0,
        posts_count: profile.posts_count || 0,
        ispremium: profile.ispremium || false,
        email: authUser.email || profile.email,
        profile_completed: profile.profile_completed,
      };
    } catch (error) {
      console.error('❌ Error enriching user:', error);
      return {
        ...authUser,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
        avatar_url: authUser.user_metadata?.avatar_url,
        email: authUser.email,
        level: 1,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        profile_completed: false,
      };
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        console.log('🔄 Refreshing user data...');
        const enrichedUser = await enrichUser(currentUser);
        setUser(enrichedUser);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  const completeProfileSetup = async () => {
    console.log('✅ Profile setup complete');
    setNeedsProfileSetup(false);
    await refreshUser();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (currentSession?.user) {
          const enrichedUser = await enrichUser(currentSession.user);
          setUser(enrichedUser);
          setSession(currentSession);
          console.log('✅ User authenticated:', enrichedUser?.username || enrichedUser?.email);
        } else {
          console.log('ℹ️ No active session');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        // ✅ ALWAYS set loading to false
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 Auth event:', event);
        
        try {
          if (currentSession?.user) {
            const enrichedUser = await enrichUser(currentSession.user);
            setUser(enrichedUser);
            setSession(currentSession);
          } else {
            setUser(null);
            setSession(null);
            setNeedsProfileSetup(false);
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error);
          if (currentSession?.user) {
            setUser({
              ...currentSession.user,
              username: currentSession.user.email?.split('@')[0],
              email: currentSession.user.email,
              level: 1,
              followers_count: 0,
              following_count: 0,
              posts_count: 0,
              profile_completed: false,
            } as AuthUser);
            setSession(currentSession);
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 Logging in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const enrichedUser = await enrichUser(data.user);
        setUser(enrichedUser);
        setSession(data.session);
        console.log('✅ Login successful:', enrichedUser?.username || enrichedUser?.email);
        toast.success('Welcome back! 🎉');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      console.log('📝 Signing up...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        if (username) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            username: username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            level: 1,
            ispremium: false,
            bio: '',
            location: '',
            website: '',
            favorite_anime: [],
            interests: [],
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            followers: 0,
            following: 0,
            posts: 0,
            profile_completed: true,
          });
        } else {
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            username: `temp_${data.user.id.substring(0, 8)}`,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
            level: 1,
            ispremium: false,
            bio: '',
            location: '',
            website: '',
            favorite_anime: [],
            interests: [],
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            followers: 0,
            following: 0,
            posts: 0,
            profile_completed: false,
          });
        }

        const enrichedUser = await enrichUser(data.user);
        setUser(enrichedUser);
        setSession(data.session);
        toast.success('Account created! 🎉');
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      toast.error(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username?: string) => {
    return signup(email, password, username);
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      console.log('✅ Google OAuth initiated');
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      toast.error(error.message || 'Google login failed');
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log('👋 Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setNeedsProfileSetup(false);
      console.log('✅ Logout successful');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      toast.error(error.message || 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) throw new Error('Not authenticated');

    try {
      console.log('🔄 Updating profile...');
      
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          username: updates.username || user.username || user.email?.split('@')[0],
          avatar_url: updates.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          level: 1,
          ispremium: false,
          bio: updates.bio || '',
          location: updates.location || '',
          website: updates.website || '',
          favorite_anime: updates.favorite_anime || [],
          interests: updates.interests || [],
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          followers: 0,
          following: 0,
          posts: 0,
          profile_completed: true,
          ...updates
        });
      } else {
        await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      await refreshUser();
      toast.success('Profile updated! ✨');
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isLoading: loading,
    needsProfileSetup,
    logout,
    login,
    signup,
    register,
    loginWithGoogle,
    updateProfile,
    refreshUser,
    completeProfileSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};