import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface CTAProps {
  onComplete?: () => void;
}

export default function CTA({ onComplete }: CTAProps) {
  const [showToast, setShowToast] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      title: "Welcome to Onyx!",
      description: "Your gateway to the anime community",
      action: "Get Started"
    },
    {
      title: "Connect & Share",
      description: "Join discussions about your favorite anime series",
      action: "Continue"
    },
    {
      title: "Ready to Begin?",
      description: "Let's explore the world of anime together!",
      action: "Enter Onyx"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark CTA as completed and navigate to home
      if (onComplete) {
        onComplete();
      }
      navigate('/login');
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
    navigate('/login');
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 animate-gradient-x relative">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white/80 hover:text-white text-sm font-medium"
      >
        Skip
      </button>

      {/* Progress Indicator */}
      <div className="absolute top-6 left-6 flex space-x-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index <= currentStep ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center px-6 max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaRocket className="text-6xl text-white animate-bounce" />
        </div>
        
        <h1 className="text-5xl font-extrabold text-white drop-shadow mb-4">
          {currentStepData.title}
        </h1>
        
        <p className="text-lg text-white/90 mb-8 leading-relaxed">
          {currentStepData.description}
        </p>

        {user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8">
            <p className="text-white/90 text-sm">
              Welcome, <span className="font-semibold">{user.username}</span>!
            </p>
          </div>
        )}

        <button
          onClick={handleNext}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {currentStepData.action}
        </button>
      </div>

      {/* Animated Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <FaRocket className="text-xl animate-spin" />
          <span className="font-semibold">Ready for your anime journey!</span>
        </div>
      )}
    </div>
  );
}