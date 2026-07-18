export type QuestType = 'CHAT' | 'QUIZ' | 'READ_CONTEXT';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  target: number;
  rewardTokens: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface WeekDay {
  date: string;
  /** 0 = Thứ 2 ... 6 = Chủ nhật */
  weekday: number;
  studied: boolean;
  isToday: boolean;
}

export interface GamificationToday {
  date: string;
  streakCount: number;
  longestStreak: number;
  totalStudyDays: number;
  studiedToday: boolean;
  week: WeekDay[];
  quests: DailyQuest[];
  claimableTokens: number;
}

export interface ClaimResult {
  questId: string;
  rewardTokens: number;
  tokenBalance: number;
}
