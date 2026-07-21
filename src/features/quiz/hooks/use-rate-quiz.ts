import { useMutation, useQueryClient } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useRateQuiz(quizId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: number) => quizApi.rate(quizId, value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
