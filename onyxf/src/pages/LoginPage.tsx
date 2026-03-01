// src/pages/LoginPage.tsx - FIXED: Separate Formik instances per mode, no union type
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ✅ FIX: Interfaces at module scope — NOT inside component.
// The old code had them inside the component AND used a single Formik with
// values: LoginValues | RegisterValues. TypeScript union types only allow
// properties common to BOTH sides, so confirmPassword (only on RegisterValues)
// caused TS2339 on errors.confirmPassword and touched.confirmPassword.
interface LoginValues {
  email: string;
  password: string;
}

interface RegisterValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const registerSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const loginInitialValues: LoginValues = { email: '', password: '' };
const registerInitialValues: RegisterValues = { email: '', password: '', confirmPassword: '' };

export default function LoginPage() {
  const { user, isLoading, needsProfileSetup, login, loginWithGoogle, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 LoginPage - Auth State Check:', { isLoading, hasUser: !!user, needsProfileSetup });
    if (isLoading) return;
    if (user) {
      if (needsProfileSetup) {
        console.log('🔄 New user detected, redirecting to profile setup');
        navigate('/profile-setup', { replace: true });
      } else {
        console.log('✅ Existing user, redirecting to home');
        navigate('/home', { replace: true });
      }
    }
  }, [user, isLoading, needsProfileSetup, navigate]);

  // ✅ FIX: Two separate typed handlers — each has its own concrete type, no union
  const handleLoginSubmit = async (
    values: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    try {
      console.log('🔑 Login attempt:', values.email);
      await login(values.email, values.password);
    } catch (err: any) {
      console.error('❌ Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (
    values: RegisterValues,
    { setSubmitting }: FormikHelpers<RegisterValues>
  ) => {
    try {
      console.log('📝 Registration attempt:', values.email);
      await register(values.email, values.password);
      console.log('🔄 Registration successful, redirecting to profile setup...');
      setTimeout(() => navigate('/profile-setup', { replace: true }), 300);
    } catch (err: any) {
      console.error('❌ Register error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('❌ Google login error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Onyx...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">
            {needsProfileSetup ? 'Setting up your profile...' : 'Welcome back! Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Onyx</h1>
          <h2 className="text-2xl font-extrabold text-white">
            {isLogin ? 'Welcome Back!' : 'Join the Community'}
          </h2>
          <p className="mt-2 text-gray-200">
            {isLogin ? 'Sign in to connect with anime fans' : 'Create your account - just email & password to start'}
          </p>
        </div>

        <p className="text-center text-sm text-gray-200">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="font-medium text-white hover:text-gray-100 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">

          {/* Google OAuth */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full inline-flex justify-center py-3 px-4 rounded-lg shadow-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 hover:scale-[1.02]"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://raw.githubusercontent.com/fireflysemantics/logo/master/Google.svg"
                alt="Google logo"
              />
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* ✅ FIX: Two separate <Formik> instances with concrete generic types.
              key="login" / key="register" forces React to fully unmount and remount
              on mode switch — fields reset cleanly, no stale values leak between modes. */}
          {isLogin ? (
            <Formik<LoginValues>
              key="login"
              initialValues={loginInitialValues}
              validationSchema={loginSchema}
              onSubmit={handleLoginSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.email && touched.email && (
                      <div className="mt-1 text-sm text-red-600">{errors.email}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 ${
                        errors.password && touched.password ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.password && touched.password && (
                      <div className="mt-1 text-sm text-red-600">{errors.password}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-150 hover:scale-[1.02] ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : 'Sign in to Onyx'}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik<RegisterValues>
              key="register"
              initialValues={registerInitialValues}
              validationSchema={registerSchema}
              onSubmit={handleRegisterSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Field
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.email && touched.email && (
                      <div className="mt-1 text-sm text-red-600">{errors.email}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Field
                      id="reg-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a password (min 6 characters)"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 ${
                        errors.password && touched.password ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.password && touched.password && (
                      <div className="mt-1 text-sm text-red-600">{errors.password}</div>
                    )}
                  </div>

                  {/* ✅ confirmPassword — full type safety, no cast needed */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="mt-1 text-sm text-red-600">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      ℹ️ After creating your account, you'll complete your profile with username, bio, and favorite anime
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-150 hover:scale-[1.02] ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </div>
                    ) : 'Create your account'}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <a href="/terms" className="text-purple-600 hover:text-purple-500">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}