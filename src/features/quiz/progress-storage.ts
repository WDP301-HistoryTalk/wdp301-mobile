import AsyncStorage from '@react-native-async-storage/async-storage';

import type { QuizSession } from './types';

const KEY_PREFIX = 'quiz-progress:';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface SavedQuizProgress {
  session: QuizSession;
  userAnswers: Record<string, number>;
  elapsedSeconds: number;
  flaggedIds: string[];
  currentIdx: number;
  practiceMode: boolean;
  savedAt: number;
}

export async function saveQuizProgress(progress: SavedQuizProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_PREFIX + progress.session.quizId, JSON.stringify(progress));
  } catch {
    // best-effort — khong lam gian doan trai nghiem lam bai neu ghi that bai
  }
}

export async function loadQuizProgress(quizId: string): Promise<SavedQuizProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + quizId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedQuizProgress;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      await AsyncStorage.removeItem(KEY_PREFIX + quizId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearQuizProgress(quizId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_PREFIX + quizId);
  } catch {
    // ignore
  }
}
