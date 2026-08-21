import { useQuery } from '@tanstack/react-query';
import { getSprintTasks } from '../services/taskService';
import type { Task } from '../types';

export function useSprintTasks() {
  return useQuery<Task[], Error>({
    queryKey: ['sprintTasks'],
    queryFn: getSprintTasks,
  });
}
