// src/services/searchService.ts
import { supabase } from '../config/supabaseClient';
import { Post } from './postService';

export interface SearchResult {
  type: 'user' | 'post' | 'tag';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  preview?: string;
  data: any;
}

const RECENT_SEARCHES_KEY = 'onyx_recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Search for users by username
 */
export const searchUsers = async (query: string, limit = 10) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, bio, level, ispremium')
    .ilike('username', `%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Search for posts by content
 */
export const searchPosts = async (query: string, limit = 20): Promise<Post[]> => {
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
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Combined search - users and posts
 */
export const searchAll = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  try {
    // Search users
    const users = await searchUsers(query, 5);
    users.forEach(user => {
      results.push({
        type: 'user',
        id: user.id,
        title: user.username,
        subtitle: user.bio || `Level ${user.level}`,
        avatar: user.avatar_url,
        data: user
      });
    });

    // Search posts
    const posts = await searchPosts(query, 10);
    posts.forEach(post => {
      results.push({
        type: 'post',
        id: post.id,
        title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
        subtitle: `by ${post.author?.username || 'Unknown'}`,
        avatar: post.author?.avatar_url,
        preview: post.media_url,
        data: post
      });
    });

    // Save to recent searches
    saveRecentSearch(query);

  } catch (error) {
    console.error('❌ Search failed:', error);
  }

  return results;
};

/**
 * Get trending posts (most liked/commented in last 7 days)
 */
export const getTrendingPosts = async (limit = 10): Promise<Post[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('likes', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Get suggested users (newest or most active)
 */
export const getSuggestedUsers = async (limit = 10) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, bio, level, ispremium')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Save search query to recent searches
 */
export const saveRecentSearch = (query: string) => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    let searches: string[] = stored ? JSON.parse(stored) : [];
    
    // Remove duplicates and add to front
    searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    searches.unshift(query);
    
    // Keep only last N searches
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

/**
 * Get recent searches
 */
export const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
};

/**
 * Get trending tags (mock for now - can be enhanced with real tag tracking)
 */
export const getTrendingTags = (): string[] => {
  return [
    '#anime',
    '#fanart',
    '#cosplay',
    '#naruto',
    '#onepiece',
    '#demonslayer',
    '#myheroacademia',
    '#attackontitan',
    '#jujutsukaisen',
    '#bleach'
  ];
};