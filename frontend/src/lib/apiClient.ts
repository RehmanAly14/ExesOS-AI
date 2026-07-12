/**
 * API Client
 * ──────────────────────────────────────────────────
 * A pre-configured Axios instance that:
 *  - Uses the API base URL from the environment variable
 *  - Automatically attaches the JWT Bearer token from localStorage
 *  - Handles 401 responses by clearing auth state and redirecting
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies for HttpOnly cookie support
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────
// Automatically attach JWT from localStorage on every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('exesos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────
// Handle 401 Unauthorized globally (token expired / invalid)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data
      localStorage.removeItem('exesos_token');
      localStorage.removeItem('exesos_user');

      // Redirect to auth page if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
