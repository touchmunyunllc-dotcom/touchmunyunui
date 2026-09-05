import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl';
import { tokenStorage } from './tokenStorage';
import { getApiErrorMessage } from '@/lib/apiError';

const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === 'true';

const apiClient = axios.create({
  // Browser: same-origin /api (Next rewrite). SSR: absolute Render URL.
  baseURL: typeof window !== 'undefined' ? '/api' : getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (DEBUG_API) {
      console.debug('API Request:', config.method?.toUpperCase(), config.url);
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
  (response) => response,
  (error) => {
    const userMessage = getApiErrorMessage(error);
    (error as Error & { userMessage?: string }).userMessage = userMessage;

    const url = String(error.config?.url ?? '');
    const isExpectedAuth401 =
      error.response?.status === 401 &&
      (url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register'));

    if (!isExpectedAuth401 && DEBUG_API) {
      console.debug('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: userMessage,
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
            tokenStorage.clear();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          });
      }

      tokenStorage.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

