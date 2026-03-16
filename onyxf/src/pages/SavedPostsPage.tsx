// src/pages/SavedPostsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { getSavedPosts, unsavePost, SavedPost } from '../services/savedPostsService';
import { FaArrowLeft, FaBookmark, FaHeart, FaComment, FaShare, FaTrash } from 'react-icons/fa';

export default function SavedPostsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSavedPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSavedPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const posts = await getSavedPosts(user.id);
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error loading saved posts:', error);
      toast.error('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId: string) => {
    if (!user) return;

    setRemovingId(postId);
    try {
      const success = await unsavePost(user.id, postId);
      if (success) {
        setSavedPosts(prev => prev.filter(sp => sp.post_id !== postId));
        toast.success('Removed from saved posts');
      } else {
        toast.error('Failed to remove post');
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
      toast.error('Failed to remove post');
    } finally {
      setRemovingId(null);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading saved posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-purple-800/30 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Saved Posts</h1>
            <p className="text-gray-400 text-sm">{savedPosts.length} posts</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {savedPosts.length === 0 ? (
          <div className="bg-gray-900/80 rounded-3xl border border-purple-800/30 p-16 text-center backdrop-blur-md">
            <FaBookmark className="text-6xl text-purple-600/50 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-2">No saved posts yet</h2>
            <p className="text-gray-400 text-lg mb-6">
              Save posts to view them later
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Explore Posts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((savedPost) => (
              <div
                key={savedPost.id}
                className="bg-gray-900/80 rounded-2xl border border-purple-800/30 overflow-hidden hover:border-purple-600 transition-all backdrop-blur-md group relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleUnsave(savedPost.post_id)}
                  disabled={removingId === savedPost.post_id}
                  className="absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  title="Remove from saved"
                >
                  {removingId === savedPost.post_id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FaTrash className="text-sm" />
                  )}
                </button>

                {/* Media */}
                {savedPost.post.media_url && (
                  <div 
                    className="aspect-square cursor-pointer"
                    onClick={() => navigate('/home')} // TODO: Navigate to specific post
                  >
                    {savedPost.post.media_type === 'video' ? (
                      <video
                        src={savedPost.post.media_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={savedPost.post.media_url}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Author */}
                  <div className="flex items-center space-x-2 mb-3">
                    <img
                      src={savedPost.post.author.avatar_url || 'https://i.pravatar.cc/150'}
                      alt={savedPost.post.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {savedPost.post.author.username}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatTime(savedPost.post.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                    {savedPost.post.content}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <FaHeart />
                      <span>{formatCount(savedPost.post.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaComment />
                      <span>{formatCount(savedPost.post.comments_count)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaShare />
                      <span>{formatCount(savedPost.post.shares)}</span>
                    </div>
                  </div>

                  {/* Saved Date */}
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <p className="text-gray-500 text-xs">
                      Saved {formatTime(savedPost.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}