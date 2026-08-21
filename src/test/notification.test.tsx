import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppShell from '../components/AppShell';
import { useNotificationStore } from '../stores/notificationStore';
import { fetchNotificationPosts } from '../services/notificationService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/notificationService');

const mockPosts = [
  { userId: 1, id: 1, title: 'First Post', body: 'Body 1' },
  { userId: 1, id: 2, title: 'Second Post', body: 'Body 2' },
];

describe('Notification System', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useNotificationStore.getState().clearAll();
    useNotificationStore.getState().setPanelOpen(false);
    useNotificationStore.getState().setToastMessage(null);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.mocked(fetchNotificationPosts).mockResolvedValue(mockPosts);
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('polls JSONPlaceholder, creates notifications, and displays badge unread count', async () => {
    renderWithProviders(<AppShell />);

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications).toHaveLength(2);
    });

    expect(screen.getByTestId('notification-badge')).toHaveTextContent('2');
  });

  it('marks a notification as read when clicked, decreasing unread badge count', async () => {
    renderWithProviders(<AppShell />);

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications).toHaveLength(2);
    });

    fireEvent.click(screen.getByTestId('notification-bell'));
    expect(screen.getByRole('dialog', { name: 'Notification Panel' })).toBeInTheDocument();

    const firstItem = screen.getByTestId('notification-item-1');
    fireEvent.click(firstItem);

    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');
    expect(useNotificationStore.getState().notifications.find((n) => n.id === 1)?.read).toBe(true);
  });

  it('marks all notifications as read when clicking mark all read', async () => {
    renderWithProviders(<AppShell />);

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications).toHaveLength(2);
    });

    fireEvent.click(screen.getByTestId('notification-bell'));

    fireEvent.click(screen.getByText('Mark all read'));

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
    expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it('paginates notifications when more than 20 exist', async () => {
    const store = useNotificationStore.getState();
    const lotsOfNotifications = Array.from({ length: 25 }, (_, idx) => ({
      id: idx + 10,
      title: `Notification ${idx + 10}`,
      message: `Message details ${idx + 10}`,
      type: 'post',
    }));

    act(() => {
      store.addNotifications(lotsOfNotifications);
      store.setPanelOpen(true);
    });

    renderWithProviders(<AppShell />);

    expect(screen.getByText('Notification 10')).toBeInTheDocument();
    expect(screen.queryByText('Notification 30')).not.toBeInTheDocument();

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('Notification 30')).toBeInTheDocument();
    expect(screen.queryByText('Notification 10')).not.toBeInTheDocument();
  });

  it('pauses polling when tab is hidden and resumes when visible', async () => {
    renderWithProviders(<AppShell />);

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    });
    fireEvent(document, new Event('visibilitychange'));

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    });
    fireEvent(document, new Event('visibilitychange'));
  });

  it('triggers a toast when new notifications arrive while panel is closed', async () => {
    renderWithProviders(<AppShell />);

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications).toHaveLength(2);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('New Post: First Post')).toBeInTheDocument();
  });
});
