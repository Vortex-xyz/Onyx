// src/pages/ProfilePage.tsx - WITH FOLLOW SYSTEM 🚀
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import { Post } from '../services/postService';
import { 
  followUser, 
  isFollowing, 
  getFollowers, 
  getFollowing, 
  getFollowCounts,
  FollowUser 
} from '../services/followService';
import toast from 'react-hot-toast';
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaLink,
  FaEdit,
  FaTimes,
  FaHeart,
  FaComment,
  FaCalendar,
  FaCrown,
  FaVideo,
  FaThLarge,
  FaList,
  FaSpinner,
  FaStar,
  FaCamera,
  FaImage,
  FaBolt,
  FaFire,
  FaGamepad,
  FaPalette,
  FaMusic,
  FaBook,
  FaCode,
  FaPlus,
  FaCheck,
  FaUserPlus,
  FaUserCheck,
  FaUsers
} from 'react-icons/fa';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  full_name: string | null;
  location: string | null;
  website: string | null;
  favorite_anime: string[] | null;
  interests: string[] | null;
  level: number;
  ispremium: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

interface ProfilePageProps {
  darkMode?: boolean;
  userId?: string;
}

const AVAILABLE_INTERESTS = [
  { id: 'anime', label: 'Anime', icon: FaFire, color: 'from-red-500 to-orange-500' },
  { id: 'manga', label: 'Manga', icon: FaBook, color: 'from-purple-500 to-pink-500' },
  { id: 'gaming', label: 'Gaming', icon: FaGamepad, color: 'from-blue-500 to-cyan-500' },
  { id: 'art', label: 'Digital Art', icon: FaPalette, color: 'from-green-500 to-emerald-500' },
  { id: 'music', label: 'J-Pop/K-Pop', icon: FaMusic, color: 'from-pink-500 to-rose-500' },
  { id: 'cosplay', label: 'Cosplay', icon: FaStar, color: 'from-yellow-500 to-amber-500' },
  { id: 'coding', label: 'Coding', icon: FaCode, color: 'from-indigo-500 to-purple-500' },
  { id: 'streaming', label: 'Streaming', icon: FaVideo, color: 'from-violet-500 to-fuchsia-500' },
];

