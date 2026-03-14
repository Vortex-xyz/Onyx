// src/services/userProfileService.ts
import { supabase } from '../config/supabaseClient';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
}

export interface UserPost {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  likes: number;
  comments_count: number;
  shares: number;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

/**
 * Get user profile by username
 */
export async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, full_name, bio, avatar_url, created_at')
      .eq('username', username)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return null;
    }

    // Get follower count
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    // Get post count
    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return {
      ...user,
      follower_count: followerCount || 0,
      following_count: followingCount || 0,
      post_count: postCount || 0,
    };
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
}

/**
 * Get user's posts
 */
export async function getUserPosts(userId: string): Promise<UserPost[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        media_url,
        media_type,
        created_at,
        likes,
        comments_count,
        shares,
        users!posts_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }

    // Transform data to match UserPost interface
    const posts = (data || []).map((post: any) => ({
      ...post,
      author: Array.isArray(post.users) ? post.users[0] : post.users,
    }));

    // Remove the 'users' field
    return posts.map(({ users, ...rest }: any) => rest);
  } catch (error) {
    console.error('Exception fetching user posts:', error);
    return [];
  }
}

/**
 * Check if current user is following the profile user
 */
export async function checkIfFollowing(
  currentUserId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking follow status:', error);
    return false;
  }
}

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) {
      console.error('Error following user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception following user:', error);
    return false;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception unfollowing user:', error);
    return false;
  }
}