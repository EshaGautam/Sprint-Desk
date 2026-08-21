import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Board from '../pages/Board';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useUsers } from '../hooks/useUsers';
import { useComments } from '../hooks/useComments';
import { useBoardStore } from '../stores/boardStore';
import type { Task } from '../types';

vi.mock('../hooks/useSprintTasks');
vi.mock('../hooks/useUsers');
vi.mock('../hooks/useComments');

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core') as any;
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => {
      (window as any).triggerDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    },
    useDraggable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      isDragging: false,
    }),
    useDroppable: () => ({
      setNodeRef: () => {},
    }),
  };
});

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', status: 'backlog', order: 1, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 101, sprintId: 1, description: '', dueDate: '', completedAt: null },
  { id: 2, title: 'Task 2', status: 'backlog', order: 2, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 101, sprintId: 1, description: '', dueDate: '', completedAt: null },
  { id: 3, title: 'Task 3', status: 'backlog', order: 3, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 101, sprintId: 1, description: '', dueDate: '', completedAt: null },
];

const mockUsers = [
  { id: 101, name: 'Alice Smith', email: 'alice@example.com', avatar: 'alice.jpg' },
];

describe('Kanban Board Drag and Drop', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useBoardStore.getState().resetBoard();

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

  it('handles same-column reorder correctly', () => {
    render(<Board />);

    const triggerDragEnd = (window as any).triggerDragEnd;
    expect(triggerDragEnd).toBeDefined();

    act(() => {
      triggerDragEnd({
        active: { id: 3 },
        over: { id: 1 },
      });
    });

    const storeTasks = useBoardStore.getState().tasks.sort((a, b) => a.order - b.order);
    expect(storeTasks[0].id).toBe(3);
    expect(storeTasks[0].order).toBe(1);
    expect(storeTasks[1].id).toBe(1);
    expect(storeTasks[1].order).toBe(2);
    expect(storeTasks[2].id).toBe(2);
    expect(storeTasks[2].order).toBe(3);
  });

  it('handles cross-column move correctly', () => {
    render(<Board />);

    const triggerDragEnd = (window as any).triggerDragEnd;
    act(() => {
      triggerDragEnd({
        active: { id: 1 },
        over: { id: 'in-progress' },
      });
    });

    const tasks = useBoardStore.getState().tasks;
    const task1 = tasks.find(t => t.id === 1);
    expect(task1?.status).toBe('in-progress');
    expect(task1?.order).toBe(1);

    const backlogTasks = tasks.filter(t => t.status === 'backlog');
    expect(backlogTasks).toHaveLength(2);
  });

  it('keeps board state unchanged on invalid drop outside targets', () => {
    render(<Board />);

    const triggerDragEnd = (window as any).triggerDragEnd;
    act(() => {
      triggerDragEnd({
        active: { id: 1 },
        over: null,
      });
    });

    const tasks = useBoardStore.getState().tasks;
    expect(tasks).toHaveLength(3);
    expect(tasks.find(t => t.id === 1)?.status).toBe('backlog');
  });

  it('updates the Zustand store and persists change in local storage', async () => {
    render(<Board />);

    const triggerDragEnd = (window as any).triggerDragEnd;
    act(() => {
      triggerDragEnd({
        active: { id: 2 },
        over: { id: 'done' },
      });
    });

    const persisted = JSON.parse(localStorage.getItem('board-store') || '{}');
    expect(persisted.state.tasks).toBeDefined();
    expect(persisted.state.tasks.find((t: any) => t.id === 2).status).toBe('done');
  });
});
