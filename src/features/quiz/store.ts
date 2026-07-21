import { create } from 'zustand';

import type { QuizQuestion, QuizResult, QuizSession } from './types';

interface ActiveQuiz {
  session: QuizSession;
  userAnswers: Record<string, number>; // questionId → selectedOption
  elapsedSeconds: number;
  /** Che do luyen tap: hien dung/sai ngay sau moi cau, chay song song che do thi. */
  practiceMode: boolean;
}

interface FinishedQuiz {
  result: QuizResult;
  questions: QuizQuestion[];
  userAnswers: Record<string, number>;
  quizTitle: string;
  quizId: string;
  /** Chi co khi xem ket qua qua sessionId (fetch tu server) — luong finishQuiz local khong co san. */
  contextId?: string;
}

interface QuizStore {
  active: ActiveQuiz | null;
  finished: FinishedQuiz | null;

  startQuiz: (session: QuizSession, practiceMode?: boolean) => void;
  restoreQuiz: (
    session: QuizSession,
    userAnswers: Record<string, number>,
    elapsedSeconds: number,
    practiceMode?: boolean,
  ) => void;
  setAnswer: (questionId: string, option: number) => void;
  setElapsed: (seconds: number) => void;
  finishQuiz: (result: QuizResult) => void;
  clearAll: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  active: null,
  finished: null,

  startQuiz: (session, practiceMode = false) =>
    set({ active: { session, userAnswers: {}, elapsedSeconds: 0, practiceMode }, finished: null }),

  // Khoi phuc tien trinh da luu (AsyncStorage) tu lan lam do truoc, thay vi bat dau phien moi.
  restoreQuiz: (session, userAnswers, elapsedSeconds, practiceMode = false) =>
    set({ active: { session, userAnswers, elapsedSeconds, practiceMode }, finished: null }),

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
        quizId: active.session.quizId,
      },
      active: null,
    });
  },

  clearAll: () => set({ active: null, finished: null }),
}));
