import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  username: string | null;
  setTokens: (accessToken: string, refreshToken: string, username?: string) => void;
  logout: () => void;
  initializeSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isInitialLoading: true,
  username: null,
  setTokens: (accessToken, refreshToken, username) => {
    localStorage.setItem('refresh_token', refreshToken);
    set({
      accessToken,
      isAuthenticated: true,
      username: username || useAuthStore.getState().username,
    });
  },
  logout: () => {
    localStorage.removeItem('refresh_token');
    set({
      accessToken: null,
      isAuthenticated: false,
      username: null,
    });
  },
  initializeSession: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      set({ isInitialLoading: false });
      return;
    }

    try {
      const response = await fetch('https://dummyjson.com/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        set({
          accessToken: data.accessToken,
          isAuthenticated: true,
        });
        localStorage.setItem('refresh_token', data.refreshToken);
      } else {
        localStorage.removeItem('refresh_token');
      }
    } catch {
      localStorage.removeItem('refresh_token');
    } finally {
      set({ isInitialLoading: false });
    }
  },
}));
