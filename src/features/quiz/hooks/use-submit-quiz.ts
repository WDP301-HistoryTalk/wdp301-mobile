import { useMutation, useQueryClient } from '@tanstack/react-query';

import { quizApi } from '../api';
import { useQuizStore } from '../store';
import type { SubmitAnswers } from '../types';

export function useSubmitQuiz() {
  const finishQuiz = useQuizStore((s) => s.finishQuiz);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitAnswers) => quizApi.submit(data),
    onSuccess: (result) => {
      finishQuiz(result);
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      void queryClient.invalidateQueries({ queryKey: ['quiz'] });
      // Nộp quiz xong → tiến độ nhiệm vụ ngày đổi ngay
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'today'] });
    },
  });
}
