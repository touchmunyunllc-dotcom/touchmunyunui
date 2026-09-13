import apiClient from './apiClient';
import { tokenStorage } from './tokenStorage';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(
    email: string,
    password: string,
    name: string,
    captchaToken?: string | null
  ): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', {
      email,
      password,
      name,
      captchaToken,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /** Returns null when logged out — does not call /auth/me without a stored access token. */
  async getCurrentUser(): Promise<LoginResponse['user'] | null> {
    const token = tokenStorage.get();
    if (!token?.trim()) {
      return null;
    }

    try {
      const response = await apiClient.get<LoginResponse['user']>('/auth/me');
      return response.data;
    } catch {
      tokenStorage.clear();
      return null;
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password-reset/request', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password-reset/verify', {
      token,
      newPassword,
    });
  },

  async updateProfile(name?: string, email?: string) {
    const response = await apiClient.put<LoginResponse['user']>('/auth/profile', {
      name,
      email,
    });
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/password', {
      currentPassword,
      newPassword,
    });
  },
};

