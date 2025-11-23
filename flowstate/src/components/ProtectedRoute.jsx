/**
 * Protected Route Component
 * 
 * Redirects to /auth if user is not authenticated
 * Shows loading spinner while checking auth state
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthHook';

export default function ProtectedRoute({ children }) {
  const { authUser, loading } = useAuth();

  // Demo mode: Allow access without authentication if Firebase not configured
  const isDemoMode = import.meta.env.VITE_FIREBASE_API_KEY === undefined || 
                      import.meta.env.VITE_FIREBASE_API_KEY === 'your_api_key_here';

  // Show loading spinner while checking authentication (skip in demo mode)
  if (loading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            
            {/* Inner glow */}
            <div className="absolute inset-4 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading FlowState
          </h3>
          <p className="text-purple-300 text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // In demo mode, allow access without authentication
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Redirect to auth page if not authenticated
  if (!authUser) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
