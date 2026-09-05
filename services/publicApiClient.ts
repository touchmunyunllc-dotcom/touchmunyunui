import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl';
import { getApiErrorMessage } from '@/lib/apiError';

/**
 * No Authorization header and no global 401 → /login redirect.
 * Use for guest checkout, public guest order lookup, and checkout-status polling.
 */
const publicApiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const userMessage = getApiErrorMessage(error);
    (error as Error & { userMessage?: string }).userMessage = userMessage;
    return Promise.reject(error);
  }
);

export default publicApiClient;
