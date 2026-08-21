import { useAuthStore } from '../stores/authStore';

/**
 * Sends a login request to the DummyJSON API.
 * Updates the in-memory Zustand store and local storage on success.
 */
export async function loginUser(username: string, password: string): Promise<any> {
  const response = await fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invalid username or password');
  }

  const data = await response.json();
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.username);
  return data;
}