const LEVEL_RANKS = [
  { min: 1, max: 9, title: 'Rookie', color: 'text-gray-400' },
  { min: 10, max: 24, title: 'Rising Star', color: 'text-blue-400' },
  { min: 25, max: 49, title: 'Elite', color: 'text-purple-400' },
  { min: 50, max: 99, title: 'Master', color: 'text-yellow-400' },
  { min: 100, max: 999, title: 'Legend', color: 'text-red-400' },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ darkMode = true, userId }) => {
  const { user: currentUser, refreshUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Follow system
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersData, setFollowersData] = useState<FollowUser[]>([]);
  const [followingData, setFollowingData] = useState<FollowUser[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [newAnime, setNewAnime] = useState('');
  
  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const profileUserId = userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === profileUserId;

  useEffect(() => {
    if (profileUserId) {
      loadProfile();
      loadUserPosts();
      if (!isOwnProfile) {
        checkFollowStatus();
      }
    }
  }, [profileUserId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', profileUserId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditedProfile(data);
      setTempInterests(data.interests || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
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
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!profileUserId) return;
    const following = await isFollowing(profileUserId);
    setIsFollowingUser(following);
  };

  const handleFollowToggle = async () => {
    if (!profileUserId || !currentUser) return;
    
    try {
      setFollowLoading(true);
      const nowFollowing = await followUser(profileUserId);
      setIsFollowingUser(nowFollowing);
      
      // Update follower count optimistically
      setProfile(prev => prev ? {
        ...prev,
        followers_count: prev.followers_count + (nowFollowing ? 1 : -1)
      } : null);
      
      toast.success(nowFollowing ? 'Following! ' : 'Unfollowed', {
        icon: nowFollowing ? '✨' : '👋'
      });
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLoadFollowers = async () => {
    if (!profileUserId) return;
    
    try {
      setLoadingFollowers(true);
      const data = await getFollowers(profileUserId);
      setFollowersData(data);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error loading followers:', error);
      toast.error('Failed to load followers');
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleLoadFollowing = async () => {
    if (!profileUserId) return;
    
    try {
      setLoadingFollowing(true);
      const data = await getFollowing(profileUserId);
      setFollowingData(data);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error loading following:', error);
      toast.error('Failed to load following');
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          username: editedProfile.username,
          full_name: editedProfile.full_name,
          bio: editedProfile.bio,
          location: editedProfile.location,
          website: editedProfile.website,
          favorite_anime: editedProfile.favorite_anime,
          interests: editedProfile.interests,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser!.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev!, ...editedProfile }));
      setIsEditing(false);
      await refreshUser();
      toast.success('Profile updated! ✨', { icon: '🎨' });
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser!.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser!.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      await refreshUser();
      toast.success('Avatar updated! 🎨');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingBanner(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser!.id}-banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ banner_url: publicUrl })
        .eq('id', currentUser!.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, banner_url: publicUrl } : null);
      await refreshUser();
      toast.success('Banner updated! 🎨');
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error('Failed to update banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    setTempInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const saveInterests = () => {
    setEditedProfile({ ...editedProfile, interests: tempInterests });
    setEditingInterests(false);
    toast.success('Interests updated!');
  };

  const addFavoriteAnime = () => {
    if (!newAnime.trim()) return;
    
    const currentAnime = editedProfile.favorite_anime || [];
    if (currentAnime.length >= 5) {
      toast.error('Maximum 5 favorite anime');
      return;
    }
    
    setEditedProfile({
      ...editedProfile,
      favorite_anime: [...currentAnime, newAnime.trim()]
    });
    setNewAnime('');
  };

  const removeFavoriteAnime = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      favorite_anime: (editedProfile.favorite_anime || []).filter((_, i) => i !== index)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getRankInfo = (level: number) => {
    return LEVEL_RANKS.find(rank => level >= rank.min && level <= rank.max) || LEVEL_RANKS[0];
  };

  const getLevelProgress = (level: number) => {
    const currentRank = getRankInfo(level);
    const progress = ((level - currentRank.min) / (currentRank.max - currentRank.min)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-600/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            <FaBolt className="absolute inset-0 m-auto text-purple-600 text-2xl animate-pulse" />
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <FaUserCircle className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-800' : 'text-gray-300'}`} />
          <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>User not found</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This profile doesn't exist</p>
        </div>
      </div>
    );
  }

  const mediaPosts = userPosts.filter(p => p.media_url);
  const rankInfo = getRankInfo(profile.level);
  const levelProgress = getLevelProgress(profile.level);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Banner Section */}
      <div className="relative h-80 overflow-hidden">
        {profile.banner_url ? (
          <div className="relative h-full">
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
          </div>
        ) : (
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white/20 rounded-full"></div>
              <div className="absolute bottom-10 left-1/3 w-40 h-40 border-2 border-white/10 rounded-full"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
          </div>
        )}
        
        {isOwnProfile && (
          <label className="absolute bottom-6 right-6 cursor-pointer z-10">
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
              disabled={uploadingBanner}
            />
            <div className="bg-black/70 backdrop-blur-xl text-white px-5 py-3 rounded-xl hover:bg-black/90 transition-all flex items-center space-x-3 border border-white/10">
              {uploadingBanner ? (
                <>
                  <FaSpinner className="animate-spin text-purple-400" />
                  <span className="text-sm font-semibold">Uploading...</span>
                </>
              ) : (
                <>
                  <FaCamera className="text-purple-400" />
                  <span className="text-sm font-semibold">Edit Banner</span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-5 -mt-32 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDEBAR */}
          <div className={`lg:w-80 rounded-2xl border overflow-hidden ${
            darkMode ? 'bg-gray-900/90 backdrop-blur-xl border-gray-800' : 'bg-white/90 backdrop-blur-xl border-gray-200'
          }`}>
            {/* Avatar & Username Section */}
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="relative">
                  <img
                    src={profile.avatar_url || 'https://i.pravatar.cc/150'}
                    alt={profile.username}
                    className={`w-32 h-32 rounded-2xl border-4 ${
                      darkMode ? 'border-gray-900 bg-gray-900' : 'border-white bg-white'
                    } shadow-xl`}
                  />
                  {profile.ispremium && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-2.5 border-4 border-gray-900 shadow-lg animate-pulse">
                      <FaCrown className="text-white text-lg" />
                    </div>
                  )}
                </div>
                
                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <div className="bg-gradient-to-br from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white p-3 rounded-xl transition-all shadow-lg border-2 border-gray-900">
                      {uploadingAvatar ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCamera />
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Username */}
              <div className="mb-4">
                {isEditing ? (
                  <input
                    value={editedProfile.username || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    placeholder="Username"
                    className={`w-full p-2 rounded-lg border text-center text-xl font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600/50 ${
                      darkMode
                        ? 'bg-black border-gray-800 text-white placeholder-gray-600'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                ) : (
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile.username}
                  </h1>
                )}
                
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className={`text-sm font-semibold ${rankInfo.color}`}>
                    {rankInfo.title}
                  </span>
                  {profile.ispremium && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </div>
              </div>

              {/* Level Progress */}
              <div className={`mb-6 p-4 rounded-xl border ${
                darkMode ? 'bg-black/50 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    LEVEL
                  </span>
                  <span className={`text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent`}>
                    {profile.level}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <p className={`text-[10px] mt-1.5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                  {Math.round(levelProgress)}% to next rank
                </p>
              </div>

              {/* Stats Grid - WITH FOLLOW COUNTS */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-3 rounded-xl border ${darkMode ? 'bg-black/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userPosts.length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Posts</div>
                </div>
                <div className={`p-3 rounded-xl border ${darkMode ? 'bg-black/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {mediaPosts.length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Media</div>
                </div>
              </div>

              {/* FOLLOW STATS - CLICKABLE */}
              <div className={`grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl border ${
                darkMode ? 'bg-black/50 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <button
                  onClick={handleLoadFollowers}
                  disabled={loadingFollowers}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loadingFollowers ? <FaSpinner className="animate-spin mx-auto" /> : formatCount(profile.followers_count || 0)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Followers</div>
                </button>
                <button
                  onClick={handleLoadFollowing}
                  disabled={loadingFollowing}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loadingFollowing ? <FaSpinner className="animate-spin mx-auto" /> : formatCount(profile.following_count || 0)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Following</div>
                </button>
              </div>

              {/* Edit/Follow Button */}
              {isOwnProfile ? (
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleUpdateProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={isUpdating}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                    isEditing
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30'
                      : darkMode
                        ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {isUpdating ? (
                    <><FaSpinner className="animate-spin" /><span>Saving...</span></>
                  ) : isEditing ? (
                    <><FaCheck /><span>Save Changes</span></>
                  ) : (
                    <><FaEdit /><span>Edit Profile</span></>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg ${
                    isFollowingUser
                      ? darkMode
                        ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300'
                      : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-purple-500/30'
                  }`}
                >
                  {followLoading ? (
                    <><FaSpinner className="animate-spin" /><span>Loading...</span></>
                  ) : isFollowingUser ? (
                    <><FaUserCheck /><span>Following</span></>
                  ) : (
                    <><FaUserPlus /><span>Follow</span></>
                  )}
                </button>
              )}
            </div>

            {/* Bio Section */}
            <div className={`p-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Bio - Tell us about yourself..."
                    className={`w-full p-3 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-600/50 ${
                      darkMode
                        ? 'bg-black border-gray-800 text-white placeholder-gray-600'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    rows={3}
                  />
                  <input
                    value={editedProfile.location || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    placeholder="📍 Location"
                    className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 ${
                      darkMode
                        ? 'bg-black border-gray-800 text-white placeholder-gray-600'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <input
                    value={editedProfile.website || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                    placeholder="🔗 Website"
                    className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 ${
                      darkMode
                        ? 'bg-black border-gray-800 text-white placeholder-gray-600'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              ) : (
                <>
                  {profile.bio && (
                    <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile.bio}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    {profile.location && (
                      <div className={`flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <FaMapMarkerAlt className="text-purple-600" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <FaLink />
                        <span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    <div className={`flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FaCalendar className="text-purple-600" />
                      <span>Joined {formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Interests Section */}
            <div className={`p-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  INTERESTS
                </h3>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      if (editingInterests) {
                        saveInterests();
                      } else {
                        setEditingInterests(true);
                      }
                    }}
                    className="text-purple-600 hover:text-purple-700 text-xs font-semibold"
                  >
                    {editingInterests ? 'Done' : 'Edit'}
                  </button>
                )}
              </div>
              
              {editingInterests ? (
                <div className="space-y-2">
                  {AVAILABLE_INTERESTS.map(interest => {
                    const Icon = interest.icon;
                    const isSelected = tempInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`w-full p-2 rounded-lg border transition-all flex items-center space-x-2 ${
                          isSelected
                            ? `bg-gradient-to-r ${interest.color} border-transparent text-white`
                            : darkMode
                              ? 'bg-black border-gray-800 text-gray-400 hover:border-purple-600/50'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <Icon />
                        <span className="text-sm font-medium">{interest.label}</span>
                        {isSelected && <FaCheck className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profile.interests || []).length > 0 ? (
                    (profile.interests || []).map(interestId => {
                      const interest = AVAILABLE_INTERESTS.find(i => i.id === interestId);
                      if (!interest) return null;
                      const Icon = interest.icon;
                      return (
                        <span
                          key={interestId}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 bg-gradient-to-r ${interest.color} text-white`}
                        >
                          <Icon className="text-xs" />
                          <span>{interest.label}</span>
                        </span>
                      );
                    })
                  ) : (
                    <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                      {isOwnProfile ? 'Add your interests' : 'No interests added'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Favorite Anime */}
            <div className={`p-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className={`text-sm font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                FAVORITE ANIME
              </h3>
              
              {isEditing ? (
                <div className="space-y-2">
                  {(editedProfile.favorite_anime || []).map((anime, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                        darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
                      }`}>
                        {anime}
                      </span>
                      <button
                        onClick={() => removeFavoriteAnime(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      value={newAnime}
                      onChange={(e) => setNewAnime(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFavoriteAnime()}
                      placeholder="Add anime..."
                      className={`flex-1 p-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 ${
                        darkMode
                          ? 'bg-black border-gray-800 text-white placeholder-gray-600'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <button
                      onClick={addFavoriteAnime}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(profile.favorite_anime || []).length > 0 ? (
                    (profile.favorite_anime || []).map((anime, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          darkMode ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {index + 1}. {anime}
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                      {isOwnProfile ? 'Add your favorites' : 'No favorites added'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTENT - Posts */}
          <div className="flex-1">
            {/* Tabs */}
            <div className={`rounded-2xl border overflow-hidden mb-6 ${
              darkMode ? 'bg-gray-900/90 backdrop-blur-xl border-gray-800' : 'bg-white/90 backdrop-blur-xl border-gray-200'
            }`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                      activeTab === 'posts'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                        : darkMode
                          ? 'text-gray-500 hover:text-white hover:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                      activeTab === 'media'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                        : darkMode
                          ? 'text-gray-500 hover:text-white hover:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Media
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white'
                        : darkMode
                          ? 'text-gray-500 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-purple-600 text-white'
                        : darkMode
                          ? 'text-gray-500 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {activeTab === 'posts' && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {userPosts.map(post => (
                    <div
                      key={post.id}
                      className={`aspect-square rounded-xl overflow-hidden cursor-pointer group relative border ${
                        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                      }`}
                    >
                      {post.media_url ? (
                        <>
                          <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                          {post.media_type === 'video' && (
                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full p-2">
                              <FaVideo className="text-white text-xs" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center space-x-6 text-white">
                              <div className="flex items-center space-x-2">
                                <FaHeart className="text-red-500" />
                                <span className="font-bold">{formatCount(post.likes)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FaComment className="text-blue-500" />
                                <span className="font-bold">{formatCount(post.comments_count)}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center p-5 ${
                          darkMode ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          <p className={`text-sm line-clamp-6 text-center ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {post.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <div
                      key={post.id}
                      className={`p-6 rounded-2xl border transition-all hover:shadow-xl ${
                        darkMode ? 'bg-gray-900/90 border-gray-800 hover:border-purple-600/50' : 'bg-white/90 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed`}>
                        {post.content}
                      </p>
                      {post.media_url && (
                        <div className="relative rounded-xl overflow-hidden">
                          <img src={post.media_url} alt="" className="w-full" />
                          {post.media_type === 'video' && (
                            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-3">
                              <FaVideo className="text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`flex items-center space-x-6 mt-4 text-sm ${
                        darkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        <span className="flex items-center space-x-2">
                          <FaHeart className="text-red-500" />
                          <span className="font-semibold">{formatCount(post.likes)}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <FaComment className="text-blue-500" />
                          <span className="font-semibold">{formatCount(post.comments_count)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'media' && (
              <div className="grid grid-cols-3 gap-4">
                {mediaPosts.map(post => (
                  <div
                    key={post.id}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                  >
                    <img src={post.media_url!} alt="" className="w-full h-full object-cover" />
                    {post.media_type === 'video' && (
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full p-2">
                        <FaVideo className="text-white text-xs" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center space-x-6 text-white">
                        <div className="flex items-center space-x-2">
                          <FaHeart className="text-red-500" />
                          <span className="font-bold">{formatCount(post.likes)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaComment className="text-blue-500" />
                          <span className="font-bold">{formatCount(post.comments_count)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {((activeTab === 'posts' && userPosts.length === 0) || 
              (activeTab === 'media' && mediaPosts.length === 0)) && (
              <div className={`rounded-2xl border p-16 text-center ${
                darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-200'
              }`}>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl"></div>
                  <FaImage className={`relative text-6xl ${darkMode ? 'text-gray-800' : 'text-gray-300'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No {activeTab} yet
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {isOwnProfile ? 'Share your first post!' : 'Nothing here yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOLLOWERS MODAL */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden ${
            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-bold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaUsers className="text-purple-600" />
                <span>Followers</span>
              </h3>
              <button onClick={() => setShowFollowersModal(false)}>
                <FaTimes className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {followersData.length > 0 ? (
                followersData.map(follower => (
                  <div key={follower.id} className="flex items-center space-x-3">
                    <img
                      src={follower.avatar_url || 'https://i.pravatar.cc/150'}
                      alt={follower.username}
                      className="w-12 h-12 rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {follower.username}
                        </p>
                        {follower.ispremium && (
                          <FaCrown className="text-yellow-500 text-xs" />
                        )}
                      </div>
                      {follower.bio && (
                        <p className={`text-xs line-clamp-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {follower.bio}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? 'bg-purple-600/10 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      Lvl {follower.level}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaUsers className={`text-5xl mx-auto mb-3 ${darkMode ? 'text-gray-800' : 'text-gray-300'}`} />
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    No followers yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOLLOWING MODAL */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden ${
            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-bold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaUsers className="text-purple-600" />
                <span>Following</span>
              </h3>
              <button onClick={() => setShowFollowingModal(false)}>
                <FaTimes className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {followingData.length > 0 ? (
                followingData.map(following => (
                  <div key={following.id} className="flex items-center space-x-3">
                    <img
                      src={following.avatar_url || 'https://i.pravatar.cc/150'}
                      alt={following.username}
                      className="w-12 h-12 rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {following.username}
                        </p>
                        {following.ispremium && (
                          <FaCrown className="text-yellow-500 text-xs" />
                        )}
                      </div>
                      {following.bio && (
                        <p className={`text-xs line-clamp-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {following.bio}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? 'bg-purple-600/10 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      Lvl {following.level}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaUsers className={`text-5xl mx-auto mb-3 ${darkMode ? 'text-gray-800' : 'text-gray-300'}`} />
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    Not following anyone yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Default export for routes
export default ProfilePage;