import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl';

const apiClient = axios.create({
  // Absolute Render URL in browser + SSR (no Next rewrite /api proxy).
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Log request for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log response for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    const url = String(error.config?.url ?? '');
    const isExpectedAuth401 =
      error.response?.status === 401 &&
      (url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register'));

    if (!isExpectedAuth401) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    if (error.response?.status === 401) {
      // Guest/public flows must not be redirected to login.
      if (
        url.includes('/guest/') ||
        url.includes('/auth/me') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }

      const originalRequest = (error.config || {}) as typeof error.config & { _retry?: boolean };
      if (!originalRequest._retry && !url.includes('/auth/refresh')) {
        originalRequest._retry = true;
        return apiClient
          .post('/auth/refresh')
          .then(() => apiClient(originalRequest))
          .catch(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          });
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

