import { create } from 'zustand';

import type { QuizQuestion, QuizResult, QuizSession } from './types';

interface ActiveQuiz {
  session: QuizSession;
  userAnswers: Record<string, number>; // questionId → selectedOption
  elapsedSeconds: number;
}

interface FinishedQuiz {
  result: QuizResult;
  questions: QuizQuestion[];
  userAnswers: Record<string, number>;
  quizTitle: string;
}

interface QuizStore {
  active: ActiveQuiz | null;
  finished: FinishedQuiz | null;

  startQuiz: (session: QuizSession) => void;
  setAnswer: (questionId: string, option: number) => void;
  setElapsed: (seconds: number) => void;
  finishQuiz: (result: QuizResult) => void;
  clearAll: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  active: null,
  finished: null,

  startQuiz: (session) =>
    set({ active: { session, userAnswers: {}, elapsedSeconds: 0 }, finished: null }),

  setAnswer: (questionId, option) =>
    set((s) => ({
      active: s.active
        ? { ...s.active, userAnswers: { ...s.active.userAnswers, [questionId]: option } }
        : s.active,
    })),

  setElapsed: (seconds) =>
    set((s) => ({ active: s.active ? { ...s.active, elapsedSeconds: seconds } : s.active })),

  finishQuiz: (result) => {
    const { active } = get();
    if (!active) return;
    set({
      finished: {
        result,
        questions: active.session.questions,
        userAnswers: active.userAnswers,
        quizTitle: active.session.title,
      },
      active: null,
    });
  },

  clearAll: () => set({ active: null, finished: null }),
}));
