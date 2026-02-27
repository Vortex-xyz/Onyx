// src/services/postService.ts - COMPLETE VERSION
import { supabase } from '../config/supabaseClient';
import { postQueue } from './postQueue';

export interface Post {
  id: string;
  content: string;
  user_id: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  likes: number;
  comments_count: number;
  shares: number;
  created_at: string;
  updated_at?: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
    isPremium: boolean;
  };
  is_liked?: boolean;
}

interface CreatePostInput {
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
}

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  const queuedPost = await postQueue.enqueue(input.content, input.media_url, input.media_type);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  return {
    id: queuedPost.id,
    content: queuedPost.content,
    user_id: queuedPost.userId,
    media_url: queuedPost.media_url,
    media_type: queuedPost.media_type,
    likes: 0,
    comments_count: 0,
    shares: 0,
    created_at: new Date().toISOString(),
    author: {
      id: user.id,
      username: user.user_metadata?.username || 'You',
      avatar_url: user.user_metadata?.avatar_url || null,
      level: 1,
      isPremium: false
    }
  };
};

export const fetchPosts = async (limit = 10, offset = 0): Promise<Post[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users (
        id,
        username,
        avatar_url,
        level,
        ispremium
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  if (user && data) {
    const postIds = data.map(p => p.id);
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
    
    return data.map(post => ({
      ...post,
      is_liked: likedPostIds.has(post.id)
    }));
  }

  return data || [];
};

export const likePost = async (postId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id });
    
    if (error) throw error;
    return true;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const sharePost = async (postId: string): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .update({ shares: supabase.rpc('increment', { x: 1 }) })
    .eq('id', postId);

  if (error) throw error;

  const url = `${window.location.origin}/post/${postId}`;
  await navigator.clipboard.writeText(url);
};

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
    ispremium: boolean;
  };
  replies?: Comment[];
}

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:users (
        id,
        username,
        avatar_url,
        level,
        ispremium
      )
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Fetch comments error:', error);
    throw error;
  }

  if (data) {
    for (const comment of data) {
      const { data: replies } = await supabase
        .from('comments')
        .select(`
          *,
          author:users (
            id,
            username,
            avatar_url,
            level,
            ispremium
          )
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });
      
      comment.replies = replies || [];
    }
  }

  return data || [];
};

export const createComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('🔍 Creating comment with:', {
    post_id: postId,
    user_id: user.id,
    content,
    parent_id: parentId
  });

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
      parent_id: parentId
    })
    .select(`
      *,
      author:users (
        id,
        username,
        avatar_url,
        level,
        ispremium
      )
    `)
    .single();

  if (error) {
    console.error('❌ Create comment error:', error);
    throw error;
  }
  
  return data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const followUser = async (userId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  if (user.id === userId) throw new Error('Cannot follow yourself');

  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single();

  if (existingFollow) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', existingFollow.id);
    
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: userId });
    
    if (error) throw error;
    return true;
  }
};

export const isFollowing = async (userId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single();

  return !!data;
};

export const getFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower:users!follows_follower_id_fkey (
        id,
        username,
        avatar_url,
        level,
        ispremium
      )
    `)
    .eq('following_id', userId);

  if (error) throw error;
  return data?.map(f => f.follower) || [];
};

export const getFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following:users!follows_following_id_fkey (
        id,
        username,
        avatar_url,
        level,
        ispremium
      )
    `)
    .eq('follower_id', userId);

  if (error) throw error;
  return data?.map(f => f.following) || [];
};