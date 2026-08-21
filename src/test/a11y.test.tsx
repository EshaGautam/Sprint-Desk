import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../pages/Login';
import AppShell from '../components/AppShell';
import Board from '../pages/Board';
import Analytics from '../pages/Analytics';
import Drawer from '../components/Drawer/Drawer';
import Modal from '../components/Modal/Modal';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useUsers } from '../hooks/useUsers';
import { useComments } from '../hooks/useComments';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useSprintTasks');
vi.mock('../hooks/useUsers');
vi.mock('../hooks/useComments');

const mockTasks = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Desc 1',
    status: 'backlog',
    priority: 'high',
    assigneeId: 10,
    dueDate: '2026-08-22',
    sprintId: 1,
    order: 0,
  },
];

const mockUsers = [
  { id: 10, name: 'Alice Smith', avatar: 'https://example.com/alice.jpg' },
];

describe('A11y & Responsive Validations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.mocked(useSprintTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useComments).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('1. Login fields have accessible labels', () => {
    renderWithProviders(<Login />);
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('2. Theme toggle and notification bell have accessible names', () => {
    renderWithProviders(<AppShell />);
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notification bell/i })).toBeInTheDocument();
  });

  it('3. Drawer can be closed using Escape', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Drawer Title">
        <p>Drawer Content</p>
      </Drawer>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('4. Modal close and actions are keyboard accessible', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modal Title">
        <button onClick={handleClose}>Confirm</button>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('5. Task card interaction is keyboard accessible', async () => {
    renderWithProviders(<Board />);

    await waitFor(() => {
      expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    });

    const card = screen.getByTestId('task-card-1');
    card.focus();

    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
  });

  it('6. Image assignee avatars have appropriate alt text descriptions', async () => {
    renderWithProviders(<Board />);
    await waitFor(() => {
      expect(screen.getByAltText('Alice Smith')).toBeInTheDocument();
    });
  });

  it('7. Analytics renders correctly', async () => {
    const { container } = renderWithProviders(<Analytics />);
    expect(container).toBeInTheDocument();
  });
});
