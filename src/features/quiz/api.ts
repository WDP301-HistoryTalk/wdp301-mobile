import { apiClient } from '@/lib/api-client';

import type { MyResult, Quiz, QuizResult, QuizSession, SubmitAnswers } from './types';

export const quizApi = {
  list: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient<Quiz[]>(`/quizzes${qs}`);
  },

  getById: (quizId: string) =>
    apiClient<Quiz>(`/quizzes/${quizId}`),

  startSession: (quizId: string) =>
    apiClient<QuizSession>(`/quizzes/${quizId}/start`, { method: 'POST' }),

  submit: (data: SubmitAnswers) =>
    apiClient<QuizResult>('/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyResults: (page = 0, size = 10) =>
    apiClient<{ content: MyResult[]; hasNext: boolean; currentPage: number; totalElements: number }>(
      `/quizzes/results/me?page=${page}&size=${size}`
    ),
};
