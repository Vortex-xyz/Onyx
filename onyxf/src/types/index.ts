export interface User {
  uid: string;
  email: string;
  username: string;
  photoURL?: string;
  bio?: string;
  level?: number;
  badges?: string[];
  favoriteAnime?: string[];
  createdAt?: string;
  updatedAt?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  videoDuration?: number;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  shares?: number;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  postId: string;
  likes: string[];
}