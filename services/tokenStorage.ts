const ACCESS_TOKEN_KEY = 'tm_access_token';

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string | null | undefined): void {
    if (typeof window === 'undefined') return;
    try {
      if (!token) {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      } else {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      }
    } catch {
      // ignore quota / private mode
    }
  },

  clear(): void {
    this.set(null);
  },
};
