import React from 'react';

interface AnimePost {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  user: {
    name: string;
    avatar: string;
  };
  likes: number;
}

// Mock data for testing
const mockPosts: AnimePost[] = [
  {
    id: '1',
    imageUrl: 'https://via.placeholder.com/300x400',
    title: 'Attack on Titan Scene',
    description: 'Epic moment from the final season!',
    tags: ['AttackOnTitan', 'Anime', 'Epic'],
    user: {
      name: 'AnimeGuru',
      avatar: 'https://via.placeholder.com/40',
    },
    likes: 156,
  },
  {
    id: '2',
    imageUrl: 'https://via.placeholder.com/400x300',
    title: 'One Piece Artwork',
    description: 'Luffy in Gear 5 form!',
    tags: ['OnePiece', 'Luffy', 'Fanart'],
    user: {
      name: 'PirateKing',
      avatar: 'https://via.placeholder.com/40',
    },
    likes: 234,
  },
  // Add more mock posts as needed
];

export default function AnimeGrid() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {mockPosts.map(post => (
        <div key={post.id} className="break-inside-avoid mb-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-auto object-cover"
          />
          <div className="p-4">
            <div className="flex items-center mb-3">
              <img src={post.user.avatar} alt={post.user.name} className="w-8 h-8 rounded-full mr-2" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">{post.user.name}</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{post.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">{post.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map(tag => (
                <span key={tag} className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-2 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
              <button className="flex items-center gap-1 hover:text-purple-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.likes}
              </button>
              <button className="hover:text-purple-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
