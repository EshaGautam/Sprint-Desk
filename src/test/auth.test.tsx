import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { loginUser } from '../services/authService';
import { authenticatedFetch, setSimulateExpiredToken } from '../services/apiClient';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicOnlyRoute from '../components/PublicOnlyRoute';

describe('Authentication Flow', () => {
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

  it('successful login sets tokens and store state', async () => {
    const mockUser = {
      username: 'testuser',
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await loginUser('testuser', 'password');

    expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password' }),
    }));

    expect(result).toEqual(mockUser);
    expect(useAuthStore.getState().accessToken).toBe('access-123');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem('refresh_token')).toBe('refresh-123');
  });

  it('failed login throws error and keeps unauthenticated state', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(loginUser('wrong', 'pass')).rejects.toThrow('Invalid credentials');

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('authenticatedFetch attaches Authorization header', async () => {
    useAuthStore.setState({ accessToken: 'test-token', isAuthenticated: true });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal('fetch', fetchMock);

    await authenticatedFetch('https://example.com/api/data');

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/data', expect.objectContaining({
      headers: expect.any(Headers),
    }));

    const lastCallHeaders = fetchMock.mock.calls[0][1].headers as Headers;
    expect(lastCallHeaders.get('Authorization')).toBe('Bearer test-token');
  });

  it('expired token triggers refresh and retries failed request successfully', async () => {
    useAuthStore.setState({ accessToken: 'expired-token', isAuthenticated: true });
    localStorage.setItem('refresh_token', 'refresh-token-valid');

    setSimulateExpiredToken(true);

    const mockRefreshResponse = {
      accessToken: 'new-access-token',
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
        json: async () => ({ success: true }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const response = await authenticatedFetch('https://example.com/api/protected');
    const result = await response.json();

    expect(result).toEqual({ success: true });

    expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/auth/refresh', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'refresh-token-valid' }),
    }));

    expect(useAuthStore.getState().accessToken).toBe('new-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
  });

  it('failed refresh clears store and logs out user', async () => {
    useAuthStore.setState({ accessToken: 'expired-token', isAuthenticated: true });
    localStorage.setItem('refresh_token', 'refresh-token-invalid');

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

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('session restoration works from valid refresh token', async () => {
    localStorage.setItem('refresh_token', 'valid-persisted-refresh');

    const mockRefreshResponse = {
      accessToken: 'restored-access',
      refreshToken: 'new-refresh-token',
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRefreshResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    await useAuthStore.getState().initializeSession();

    expect(useAuthStore.getState().accessToken).toBe('restored-access');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isInitialLoading).toBe(false);
  });

  it('logout clears store and deletes refresh token from localStorage', () => {
    useAuthStore.setState({ accessToken: 'token-to-clear', isAuthenticated: true });
    localStorage.setItem('refresh_token', 'refresh-to-clear');

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});

describe('Route Guards', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      isInitialLoading: false,
      username: null,
    });
  });

  it('ProtectedRoute redirects unauthenticated users to /login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('ProtectedRoute renders protected content for authenticated users', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('PublicOnlyRoute redirects authenticated users to /dashboard', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('PublicOnlyRoute renders public content for unauthenticated users', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });
});
