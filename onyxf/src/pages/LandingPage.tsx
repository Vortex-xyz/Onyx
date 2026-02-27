import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaHeart, FaUsers, FaComments, FaPlay, FaStar, FaArrowRight } from 'react-icons/fa';
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
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FaComments,
      title: "Connect & Chat",
      description: "Join real-time discussions about your favorite anime series with fans worldwide"
    },
    {
      icon: FaUsers,
      title: "Build Community",
      description: "Create groups, share recommendations, and make lasting friendships in the anime world"
    },
    {
      icon: FaHeart,
      title: "Share & Discover",
      description: "Share your anime artwork, reviews, and discover hidden gems from fellow otakus"
    }
  ];

  const testimonials = [
    {
      name: "SakuraFan69_2067",
      content: "Finally found my anime family! The discussions here are amazing.",
      rating: 5
    },
    {
      name: "NarutoLover_91I",
      content: "Best place to get anime recommendations. Discovered so many great series!",
      rating: 5
    },
    {
      name: "OtakuArtist_2016",
      content: "Love sharing my fanart here. The community is so supportive!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-400 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="animate-pulse absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="animate-pulse absolute top-32 right-20 w-16 h-16 bg-white rounded-full delay-300"></div>
        <div className="animate-pulse absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full delay-700"></div>
        <div className="animate-pulse absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <h1 className="text-2xl font-bold text-white stroke-black">Onyx</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="text-white/90 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <div className={`transition-all duration-1000 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <FaRocket className="text-8xl text-white animate-bounce" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6">
            Welcome to Onyx
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
            The ultimate destination for anime fans to connect, share, and discover amazing content together
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 min-w-[200px]"
            >
              <FaRocket />
              <span>Start Your Journey</span>
            </button>
            
            <button className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors">
              <FaPlay className="text-lg" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm">Anime Fans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1K+</div>
              <div className="text-sm">Series Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Anime Fans Love Onyx
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              const isActive = index === currentFeature;
              
              return (
                <div
                  key={index}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center transition-all duration-500 hover:bg-white/20 ${
                    isActive ? 'scale-105 bg-white/20' : ''
                  }`}
                >
                  <div className="flex justify-center mb-6">
                    <FeatureIcon className={`text-5xl text-white transition-all duration-500 ${isActive ? 'animate-bounce' : ''}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative z-10 py-20 px-6 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            What Our Community Says
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 mb-4 italic">"{testimonial.content}"</p>
                <p className="text-white/70 font-medium">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Connect with thousands of anime fans and start your journey today
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
          >
            <span>Join Onyx Now</span>
            <FaArrowRight />
          </button>
          
          <p className="text-white/60 text-sm mt-4">
            Free to join • No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-6 border-t border-white/20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center text-white/70 text-sm">
          <div className="mb-4 md:mb-0">
            © 2025 Onyx. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}