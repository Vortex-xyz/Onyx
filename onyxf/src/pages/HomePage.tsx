// src/pages/HomePage.tsx - COMPLETE WITH FCM + PWA
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';
import {
  createPost,
  fetchPosts,
  Post,
  likePost,
  createComment,
  fetchComments,
  Comment
} from '../services/postService';
import { followUser, isFollowing as checkIsFollowing } from '../services/followService';
import { postQueue } from '../services/postQueue';
import { reportPost, ReportReason } from '../services/reportService';
import { moderateContent } from '../services/contentFilter';
import { savePost, unsavePost, isPostSaved } from '../services/savedPostsService';
import { requestNotificationPermission, listenForMessages } from '../services/fcmService';
import { ExplorePage } from './ExplorePage';
import GalleryPage from './GalleryPage';
import { ProfilePage } from './ProfilePage';
import { FaHome, FaImages, FaUsers, FaShoppingBag, FaUser, FaFire, FaStar, FaPlus } from 'react-icons/fa';

// Import all components
import { QueueStatus } from '../components/home/QueueStatus';
import { TopNav } from '../components/home/TopNav';
import { ProfileMenu } from '../components/home/ProfileMenu';
import { Sidebar } from '../components/home/Sidebar';
import { SpotlightCarousel } from '../components/home/SpotlightCarousel';
import { FilterChips } from '../components/home/FilterChips';
import { PostCard } from '../components/home/PostCard';
import { CreatePostModal } from '../components/home/CreatePostModal';
import { MobileBottomNav } from '../components/home/MobileBottomNav';
import { ReportModal } from '../components/home/ReportModal';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

// Import types from components
import { 
  UserData, 
  SpotlightPost, 
  FilterChip, 
  NavItem, 
  QueueStatus as QueueStatusType 
} from '../components/home/types';

