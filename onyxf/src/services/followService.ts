// src/services/followService.ts - FOLLOW SYSTEM
import { supabase } from '../config/supabaseClient';

export interface FollowUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  ispremium: boolean;
}

/**
 * Follow or unfollow a user
 * Returns true if now following, false if unfollowed
 */
export const followUser = async (targetUserId: string): Promise<boolean> => {
  console.log('=== FOLLOW USER DEBUG START ===');
  console.log('Target user ID:', targetUserId);
  
  // ✅ Check session with detailed logging
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  console.log('📊 Session check:', {
    hasSession: !!sessionData?.session,
    hasUser: !!sessionData?.session?.user,
    userId: sessionData?.session?.user?.id,
    hasAccessToken: !!sessionData?.session?.access_token,
    tokenPreview: sessionData?.session?.access_token?.substring(0, 30) + '...',
    sessionError: sessionError
  });
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError);
    throw new Error('Session error: ' + sessionError.message);
  }
  
  if (!sessionData?.session?.user) {
    console.error('❌ No authenticated user found');
    throw new Error('Not authenticated - no session user');
  }

  const user = sessionData.session.user;
  console.log('✅ Authenticated user:', user.id);
  console.log('🔍 Checking follow status for:', targetUserId);

  // Test if we can access follows table at all
  console.log('🧪 Testing follows table access...');
  const { data: testData, error: testError } = await supabase
    .from('follows')
    .select('count')
    .limit(1);
  
  console.log('🧪 Test query result:', {
    success: !testError,
    error: testError,
    data: testData
  });

  // Check if already following with detailed error handling
  console.log('🔍 Querying follows table...');
  const { data: existingFollow, error: checkError } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  console.log('📊 Follow check result:', {
    hasData: !!existingFollow,
    error: checkError,
    errorCode: checkError?.code,
    errorMessage: checkError?.message,
    errorDetails: checkError?.details,
    errorHint: checkError?.hint
  });

  if (checkError) {
    console.error('❌ Error checking follow status:', checkError);
    console.error('❌ Full error object:', JSON.stringify(checkError, null, 2));
    throw checkError;
  }

  if (existingFollow) {
    // Unfollow
    console.log('👋 Unfollowing user...');
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      throw deleteError;
    }

    // Decrement counts
    await supabase.rpc('decrement_follower_count', { user_id: targetUserId });
    await supabase.rpc('decrement_following_count', { user_id: user.id });

    console.log('✅ Unfollowed successfully');
    console.log('=== FOLLOW USER DEBUG END ===');
    return false;
  } else {
    // Follow
    console.log('💜 Following user...');
    const { error: insertError } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      });

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      console.error('❌ Full insert error:', JSON.stringify(insertError, null, 2));
      throw insertError;
    }

    // Increment counts
    await supabase.rpc('increment_follower_count', { user_id: targetUserId });
    await supabase.rpc('increment_following_count', { user_id: user.id });

    console.log('✅ Followed successfully');
    console.log('=== FOLLOW USER DEBUG END ===');
    return true;
  }
};

/**
 * Check if current user is following target user
 */
export const isFollowing = async (targetUserId: string): Promise<boolean> => {
  // ✅ FIXED: Use getSession() instead of getUser() for RLS to work
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', session.user.id)
    .eq('following_id', targetUserId)
    .maybeSingle(); // Use maybeSingle to avoid error when not found

  if (error) {
    console.error('❌ Error checking follow status:', error);
    return false;
  }

  return !!data;
};

/**
 * Get list of followers for a user
 */
export const getFollowers = async (userId: string): Promise<FollowUser[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower:users!follows_follower_id_fkey (
        id,
        username,
        avatar_url,
        bio,
        level,
        ispremium
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching followers:', error);
    return [];
  }

  return (data || []).map((item: any) => item.follower).filter(Boolean);
};

/**
 * Get list of users that a user is following
 */
export const getFollowing = async (userId: string): Promise<FollowUser[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following:users!follows_following_id_fkey (
        id,
        username,
        avatar_url,
        bio,
        level,
        ispremium
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching following:', error);
    return [];
  }

  return (data || []).map((item: any) => item.following).filter(Boolean);
};

/**
 * Get follower and following counts for a user
 */
export const getFollowCounts = async (userId: string): Promise<{ followers: number; following: number }> => {
  const { data, error } = await supabase
    .from('users')
    .select('followers_count, following_count')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching follow counts:', error);
    return { followers: 0, following: 0 };
  }

  return {
    followers: data?.followers_count || 0,
    following: data?.following_count || 0
  };
};