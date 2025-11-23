/**
 * API Client for Backend Communication
 */

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Generic GET request
 */
export const get = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

/**
 * Generic POST request
 */
export const post = async (endpoint, data) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Generic PUT request
 */
export const put = async (endpoint, data) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Generic DELETE request
 */
export const del = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
};

export const sessionApi = {
  start: async (initialData = {}) => {
    const response = await fetch(`${API_URL}/api/sessions/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ initialData }),
    });
    return response.json();
  },

  update: async (sessionId, metrics) => {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ metrics }),
    });
    return response.json();
  },

  end: async (sessionId, finalMetrics = {}, notes = '', taskCompleted = '') => {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ finalMetrics, notes, taskCompleted }),
    });
    return response.json();
  },

  getById: async (sessionId) => {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  },
};

export const userApi = {
  getSessions: async (limit = 50, skip = 0, status = null) => {
    const params = new URLSearchParams({ limit, skip });
    if (status) params.append('status', status);

    const response = await fetch(`${API_URL}/api/users/sessions?${params}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/api/users/stats`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  },
};

export const aiApi = {
  sendMessage: async (message, context = {}) => {
    const response = await fetch(`${API_URL}/api/ai/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ message, context }),
    });
    return response.json();
  },
};

export default {
  session: sessionApi,
  user: userApi,
  ai: aiApi,
};
