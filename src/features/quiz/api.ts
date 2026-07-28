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
    // 0 must still be sent explicitly — it means "no time limit", distinct
    // from omitting the param (which lets the backend fall back to the
    // quiz's own default duration).
    const qs = limitedTime !== undefined ? `?limitedTime=${limitedTime}` : '';
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

  getMyResults: (page = 0, size = 10, quizId?: string) => {
    const qs = quizId ? `&quizId=${encodeURIComponent(quizId)}` : '';
    return apiClient<MyResultsPage>(
      `/quizzes/results/me?page=${page}&size=${size}${qs}`
    );
  },

  getMyResultBySession: (sessionId: string) =>
    apiClient<QuizResultDetail>(`/quizzes/results/me/${sessionId}`),

  rate: (quizId: string, value: number) =>
    apiClient<{ rating: number; ratingCount: number; myRating: number }>(`/quizzes/${quizId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    }),

  getMyRating: (quizId: string) =>
    apiClient<{ myRating: number | null }>(`/quizzes/${quizId}/rating/me`),

  reportQuestion: (questionId: string, reason?: string) =>
    apiClient<{}>(`/quizzes/questions/${questionId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
