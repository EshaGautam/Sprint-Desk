import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import AppShell from '../components/AppShell';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('Application Theme Switcher', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().setTheme('dark'); // Reset to default dark theme
    queryClient = new QueryClient();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('loads the default dark theme correctly', () => {
    const store = useThemeStore.getState();
    expect(store.theme).toBe('dark');
  });

  it('switches theme from dark to light and light to dark in state', () => {
    const store = useThemeStore.getState();

    // Toggle to light
    act(() => {
      store.toggleTheme();
    });
    expect(useThemeStore.getState().theme).toBe('light');

    // Toggle back to dark
    act(() => {
      store.toggleTheme();
    });
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('persists selected theme across reinitialization simulation', async () => {
    // Select light theme
    act(() => {
      useThemeStore.getState().setTheme('light');
    });

    // Simulate page refresh by rehydrating the store
    await useThemeStore.persist.rehydrate();

    // Verify it is restored
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('renders theme toggle in the application shell and triggers theme switches', () => {
    renderWithProviders(<AppShell />);

    const toggleBtn = screen.getByTestId('theme-toggle');
    expect(toggleBtn).toBeInTheDocument();

    // Click toggle to switch to light mode
    fireEvent.click(toggleBtn);
    expect(useThemeStore.getState().theme).toBe('light');

    // Click toggle again to switch back to dark mode
    fireEvent.click(toggleBtn);
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('synchronizes the root HTML class with the active theme', async () => {
    useThemeStore.getState().setTheme('dark');
    useAuthStore.setState({
      accessToken: 'fake-access-token',
      isAuthenticated: true,
      isInitialLoading: false,
      username: 'emilys',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    const toggleBtn = await screen.findByTestId('theme-toggle');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);

    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);

    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);
  });
});

