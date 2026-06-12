import { useMutation } from '@tanstack/react-query';

import { quizApi } from '../api';
import { useQuizStore } from '../store';
import type { SubmitAnswers } from '../types';

export function useSubmitQuiz() {
  const finishQuiz = useQuizStore((s) => s.finishQuiz);

  return useMutation({
    mutationFn: (data: SubmitAnswers) => quizApi.submit(data),
    onSuccess: (result) => {
      finishQuiz(result);
    },
  });
}
