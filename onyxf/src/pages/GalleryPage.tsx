// src/pages/GalleryPage.tsx - FIXED: No Duplicate Media
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabaseClient';
import { Post } from '../services/postService';
import toast from 'react-hot-toast';
import {
  FaPlay,
  FaHeart,
  FaComment,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBookmark,
  FaShare,
  FaStar,
  FaImages,
  FaVideo,
  FaFilter
} from 'react-icons/fa';

interface GalleryPageProps {
  darkMode: boolean;
  userId?: string;
}

export default function GalleryPage({ darkMode, userId }: GalleryPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [savedPosts, setSavedPosts] = useState(new Set<string>());

  // ✅ FIX 1: Refs to always have fresh values in callbacks (prevents stale closure)
  const filterRef = useRef(filter);
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const postsRef = useRef(posts);
  const isFetchingRef = useRef(false); // ✅ FIX 2: Guard against concurrent fetches

  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // ✅ FIX 3: fetchGalleryPosts reads filter from ref, not closure
  const fetchGalleryPosts = useCallback(async (limit: number, offset: number): Promise<Post[]> => {
    const activeFilter = filterRef.current;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar_url, level, ispremium)
      `)
      .not('media_url', 'is', null)
      .order('created_at', { ascending: false });

    if (activeFilter === 'images') {
      query = query.eq('media_type', 'image');
    } else if (activeFilter === 'videos') {
      query = query.eq('media_type', 'video');
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, []); // ✅ No deps - reads everything from refs

  // ✅ FIX 4: Initial load + filter change — fully resets state
  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      // Reset everything atomically
      setPosts([]);
      setHasMore(true);
      isFetchingRef.current = false;
      setLoading(true);

      try {
        const fetchedPosts = await fetchGalleryPosts(20, 0);

        if (cancelled) return;

        // ✅ FIX 5: Deduplicate on initial load too
        const unique = Array.from(
          new Map(fetchedPosts.map(p => [p.id, p])).values()
        );
        setPosts(unique);

        if (fetchedPosts.length < 20) {
          setHasMore(false);
        }

        // Load liked posts
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !cancelled) {
          const { data: userLikes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.id);

          if (userLikes) {
            setLikedPosts(new Set(userLikes.map((like: { post_id: string }) => like.post_id)));
          }
        }
      } catch (error) {
        if (!cancelled) toast.error('Failed to load gallery');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [filter, fetchGalleryPosts]); // ✅ Reruns on filter change

  // ✅ FIX 6: loadMorePosts uses refs to read latest state, isFetchingRef prevents double-fire
  const loadMorePosts = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const currentLength = postsRef.current.length;
      const morePosts = await fetchGalleryPosts(20, currentLength);

      if (morePosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => {
          // ✅ FIX 7: Deduplicate appended posts by ID
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = morePosts.filter(p => !existingIds.has(p.id));
          if (uniqueNew.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...uniqueNew];
        });

        if (morePosts.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load more posts:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchGalleryPosts]); // ✅ Stable - no state deps

  // ✅ FIX 8: IntersectionObserver — disconnect old, reconnect on loadMorePosts change
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMorePosts]);

  const handleLike = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    const isLiked = likedPosts.has(postId);

    try {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        isLiked ? newSet.delete(postId) : newSet.add(postId);
        return newSet;
      });

      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      }

      const { data: updatedPost } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();

      if (updatedPost) {
        setPosts(prev =>
          prev.map(post => post.id === postId ? { ...post, likes: updatedPost.likes } : post)
        );
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, likes: updatedPost.likes } : null);
        }
      }
    } catch (error) {
      console.error('❌ Failed to like post:', error);
      toast.error('Failed to like post');
      // Rollback
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        isLiked ? newSet.add(postId) : newSet.delete(postId);
        return newSet;
      });
    }
  };

  const toggleSave = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast.success('Removed from saved');
      } else {
        newSet.add(postId);
        toast.success('Saved!');
      }
      return newSet;
    });
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!', { icon: '🔗' });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const navigatePost = (direction: 'prev' | 'next') => {
    if (!selectedPost) return;
    const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0) newIndex = posts.length - 1;
    if (newIndex >= posts.length) newIndex = 0;
    setSelectedPost(posts[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPost) return;
      if (e.key === 'ArrowLeft') navigatePost('prev');
      if (e.key === 'ArrowRight') navigatePost('next');
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost, posts]);

  const SkeletonGrid = () => (
    <>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`aspect-square rounded-lg animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
        />
      ))}
    </>
  );

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gallery
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {posts.length} {filter === 'all' ? 'media items' : filter}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'images', 'videos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {f === 'all' && <FaFilter className="text-xs" />}
              {f === 'images' && <FaImages className="text-xs" />}
              {f === 'videos' && <FaVideo className="text-xs" />}
              <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}
          >
            <img
              src={post.media_url}
              alt={post.content}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {post.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-white/90 rounded-full p-3">
                  <FaPlay className="text-purple-600" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <FaHeart className={likedPosts.has(post.id) ? 'fill-current text-purple-400' : ''} />
                      <span>{formatCount(post.likes)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaComment />
                      <span>{formatCount(post.comments_count)}</span>
                    </span>
                  </div>
                  {post.author?.isPremium && <FaStar className="text-yellow-400" />}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && <SkeletonGrid />}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={observerTarget} className="h-10" />

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
            All {filter === 'all' ? 'media' : filter} loaded ✨
          </p>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-16">
          <FaImages className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-800' : 'text-gray-300'}`} />
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No {filter === 'all' ? 'media' : filter} found
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
            Try changing the filter or create a post with media
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          >
            <FaTimes className="text-xl" />
          </button>

          <button
            onClick={() => navigatePost('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          <button
            onClick={() => navigatePost('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <FaChevronRight className="text-xl" />
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Media */}
              <div className="lg:w-2/3 flex items-center justify-center bg-black rounded-lg overflow-hidden">
                {selectedPost.media_type === 'video' ? (
                  <div className="relative w-full">
                    <img
                      src={selectedPost.media_url}
                      alt="Video thumbnail"
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-purple-600 hover:bg-purple-700 rounded-full p-6 cursor-pointer transition-all">
                        <FaPlay className="text-white text-3xl ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={selectedPost.media_url}
                    alt={selectedPost.content}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                )}
              </div>

              {/* Info Panel */}
              <div className={`lg:w-1/3 rounded-lg p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={selectedPost.author?.avatar_url || 'https://i.pravatar.cc/150'}
                    alt={selectedPost.author?.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedPost.author?.username || 'Anonymous'}
                      </h3>
                      {selectedPost.author?.isPremium && <FaStar className="text-yellow-400 text-sm" />}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      {formatTime(selectedPost.created_at)}
                    </p>
                  </div>
                </div>

                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedPost.content}
                </p>

                <div className={`flex items-center space-x-4 mb-4 pb-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center space-x-2 transition-all ${
                      likedPosts.has(selectedPost.id)
                        ? 'text-purple-500'
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FaHeart className={likedPosts.has(selectedPost.id) ? 'fill-current' : ''} />
                    <span className="font-semibold">{formatCount(selectedPost.likes)}</span>
                  </button>

                  <button className={`flex items-center space-x-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    <FaComment />
                    <span className="font-semibold">{formatCount(selectedPost.comments_count)}</span>
                  </button>

                  <button
                    onClick={() => toggleSave(selectedPost.id)}
                    className={`ml-auto ${
                      savedPosts.has(selectedPost.id)
                        ? 'text-purple-500'
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FaBookmark className={savedPosts.has(selectedPost.id) ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={() => handleShare(selectedPost.id)}
                    className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                  >
                    <FaShare />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCount(selectedPost.likes)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Likes</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCount(selectedPost.comments_count)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Comments</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCount(selectedPost.shares)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Shares</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}