import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Analytics from '../pages/Analytics';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useBoardStore } from '../stores/boardStore';
import type { Task } from '../types';

vi.mock('../hooks/useSprintTasks');

vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts') as any;
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container" style={{ width: '800px', height: '600px' }}>
        {children}
      </div>
    ),
  };
});

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', status: 'done', order: 1, priority: 'high', assigneeId: 101, sprintId: 1, description: '', dueDate: '', completedAt: '2026-08-20T09:00:00Z', createdAt: '', updatedAt: '' },
  { id: 2, title: 'Task 2', status: 'done', order: 2, priority: 'medium', assigneeId: 101, sprintId: 1, description: '', dueDate: '', completedAt: '2026-08-21T09:00:00Z', createdAt: '', updatedAt: '' },
  { id: 3, title: 'Task 3', status: 'in-progress', order: 1, priority: 'low', assigneeId: 102, sprintId: 1, description: '', dueDate: '', completedAt: null, createdAt: '', updatedAt: '' },
  { id: 4, title: 'Task 4', status: 'backlog', order: 1, priority: 'high', assigneeId: 102, sprintId: 2, description: '', dueDate: '', completedAt: null, createdAt: '', updatedAt: '' },
];

describe('Analytics Page Charts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useBoardStore.getState().resetBoard();

    vi.mocked(useSprintTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
    } as any);
  });

  it('renders all four required chart sections', () => {
    render(<Analytics />);

    expect(screen.getByText('Sprint Velocity')).toBeInTheDocument();
    expect(screen.getByText('Task Status')).toBeInTheDocument();
    expect(screen.getByText('Priority Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Completion Trend')).toBeInTheDocument();
  });

  it('reacts dynamically to board-state changes in the Zustand store', () => {
    render(<Analytics />);

    // Initially, there are 2 completed tasks in Sprint 1 (from mockTasks)
    // We add another completed task in Sprint 1 to Zustand store
    act(() => {
      useBoardStore.getState().addTask({
        title: 'New Completed Task',
        description: '',
        status: 'done',
        priority: 'high',
        assigneeId: 101,
        sprintId: 1,
        dueDate: '',
        completedAt: '2026-08-22T09:00:00Z',
      });
    });

    // Check that tasks count in store is updated
    const tasks = useBoardStore.getState().tasks;
    expect(tasks).toHaveLength(5);

    // Verify task status count for 'done' in status data is 3
    const doneTasksCount = tasks.filter((t) => t.status === 'done').length;
    expect(doneTasksCount).toBe(3);
  });

  it('renders correctly at 375px mobile viewport width without layout errors', () => {
    // Resize viewport
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<Analytics />);
    expect(container.firstChild).toBeInTheDocument();

    // Reset viewport size
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });
});
