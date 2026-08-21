import { useQuery } from '@tanstack/react-query';
import { fetchMockData } from '../services/taskService';
import type { Comment } from '../types';

/**
 * Hook to retrieve comments data from the service layer.
 */
export function useComments() {
  return useQuery<Comment[], Error>({
    queryKey: ['mockComments'],
    queryFn: async () => {
      const data = await fetchMockData();
      return data.comments;
    },
  });
}
