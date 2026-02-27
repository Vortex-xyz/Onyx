// src/hooks/useSupabaseAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { Session } from '@supabase/supabase-js';

let authListenerCount = 0;

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authListenerCount++;
    const currentListenerCount = authListenerCount;
    
    console.log(`🎯 Auth Listener #${currentListenerCount} CREATED`);

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        console.log(`📋 Listener #${currentListenerCount}: Initial session`, session ? '✅ Found' : '❌ None');
        setSession(session);
      } catch (error) {
        console.error(`❌ Listener #${currentListenerCount}: Error getting session`, error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔔 Listener #${currentListenerCount}: Auth changed -`, event);
        setSession(session);
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      console.log(`🗑️ Auth Listener #${currentListenerCount} DESTROYED`);
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once!

  return { session, loading };
};