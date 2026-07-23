import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { StreakWidget, type StreakWidgetCharacter } from './streak-widget';

const STREAK_KEY = 'widget:streak';
const CHARACTERS_KEY = 'widget:characters';

export const WIDGET_NAME = 'Streak';

interface StreakCache {
  streakCount: number;
}

// Cache doc-ghi tu foreground app — headless widget task chi doc lai, khong
// tu goi API (tranh phai xu ly auth token trong Headless JS context).
export async function saveStreakWidgetCache(streakCount: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({ streakCount } satisfies StreakCache));
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

export async function readStreakWidgetCache(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    return (JSON.parse(raw) as StreakCache).streakCount ?? 0;
  } catch {
    return 0;
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
  const [streakCount, character] = await Promise.all([
    readStreakWidgetCache(),
    readRandomCharacterFromWidgetCache(),
  ]);

  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => <StreakWidget streakCount={streakCount} character={character} />,
  });
}
