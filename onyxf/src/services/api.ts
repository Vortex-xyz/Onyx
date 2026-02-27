import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { Post, Comment, User } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API service methods
export const postsApi = {
  // Get posts with optional filters
  getPosts: async (params?: { type?: 'latest' | 'following' | 'trending'; page?: number; limit?: number }) => {
    const response = await api.get<Post[]>(API_ENDPOINTS.POSTS, { params });
    return response.data;
  },

  // Create a new post
  createPost: async (postData: FormData) => {
    const response = await api.post<Post>(API_ENDPOINTS.POSTS, postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Like/unlike a post
  toggleLike: async (postId: string) => {
    const response = await api.post<{ liked: boolean }>(API_ENDPOINTS.POST_LIKE(postId));
    return response.data;
  },

  // Save/unsave a post
  toggleSave: async (postId: string) => {
    const response = await api.post<{ saved: boolean }>(API_ENDPOINTS.POST_SAVE(postId));
    return response.data;
  },

  // Add a comment to a post
  addComment: async (postId: string, content: string) => {
    const response = await api.post<Comment>(API_ENDPOINTS.POST_COMMENT(postId), { content });
    return response.data;
  },

  // Search posts
  searchPosts: async (query: string) => {
    const response = await api.get<Post[]>(API_ENDPOINTS.SEARCH_POSTS, {
      params: { q: query },
    });
    return response.data;
  },
};

export const usersApi = {
  // Get user profile
  getProfile: async (username: string) => {
    const response = await api.get<User>(API_ENDPOINTS.USER_PROFILE(username));
    return response.data;
  },

  // Get user's posts
  getUserPosts: async (username: string) => {
    const response = await api.get<Post[]>(API_ENDPOINTS.USER_POSTS(username));
    return response.data;
  },

  // Get saved posts
  getSavedPosts: async () => {
    const response = await api.get<Post[]>(API_ENDPOINTS.USER_SAVED_POSTS);
    return response.data;
  },

  // Get liked posts
  getLikedPosts: async () => {
    const response = await api.get<Post[]>(API_ENDPOINTS.USER_LIKED_POSTS);
    return response.data;
  },

  // Follow/unfollow a user
  toggleFollow: async (username: string) => {
    const response = await api.post<{ following: boolean }>(API_ENDPOINTS.USER_FOLLOW(username));
    return response.data;
  },

  // Search users
  searchUsers: async (query: string) => {
    const response = await api.get<User[]>(API_ENDPOINTS.SEARCH_USERS, {
      params: { q: query },
    });
    return response.data;
  },
};

export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return user;
  },

  // Register
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default api;
