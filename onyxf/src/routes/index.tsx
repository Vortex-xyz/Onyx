// onyxf/src/routes/index.tsx - CORRECT VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import CreatePostPage from '../pages/CreatePostPage';
import ProfileSetup from '../pages/ProfileSetup';
import ProfilePage from '../pages/ProfilePage'; // YOUR edit profile page
import PublicUserProfilePage from '../pages/UserProfilePage'; // VIEW OTHER users
import SettingsPage from '../pages/SettingsPage';
import AuthCallback from '../pages/AuthCallback';

console.log('🚀 Routes loaded - OAuth version');
console.log('✅ AuthCallback imported:', typeof AuthCallback);

// ✅ Profile Setup Route Guard
const ProfileSetupRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading, needsProfileSetup } = useAuth();

  console.log('🛡️ ProfileSetupRoute Guard:', {
    hasUser: !!user,
    isLoading,
    needsProfileSetup,
    username: user?.username
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProfileSetupRoute: No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (!needsProfileSetup) {
    console.log('✅ ProfileSetupRoute: Profile complete, redirecting to /home');
    return <Navigate to="/home" replace />;
  }

  console.log('✅ ProfileSetupRoute: Showing profile setup page');
  return children;
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading, needsProfileSetup } = useAuth();

  console.log('🛡️ ProtectedRoute Guard:', {
    hasUser: !!user,
    isLoading,
    needsProfileSetup
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (needsProfileSetup) {
    console.log('🔄 ProtectedRoute: Profile incomplete, redirecting to /profile-setup');
    return <Navigate to="/profile-setup" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* ✅ CRITICAL: AUTH CALLBACK MUST BE FIRST! */}
        <Route 
          path="/auth/callback" 
          element={
            <>
              {console.log('🎯 /auth/callback route MATCHED!')}
              <AuthCallback />
            </>
          } 
        />

        {/* Public routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/home" replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <LoginPage />}
        />

        {/* Profile Setup Route */}
        <Route
          path="/profile-setup"
          element={
            <ProfileSetupRoute>
              <ProfileSetup />
            </ProfileSetupRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />

        {/* 👤 PROFILE ROUTES - ORDER MATTERS! */}
        {/* Edit YOUR OWN profile - must be BEFORE /:username */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* View OTHER users' profiles */}
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <PublicUserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;