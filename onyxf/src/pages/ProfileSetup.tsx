import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaImage } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

export default function ProfileSetup() {
  const { user, completeProfileSetup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    website: '',
    favorite_anime: [] as string[],
  });

  const [animeInput, setAnimeInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Check if current username is temporary
  const isTempUsername = user?.username?.startsWith('temp_');

  useEffect(() => {
    console.log('📊 Profile Setup Page Viewed', {
      user_id: user?.id, // ✅ FIXED
      current_username: user?.username,
      is_temp: isTempUsername,
      timestamp: new Date().toISOString(),
    });

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      console.log(`⏱️ Time spent on profile setup: ${timeSpent} seconds`);
    };
  }, [user?.id, startTime, user?.username, isTempUsername]); // ✅ FIXED

  useEffect(() => {
    if (!user) {
      console.warn('⚠️ No user found in ProfileSetup, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAnime = () => {
    if (animeInput.trim() && formData.favorite_anime.length < 5) {
      setFormData({
        ...formData,
        favorite_anime: [...formData.favorite_anime, animeInput.trim()],
      });
      setAnimeInput('');
    }
  };

  const handleRemoveAnime = (index: number) => {
    setFormData({
      ...formData,
      favorite_anime: formData.favorite_anime.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`; // ✅ FIXED
    const filePath = `${type}s/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        setAvatarPreview(publicUrl);
      } else {
        setBannerPreview(publicUrl);
      }

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation: Username is REQUIRED
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    // Validation: Username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username.trim())) {
      toast.error('Username must be 3-20 characters (letters, numbers, underscores only)');
      return;
    }

    const bioToSave = formData.bio.trim() || 'New anime fan on Onyx!';

    setLoading(true);

    try {
      console.log('💾 Saving profile for user:', user.id); // ✅ FIXED
      console.log('📝 Replacing temporary username:', user.username, '→', formData.username.trim());

      const { data, error } = await supabase
        .from('users')
        .update({
          username: formData.username.trim(),
          full_name: formData.full_name.trim() || null,
          bio: bioToSave,
          location: formData.location.trim() || null,
          website: formData.website.trim() || null,
          favorite_anime: formData.favorite_anime.length > 0 ? formData.favorite_anime : null,
          avatar_url: avatarPreview || null,
          banner_url: bannerPreview || null,
          profile_completed: true,
        })
        .eq('id', user.id) // ✅ Already correct
        .select();

      console.log('📊 Update response:', { data, error });

      if (error) {
        console.error('❌ Database error:', error);
        
        // Handle username already taken
        if (error.code === '23505') {
          toast.error('Username already taken. Please choose another.');
          setLoading(false);
          return;
        }
        throw error;
      }

      console.log('✅ Profile saved successfully:', data);

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      console.log('📊 Profile Setup Completed', {
        user_id: user.id, // ✅ FIXED
        time_spent_seconds: timeSpent,
        fields_filled: {
          full_name: !!formData.full_name.trim(),
          bio: !!formData.bio.trim(),
          location: !!formData.location.trim(),
          website: !!formData.website.trim(),
          favorite_anime_count: formData.favorite_anime.length,
          has_avatar: !!avatarPreview,
          has_banner: !!bannerPreview,
        },
      });

      // ✅ Mark profile as complete in AuthContext
      await completeProfileSetup();
      
      toast.success('Profile created successfully! Welcome to Onyx! 🎌');
      
      // ✅ Add small delay to ensure state updates
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    try {
      console.log('⏭️ User skipping profile setup');

      await supabase
        .from('users')
        .update({ 
          bio: 'New to Onyx!',
          profile_completed: true,
        })
        .eq('id', user.id); // ✅ FIXED

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      console.log('📊 Profile Setup Skipped', {
        user_id: user.id, // ✅ FIXED
        time_spent_seconds: timeSpent,
      });

      await completeProfileSetup();
      
      toast.success('Welcome to Onyx! You can complete your profile later.');
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('❌ Error skipping profile setup:', error);
      await completeProfileSetup();
      navigate('/home', { replace: true });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell the anime community about yourself</p>
          {isTempUsername && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 inline-block">
              <p className="text-sm text-yellow-800">
                ⚠️ You haven't chosen a username yet. Let's pick one!
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Step 1 of 3 - Basic Info</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Banner
              <span className="text-gray-400 font-normal ml-2">(Optional)</span>
            </label>
            <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl overflow-hidden">
              {bannerPreview && (
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 cursor-pointer transition-colors">
                <div className="text-center text-white">
                  <FaImage className="text-3xl mx-auto mb-2" />
                  <span className="text-sm">Upload Banner</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'banner');
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                    {formData.username.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'avatar');
                  }}
                />
              </label>
            </div>
          </div>

          {/* Username - REQUIRED */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Choose your unique username"
            />
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters • Letters, numbers, and underscores only
            </p>
            {isTempUsername && (
              <p className="text-xs text-yellow-700 mt-1 font-medium">
                💡 Current: {user.username} (temporary) → Choose your permanent username above
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
              <span className="text-gray-400 font-normal ml-2">(Optional)</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your full name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
              <span className="text-gray-400 font-normal ml-2">(Recommended)</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself and your anime interests..."
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>A good bio helps others connect with you!</span>
              <span>{formData.bio.length}/200</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
              <span className="text-gray-400 font-normal ml-2">(Optional)</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Tokyo, Japan"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
              <span className="text-gray-400 font-normal ml-2">(Optional)</span>
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Anime (up to 5)
              <span className="text-gray-400 font-normal ml-2">(Optional)</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={animeInput}
                onChange={(e) => setAnimeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAnime())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Attack on Titan"
                disabled={formData.favorite_anime.length >= 5}
              />
              <button
                type="button"
                onClick={handleAddAnime}
                disabled={formData.favorite_anime.length >= 5 || !animeInput.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.favorite_anime.map((anime, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full"
                >
                  {anime}
                  <button
                    type="button"
                    onClick={() => handleRemoveAnime(index)}
                    className="hover:text-purple-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.favorite_anime.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Add your favorite anime to connect with fans who share your taste!
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading || !formData.username.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            <span className="text-red-500">*</span> Required fields
          </p>
        </form>

        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Profile Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• A complete profile gets 3x more followers</li>
            <li>• Adding favorite anime helps us recommend content you'll love</li>
            <li>• You can always update your profile later from settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}