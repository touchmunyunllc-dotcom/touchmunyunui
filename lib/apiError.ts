import { AxiosError } from 'axios';

type ApiErrorBody = {
  message?: string;
  title?: string;
  detail?: string;
  error?: string;
  errors?: string[] | Record<string, string[]>;
};

/** Extract a user-facing message from API / network errors. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!error) return fallback;

  if (typeof error === 'string' && error.trim()) return error.trim();

  const axiosError = error as AxiosError<ApiErrorBody | string>;
  const data = axiosError.response?.data;

  if (typeof data === 'string' && data.trim()) return data.trim();

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (typeof data.title === 'string' && data.title.trim() && !data.detail) {
      return data.title.trim();
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.filter(Boolean).join('. ');
    }

    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat().filter(Boolean);
      if (messages.length > 0) return messages.join('. ');
    }
  }

  if (axiosError.message === 'Network Error') {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  const status = axiosError.response?.status;
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status && status >= 500) return 'Server error. Please try again later.';

  return fallback;
}
