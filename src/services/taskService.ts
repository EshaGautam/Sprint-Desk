import type { MockData, Task } from '../types';

export async function fetchMockData(): Promise<MockData> {
  const response = await fetch('/mock-data.json');
  if (!response.ok) {
    throw new Error('Failed to fetch mock data');
  }
  return response.json();
}

export async function getSprintTasks(): Promise<Task[]> {
  const data = await fetchMockData();
  // Limit to the first 30 tasks for the board.
  return data.tasks.slice(0, 30);
}
