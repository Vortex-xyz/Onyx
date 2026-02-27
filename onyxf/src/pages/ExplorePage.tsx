// src/pages/ExplorePage.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaTimes, 
  FaFire, 
  FaUser, 
  FaImage,
  FaClock,
  FaHashtag,
  FaHeart,
  FaComment,
  FaStar
} from 'react-icons/fa';
import { 
  searchAll, 
  getTrendingPosts, 
  getSuggestedUsers,
  getRecentSearches,
  clearRecentSearches,
  getTrendingTags,
  SearchResult 
} from '../services/searchService';
import { Post } from '../services/postService';
import toast from 'react-hot-toast';

interface ExplorePageProps {
  darkMode?: boolean;
  onUserClick?: (userId: string) => void;
  onPostClick?: (postId: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ 
  darkMode = true,
  onUserClick,
  onPostClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [trending, suggested, tags, recent] = await Promise.all([
        getTrendingPosts(12),
        getSuggestedUsers(8),
        Promise.resolve(getTrendingTags()),
        Promise.resolve(getRecentSearches())
      ]);

      setTrendingPosts(trending);
      setSuggestedUsers(suggested);
      setTrendingTags(tags);
      setRecentSearches(recent);
    } catch (error) {
      console.error('❌ Failed to load explore data:', error);
      toast.error('Failed to load explore page');
    }
  };

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const results = await searchAll(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('❌ Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
    toast.success('Recent searches cleared');
  };

  const filteredResults = searchResults.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'users') return result.type === 'user';
    if (activeTab === 'posts') return result.type === 'post';
    return true;
  });

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-6 pb-20 lg:pb-6">
      {/* Search Bar */}
      <div className="mb-8">
        <div className={`relative rounded-2xl overflow-hidden border transition-all ${
          darkMode 
            ? 'bg-gray-900 border-gray-800 focus-within:border-purple-600/50' 
            : 'bg-white border-gray-200 focus-within:border-purple-400'
        }`}>
          <div className="flex items-center px-5 py-4">
            <FaSearch className={`text-lg mr-3 ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, posts, tags..."
              className={`flex-1 bg-transparent outline-none text-sm ${
                darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className={`p-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-800'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Search Loading */}
          {isSearching && (
            <div className={`px-5 pb-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2 pt-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Searching...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className={`mt-4 rounded-2xl border overflow-hidden ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            {/* Tabs */}
            <div className={`flex items-center space-x-1 p-2 border-b ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              {[
                { id: 'all', label: 'All', count: searchResults.length },
                { id: 'users', label: 'Users', count: searchResults.filter(r => r.type === 'user').length },
                { id: 'posts', label: 'Posts', count: searchResults.filter(r => r.type === 'post').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    if (result.type === 'user') {
                      onUserClick?.(result.id);
                    } else if (result.type === 'post') {
                      onPostClick?.(result.id);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-5 py-3 transition-all ${
                    darkMode 
                      ? 'hover:bg-gray-800 border-b border-gray-800' 
                      : 'hover:bg-gray-50 border-b border-gray-200'
                  }`}
                >
                  {result.avatar ? (
                    <img
                      src={result.avatar}
                      alt={result.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : result.preview ? (
                    <img
                      src={result.preview}
                      alt={result.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-200'
                    }`}>
                      {result.type === 'user' ? <FaUser /> : <FaImage />}
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {result.title}
                    </h3>
                    {result.subtitle && (
                      <p className={`text-xs truncate ${
                        darkMode ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    result.type === 'user'
                      ? 'bg-purple-600/10 text-purple-600'
                      : 'bg-blue-600/10 text-blue-600'
                  }`}>
                    {result.type === 'user' ? 'User' : 'Post'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {showSearchResults && searchResults.length === 0 && !isSearching && (
          <div className={`mt-4 rounded-2xl border p-8 text-center ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <FaSearch className={`text-4xl mx-auto mb-3 ${
              darkMode ? 'text-gray-700' : 'text-gray-300'
            }`} />
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              No results found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {!showSearchResults && recentSearches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold flex items-center space-x-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <FaClock className="text-purple-600" />
              <span>Recent Searches</span>
            </h2>
            <button
              onClick={handleClearRecent}
              className={`text-xs font-medium ${
                darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(search)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  darkMode
                    ? 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-purple-600/50'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-purple-400'
                }`}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Tags */}
      {!showSearchResults && (
        <div className="mb-8">
          <h2 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaHashtag className="text-purple-600" />
            <span>Trending Tags</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-600/10 to-violet-600/10 text-purple-400 hover:from-purple-600/20 hover:to-violet-600/20 border border-purple-600/20'
                    : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 hover:from-purple-200 hover:to-violet-200 border border-purple-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Users */}
      {!showSearchResults && suggestedUsers.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaUser className="text-purple-600" />
            <span>Suggested Users</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserClick?.(user.id)}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  darkMode
                    ? 'bg-gray-900 border-gray-800 hover:border-purple-600/50'
                    : 'bg-white border-gray-200 hover:border-purple-400'
                }`}
              >
                <div className="relative inline-block mb-3">
                  <img
                    src={user.avatar_url || 'https://i.pravatar.cc/150'}
                    alt={user.username}
                    className="w-16 h-16 rounded-full"
                  />
                  {user.ispremium && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-gray-900">
                      <FaStar className="text-yellow-900 text-[8px]" />
                    </div>
                  )}
                </div>
                <h3 className={`font-semibold text-sm mb-1 truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.username}
                </h3>
                <p className={`text-xs truncate ${
                  darkMode ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  Level {user.level}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts */}
      {!showSearchResults && trendingPosts.length > 0 && (
        <div>
          <h2 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaFire className="text-purple-600" />
            <span>Trending Posts</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {trendingPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className={`rounded-2xl border overflow-hidden transition-all text-left ${
                  darkMode
                    ? 'bg-gray-900 border-gray-800 hover:border-purple-600/50'
                    : 'bg-white border-gray-200 hover:border-purple-400'
                }`}
              >
                {post.media_url && (
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    <img
                      src={post.media_url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center space-x-2">
                        <FaHeart className="text-[10px]" />
                        <span>{formatCount(post.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaComment className="text-[10px]" />
                        <span>{formatCount(post.comments_count)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <p className={`text-xs line-clamp-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {post.content}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <img
                      src={post.author?.avatar_url || 'https://i.pravatar.cc/40'}
                      alt={post.author?.username}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className={`text-[10px] truncate ${
                      darkMode ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {post.author?.username}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};