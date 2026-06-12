import { useQuery } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getById(quizId),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 5,
  });
}
