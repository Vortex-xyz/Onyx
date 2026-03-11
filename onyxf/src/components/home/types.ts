// src/components/home/types.ts
import { IconType } from 'react-icons';

export interface Author {
  id: string;
  username: string;
  avatar_url: string;
  level: number;
  isPremium: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  likes: number;
  comments_count: number;
  shares: number;
  created_at: string;
  author?: Author;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: Author;
}

export interface UserData {
  username: string;
  email: string;
  photoURL: string;
  level: number;
  bio: string;
  location: string;
  followers: number;
  following: number;
  posts: number;
  isPremium: boolean;
}

export interface SpotlightPost {
  id: string;
  title: string;
  author: string;
  views: string;
  image: string;
  badge: string;
}

export interface FilterChip {
  id: string;
  label: string;
  icon: IconType;
}

export interface NavItem {
  id: string;
  icon: IconType;
  label: string;
}

export interface QueueStatus {
  pending: number;
  failed: number;
}