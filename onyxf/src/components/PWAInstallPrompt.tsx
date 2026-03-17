// src/components/PWAInstallPrompt.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaMobileAlt } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds (not too aggressive)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // iOS Install Instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-6 lg:w-96">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-3 rounded-xl">
                  <FaMobileAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Install Onyx</h3>
                  <p className="text-gray-400 text-sm">Add to Home Screen</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <p className="font-semibold text-purple-400">How to install:</p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Tap the <span className="font-bold">Share</span> button below</li>
                <li>Scroll and tap <span className="font-bold">Add to Home Screen</span></li>
                <li>Tap <span className="font-bold">Add</span> to confirm</li>
              </ol>
              <p className="text-xs text-gray-500 mt-4">
                Get the full app experience with faster loading and offline support!
              </p>
            </div>
          </div>
          
          <div className="bg-purple-600/10 border-t border-purple-600/20 px-6 py-3">
            <div className="flex items-center space-x-2 text-purple-400 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              <span>Tap Share → Add to Home Screen</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Prompt
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-6 lg:w-96">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-3 rounded-xl">
                  <FaDownload className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Install Onyx App</h3>
                  <p className="text-gray-400 text-sm">Quick access from your home screen</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-3 text-sm text-gray-300">
                <div className="bg-purple-600/20 rounded-lg p-2 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Faster loading</p>
                  <p className="text-xs text-gray-500">Instant access to your feed</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 text-sm text-gray-300">
                <div className="bg-purple-600/20 rounded-lg p-2 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Works offline</p>
                  <p className="text-xs text-gray-500">View content without internet</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm text-gray-300">
                <div className="bg-purple-600/20 rounded-lg p-2 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Push notifications</p>
                  <p className="text-xs text-gray-500">Never miss a like or comment</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all"
              >
                Not now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};