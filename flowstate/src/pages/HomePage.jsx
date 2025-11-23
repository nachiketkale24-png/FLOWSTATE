import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthHook';

export default function HomePage() {
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && authUser) {
      navigate('/dashboard');
    }
  }, [authUser, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading FlowState</h3>
          <p className="text-purple-300 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-7xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 animate-pulse">
              FlowState AI
            </h1>
            <p className="text-2xl text-purple-200/80 font-light tracking-wide">
              Your AI-Powered Focus Companion
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card p-6 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Flow Tracking</h3>
              <p className="text-purple-200/70 text-sm">Real-time monitoring of your deep work sessions</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-pink-500/30 hover:border-pink-400/50 transition-all">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Insights</h3>
              <p className="text-purple-200/70 text-sm">Smart recommendations powered by AI</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
              <p className="text-purple-200/70 text-sm">Track your productivity patterns over time</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/auth"
              className="inline-block px-12 py-4 bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)]"
            >
              Get Started →
            </Link>
            
            {/* Demo Mode Button */}
            <Link
              to="/dashboard"
              className="inline-block px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold text-base rounded-full hover:bg-white/20 transition-all"
            >
              Try Demo Mode 🚀
            </Link>
          </div>

          {/* Tagline */}
          <p className="text-purple-300/50 text-sm mt-8">
            Eliminate distractions. Achieve flow. Unlock your potential.
          </p>
        </div>
      </div>
    </div>
  );
}
