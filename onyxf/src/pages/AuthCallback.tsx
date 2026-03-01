// src/pages/AuthCallback.tsx - FIXED WITHOUT INTERESTS COLUMN
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
    console.log('🎯 AUTH CALLBACK COMPONENT MOUNTED!');
    console.log('═══════════════════════════════════════');
    
    log('AuthCallback component mounted');
    log(`Current pathname: ${location.pathname}`);
    log(`Full URL: ${window.location.href}`);
    log(`Hash: ${window.location.hash}`);
    log(`Search params: ${window.location.search}`);

    const handleCallback = async () => {
      try {
        log('STEP 1: Getting session from Supabase...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          log(`Session error: ${sessionError.message}`, true);
          setStatus('error');
          toast.error('Session error: ' + sessionError.message);
          log('Redirecting to login in 3 seconds...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        log('Session response received');
        log(`Has session: ${!!sessionData.session}`);

        if (!sessionData.session) {
          log('No session found in getSession()', true);
          log('Attempting to exchange code for session...');

          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
          
          const code = urlParams.get('code') || hashParams.get('code');
          log(`Auth code present: ${!!code}`);

          if (!code) {
            log('No auth code found in URL', true);
            setStatus('error');
            toast.error('No authentication code found');
            log('Redirecting to login in 3 seconds...');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          log(`Exchanging code for session: ${code.substring(0, 10)}...`);
          const { data: codeExchangeData, error: codeExchangeError } = 
            await supabase.auth.exchangeCodeForSession(code);

          if (codeExchangeError) {
            log(`Code exchange failed: ${codeExchangeError.message}`, true);
            setStatus('error');
            toast.error('Failed to authenticate');
            log('Redirecting to login in 3 seconds...');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          log('✅ Code exchange successful!');
          log(`User email: ${codeExchangeData.session?.user?.email}`);
        }

        log('STEP 2: Getting final session...');
        const { data: finalSessionData } = await supabase.auth.getSession();
        const session = finalSessionData.session;

        if (!session) {
          log('No session after all attempts', true);
          setStatus('error');
          toast.error('Authentication failed');
          log('Redirecting to login in 3 seconds...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
        const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;

        log(`✅ AUTHENTICATED!`);
        log(`User ID: ${userId}`);
        log(`Email: ${userEmail}`);
        log(`Name: ${userName || 'Not provided'}`);
        log(`Avatar: ${avatarUrl ? 'Yes' : 'No'}`);

        log('STEP 3: Checking for user profile in database...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            log('Profile not found - this is a new user');
            log('STEP 4: Creating new profile...');

            // ✅ FIXED: Use name from Google, fallback to email username
            // ✅ CRITICAL FIX: Use temp username so user can choose their own in ProfileSetup
            const newUsername = `temp_${userId.substring(0, 8)}`;
            log(`Generated TEMP username: ${newUsername} (user will choose real name in profile setup)`);

            const newProfile = {
              id: userId,
              email: userEmail,
              username: newUsername, // ✅ Temp username - user will set real one in ProfileSetup
              avatar_url: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUsername}`,
              level: 1,
              ispremium: false,
              bio: '',
              location: '',
              website: '',
              favorite_anime: [],
              // ❌ REMOVED: interests field (column doesn't exist)
              followers_count: 0,
              following_count: 0,
              posts_count: 0,
              profile_completed: false,
            };

            log('Inserting profile into database...');
            const { error: insertError } = await supabase
              .from('users')
              .insert(newProfile);

            if (insertError) {
              log(`Profile creation failed: ${insertError.message}`, true);
              log(`Error code: ${insertError.code}`);
              setStatus('error');
              toast.error('Failed to create profile: ' + insertError.message);
              log('Redirecting to login in 3 seconds...');
              setTimeout(() => navigate('/login'), 3000);
              return;
            }

            log('✅ Profile created successfully!');
            log('Profile needs completion');
            setStatus('success');
            toast.success('Account created! Complete your profile 🎉');
            log('Redirecting to /profile-setup in 2 seconds...');
            setTimeout(() => {
              log('Navigating to /profile-setup...');
              navigate('/profile-setup', { replace: true });
            }, 2000);
            return;
          }

          log(`Profile fetch error: ${profileError.message}`, true);
          log(`Error code: ${profileError.code}`);
          setStatus('error');
          toast.error('Profile error: ' + profileError.message);
          log('Redirecting to login in 3 seconds...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        log(`✅ Profile found!`);
        log(`Username: ${profile.username}`);
        log(`Profile completed: ${profile.profile_completed}`);
        log(`Level: ${profile.level}`);

        if (!profile.profile_completed) {
          log('Profile incomplete - needs setup');
          setStatus('success');
          toast.success('Welcome! Complete your profile 🎨');
          log('Redirecting to /profile-setup in 2 seconds...');
          setTimeout(() => {
            log('Navigating to /profile-setup...');
            navigate('/profile-setup', { replace: true });
          }, 2000);
        } else {
          log('Profile complete - user is ready');
          setStatus('success');
          toast.success(`Welcome back, ${profile.username}! 🎉`);
          log('Redirecting to /home in 2 seconds...');
          setTimeout(() => {
            log('Navigating to /home...');
            navigate('/home', { replace: true });
          }, 2000);
        }

      } catch (error: any) {
        log(`💥 UNEXPECTED ERROR: ${error.message}`, true);
        log(`Error name: ${error.name}`);
        log(`Stack trace: ${error.stack}`);
        setStatus('error');
        toast.error('Unexpected error: ' + error.message);
        log('Redirecting to login in 3 seconds...');
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
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                ⏳
              </div>
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
          {status === 'processing' && 'Processing Google Login...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Error'}
        </h1>
        
        <p className="text-gray-300 text-lg">
          {status === 'processing' && 'Setting up your account...'}
          {status === 'success' && 'Redirecting you now...'}
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
              Initializing debug console...
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>💡 Tip: Open browser console (F12) for additional technical details</p>
      </div>
    </div>
  );
};

export default AuthCallback;