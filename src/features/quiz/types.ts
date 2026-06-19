export type QuizLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuizEra = 'ALL' | 'ANCIENT' | 'MEDIEVAL' | 'MODERN' | 'CONTEMPORARY';
export type QuizGrade = 10 | 11 | 12;

export interface Quiz {
  quizId: string;
  title: string;
  level: QuizLevel;
  description: string;
  era: QuizEra;
  durationSeconds: number;
  playCount: number;
  rating: number;
  contextTitle?: string;
  grade?: QuizGrade;
  chapterNumber?: number;
  chapterTitle?: string;
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
  questions: QuizResultDetailQuestion[];
}
