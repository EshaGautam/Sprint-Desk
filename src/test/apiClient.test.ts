import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { authenticatedFetch, setSimulateExpiredToken } from '../services/apiClient';

describe('authenticatedFetch API Client Interceptor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      isInitialLoading: false,
      username: null,
    });
  });

  it('performs a successful authenticated request attaching the Bearer token without triggering refresh', async () => {
    useAuthStore.setState({ accessToken: 'valid-token', isAuthenticated: true });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await authenticatedFetch('https://example.com/api/data');
    const result = await response.json();

    expect(result).toEqual({ data: 'success' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/data', expect.objectContaining({
      headers: expect.any(Headers),
    }));

    const lastCallHeaders = fetchMock.mock.calls[0][1].headers as Headers;
    expect(lastCallHeaders.get('Authorization')).toBe('Bearer valid-token');
  });

  it('detects 401 error, triggers silent refresh using persisted refresh token, and retries the original request with the new access token', async () => {
    useAuthStore.setState({ accessToken: 'expired-token', isAuthenticated: true });
    localStorage.setItem('refresh_token', 'valid-refresh-token');

    setSimulateExpiredToken(true);

    const mockRefreshResponse = {
      accessToken: 'fresh-access-token',
      refreshToken: 'new-refresh-token',
    };

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockRefreshResponse,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ secretData: 'hello' }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const response = await authenticatedFetch('https://example.com/api/protected');
    const result = await response.json();

    expect(result).toEqual({ secretData: 'hello' });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    // Verify refresh request parameters
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://dummyjson.com/auth/refresh', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
    }));

    // Verify retried request had new token attached
    const retryCallHeaders = fetchMock.mock.calls[2][1].headers as Headers;
    expect(retryCallHeaders.get('Authorization')).toBe('Bearer fresh-access-token');

    // Verify store updated with new credentials
    expect(useAuthStore.getState().accessToken).toBe('fresh-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
  });

  it('clears session credentials and rejects original request if silent refresh fails', async () => {
    useAuthStore.setState({ accessToken: 'expired-token', isAuthenticated: true });
    localStorage.setItem('refresh_token', 'invalid-refresh-token');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      })
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

    vi.stubGlobal('fetch', fetchMock);

    await expect(authenticatedFetch('https://example.com/api/protected')).rejects.toThrow('Session expired');

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});
