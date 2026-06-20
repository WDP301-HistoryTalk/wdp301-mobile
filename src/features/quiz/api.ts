import { apiClient } from '@/lib/api-client';

import type {
  MyResultsPage,
  Quiz,
  QuizResult,
  QuizResultDetail,
  QuizSummary,
  QuizSession,
  SubmitAnswers,
} from './types';

export const quizApi = {
  list: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient<QuizSummary[]>(`/quizzes${qs}`);
  },

  getById: (quizId: string) =>
    apiClient<Quiz>(`/quizzes/${quizId}`),

  startSession: async (quizId: string, limitedTime?: number) => {
    const qs = limitedTime ? `?limitedTime=${limitedTime}` : '';
    const session = await apiClient<QuizSession>(`/quizzes/${quizId}/start${qs}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return {
      ...session,
      questions: [...session.questions].sort((a, b) => a.orderIndex - b.orderIndex),
    };
  },

  submit: (data: SubmitAnswers) =>
    apiClient<QuizResult>('/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyResults: (page = 0, size = 10) =>
    apiClient<MyResultsPage>(
      `/quizzes/results/me?page=${page}&size=${size}`
    ),

  getMyResultBySession: (sessionId: string) =>
    apiClient<QuizResultDetail>(`/quizzes/results/me/${sessionId}`),
};
