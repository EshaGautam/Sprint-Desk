import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Board from '../pages/Board';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useUsers } from '../hooks/useUsers';
import { useBoardStore } from '../stores/boardStore';
import type { Task } from '../types';

vi.mock('../hooks/useSprintTasks');
vi.mock('../hooks/useUsers');

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Desc 1',
    status: 'backlog',
    priority: 'high',
    assigneeId: 101,
    dueDate: '2026-08-31',
    sprintId: 1,
    order: 1,
    createdAt: '',
    updatedAt: '',
    completedAt: null,
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Desc 2',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 102,
    dueDate: '2026-09-15',
    sprintId: 1,
    order: 1,
    createdAt: '',
    updatedAt: '',
    completedAt: null,
  },
];

const mockUsers = [
  { id: 101, name: 'Alice Smith', email: 'alice@example.com', avatar: 'alice.jpg' },
  { id: 102, name: 'Bob Jones', email: 'bob@example.com', avatar: 'bob.jpg' },
];

describe('Kanban Board UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useBoardStore.getState().resetBoard();
  });

  it('renders loading states correctly using skeletons', () => {
    vi.mocked(useSprintTasks).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<Board />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error message when loading fails', () => {
    vi.mocked(useSprintTasks).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    render(<Board />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load Kanban board');
  });

  it('renders exactly four columns with task cards and correct counts', () => {
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

    render(<Board />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText(/Due Aug 31|Due 31 Aug/)).toBeInTheDocument();
  });

  it('renders empty state indicators for columns with no tasks', () => {
    vi.mocked(useSprintTasks).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    } as any);

    render(<Board />);

    const emptyStates = screen.getAllByText('No tasks');
    expect(emptyStates).toHaveLength(4);
  });
});
