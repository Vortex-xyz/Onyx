import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaHeart, FaUsers, FaComments, FaPlay, FaStar, FaArrowRight, FaImages, FaVideo } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [animateHero, setAnimateHero] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to home
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  useEffect(() => {
    setAnimateHero(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FaUsers,
      title: "Connect with Otaku",
      description: "Follow fellow anime fans, discover their watchlists, and build your anime network"
    },
    {
      icon: FaImages,
      title: "Share Your Collection",
      description: "Upload screenshots, fan art, and your favorite anime moments with the community"
    },
    {
      icon: FaVideo,
      title: "Video Posts",
      description: "Share AMVs, anime clips, and reactions with full video support"
    },
    {
      icon: FaHeart,
      title: "Engage & Interact",
      description: "Like, comment, and discuss your favorite series with passionate fans"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="animate-float absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute top-40 right-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="animate-float absolute bottom-32 left-32 w-36 h-36 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-20 right-16 w-48 h-48 bg-purple-600 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm bg-black/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">ONYX</h1>
            <p className="text-[8px] text-purple-200 tracking-widest uppercase -mt-1">Anime Network</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="text-white/90 hover:text-white font-medium transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/50"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
        <div className={`transition-all duration-1000 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <FaRocket className="text-5xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Onyx</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl leading-relaxed font-light">
            Your anime social network. Share moments, connect with fans, and discover new series.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/30 flex items-center space-x-3 min-w-[220px]"
            >
              <FaRocket className="text-xl" />
              <span>Join the Community</span>
            </button>
            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors font-medium"
            >
              <FaPlay className="text-sm" />
              <span>Explore Features</span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-purple-200 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <FaImages className="text-purple-400" />
              <span className="text-sm">Image Sharing</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaVideo className="text-purple-400" />
              <span className="text-sm">Video Posts</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="text-purple-400" />
              <span className="text-sm">Follow System</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaHeart className="text-purple-400" />
              <span className="text-sm">Likes & Comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-24 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-purple-200 text-lg">
              Built for anime fans, by anime fans
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              const isActive = index === currentFeature;
              
              return (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-md rounded-2xl p-6 transition-all duration-500 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 ${
                    isActive ? 'scale-105 bg-white/10 border-purple-500/50 shadow-2xl shadow-purple-500/20' : ''
                  }`}
                >
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg ${isActive ? 'animate-bounce' : ''}`}>
                      <FeatureIcon className="text-2xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">{feature.title}</h3>
                  <p className="text-purple-200 text-sm text-center leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Join?
            </h2>
            <p className="text-xl text-purple-100 mb-10">
              Start sharing your anime journey today. Completely free.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-5 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/30 flex items-center space-x-3 mx-auto text-lg"
            >
              <span>Create Your Account</span>
              <FaArrowRight className="text-xl" />
            </button>
            
            <p className="text-purple-300 text-sm mt-6">
              No credit card required • Join in 30 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-purple-300 text-sm">
          <div className="mb-4 md:mb-0 flex items-center space-x-2">
            <span className="font-bold text-white">ONYX</span>
            <span>•</span>
            <span>Anime Social Network</span>
            <span>•</span>
            <span>© 2026</span>
          </div>
          <div className="flex space-x-6">
            <button className="hover:text-white transition-colors">About</button>
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors">Terms</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}