import { useQuery } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useQuizzes(search?: string) {
  return useQuery({
    queryKey: ['quizzes', search],
    queryFn: () => quizApi.list(search),
    staleTime: 1000 * 60 * 5,
  });
}
