import { useQuery } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useQuizResults(page = 0, size = 10) {
  return useQuery({
    queryKey: ['quiz-results', page, size],
    queryFn: () => quizApi.getMyResults(page, size),
    staleTime: 1000 * 60 * 5,
  });
}
