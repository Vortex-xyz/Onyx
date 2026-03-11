// src/pages/ProfileSetup.tsx - MINIMAL ONBOARDING (Username Only)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';
import { FaUser, FaSpinner } from 'react-icons/fa';

interface ProfileSetupProps {
  darkMode?: boolean;
}

export default function ProfileSetup({ darkMode = true }: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const { user, completeProfileSetup } = useAuth();
  const navigate = useNavigate();

  // Check if username is available (debounced)
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (error && error.code === 'PGRST116') {
          // Username doesn't exist = available
          setUsernameAvailable(true);
        } else if (data) {
          // Username exists
          setUsernameAvailable(false);
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (!usernameAvailable) {
      toast.error('Username is already taken');
      return;
    }

    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    setLoading(true);

    try {
      // Update user profile with just username
      const { error } = await supabase
        .from('users')
        .update({
          username,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Welcome to ONYX! 🎉');
      
      // Mark profile as complete
      await completeProfileSetup();
      
      // Navigate to home
      navigate('/home');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to set up profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${
      darkMode ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-black text-3xl">O</span>
          </div>
          <h1 className={`text-4xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose your username
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You can add bio and interests later
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="relative">
            <div className={`flex items-center px-4 py-4 rounded-xl border-2 transition-all ${
              usernameAvailable === true
                ? 'border-green-500 bg-green-500/5'
                : usernameAvailable === false
                  ? 'border-red-500 bg-red-500/5'
                  : darkMode
                    ? 'border-gray-800 bg-gray-900'
                    : 'border-gray-200 bg-white'
            }`}>
              <FaUser className={`mr-3 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                className={`flex-1 bg-transparent outline-none ${
                  darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                }`}
                maxLength={20}
                required
              />
              {checkingUsername && (
                <FaSpinner className="animate-spin text-purple-500" />
              )}
              {usernameAvailable === true && (
                <span className="text-green-500 text-sm font-medium">Available!</span>
              )}
              {usernameAvailable === false && (
                <span className="text-red-500 text-sm font-medium">Taken</span>
              )}
            </div>
            
            {/* Character count */}
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
              {username.length}/20 characters • lowercase, numbers, underscores only
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !usernameAvailable || username.length < 3}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <FaSpinner className="animate-spin" />
                <span>Setting up...</span>
              </span>
            ) : (
              'Continue to ONYX'
            )}
          </button>
        </form>

        {/* Skip hint */}
        <p className={`text-center mt-6 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
          You'll be able to customize your profile later in settings
        </p>
      </div>
    </div>
  );
}