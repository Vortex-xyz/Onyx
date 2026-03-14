// src/pages/UserProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  getUserProfile,
  getUserPosts,
  checkIfFollowing,
  followUser,
  unfollowUser,
  UserProfile,
  UserPost,
} from '../services/userProfileService';
import { FaArrowLeft, FaCalendarAlt, FaHeart, FaComment, FaShare } from 'react-icons/fa';

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    if (!username) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;

    setLoading(true);
    try {
      // Fetch profile
      const profileData = await getUserProfile(username);
      if (!profileData) {
        toast.error('User not found');
        navigate('/home');
        return;
      }

      setProfile(profileData);

      // Fetch posts
      const postsData = await getUserPosts(profileData.id);
      setPosts(postsData);

      // Check follow status (if not own profile)
      if (user && user.id !== profileData.id) {
        const following = await checkIfFollowing(user.id, profileData.id);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const success = await unfollowUser(user.id, profile.id);
        if (success) {
          setIsFollowing(false);
          setProfile({
            ...profile,
            follower_count: profile.follower_count - 1,
          });
          toast.success(`Unfollowed ${profile.username}`);
        }
      } else {
        const success = await followUser(user.id, profile.id);
        if (success) {
          setIsFollowing(true);
          setProfile({
            ...profile,
            follower_count: profile.follower_count + 1,
          });
          toast.success(`Following ${profile.username}`);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
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
            <h1 className="text-white font-bold text-xl">{profile.username}</h1>
            <p className="text-gray-400 text-sm">{profile.post_count} posts</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-900/80 rounded-3xl border border-purple-800/30 p-8 backdrop-blur-md">
          {/* Avatar & Info */}
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full border-4 border-purple-600 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-purple-600 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white text-2xl font-bold mb-1">{profile.full_name}</h2>
                  <p className="text-purple-400 text-lg">@{profile.username}</p>
                </div>

                {/* Follow Button */}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                      isFollowing
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

                {/* Edit Profile Button */}
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 rounded-full font-semibold bg-gray-700 text-white hover:bg-gray-600 transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-300 text-base mb-4 leading-relaxed">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-4">
                <div>
                  <span className="text-white font-bold text-lg">
                    {formatCount(profile.follower_count)}
                  </span>
                  <span className="text-gray-400 ml-1">Followers</span>
                </div>
                <div>
                  <span className="text-white font-bold text-lg">
                    {formatCount(profile.following_count)}
                  </span>
                  <span className="text-gray-400 ml-1">Following</span>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center text-gray-400 text-sm">
                <FaCalendarAlt className="mr-2" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8">
          <h3 className="text-white text-2xl font-bold mb-6">Posts</h3>

          {posts.length === 0 ? (
            <div className="bg-gray-900/80 rounded-3xl border border-purple-800/30 p-12 text-center backdrop-blur-md">
              <p className="text-gray-400 text-lg">
                {isOwnProfile ? "You haven't posted anything yet" : 'No posts yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate('/home')} // TODO: Navigate to post detail
                  className="bg-gray-900/80 rounded-2xl border border-purple-800/30 overflow-hidden cursor-pointer hover:border-purple-600 transition-all backdrop-blur-md"
                >
                  {/* Media */}
                  {post.media_url && (
                    <div className="aspect-square">
                      {post.media_type === 'video' ? (
                        <video
                          src={post.media_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={post.media_url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="p-4">
                    <p className="text-gray-300 text-sm line-clamp-3 mb-3">{post.content}</p>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <FaHeart />
                        <span>{formatCount(post.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaComment />
                        <span>{formatCount(post.comments_count)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaShare />
                        <span>{formatCount(post.shares)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}