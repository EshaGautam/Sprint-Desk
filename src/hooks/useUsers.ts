import { useQuery } from '@tanstack/react-query';
import { fetchMockData } from '../services/taskService';
import type { User } from '../types';

/**
 * Hook to retrieve user profile data from the service layer.
 */
export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['mockUsers'],
    queryFn: async () => {
      const data = await fetchMockData();
      return data.users;
    },
  });
}
