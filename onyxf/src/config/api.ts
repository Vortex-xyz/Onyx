export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://organic-space-engine-4j65qj5qrqqqcw75-3001.app.github.dev';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Posts
  POSTS: '/posts',
  POST_LIKE: (id: string) => `/posts/${id}/like`,
  POST_SAVE: (id: string) => `/posts/${id}/save`,
  POST_COMMENT: (id: string) => `/posts/${id}/comments`,
  
  // Users
  USERS: '/users',
  USER_PROFILE: (username: string) => `/users/${username}`,
  USER_FOLLOW: (username: string) => `/users/${username}/follow`,
  USER_POSTS: (username: string) => `/users/${username}/posts`,
  USER_SAVED_POSTS: '/users/me/saved',
  USER_LIKED_POSTS: '/users/me/liked',
  
  // Search
  SEARCH_POSTS: '/search/posts',
  SEARCH_USERS: '/search/users',
};
