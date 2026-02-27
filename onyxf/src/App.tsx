// src/App.tsx - COMPLETE VERSION WITH MAXIMUM DEBUG
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfileSetup from './pages/ProfileSetup';
import HomePage from './pages/HomePage';
import AuthCallback from './pages/AuthCallback';
import Chats from './pages/Chats';
import Profile from './pages/ProfilePage';
import Settings from './pages/Settings';
console.log('🔥🔥🔥 APP.TSX LOADED - OAUTH VERSION 🔥🔥🔥');
// ✅ VERIFY IMPORTS
console.log('🚀 App.tsx loaded');
console.log('✅ AuthCallback imported:', typeof AuthCallback);

const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoading, needsProfileSetup } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute:', {
    path: location.pathname,
    hasUser: !!user,
    loading: loading || isLoading,
    needsProfileSetup
  });

  if (loading || isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!user) {
    console.log('❌ No user, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsProfileSetup && location.pathname !== '/profile-setup') {
    console.log('🔄 Redirecting to /profile-setup');
    return <Navigate to="/profile-setup" replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
}

function ProfileSetupRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoading, needsProfileSetup } = useAuth();

  if (loading || isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!needsProfileSetup) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function AppRouter() {
  const location = useLocation();

  // 🔍 LOG EVERY ROUTE CHANGE
  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('🌐 ROUTE CHANGED');
    console.log('📍 Pathname:', location.pathname);
    console.log('🔗 Full URL:', window.location.href);
    console.log('🔑 Hash:', window.location.hash);
    console.log('🔍 Search:', window.location.search);
    console.log('═══════════════════════════════════════');
  }, [location]);

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { 
            background: '#363636', 
            color: '#fff',
            fontWeight: '500'
          },
          success: { 
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            duration: 3000
          },
          error: { 
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            duration: 5000
          },
        }}
      />
      
      <Routes>
        {/* ✅ AUTH CALLBACK - MUST BE FIRST! */}
        <Route 
          path="/auth/callback" 
          element={
            <>
              {console.log('🎯 /auth/callback route MATCHED!')}
              <AuthCallback />
            </>
          } 
        />
        
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/landing" element={<LandingPage />} />
        
        {/* PROFILE SETUP */}
        <Route
          path="/profile-setup"
          element={
            <ProfileSetupRoute>
              <ProfileSetup />
            </ProfileSetupRoute>
          }
        />
        
        {/* PROTECTED ROUTES */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/:id" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* ROOT AND CATCH-ALL */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  // 🔍 DETECT OAUTH ON MOUNT
  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 APP MOUNTED');
    console.log('📍 Current pathname:', window.location.pathname);
    console.log('🔗 Full URL:', window.location.href);
    
    if (window.location.pathname.includes('callback')) {
      console.log('🔥🔥🔥 OAUTH CALLBACK DETECTED IN URL! 🔥🔥🔥');
    }
    console.log('═══════════════════════════════════════');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;