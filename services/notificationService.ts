import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/apiError';

export const notificationService = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  /** Show the API's actual error message when available. */
  apiError: (error: unknown, fallback = 'Something went wrong. Please try again.') => {
    const err = error as Error & { userMessage?: string };
    toast.error(err.userMessage ?? getApiErrorMessage(error, fallback));
  },

  info: (message: string) => {
    toast(message, { icon: 'ℹ️' });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

