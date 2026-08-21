import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../services/authService';

/**
 * Mutation hook for logging in a user.
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ username, password }: any) => loginUser(username, password),
  });
}
