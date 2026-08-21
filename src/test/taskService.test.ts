import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSprintTasks } from '../services/taskService';
import type { Task, MockData } from '../types';

// Mock dataset with 35 tasks to test the 30-task limit slicing
const mockTasks: Task[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  title: `Task ${i + 1}`,
  description: `Description ${i + 1}`,
  status: 'backlog',
  priority: 'medium',
  assigneeId: 1,
  dueDate: '2026-08-25',
  sprintId: 3,
  order: i + 1,
  createdAt: '2026-08-16T09:20:00Z',
  completedAt: null,
  updatedAt: '2026-08-16T09:20:00Z',
}));

const mockData: MockData = {
  users: [],
  sprints: [],
  tasks: mockTasks,
  comments: [],
  notifications: [],
};

describe('taskService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should retrieve the first 30 sprint tasks from mock-data.json', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    vi.stubGlobal('fetch', fetchMock);

    const tasks = await getSprintTasks();

    expect(fetchMock).toHaveBeenCalledWith('/mock-data.json');
    expect(tasks).toBeInstanceOf(Array);
    expect(tasks.length).toBe(30);

    expect(tasks[0].id).toBe(1);
    expect(tasks[29].id).toBe(30);
  });

  it('should throw an error if the fetch fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getSprintTasks()).rejects.toThrow('Failed to fetch mock data');
  });
});
