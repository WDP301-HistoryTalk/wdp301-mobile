import { useMutation } from '@tanstack/react-query';

import { quizApi } from '../api';

export function useReportQuestion() {
  return useMutation({
    mutationFn: ({ questionId, reason }: { questionId: string; reason?: string }) =>
      quizApi.reportQuestion(questionId, reason),
  });
}
