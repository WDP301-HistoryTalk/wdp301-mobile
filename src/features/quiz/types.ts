export interface Quiz {
  quizId: string;
  title: string;
  description: string;
  grade?: number;
  chapterNumber?: number;
  chapterTitle?: string;
  era: string;
  durationSeconds: number;
  playCount: number;
  rating: number;
  contextTitle: string;
}

export interface QuizQuestion {
  questionId: string;
  content: string;
  options: string[];
  correctAnswer: number;
  orderIndex: number;
  explanation: string;
}

export interface QuizSession {
  sessionId: string;
  quizId: string;
  title: string;
  durationSeconds: number;
  questions: QuizQuestion[];
}

export interface SubmitAnswers {
  sessionId: string;
  answers: { questionId: string; selectedOption: number }[];
  durationSeconds?: number;
}

export interface QuizResult {
  resultId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: number[];
  wrongAnswers: number[];
}

export interface MyResult {
  resultId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  completedAt: string;
}