// Spotlight data
const SPOTLIGHT_POSTS: SpotlightPost[] = [
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

  // State management
  const [darkMode, setDarkMode] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [feedFilter, setFeedFilter] = useState('foryou');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [savedPosts, setSavedPosts] = useState(new Set<string>());
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatusType>({ pending: 0, failed: 0 });
  const [showExplore, setShowExplore] = useState(false);
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
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  
  // Refs
  const observerTarget = useRef(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Nav items & filter chips
  const filterChips: FilterChip[] = [
    { id: 'foryou', label: 'For You', icon: FaFire },
    { id: 'following', label: 'Following', icon: FaUsers },
    { id: 'trending', label: 'Trending', icon: FaStar },
  ];

  const navItems: NavItem[] = [
    { id: 'feed', icon: FaHome, label: 'Feed' },
    { id: 'gallery', icon: FaImages, label: 'Gallery' },
    { id: 'communities', icon: FaUsers, label: 'Communities' },
    { id: 'shop', icon: FaShoppingBag, label: 'Shop' },
    { id: 'profile', icon: FaUser, label: 'Profile' },
  ];

  // User data
  const userData: UserData = {
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

  // Utility functions
  const formatTime = (isoString: string) => {
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
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

  // Load initial data
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
        const fetchedPosts = await fetchPosts(10, 0);
        setPosts(fetchedPosts);

        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', session.user.id);
        if (userLikes) {
          setLikedPosts(new Set(userLikes.map((like: { post_id: string }) => like.post_id)));
        }

        const authorIds = [...new Set(fetchedPosts.map(p => p.user_id).filter(id => id !== session.user.id))];
        if (authorIds.length > 0) {
          const followingStatuses = await Promise.all(
            authorIds.map(async (authorId) => ({
              userId: authorId,
              isFollowing: await checkIsFollowing(authorId)
            }))
          );
          setFollowingUsers(new Set(followingStatuses.filter(s => s.isFollowing).map(s => s.userId)));
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
        setAuthLoading(false);
      }
    };
    loadInitialData();
  }, [navigate]);

  // Load saved posts status
  useEffect(() => {
    const loadSavedStatus = async () => {
      if (!user || posts.length === 0) return;
      
      const savedSet = new Set<string>();
      for (const post of posts) {
        const saved = await isPostSaved(user.id, post.id);
        if (saved) {
          savedSet.add(post.id);
        }
      }
      setSavedPosts(savedSet);
    };

    loadSavedStatus();
  }, [user, posts.length]);

  // FCM Notification Permission Request
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        requestNotificationPermission(user.id).then(token => {
          if (token) {
            console.log('✅ FCM token received:', token);
          }
        }).catch(error => {
          console.error('FCM permission error:', error);
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // FCM Foreground Message Listener
  useEffect(() => {
    if (!user) return;

    listenForMessages((payload) => {
      console.log('📬 Foreground message received:', payload);
      
      const title = payload.notification?.title || 'New notification';
      const body = payload.notification?.body || '';
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gray-900 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-purple-600/30`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src={payload.notification?.icon || '/logo192.png'}
                  alt=""
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {body}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-800">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (payload.data?.url) {
                  window.location.href = payload.data.url;
                }
              }}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              View
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right'
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Queue monitoring
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const status = postQueue.getQueueStatus();
        setQueueStatus({ pending: status.pending, failed: status.failed });
        await postQueue.processQueue();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(() => {
      if (!document.hidden) postQueue.processQueue();
    }, 30000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Spotlight carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSpotlight((prev) => (prev + 1) % SPOTLIGHT_POSTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (spotlightRef.current) {
      const el = spotlightRef.current as HTMLElement;
      el.scrollTo({ left: currentSpotlight * el.offsetWidth, behavior: 'smooth' });
    }
  }, [currentSpotlight]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      const target = event.target as HTMLElement;
      if (!target.closest('[data-post-menu]')) {
        setShowPostMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Infinite scroll
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore || activeTab !== 'feed') return;
    setLoading(true);
    try {
      const morePosts = await fetchPosts(5, posts.length);
      if (morePosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...morePosts]);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [posts.length, loading, hasMore, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && activeTab === 'feed') loadMorePosts();
      },
      { threshold: 0.5 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMorePosts, activeTab]);

  // Handlers
  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error('Post content is required');
      return;
    }

    const moderation = moderateContent(postContent);
    if (!moderation.clean) {
      toast.error(`Post blocked: ${moderation.reason}`);
      return;
    }

    try {
      setIsSubmittingPost(true);
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
      toast.success('Post created! 🎉');
      postQueue.processQueue();
    } catch (error: any) {
      if (error.message?.includes('Rate limit') || error.message?.includes('rate limit')) {
        toast.error('Slow down! You can only create 10 posts per hour. ⏰');
      } else {
        console.error('Failed to create post:', error);
        toast.error('Failed to create post');
      }
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return toast.error('Please login');
    const isLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      isLiked ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
    try {
      await likePost(postId);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post || String(post.user_id).trim() !== String(user.id).trim()) {
      toast.error('You can only delete your own posts');
      return;
    }
    setShowPostMenu(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    if (!window.confirm('Delete this post?')) return;
    
    setPosts(prev => prev.filter(p => p.id !== postId));
    const loadingToast = toast.loading('Deleting post...');
    try {
      const { error, count } = await supabase
        .from('posts')
        .delete({ count: 'exact' })
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
      if (count === 0) {
        toast.error('Delete failed', { id: loadingToast });
        const fetchedPosts = await fetchPosts(10, 0);
        setPosts(fetchedPosts);
        return;
      }
      toast.success('Post deleted!', { id: loadingToast });
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete', { id: loadingToast });
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user || userId === user.id) return;
    try {
      setFollowLoading(userId);
      const nowFollowing = await followUser(userId);
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        nowFollowing ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
      toast.success(nowFollowing ? 'Following! ✨' : 'Unfollowed');
    } catch (error) {
      toast.error('Failed to follow');
    } finally {
      setFollowLoading(null);
    }
  };

  const handleSharePost = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success('Link copied! 🔗');
    setShowPostMenu(null);
  };

  const handleReportPost = async (postId: string, reason: ReportReason, description: string) => {
    try {
      await reportPost(postId, user!.id, reason, description);
      toast.success('Report submitted. Thank you for keeping Onyx safe! 🛡️');
      setShowReportModal(null);
      setShowPostMenu(null);
    } catch (error: any) {
      if (error.message.includes('already reported')) {
        toast.error('You have already reported this post');
      } else {
        toast.error('Failed to submit report');
      }
      console.error('Report error:', error);
    }
  };

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
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(null);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      const newComment = await createComment(postId, commentText);
      setComments(prev => ({ ...prev, [postId]: [newComment, ...(prev[postId] || [])] }));
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
      ));
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const toggleSave = async (postId: string) => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }

    const isSaved = savedPosts.has(postId);

    setSavedPosts(prev => {
      const newSet = new Set(prev);
      isSaved ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });

    try {
      if (isSaved) {
        const success = await unsavePost(user.id, postId);
        if (success) {
          toast.success('Removed from saved posts');
        } else {
          setSavedPosts(prev => new Set(prev).add(postId));
          toast.error('Failed to remove from saved');
        }
      } else {
        const success = await savePost(user.id, postId);
        if (success) {
          toast.success('Post saved! 📌');
        } else {
          setSavedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          toast.error('Failed to save post');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        isSaved ? newSet.add(postId) : newSet.delete(postId);
        return newSet;
      });
      toast.error('Something went wrong');
    }
  };

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
      <PWAInstallPrompt />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px] ${darkMode ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className={`absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-violet-600 rounded-full blur-[150px] ${darkMode ? 'opacity-5' : 'opacity-3'}`}></div>
      </div>

      <QueueStatus status={queueStatus} onRetryFailed={() => postQueue.retryFailed()} />

      <TopNav
        darkMode={darkMode}
        showExplore={showExplore}
        userData={userData}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleExplore={() => setShowExplore(!showExplore)}
        onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
      />

      {showProfileMenu && (
        <div className="relative">
          <div className="fixed top-16 right-6 z-50">
            <ProfileMenu
              darkMode={darkMode}
              userData={userData}
              isOpen={showProfileMenu}
              menuRef={profileMenuRef}
              onViewProfile={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
              onLogout={async () => { await logout(); navigate('/login'); }}
              formatCount={formatCount}
            />
          </div>
        </div>
      )}

      <div className="flex pt-16">
        <Sidebar
          darkMode={darkMode}
          userData={userData}
          navItems={navItems}
          activeTab={activeTab}
          currentXP={currentXP}
          nextLevelXP={nextLevelXP}
          onTabChange={(id) => { setActiveTab(id); setShowExplore(false); }}
          onLogout={async () => { await logout(); navigate('/login'); }}
        />

        <main className="flex-1 lg:ml-64 px-5 py-6 max-w-4xl mx-auto pb-20 lg:pb-6 relative z-10">
          {activeTab === 'gallery' ? (
            <GalleryPage darkMode={darkMode} />
          ) : showExplore ? (
            <ExplorePage darkMode={darkMode} onUserClick={() => setShowExplore(false)} onPostClick={() => setShowExplore(false)} />
          ) : activeTab === 'feed' ? (
            <>
              <SpotlightCarousel
                darkMode={darkMode}
                posts={SPOTLIGHT_POSTS}
                currentIndex={currentSpotlight}
                spotlightRef={spotlightRef}
                onIndexChange={setCurrentSpotlight}
              />

              <FilterChips
                darkMode={darkMode}
                chips={filterChips}
                activeFilter={feedFilter}
                onFilterChange={setFeedFilter}
              />

              <div className="space-y-5">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    darkMode={darkMode}
                    post={post as any}
                    user={user}
                    isLiked={likedPosts.has(post.id)}
                    isSaved={savedPosts.has(post.id)}
                    isFollowing={followingUsers.has(post.user_id)}
                    followLoading={followLoading === post.user_id}
                    showComments={showComments === post.id}
                    showPostMenu={showPostMenu === post.id}
                    comments={comments[post.id] as any || []}
                    commentText={commentText}
                    loadingComments={loadingComments === post.id}
                    userData={userData}
                    onLike={() => handleLike(post.id)}
                    onToggleComments={() => handleToggleComments(post.id)}
                    onShare={() => handleSharePost(post.id)}
                    onToggleSave={() => toggleSave(post.id)}
                    onFollow={() => handleFollow(post.user_id)}
                    onDelete={() => handleDeletePost(post.id)}
                    onToggleMenu={() => setShowPostMenu(prev => prev === post.id ? null : post.id)}
                    onReport={() => setShowReportModal(post.id)}
                    onCommentChange={setCommentText}
                    onSubmitComment={() => handleAddComment(post.id)}
                    formatTime={formatTime}
                    formatCount={formatCount}
                  />
                ))}
                <div ref={observerTarget} className="h-10" />
              </div>
            </>
          ) : activeTab === 'profile' ? (
            <ProfilePage darkMode={darkMode} userId={user?.id} />
          ) : (
            <div className="text-center py-16">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>Coming Soon!</p>
            </div>
          )}
        </main>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 lg:bottom-8 right-8 bg-gradient-to-br from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white p-4 rounded-2xl shadow-2xl shadow-purple-500/40 transition-all hover:scale-105 z-40"
      >
        <FaPlus className="text-xl" />
      </button>

      <CreatePostModal
        darkMode={darkMode}
        isOpen={showCreateModal}
        postContent={postContent}
        postMediaUrl={postMediaUrl}
        isSubmitting={isSubmittingPost}
        onContentChange={setPostContent}
        onMediaUpload={(url, type) => { setPostMediaUrl(url); setPostMediaType(type); }}
        onMediaRemove={() => { setPostMediaUrl(''); setPostMediaType(undefined); }}
        onSubmit={handleCreatePost}
        onClose={() => setShowCreateModal(false)}
      />

      {showReportModal && (
        <ReportModal
          darkMode={darkMode}
          isOpen={!!showReportModal}
          postId={showReportModal}
          onClose={() => setShowReportModal(null)}
          onSubmit={(reason, description) => handleReportPost(showReportModal, reason, description)}
        />
      )}

      <MobileBottomNav
        darkMode={darkMode}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(id) => { setActiveTab(id); setShowExplore(false); }}
      />
    </div>
  );
}