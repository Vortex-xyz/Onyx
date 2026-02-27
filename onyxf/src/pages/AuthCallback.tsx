// src/pages/AuthCallback.tsx - PRODUCTION FIXED FOR YOUR EXACT SCHEMA
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  const log = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = isError ? '❌ ERROR' : '✅ INFO';
    const fullMessage = `[${timestamp}] ${prefix}: ${message}`;
    
    console.log(fullMessage);
    setLogs(prev => [...prev, fullMessage]);
  };

  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('🎯 AUTH CALLBACK - PRODUCTION VERSION');
    console.log('═══════════════════════════════════════');
    
    log('AuthCallback mounted');

    const handleCallback = async () => {
      try {
        log('STEP 1: Getting session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          log(`Session error: ${sessionError.message}`, true);
          setStatus('error');
          toast.error('Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!sessionData.session) {
          log('No session, trying code exchange...');
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
          const code = urlParams.get('code') || hashParams.get('code');

          if (!code) {
            log('No auth code found', true);
            setStatus('error');
            toast.error('No authentication code');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            log(`Code exchange failed: ${codeError.message}`, true);
            setStatus('error');
            toast.error('Authentication failed');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
        }

        log('STEP 2: Getting final session...');
        const { data: finalData } = await supabase.auth.getSession();
        const session = finalData.session;

        if (!session) {
          log('No session after exchange', true);
          setStatus('error');
          toast.error('Session error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
        const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;

        log(`✅ Authenticated: ${userEmail}`);
        log(`Google name: ${userName || 'Not provided'}`);
        log(`Google avatar: ${avatarUrl ? 'Yes' : 'No'}`);

        log('STEP 3: Checking database for user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            log('Profile not found - NEW USER - Creating profile...');

            const newUsername = userName || userEmail?.split('@')[0] || `user_${userId.substring(0, 8)}`;
            log(`Using username: ${newUsername}`);
            log(`Using avatar: ${avatarUrl || 'dicebear fallback'}`);

            // ✅ CRITICAL: Insert with YOUR EXACT SCHEMA
            const newProfile = {
              id: userId,
              email: userEmail,
              username: newUsername,
              avatar_url: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUsername}`,
              level: 1,
              ispremium: false,
              bio: '',
              location: '',
              website: '',
              favorite_anime: [],
              interests: [],
              // ✅ Using _count columns (your schema has both old and new)
              followers_count: 0,
              following_count: 0,
              posts_count: 0,
              // Also set old columns to 0 for consistency
              followers: 0,
              following: 0,
              posts: 0,
              profile_completed: false,
            };

            log('Inserting profile with data:');
            log(JSON.stringify(newProfile, null, 2));

            const { data: insertedProfile, error: insertError } = await supabase
              .from('users')
              .insert(newProfile)
              .select()
              .single();

            if (insertError) {
              log(`❌ INSERT FAILED: ${insertError.message}`, true);
              log(`Error code: ${insertError.code}`, true);
              log(`Error details: ${insertError.details}`, true);
              log(`Error hint: ${insertError.hint}`, true);
              
              setStatus('error');
              toast.error(`Failed to create profile: ${insertError.message}`);
              
              // Show full error in console for debugging
              console.error('Full insert error:', insertError);
              
              setTimeout(() => navigate('/login'), 5000);
              return;
            }

            log('✅ Profile created successfully!');
            log(`Profile data: ${JSON.stringify(insertedProfile)}`);
            
            setStatus('success');
            toast.success('Welcome to Onyx! Complete your profile 🎉');
            
            setTimeout(() => {
              log('Navigating to profile setup...');
              navigate('/profile-setup', { replace: true });
            }, 2000);
            return;
          }

          // Other database errors
          log(`Profile fetch error: ${profileError.message}`, true);
          setStatus('error');
          toast.error('Database error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        log(`✅ Profile found: ${profile.username}`);
        log(`Profile completed: ${profile.profile_completed}`);

        if (!profile.profile_completed) {
          log('Profile incomplete - redirecting to setup');
          setStatus('success');
          toast.success('Complete your profile 🎨');
          setTimeout(() => navigate('/profile-setup', { replace: true }), 2000);
        } else {
          log('Profile complete - redirecting to home');
          setStatus('success');
          toast.success(`Welcome back, ${profile.username}! 🎉`);
          setTimeout(() => navigate('/home', { replace: true }), 2000);
        }

      } catch (error: any) {
        log(`💥 UNEXPECTED ERROR: ${error.message}`, true);
        console.error('Full error:', error);
        setStatus('error');
        toast.error('Unexpected error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-6">
          {status === 'processing' && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-purple-600/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">⏳</div>
            </>
          )}
          {status === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-7xl animate-bounce">✅</div>
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-7xl animate-pulse">❌</div>
            </div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">
          {status === 'processing' && 'Processing Login...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h1>
        
        <p className="text-gray-300 text-lg">
          {status === 'processing' && 'Setting up your account...'}
          {status === 'success' && 'Redirecting...'}
          {status === 'error' && 'Something went wrong'}
        </p>
      </div>

      <div className="w-full max-w-5xl bg-black/70 border-2 border-purple-600/50 rounded-xl p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Debug Console
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
            status === 'success' ? 'bg-green-500/20 text-green-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {status.toUpperCase()}
          </div>
        </div>
        
        <div className="space-y-2 max-h-[500px] overflow-y-auto font-mono text-sm">
          {logs.map((logEntry, index) => {
            const isError = logEntry.includes('❌ ERROR');
            const isSuccess = logEntry.includes('✅ INFO');
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  isError 
                    ? 'bg-red-900/30 border-red-500 text-red-300' 
                    : isSuccess
                    ? 'bg-green-900/20 border-green-500 text-green-300'
                    : 'bg-gray-900/50 border-purple-500 text-gray-300'
                }`}
              >
                {logEntry}
              </div>
            );
          })}
          
          {logs.length === 0 && (
            <div className="text-center text-gray-600 italic py-8">
              Initializing...
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>💡 Check console (F12) for detailed error logs</p>
      </div>
    </div>
  );
};

export default AuthCallback;