import { useMutation } from '@tanstack/react-query';

import { quizApi } from '../api';
import { useQuizStore } from '../store';

export function useStartQuiz() {
  const startQuiz = useQuizStore((s) => s.startQuiz);

  return useMutation({
    mutationFn: (params: string | { quizId: string; limitedTime?: number; practiceMode?: boolean }) => {
      if (typeof params === 'string') return quizApi.startSession(params);
      return quizApi.startSession(params.quizId, params.limitedTime);
    },
    onSuccess: (session, params) => {
      const practiceMode = typeof params === 'object' ? params.practiceMode : false;
      startQuiz(session, practiceMode);
    },
  });
}
