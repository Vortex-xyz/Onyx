// src/config/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tzatiaeqeljbkuqyilew.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YXRpYWVxZWxqYmt1cXlpbGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1Mzk2NTIsImV4cCI6MjA3MjExNTY1Mn0.dX71Cn5m-OIDxOBV93JL1shgMJ4d2C773PH3f6xlx6I';

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // ✅ REMOVED custom storage and storageKey - let Supabase use defaults
  },
});

// Monitor auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Auth State Change:', event);
  
  if (session?.expires_at) {
    const expiresIn = session.expires_at - Math.floor(Date.now() / 1000);
    console.log(`⏰ Session expires in ${Math.floor(expiresIn / 60)} minutes`);
  }
});