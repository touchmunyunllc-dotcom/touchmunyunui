import axios from 'axios';

const publicApiBaseUrl = (() => {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://touchmunyunapi.onrender.com/api';
  const trimmedApiUrl = rawApiUrl.replace(/\/+$/, '');
  return trimmedApiUrl.endsWith('/api') ? trimmedApiUrl : `${trimmedApiUrl}/api`;
})();

/**
 * No Authorization header and no global 401 → /login redirect.
 * Use for guest checkout, public guest order lookup, and checkout-status polling.
 */
const publicApiClient = axios.create({
  baseURL: publicApiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicApiClient;
