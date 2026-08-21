import { useAuthStore } from '../stores/authStore';

let simulateExpiredToken = false;
let refreshPromise: Promise<string> | null = null;

/**
 * Toggles token expiration simulation for testing purposes.
 */
export function setSimulateExpiredToken(value: boolean) {
  simulateExpiredToken = value;
}

/**
 * An authenticated fetch wrapper that automatically attaches the in-memory access token,
 * handles silent token refresh on 401 Unauthorized status, and retries the original request.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, setTokens, logout } = useAuthStore.getState();

  let tokenToAttach = accessToken;

  // Override token to simulate expiration in tests
  if (simulateExpiredToken) {
    tokenToAttach = 'expired-token';
  }

  const headers = new Headers(options.headers || {});
  if (tokenToAttach) {
    headers.set('Authorization', `Bearer ${tokenToAttach}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      logout();
      throw new Error('Session expired');
    }

    try {
      if (simulateExpiredToken) {
        setSimulateExpiredToken(false);
      }

      // Shared promise prevents duplicate concurrent refresh operations
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshResponse = await fetch('https://dummyjson.com/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Refresh failed');
          }

          const refreshData = await refreshResponse.json();
          setTokens(refreshData.accessToken, refreshData.refreshToken);
          return refreshData.accessToken;
        })();
      }

      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      // Retry original failed request
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(url, { ...options, headers: retryHeaders });
    } catch {
      refreshPromise = null;
      logout();
      throw new Error('Session expired');
    }
  }

  return response;
}
