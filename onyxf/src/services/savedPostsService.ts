// src/services/savedPostsService.ts
import { supabase } from '../config/supabaseClient';

export interface SavedPost {
  id: string;
  post_id: string;
  created_at: string;
  post: {
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
  };
}

/**
 * Save a post
 */
export async function savePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) {
      // Check if already saved (unique constraint violation)
      if (error.code === '23505') {
        console.log('Post already saved');
        return true; // Already saved is not an error
      }
      console.error('Error saving post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving post:', error);
    return false;
  }
}

/**
 * Unsave a post
 */
export async function unsavePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unsaving post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception unsaving post:', error);
    return false;
  }
}

/**
 * Check if a post is saved
 */
export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking saved status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking saved status:', error);
    return false;
  }
}

/**
 * Get all saved posts for a user
 */
export async function getSavedPosts(userId: string): Promise<SavedPost[]> {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        id,
        post_id,
        created_at,
        posts!saved_posts_post_id_fkey (
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
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }

    // Transform data to match SavedPost interface
    const savedPosts = (data || []).map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      created_at: item.created_at,
      post: {
        ...item.posts,
        author: Array.isArray(item.posts.users) 
          ? item.posts.users[0] 
          : item.posts.users,
      },
    }));

    // Remove the 'users' field from posts
    return savedPosts.map((sp: any) => ({
      ...sp,
      post: {
        id: sp.post.id,
        user_id: sp.post.user_id,
        content: sp.post.content,
        media_url: sp.post.media_url,
        media_type: sp.post.media_type,
        created_at: sp.post.created_at,
        likes: sp.post.likes,
        comments_count: sp.post.comments_count,
        shares: sp.post.shares,
        author: sp.post.author,
      },
    }));
  } catch (error) {
    console.error('Exception fetching saved posts:', error);
    return [];
  }
}

/**
 * Get count of saved posts
 */
export async function getSavedPostsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('saved_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting saved posts count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception getting saved posts count:', error);
    return 0;
  }
}