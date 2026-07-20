export type QuizLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuizEra = 'ALL' | 'ANCIENT' | 'MEDIEVAL' | 'MODERN' | 'CONTEMPORARY';
export type QuizGrade = 10 | 11 | 12;

export interface QuizSummary {
  quizId: string;
  title: string;
  level: QuizLevel;
  era: QuizEra;
  playCount: number;
  rating?: number;
  contextTitle?: string;
}

export interface Quiz extends QuizSummary {
  description?: string;
  durationSeconds?: number;
  rating?: number;
  grade?: QuizGrade;
  chapterNumber?: number;
  chapterTitle?: string;
  /** So lan chinh nguoi dung hien tai da hoan thanh quiz nay (rieng, khac playCount toan he thong). */
  userPlayCount?: number;
}

export interface QuizQuestion {
  questionId: string;
  content: string;
  options: string[];
  correctAnswer: number;
  orderIndex: number;
  explanation?: string;
}

export interface QuizSession {
  sessionId: string;
  quizId: string;
  title: string;
  limitedTime: number;
  durationSeconds: number;
  questions: QuizQuestion[];
}

export interface SubmitAnswers {
  sessionId: string;
  answers: { questionId: string; selectedAnswer: number }[];
}

export interface QuizResult {
  resultId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  startTime: string;
  endTime: string;
  correctAnswers: number[];
  wrongAnswers: number[];
}

export interface MyResult {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface MyResultsPage {
  content: MyResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QuizResultDetailQuestion extends QuizQuestion {
  selectedAnswer: number;
  correct: boolean;
}

export interface PreviousAttempt {
  score: number;
  percentage: number;
  completedAt: string;
}

export interface QuizResultDetail {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  limitedTime: number;
  startedAt: string;
  completedAt: string;
  previousAttempt?: PreviousAttempt | null;
  questions: QuizResultDetailQuestion[];
}
