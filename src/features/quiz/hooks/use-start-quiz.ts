import { useMutation } from '@tanstack/react-query';

import { quizApi } from '../api';
import { useQuizStore } from '../store';

export function useStartQuiz() {
  const startQuiz = useQuizStore((s) => s.startQuiz);

  return useMutation({
    mutationFn: (quizId: string) => quizApi.startSession(quizId),
    onSuccess: (session) => {
      startQuiz(session);
    },
  });
}
