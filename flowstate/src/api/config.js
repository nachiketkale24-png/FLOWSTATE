/**
 * API Configuration with Firebase Auth
 */

import { auth } from '../lib/firebaseClient';

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  debug: import.meta.env.VITE_API_DEBUG === 'true',
};

/**
 * Get Firebase ID token for authenticated requests
 */
export async function getAuthToken() {
  try {
    if (auth?.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Get current user ID
 */
export function getCurrentUserId() {
  return auth?.currentUser?.uid || 'demo-user';
}

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  // Session endpoints
  SESSION_START: '/api/sessions/start',
  SESSION_UPDATE: (id) => `/api/sessions/${id}/update`,
  SESSION_END: (id) => `/api/sessions/${id}/end`,
  SESSION_GET: (id) => `/api/sessions/${id}`,
  
  // Analytics endpoints
  ANALYTICS_WEEKLY: '/api/analytics/weekly',
  ANALYTICS_STAMINA: '/api/analytics/stamina',
  ANALYTICS_FLOW: '/api/analysis/flow',
  
  // AI endpoints
  AI_INSIGHTS: '/api/analysis/insights',
  AI_FLOW_ANALYSIS: '/api/analysis/flow',
  AI_CHAT: '/api/ai/message',
  
  // User endpoints
  USER_SESSIONS: (userId) => `/api/users/${userId}/sessions`,
  USER_STATS: (userId) => `/api/users/${userId}/stats`,
};

/**
 * Make API request with auth token and error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (API_CONFIG.debug) {
      console.log(`[API Request] ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body) : '');
    }

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (API_CONFIG.debug) {
      console.log(`[API Response] ${url}`, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - backend may be unavailable');
    }

    if (API_CONFIG.debug) {
      console.error(`[API Error] ${url}`, error);
    }

    throw error;
  }
}

/**
 * Show toast notification (simple console for now, can be replaced with actual toast library)
 */
export function showToast(message, type = 'info') {
  const styles = {
    error: 'color: #ff6b6b; font-weight: bold;',
    success: 'color: #51cf66; font-weight: bold;',
    info: 'color: #339af0; font-weight: bold;',
  };

  console.log(`%c[${type.toUpperCase()}] ${message}`, styles[type] || styles.info);
  
  // TODO: Replace with actual toast UI component
  // For now, you can add a toast library like react-hot-toast or sonner
}
