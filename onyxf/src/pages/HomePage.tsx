import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import {
  createPost,
  fetchPosts,
  Post,
  likePost,
  deletePost,
  createComment,
  fetchComments,
  Comment
} from '../services/postService';
import { followUser, isFollowing as checkIsFollowing } from '../services/followService';
import { postQueue } from '../services/postQueue';
import { ImageUpload } from '../components/ImageUpload';
import { ExplorePage } from './ExplorePage';
import GalleryPage from './GalleryPage';
import { ProfilePage } from './ProfilePage';
import toast from 'react-hot-toast';
import {
  FaHome,
  FaImages,
  FaUsers,
  FaShoppingBag,
  FaUser,
  FaHeart,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaPlay,
  FaPlus,
  FaFire,
  FaBell,
  FaSearch,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaBookmark,
  FaPaperPlane,
  FaTimes,
  FaStar,
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaTrash,
  FaLink,
  FaUserPlus,
  FaUserCheck
} from 'react-icons/fa';

const spotlightPosts = [
  {
    id: 'spotlight1',
    title: 'Amazing Gojo Satoru Fan Art',
    author: 'ArtMaster_Yuki',
    views: '12.5K',
    image: 'https://via.placeholder.com/1200x500/8B5CF6/ffffff?text=Trending+Gojo+Art',
    badge: 'Trending'
  },
  {
    id: 'spotlight2',
    title: 'Top 10 Anime Openings 2024',
    author: 'AnimeReviewer',
    views: '25.3K',
    image: 'https://via.placeholder.com/1200x500/7C3AED/ffffff?text=Top+10+Anime+Openings',
    badge: 'Popular'
  },
  {
    id: 'spotlight3',
    title: 'Naruto vs Sasuke Speed Drawing',
    author: 'SpeedArtist_Jin',
    views: '18.7K',
    image: 'https://via.placeholder.com/1200x500/6D28D9/ffffff?text=Naruto+vs+Sasuke',
    badge: 'Featured'
  },
  {
    id: 'spotlight4',
    title: 'My Hero Academia Season 7 Hype',
    author: 'MHA_Fanatic',
    views: '31.2K',
    image: 'https://via.placeholder.com/1200x500/5B21B6/ffffff?text=MHA+Season+7',
    badge: 'Hot'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ✅ Auth loading state
  const [authLoading, setAuthLoading] = useState(true);

  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [feedFilter, setFeedFilter] = useState('foryou');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [savedPosts, setSavedPosts] = useState(new Set<string>());
  const [darkMode, setDarkMode] = useState(true);
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [queueStatus, setQueueStatus] = useState({ pending: 0, failed: 0 });
  const [showExplore, setShowExplore] = useState(false);

  // ✅ Follow state for posts
  const [followingUsers, setFollowingUsers] = useState(new Set<string>());
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  // Post creation state
  const [postContent, setPostContent] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postMediaType, setPostMediaType] = useState<'image' | 'video' | undefined>();
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState<string | null>(null);

  // UI state
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);

  // Refs
  // ✅ FIX: postMenuRef REMOVED — was a single ref shared across all posts in .map(),
  // always pointing to the last rendered post's node. Replaced with data-post-menu attribute.
  const observerTarget = useRef(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // ✅ Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setAuthLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/login');
          return;
        }

        setLoading(true);
        console.log('📥 Loading initial posts...');

        const fetchedPosts = await fetchPosts(10, 0);
        setPosts(fetchedPosts);
        console.log(`✅ Loaded ${fetchedPosts.length} posts`);

        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', session.user.id);

        if (userLikes) {
          setLikedPosts(new Set(userLikes.map((like: { post_id: string }) => like.post_id)));
          console.log(`💜 User has ${userLikes.length} liked posts`);
        }

        const authorIds = [...new Set(fetchedPosts.map(p => p.user_id).filter(id => id !== session.user.id))];
        console.log('📊 Checking follow status for', authorIds.length, 'authors');

        if (authorIds.length > 0) {
          const followingStatuses = await Promise.all(
            authorIds.map(async (authorId) => {
              const isFollowingAuthor = await checkIsFollowing(authorId);
              return { userId: authorId, isFollowing: isFollowingAuthor };
            })
          );

          const followingSet = new Set(
            followingStatuses.filter(s => s.isFollowing).map(s => s.userId)
          );
          console.log('💜 Total following:', followingSet.size, 'users');
          setFollowingUsers(followingSet);
        }

      } catch (error) {
        console.error('❌ Failed to load posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
        setAuthLoading(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  // ✅ Queue monitoring
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const status = postQueue.getQueueStatus();
        setQueueStatus({ pending: status.pending, failed: status.failed });
        await postQueue.processQueue();

        try {
          const fetchedPosts = await fetchPosts(10, 0);
          setPosts(fetchedPosts);

          const newStatus = postQueue.getQueueStatus();
          setQueueStatus({ pending: newStatus.pending, failed: newStatus.failed });

          if (newStatus.pending === 0 && status.pending > 0) {
            toast.success('All posts synced! 🎉');
          }
        } catch (error) {
          console.error('❌ Failed to refresh:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (!document.hidden) {
        postQueue.processQueue();
        const status = postQueue.getQueueStatus();
        setQueueStatus({ pending: status.pending, failed: status.failed });
      }
    }, 30000);

    const status = postQueue.getQueueStatus();
    setQueueStatus({ pending: status.pending, failed: status.failed });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // ✅ Spotlight carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSpotlight((prev) => (prev + 1) % spotlightPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Spotlight scroll sync
  useEffect(() => {
    if (spotlightRef.current) {
      const el = spotlightRef.current as HTMLElement;
      el.scrollTo({ left: currentSpotlight * el.offsetWidth, behavior: 'smooth' });
    }
  }, [currentSpotlight]);

  // ✅ Infinite scroll
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore || activeTab !== 'feed') return;

    setLoading(true);
    try {
      const morePosts = await fetchPosts(5, posts.length);

      if (morePosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...morePosts]);

        const newAuthorIds = [...new Set(morePosts.map(p => p.user_id))];
        const followingStatuses = await Promise.all(
          newAuthorIds.map(async (authorId) => ({
            userId: authorId,
            isFollowing: await checkIsFollowing(authorId)
          }))
        );

        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          followingStatuses.forEach(s => {
            if (s.isFollowing) newSet.add(s.userId);
          });
          return newSet;
        });
      }
    } catch (error) {
      console.error('❌ Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [posts.length, loading, hasMore, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && activeTab === 'feed') {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMorePosts, activeTab]);

  // ✅ FIX: Click-outside handler — uses data-post-menu attribute instead of broken shared ref
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Profile menu
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }

      // ✅ Post menus — data attribute approach works for every post independently.
      // The old postMenuRef was assigned inside .map() so it always pointed to
      // the LAST rendered post, causing every other menu's outside-click to misfire.
      const target = event.target as HTMLElement;
      const clickedInsidePostMenu = target.closest('[data-post-menu]');
      if (!clickedInsidePostMenu) {
        // Only close if a menu is actually open (avoids noisy re-renders)
        setShowPostMenu(prev => {
          if (prev !== null) console.log('🖱️ Clicked outside post menu — closing menu for post:', prev);
          return null;
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Follow/Unfollow from post
  const handleFollowFromPost = async (userId: string) => {
    if (!user || userId === user.id) return;

    try {
      setFollowLoading(userId);
      console.log('🔄 Follow action for user:', userId);

      const nowFollowing = await followUser(userId);
      console.log('✅ Follow result:', nowFollowing ? 'NOW FOLLOWING' : 'UNFOLLOWED');

      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        if (nowFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      toast.success(nowFollowing ? 'Following! ✨' : 'Unfollowed', {
        icon: nowFollowing ? '🎉' : '👋'
      });
    } catch (error) {
      console.error('❌ Failed to update follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(null);
    }
  };

  // ✅ CREATE POST
  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error('Post content is required');
      return;
    }

    try {
      setIsSubmittingPost(true);
      console.log('📝 Creating post...');

      const optimisticPost = await createPost({
        content: postContent,
        media_url: postMediaUrl || undefined,
        media_type: postMediaType,
      });

      setPosts(prev => [optimisticPost, ...prev]);

      setPostContent('');
      setPostMediaUrl('');
      setPostMediaType(undefined);
      setShowCreateModal(false);

      toast.success('Post created! Syncing... 🎉', { duration: 2000 });

      postQueue.processQueue().then(async () => {
        try {
          const fetchedPosts = await fetchPosts(10, 0);
          setPosts(fetchedPosts);
        } catch (error) {
          console.error('❌ Failed to refresh after post:', error);
        }
      });

    } catch (error) {
      console.error('❌ Failed to create post:', error);
      toast.error('Failed to create post. Will retry automatically.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // ✅ LIKE POST
  const handleLikePost = async (postId: string) => {
    const isLiked = likedPosts.has(postId);

    try {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        isLiked ? newSet.delete(postId) : newSet.add(postId);
        return newSet;
      });

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      ));

      await likePost(postId);
    } catch (error) {
      console.error('❌ Failed to like post:', error);
      toast.error('Failed to like post');

      // Rollback
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        isLiked ? newSet.add(postId) : newSet.delete(postId);
        return newSet;
      });
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1 }
          : post
      ));
    }
  };

  // ✅ DELETE POST — fully fixed
  const handleDeletePost = async (postId: string) => {
    console.log('🗑️ handleDeletePost called — postId:', postId);
    console.log('👤 Current user:', user?.id);

    if (!user) {
      console.warn('❌ No user found — aborting delete');
      toast.error('You must be logged in');
      return;
    }

    const post = posts.find(p => p.id === postId);
    console.log('📄 Found post:', post ? `id=${post.id}, user_id=${post.user_id}` : 'NOT FOUND in local state');

    if (!post) {
      console.warn('❌ Post not found in local state — postId:', postId);
      toast.error('Post not found');
      return;
    }

    // ✅ FIX: String-coerce both sides — Supabase UUID vs auth UID can have type mismatch
    const postUserId = String(post.user_id).trim();
    const currentUserId = String(user.id).trim();
    console.log('🔐 Ownership check — post.user_id:', postUserId, '| user.id:', currentUserId, '| match:', postUserId === currentUserId);

    if (postUserId !== currentUserId) {
      console.warn('❌ Ownership mismatch — cannot delete this post');
      toast.error('You can only delete your own posts');
      return;
    }

    // ✅ FIX: Close the menu BEFORE confirm dialog opens.
    // Old bug: mousedown event (which closes the menu) fired BEFORE onClick,
    // so the menu was already unmounted when delete button's onClick ran.
    setShowPostMenu(null);
    console.log('📋 Post menu closed — waiting for re-render before confirm dialog...');

    // Small delay so React can flush the menu-close re-render before confirm blocks the thread
    await new Promise(resolve => setTimeout(resolve, 50));

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    console.log('❓ User confirmed delete:', confirmed);

    if (!confirmed) {
      console.log('🚫 Delete cancelled by user');
      return;
    }

    console.log('⏳ Proceeding with Supabase delete for postId:', postId);

    // Optimistic removal from UI
    setPosts(prev => prev.filter(p => p.id !== postId));
    const loadingToast = toast.loading('Deleting post...');

    try {
      const { error, count } = await supabase
        .from('posts')
        .delete({ count: 'exact' }) // ✅ count:'exact' detects silent RLS blocks
        .eq('id', postId)
        .eq('user_id', user.id);

      console.log('📡 Supabase delete response — error:', error, '| rows affected:', count);

      if (error) {
        console.error('❌ Supabase delete error:', error.message, '| code:', error.code, '| details:', error.details);
        throw error;
      }

      if (count === 0) {
        // Deleted 0 rows — RLS policy likely blocked it silently
        console.warn('⚠️ Delete returned 0 rows — possible RLS policy block or post already deleted');
        toast.error('Delete failed — check your Supabase RLS policy for posts table', { id: loadingToast });

        // Restore UI since nothing was actually deleted
        const fetchedPosts = await fetchPosts(10, 0);
        setPosts(fetchedPosts);
        return;
      }

      console.log('✅ Post deleted successfully — postId:', postId);
      toast.success('Post deleted!', { id: loadingToast });

    } catch (error: any) {
      console.error('❌ handleDeletePost threw an error:', error);
      toast.error(error.message || 'Failed to delete post', { id: loadingToast });

      // Restore optimistic removal
      try {
        const fetchedPosts = await fetchPosts(10, 0);
        setPosts(fetchedPosts);
        console.log('🔄 Posts restored after failed delete');
      } catch (e) {
        console.error('❌ Failed to restore posts after error:', e);
      }
    }
  };

  // ✅ SHARE POST
  const handleSharePost = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!', { icon: '🔗' });
    setShowPostMenu(null);
  };

  // ✅ TOGGLE COMMENTS
  const handleToggleComments = async (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
      return;
    }

    setShowComments(postId);

    if (!comments[postId]) {
      try {
        setLoadingComments(postId);
        const fetchedComments = await fetchComments(postId);
        setComments(prev => ({ ...prev, [postId]: fetchedComments }));
      } catch (error) {
        console.error('❌ Failed to load comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(null);
      }
    }
  };

  // ✅ ADD COMMENT
  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      const newComment = await createComment(postId, commentText);

      setComments(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }));

      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
      ));

      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // ✅ REFRESH FEED
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fetchedPosts = await fetchPosts(10, 0);
      setPosts(fetchedPosts);
      toast.success('Feed refreshed!');
    } catch (error) {
      console.error('❌ Failed to refresh:', error);
      toast.error('Failed to refresh feed');
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ LOGOUT
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // ✅ TOGGLE SAVE
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

  // ✅ UTILITY FUNCTIONS
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

  // ✅ REAL USER DATA
  const userData = {
    username: user?.username || 'User',
    email: user?.email || '',
    photoURL: user?.avatar_url || 'https://i.pravatar.cc/150?img=1',
    level: user?.level || 1,
    bio: user?.bio || '',
    location: user?.location || '',
    followers: user?.followers_count || 0,
    following: user?.following_count || 0,
    posts: posts.filter(p => p.user_id === user?.id).length,
    isPremium: user?.ispremium || false
  };

  const currentXP = ((user?.level || 1) * 500) * 0.65;
  const nextLevelXP = ((user?.level || 1) + 1) * 500;

  const filterChips = [
    { id: 'foryou', label: 'For You', icon: FaFire },
    { id: 'following', label: 'Following', icon: FaUsers },
    { id: 'trending', label: 'Trending', icon: FaStar },
  ];

  const navItems = [
    { id: 'feed', icon: FaHome, label: 'Feed' },
    { id: 'gallery', icon: FaImages, label: 'Gallery' },
    { id: 'communities', icon: FaUsers, label: 'Communities' },
    { id: 'shop', icon: FaShoppingBag, label: 'Shop' },
    { id: 'profile', icon: FaUser, label: 'Profile' },
  ];

  // ✅ SKELETON LOADER
  const SkeletonPost = () => (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl overflow-hidden animate-pulse border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="p-5 flex items-center space-x-3">
        <div className={`w-11 h-11 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        <div className="flex-1">
          <div className={`h-3.5 rounded w-32 mb-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <div className={`h-3 rounded w-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        </div>
      </div>
      <div className="px-5 pb-3">
        <div className={`h-3.5 rounded w-full mb-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        <div className={`h-3.5 rounded w-3/4 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      </div>
      <div className={`w-full h-80 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      <div className="p-5 flex space-x-6">
        <div className={`h-8 rounded w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        <div className={`h-8 rounded w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        <div className={`h-8 rounded w-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      </div>
    </div>
  );

  // ✅ LOADING SCREEN
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-600/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your feed...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px] ${darkMode ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className={`absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-violet-600 rounded-full blur-[150px] ${darkMode ? 'opacity-5' : 'opacity-3'}`}></div>
      </div>

      {/* Queue Status */}
      {queueStatus.pending > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-purple-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg">
          <FaClock className="animate-pulse" />
          <span>Syncing {queueStatus.pending} post{queueStatus.pending > 1 ? 's' : ''}...</span>
        </div>
      )}

      {queueStatus.failed > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-3 shadow-lg">
          <span>{queueStatus.failed} post{queueStatus.failed > 1 ? 's' : ''} failed</span>
          <button
            onClick={() => postQueue.retryFailed()}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-bold transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <nav className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b z-50 transition-colors ${
        darkMode ? 'bg-black/95 border-gray-800' : 'bg-white/95 border-gray-200'
      }`}>
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FaBolt className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">ONYX</h1>
              <p className="text-[9px] tracking-wider -mt-0.5 text-white">ANIME NETWORK</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExplore(!showExplore)}
              className={`p-2 rounded-lg transition-all ${
                showExplore
                  ? 'bg-purple-600 text-white'
                  : darkMode
                    ? 'text-gray-400 hover:text-purple-500 hover:bg-gray-900'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
              }`}
            >
              <FaSearch className="text-lg" />
            </button>

            <button className={`p-2 rounded-lg transition-all relative ${
              darkMode ? 'text-gray-400 hover:text-purple-500 hover:bg-gray-900' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
            }`}>
              <FaBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all ${
                darkMode ? 'text-gray-400 hover:text-purple-500 hover:bg-gray-900' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
              }`}
            >
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-900/50 transition-all"
              >
                <img
                  src={userData.photoURL}
                  alt={userData.username}
                  className="w-8 h-8 rounded-full border-2 border-purple-600/50"
                />
              </button>

              {showProfileMenu && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 ${
                  darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="relative p-6 bg-gradient-to-br from-purple-600 to-violet-600">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={userData.photoURL}
                          alt={userData.username}
                          className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                        />
                        {userData.isPremium && (
                          <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1.5 border-2 border-white">
                            <FaStar className="text-yellow-900 text-xs" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{userData.username}</h3>
                        <p className="text-white/80 text-sm">{userData.email}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Level {userData.level}
                          </span>
                          {userData.isPremium && (
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                              PRO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`grid grid-cols-3 gap-4 p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.posts}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Posts</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCount(userData.followers)}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Followers</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCount(userData.following)}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Following</div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <FaUser className="text-lg" />
                      <span className="font-medium">View Profile</span>
                    </button>
                    <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}>
                      <FaBookmark className="text-lg" />
                      <span className="font-medium">Saved Posts</span>
                    </button>
                  </div>

                  <div className={`p-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button
                      onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-500/10 font-medium"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar Navigation */}
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 backdrop-blur-md border-r p-5 overflow-y-auto hidden lg:flex lg:flex-col transition-colors ${
          darkMode ? 'bg-black/95 border-gray-800' : 'bg-white/95 border-gray-200'
        }`}>
          <div className={`mb-6 p-4 rounded-xl border transition-colors ${
            darkMode ? 'bg-gradient-to-br from-gray-900 to-black border-purple-900/30' : 'bg-gradient-to-br from-purple-50 to-white border-purple-200/50'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <img src={userData.photoURL} alt="User" className="w-11 h-11 rounded-full border-2 border-purple-600/50" />
                {userData.isPremium && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 border-black">
                    <FaStar className="text-white text-[8px]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.username}</h3>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Level {userData.level}</span>
              </div>
            </div>
            <div className={`w-full rounded-full h-1.5 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className={`text-[10px] mt-1.5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
              {Math.floor(currentXP)} / {nextLevelXP} XP to Level {userData.level + 1}
            </p>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setShowExplore(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? darkMode
                        ? 'bg-purple-600/10 text-purple-500 border-l-2 border-purple-600'
                        : 'bg-purple-100 text-purple-700 border-l-2 border-purple-600'
                      : darkMode
                        ? 'text-gray-500 hover:text-white hover:bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className={`w-full mt-4 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all border ${
              darkMode
                ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/5 border-gray-800 hover:border-red-500/20'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
            }`}
          >
            <FaSignOutAlt />
            <span className="text-sm">Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-5 py-6 max-w-4xl mx-auto pb-20 lg:pb-6 relative z-10">

          {/* GALLERY TAB */}
          {activeTab === 'gallery' ? (
            <GalleryPage darkMode={darkMode} />

          ) : showExplore ? (
            <ExplorePage
              darkMode={darkMode}
              onUserClick={(userId) => {
                console.log('Navigate to user:', userId);
                setShowExplore(false);
                setActiveTab('profile');
              }}
              onPostClick={(postId) => {
                console.log('Navigate to post:', postId);
                setShowExplore(false);
              }}
            />

          ) : activeTab === 'feed' ? (
            <>
              {refreshing && (
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-purple-600 border-t-transparent"></div>
                </div>
              )}

              {/* SPOTLIGHT SECTION */}
              <div className="mb-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaFire className="text-purple-600 text-xl" />
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Spotlight</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {spotlightPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSpotlight(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          currentSpotlight === index
                            ? 'w-6 bg-purple-600'
                            : darkMode ? 'w-1.5 bg-gray-700' : 'w-1.5 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative group">
                  <div ref={spotlightRef} className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth">
                    {spotlightPosts.map((spotlight) => (
                      <div key={spotlight.id} className="w-full flex-shrink-0 snap-center">
                        <div className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                          darkMode ? 'border-gray-800 hover:border-purple-600/50' : 'border-gray-200 hover:border-purple-400'
                        }`}>
                          <img src={spotlight.image} alt={spotlight.title} className="w-full h-64 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">{spotlight.badge}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white text-xl font-bold mb-2">{spotlight.title}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img src={`https://i.pravatar.cc/40?u=${spotlight.author}`} alt={spotlight.author} className="w-6 h-6 rounded-full border-2 border-white/50" />
                                <span className="text-white/90 text-sm font-medium">{spotlight.author}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-white/80 text-sm">
                                <FaFire className="text-xs" />
                                <span>{spotlight.views} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentSpotlight((prev) => (prev - 1 + spotlightPosts.length) % spotlightPosts.length)}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all ${
                      darkMode ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/50 hover:bg-white/70 text-gray-900'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={() => setCurrentSpotlight((prev) => (prev + 1) % spotlightPosts.length)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all ${
                      darkMode ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/50 hover:bg-white/70 text-gray-900'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {filterChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setFeedFilter(chip.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                        feedFilter === chip.id
                          ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                          : darkMode
                            ? 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                            : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      <Icon className="text-xs" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* POSTS FEED */}
              <div className="space-y-5">
                {posts.map((post) => {
                  const isOptimistic = post.id.startsWith('optimistic_');
                  const isOwnPost = user && String(post.user_id).trim() === String(user.id).trim();
                  const isFollowingAuthor = followingUsers.has(post.user_id);

                  return (
                    <article
                      key={post.id}
                      className={`rounded-2xl overflow-hidden border transition-all ${
                        darkMode
                          ? 'bg-gray-900 border-gray-800 hover:border-purple-900/50'
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      } ${isOptimistic ? 'opacity-70' : ''}`}
                    >
                      {isOptimistic && (
                        <div className="px-5 pt-3 pb-2">
                          <div className="flex items-center space-x-2 text-purple-600 text-xs">
                            <FaClock className="animate-pulse" />
                            <span>Syncing...</span>
                          </div>
                        </div>
                      )}

                      {/* POST HEADER */}
                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative">
                            <img
                              src={post.author?.avatar_url || 'https://i.pravatar.cc/150'}
                              alt={post.author?.username || 'User'}
                              className={`w-11 h-11 rounded-full border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                            />
                            {post.author?.isPremium && (
                              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 ${darkMode ? 'border-gray-900' : 'border-white'}`}>
                                <FaStar className="text-white text-[7px]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {post.author?.username || 'Anonymous'}
                              </h3>
                              <span className={darkMode ? 'text-gray-700' : 'text-gray-400'}>•</span>
                              <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                                {formatTime(post.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                                Lvl {post.author?.level || 1}
                              </span>
                            </div>
                          </div>

                          {/* FOLLOW BUTTON */}
                          {!isOwnPost && !isOptimistic && (
                            <button
                              onClick={() => handleFollowFromPost(post.user_id)}
                              disabled={followLoading === post.user_id}
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                followLoading === post.user_id ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                isFollowingAuthor
                                  ? darkMode
                                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300'
                                  : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm'
                              }`}
                            >
                              {followLoading === post.user_id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              ) : isFollowingAuthor ? (
                                <><FaUserCheck className="text-[10px]" /><span>Following</span></>
                              ) : (
                                <><FaUserPlus className="text-[10px]" /><span>Follow</span></>
                              )}
                            </button>
                          )}
                        </div>

                        {/* ✅ FIX: data-post-menu replaces ref={postMenuRef}
                            The old ref was shared across ALL posts in .map() and always
                            pointed to the LAST rendered post's DOM node, causing the
                            click-outside handler to misfire and swallow the delete click. */}
                        <div className="relative ml-2" data-post-menu>
                          <button
                            onClick={() => {
                              const next = showPostMenu === post.id ? null : post.id;
                              console.log('📂 Post menu toggle — postId:', post.id, '| opening:', next !== null);
                              setShowPostMenu(next);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              darkMode
                                ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-800'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <FaEllipsisH className="text-sm" />
                          </button>

                          {showPostMenu === post.id && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden z-10 ${
                              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                            }`}>
                              <button
                                onClick={() => handleSharePost(post.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
                                  darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                <FaLink className="text-sm" />
                                <span className="font-medium text-sm">Copy Link</span>
                              </button>

                              {isOwnPost && !isOptimistic && (
                                <button
                                  onClick={() => {
                                    console.log('🔴 Delete button clicked — postId:', post.id, '| isOwnPost:', isOwnPost);
                                    handleDeletePost(post.id);
                                  }}
                                  className="w-full flex items-center space-x-3 px-4 py-3 transition-all text-red-500 hover:bg-red-500/10"
                                >
                                  <FaTrash className="text-sm" />
                                  <span className="font-medium text-sm">Delete Post</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-5 pb-4">
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {post.content}
                        </p>
                      </div>

                      {/* Post Media */}
                      {post.media_url && (
  <div className={`relative ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
    {post.media_type === 'video' ? (
      <video 
        src={post.media_url}
        controls
        preload="metadata"
        className="w-full max-h-[600px] object-contain bg-black"
      >
        Your browser does not support video playback.
      </video>
    ) : (
      <img 
        src={post.media_url} 
        alt="Post media" 
        className="w-full h-auto" 
      />
    )}
  </div>
)}

                      {/* POST ACTIONS */}
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={() => !isOptimistic && handleLikePost(post.id)}
                              disabled={isOptimistic}
                              className={`flex items-center space-x-2 transition-all ${
                                isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                likedPosts.has(post.id)
                                  ? 'text-purple-600'
                                  : darkMode ? 'text-gray-600 hover:text-purple-500' : 'text-gray-500 hover:text-purple-600'
                              }`}
                            >
                              <FaHeart className={`text-lg ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              <span className="font-semibold text-sm">{formatCount(post.likes)}</span>
                            </button>

                            <button
                              onClick={() => !isOptimistic && handleToggleComments(post.id)}
                              disabled={isOptimistic}
                              className={`flex items-center space-x-2 transition-all ${
                                isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                showComments === post.id
                                  ? 'text-purple-600'
                                  : darkMode ? 'text-gray-600 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              <FaComment className="text-lg" />
                              <span className="font-semibold text-sm">{formatCount(post.comments_count)}</span>
                            </button>

                            <button
                              onClick={() => !isOptimistic && handleSharePost(post.id)}
                              disabled={isOptimistic}
                              className={`flex items-center space-x-2 transition-all ${
                                isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                darkMode ? 'text-gray-600 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              <FaPaperPlane className="text-lg" />
                              <span className="font-semibold text-sm">{formatCount(post.shares)}</span>
                            </button>
                          </div>

                          <button
                            onClick={() => !isOptimistic && toggleSave(post.id)}
                            disabled={isOptimistic}
                            className={`transition-all ${
                              isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              savedPosts.has(post.id)
                                ? 'text-purple-600'
                                : darkMode ? 'text-gray-600 hover:text-purple-500' : 'text-gray-500 hover:text-purple-600'
                            }`}
                          >
                            <FaBookmark className={`text-lg ${savedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* COMMENTS SECTION */}
                      {showComments === post.id && (
                        <div className={`border-t px-5 py-4 ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
                          <div className="flex items-start space-x-3 mb-4">
                            <img src={userData.photoURL} alt={userData.username} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className={`w-full p-3 border rounded-lg resize-none text-sm focus:outline-none ${
                                  darkMode
                                    ? 'bg-black border-gray-800 text-white placeholder-gray-600 focus:border-purple-600/50'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-400'
                                }`}
                                rows={2}
                              />
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!commentText.trim()}
                                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Comment
                                </button>
                              </div>
                            </div>
                          </div>

                          {loadingComments === post.id ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {comments[post.id]?.map((comment) => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                  <img
                                    src={comment.author?.avatar_url || 'https://i.pravatar.cc/150'}
                                    alt={comment.author?.username || 'User'}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {comment.author?.username || 'Anonymous'}
                                        </span>
                                        <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                                          {formatTime(comment.created_at)}
                                        </span>
                                      </div>
                                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {comments[post.id]?.length === 0 && (
                                <p className={`text-center text-sm py-4 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                                  No comments yet. Be the first to comment!
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}

                {loading && <><SkeletonPost /><SkeletonPost /></>}

                <div ref={observerTarget} className="h-10" />

                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-8">
                    <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>You're all caught up! ✨</p>
                    <button onClick={handleRefresh} className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors">
                      Refresh Feed
                    </button>
                  </div>
                )}

                {posts.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <FaFire className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-800' : 'text-gray-300'}`} />
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No posts yet</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>Be the first to create a post!</p>
                  </div>
                )}
              </div>
            </>

          ) : activeTab === 'profile' ? (
            <ProfilePage darkMode={darkMode} userId={user?.id} />

          ) : (
            <div className="text-center py-16">
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Coming Soon!</p>
            </div>
          )}
        </main>
      </div>

      {/* Create Post FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 lg:bottom-8 right-8 bg-gradient-to-br from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white p-4 rounded-2xl shadow-2xl shadow-purple-500/40 transition-all hover:scale-105 z-40"
      >
        <FaPlus className="text-xl" />
      </button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 border transition-colors ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share something with the community..."
              className={`w-full h-32 p-4 border rounded-xl focus:outline-none resize-none text-sm transition-all ${
                darkMode
                  ? 'bg-black border-gray-800 text-white placeholder-gray-600 focus:border-purple-600/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-400'
              }`}
            />

            <div className="mt-4">
              <ImageUpload
                onUploadComplete={(url, type) => {
                  setPostMediaUrl(url);
                  setPostMediaType(type);
                }}
                onRemove={() => {
                  setPostMediaUrl('');
                  setPostMediaType(undefined);
                }}
                currentPreview={postMediaUrl}
                darkMode={darkMode}
              />
            </div>

            <div className="flex items-center justify-end mt-5">
              <button
                onClick={handleCreatePost}
                disabled={isSubmittingPost || !postContent.trim()}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingPost ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Posting...
                  </span>
                ) : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t lg:hidden z-50 transition-colors ${
        darkMode ? 'bg-black/95 border-gray-800' : 'bg-white/95 border-gray-200'
      }`}>
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setShowExplore(false); }}
                className={`flex flex-col items-center p-2 transition-colors ${
                  isActive ? 'text-purple-600' : darkMode ? 'text-gray-600' : 'text-gray-500'
                }`}
              >
                <Icon className="text-xl" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}