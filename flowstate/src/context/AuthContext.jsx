/**
 * Authentication Context - JWT Version
 */

import React, { createContext, useState, useEffect } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { demoUser } from '../demoData';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from API on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (APP_CONFIG.DEMO_MODE) {
        // Demo mode: set demo user directly
        setAuthUser(demoUser);
      } else {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthUser(data.data.user);
        } else {
          localStorage.removeItem('token');
          setAuthUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      if (!APP_CONFIG.DEMO_MODE) {
        localStorage.removeItem('token');
      }
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const userData = {
        uid: data.data.user.id,
        email: data.data.user.email,
        displayName: data.data.user.displayName,
        photoURL: data.data.user.photoURL,
      };
      localStorage.setItem('token', data.data.token);
      setAuthUser(userData);

      return { user: userData };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const userData = {
        uid: data.data.user.id,
        email: data.data.user.email,
        displayName: data.data.user.displayName,
        photoURL: data.data.user.photoURL,
      };
      localStorage.setItem('token', data.data.token);
      setAuthUser(userData);

      return { user: userData };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      // Open Google OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${API_URL}/api/auth/google`,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for message from popup
      return new Promise((resolve, reject) => {
        const handleMessage = async (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            popup?.close();

            localStorage.setItem('token', event.data.token);
            await loadUser();
            resolve({ user: authUser });
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup?.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', handleMessage);

        // Timeout after 2 minutes
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          reject(new Error('Google sign in timed out'));
        }, 120000);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);

      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      localStorage.removeItem('token');
      setAuthUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
      throw err;
    }
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    authUser,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
