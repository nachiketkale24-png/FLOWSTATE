import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';

export default function Navigation() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { authUser, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/assistant', label: 'Assistant', icon: '🤖' },
    { path: '/history', label: 'History', icon: '📅' },
    { path: '/achievements', label: 'Achievements', icon: '🏆' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/reports', label: 'Reports', icon: '📑' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!authUser) return '?';
    if (authUser.displayName) {
      return authUser.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return authUser.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen z-50">
        <div
          className={`glass-card border-r border-purple-500/30 backdrop-blur-xl transition-all duration-300 ${
            isExpanded ? 'w-64' : 'w-20'
          }`}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Logo */}
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              {isExpanded && (
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 whitespace-nowrap">
                  FlowState AI
                </h1>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-purple-500/20 border border-purple-400/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'text-purple-200/70 hover:bg-purple-500/10 hover:text-white border border-transparent'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {isExpanded && (
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Status Indicator */}
          {isExpanded && authUser && (
            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              {/* User Profile */}
              <div className="glass-card p-3 rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {authUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-purple-300 truncate">
                      {authUser.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
          
          {/* Collapsed User Avatar */}
          {!isExpanded && authUser && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-purple-400/50">
                {getUserInitials()}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-card border-t border-purple-500/30 backdrop-blur-xl">
          <div className="flex justify-around items-center p-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-purple-200/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
