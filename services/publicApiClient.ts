import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl';

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

export default publicApiClient;
