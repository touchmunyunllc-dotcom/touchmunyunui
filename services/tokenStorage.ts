const ACCESS_TOKEN_KEY = 'tm_access_token';

function readStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Migrate one-time from sessionStorage (older builds). */
function migrateFromSessionStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const legacy = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (legacy && !localStorage.getItem(ACCESS_TOKEN_KEY)) {
      localStorage.setItem(ACCESS_TOKEN_KEY, legacy);
    }
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export const tokenStorage = {
  get(): string | null {
    migrateFromSessionStorage();
    const storage = readStorage();
    if (!storage) return null;
    try {
      return storage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string | null | undefined): void {
    migrateFromSessionStorage();
    const storage = readStorage();
    if (!storage) return;
    try {
      if (!token) {
        storage.removeItem(ACCESS_TOKEN_KEY);
      } else {
        storage.setItem(ACCESS_TOKEN_KEY, token);
      }
    } catch {
      // ignore quota / private mode
    }
  },

  clear(): void {
    this.set(null);
  },
};
