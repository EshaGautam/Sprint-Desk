import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore, BOARD_COLUMNS } from '../stores/boardStore';
import type { Task } from '../types';

function generateMockTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    title: `Task ${idx + 1}`,
    description: `Desc ${idx + 1}`,
    status: 'backlog',
    priority: 'medium',
    order: idx + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assigneeId: 1,
    sprintId: 1,
    dueDate: '2026-08-31',
    completedAt: null,
  }));
}

describe('Board Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useBoardStore.getState().resetBoard();
  });

  it('contains exactly the four required board columns', () => {
    expect(BOARD_COLUMNS).toHaveLength(4);
    expect(BOARD_COLUMNS[0]).toEqual({ id: 'backlog', label: 'Backlog' });
    expect(BOARD_COLUMNS[1]).toEqual({ id: 'in-progress', label: 'In Progress' });
    expect(BOARD_COLUMNS[2]).toEqual({ id: 'review', label: 'Review' });
    expect(BOARD_COLUMNS[3]).toEqual({ id: 'done', label: 'Done' });
  });

  it('initializes the board with the first 30 tasks from data input', () => {
    const inputTasks = generateMockTasks(40);
    useBoardStore.getState().initializeBoard(inputTasks);

    const storeState = useBoardStore.getState();
    expect(storeState.tasks).toHaveLength(30);
    expect(storeState.hasInitialized).toBe(true);
    expect(storeState.tasks[0].id).toBe(1);
    expect(storeState.tasks[29].id).toBe(30);
  });

  it('does not re-initialize tasks if already initialized', () => {
    const inputTasks1 = generateMockTasks(5);
    const inputTasks2 = generateMockTasks(10);

    useBoardStore.getState().initializeBoard(inputTasks1);
    useBoardStore.getState().initializeBoard(inputTasks2);

    expect(useBoardStore.getState().tasks).toHaveLength(5);
  });

  it('adds a task to the end of a column with incremented ID and sequential order', () => {
    useBoardStore.getState().initializeBoard(generateMockTasks(3));

    useBoardStore.getState().addTask({
      title: 'Added Task',
      description: 'New task details',
      status: 'backlog',
      priority: 'high',
      assigneeId: 2,
      sprintId: 1,
      dueDate: '2026-08-31',
      completedAt: null,
    });

    const tasks = useBoardStore.getState().tasks;
    expect(tasks).toHaveLength(4);

    const added = tasks.find((t) => t.title === 'Added Task');
    expect(added).toBeDefined();
    expect(added?.id).toBe(4);
    expect(added?.order).toBe(4);
  });

  it('moves a task between columns and re-indexes orders in both target and source columns', () => {
    const initialTasks: Task[] = [
      { id: 1, title: 'Task 1', status: 'backlog', order: 1, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 2, title: 'Task 2', status: 'backlog', order: 2, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 3, title: 'Task 3', status: 'in-progress', order: 1, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 4, title: 'Task 4', status: 'in-progress', order: 2, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
    ];

    useBoardStore.getState().initializeBoard(initialTasks);

    useBoardStore.getState().moveTask(2, 'in-progress', 0);

    const tasks = useBoardStore.getState().tasks;

    const backlogTasks = tasks.filter((t) => t.status === 'backlog');
    expect(backlogTasks).toHaveLength(1);
    expect(backlogTasks[0].id).toBe(1);
    expect(backlogTasks[0].order).toBe(1);

    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').sort((a, b) => a.order - b.order);
    expect(inProgressTasks).toHaveLength(3);
    expect(inProgressTasks[0].id).toBe(2);
    expect(inProgressTasks[0].order).toBe(1);
    expect(inProgressTasks[1].id).toBe(3);
    expect(inProgressTasks[1].order).toBe(2);
    expect(inProgressTasks[2].id).toBe(4);
    expect(inProgressTasks[2].order).toBe(3);
  });

  it('reorders tasks within the same column sequentially', () => {
    const initialTasks: Task[] = [
      { id: 1, title: 'Task 1', status: 'backlog', order: 1, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 2, title: 'Task 2', status: 'backlog', order: 2, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 3, title: 'Task 3', status: 'backlog', order: 3, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
    ];

    useBoardStore.getState().initializeBoard(initialTasks);

    useBoardStore.getState().moveTask(3, 'backlog', 1);

    const tasks = useBoardStore.getState().tasks.sort((a, b) => a.order - b.order);
    expect(tasks[0].id).toBe(1);
    expect(tasks[0].order).toBe(1);
    expect(tasks[1].id).toBe(3);
    expect(tasks[1].order).toBe(2);
    expect(tasks[2].id).toBe(2);
    expect(tasks[2].order).toBe(3);
  });

  it('updates editable task fields', () => {
    useBoardStore.getState().initializeBoard(generateMockTasks(1));

    useBoardStore.getState().editTask(1, {
      title: 'Updated Title',
      priority: 'high',
    });

    const task = useBoardStore.getState().tasks.find((t) => t.id === 1);
    expect(task?.title).toBe('Updated Title');
    expect(task?.priority).toBe('high');
  });

  it('deletes a task and re-indexes the orders of the remaining column tasks', () => {
    const initialTasks: Task[] = [
      { id: 1, title: 'Task 1', status: 'backlog', order: 1, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 2, title: 'Task 2', status: 'backlog', order: 2, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
      { id: 3, title: 'Task 3', status: 'backlog', order: 3, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
    ];

    useBoardStore.getState().initializeBoard(initialTasks);

    useBoardStore.getState().deleteTask(2);

    const tasks = useBoardStore.getState().tasks.sort((a, b) => a.order - b.order);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe(1);
    expect(tasks[0].order).toBe(1);
    expect(tasks[1].id).toBe(3);
    expect(tasks[1].order).toBe(2);
  });

  it('persists and restores state from local storage simulation', async () => {
    localStorage.setItem(
      'board-store',
      JSON.stringify({
        state: {
          tasks: [
            { id: 99, title: 'Persisted Task', status: 'backlog', order: 1, priority: 'medium', createdAt: '', updatedAt: '', assigneeId: 1, sprintId: 1, description: '', dueDate: '', completedAt: null },
          ],
          hasInitialized: true,
        },
      })
    );

    await useBoardStore.persist.rehydrate();

    const storeState = useBoardStore.getState();
    expect(storeState.hasInitialized).toBe(true);
    expect(storeState.tasks).toHaveLength(1);
    expect(storeState.tasks[0].title).toBe('Persisted Task');
  });
});
