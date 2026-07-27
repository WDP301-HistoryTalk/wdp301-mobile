import { useQuery } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useQuizResults(page = 0, size = 10, quizId?: string) {
  return useQuery({
    queryKey: ['quiz-results', page, size, quizId],
    queryFn: () => quizApi.getMyResults(page, size, quizId),
    staleTime: 1000 * 60 * 5,
  });
}
