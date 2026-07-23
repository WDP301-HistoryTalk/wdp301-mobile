import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { StreakWidget, type StreakWidgetCharacter, type StreakWidgetWeekDay } from './streak-widget';

const STREAK_KEY = 'widget:streak';
const CHARACTERS_KEY = 'widget:characters';

export const WIDGET_NAME = 'Streak';

interface StreakCache {
  streakCount: number;
  questsCompleted: number;
  questsTotal: number;
  week: StreakWidgetWeekDay[];
}

// Cache doc-ghi tu foreground app — headless widget task chi doc lai, khong
// tu goi API (tranh phai xu ly auth token trong Headless JS context).
export async function saveStreakWidgetCache(data: StreakCache): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {
    // best-effort
  }
}

export async function saveCharactersWidgetCache(characters: StreakWidgetCharacter[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  } catch {
    // best-effort
  }
}

export async function readStreakWidgetCache(): Promise<StreakCache> {
  const empty: StreakCache = { streakCount: 0, questsCompleted: 0, questsTotal: 0, week: [] };
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StreakCache>;
    return {
      streakCount: parsed.streakCount ?? 0,
      questsCompleted: parsed.questsCompleted ?? 0,
      questsTotal: parsed.questsTotal ?? 0,
      week: parsed.week ?? [],
    };
  } catch {
    return empty;
  }
}

export async function readRandomCharacterFromWidgetCache(): Promise<StreakWidgetCharacter | null> {
  try {
    const raw = await AsyncStorage.getItem(CHARACTERS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as StreakWidgetCharacter[];
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)] ?? null;
  } catch {
    return null;
  }
}

// Goi tu foreground (sau khi streak/characters query moi fetch xong) de widget
// tren man hinh chinh cap nhat ngay, khong phai doi chu ky 30 phut cua Android.
export async function requestStreakWidgetLiveUpdate(): Promise<void> {
  const [streak, character] = await Promise.all([
    readStreakWidgetCache(),
    readRandomCharacterFromWidgetCache(),
  ]);

  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => (
      <StreakWidget
        streakCount={streak.streakCount}
        questsCompleted={streak.questsCompleted}
        questsTotal={streak.questsTotal}
        week={streak.week}
        character={character}
      />
    ),
  });
}
