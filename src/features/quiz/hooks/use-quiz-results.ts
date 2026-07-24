import { useQuery } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useQuizResults(page = 0, size = 10, quizId?: string) {
  return useQuery({
    queryKey: ['quiz-results', page, size, quizId],
    queryFn: async () => {
      const res = await quizApi.getMyResults(page, size);
      if (quizId && res?.content) {
        return {
          ...res,
          content: res.content.filter((item) => item.quizId === quizId),
        };
      }
      return res;
    },
    staleTime: 1000 * 60 * 5,
  });
}
