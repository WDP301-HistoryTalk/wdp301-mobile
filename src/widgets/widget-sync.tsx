import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useCharacters } from '@/features/characters/hooks/use-characters';
import { useGamificationToday } from '@/features/gamification/hooks/use-today';

import {
  requestStreakWidgetLiveUpdate,
  saveCharactersWidgetCache,
  saveStreakWidgetCache,
} from './widget-cache';

// Component vo hinh, mount 1 lan o root cua app (xem AppTabs) — chi lam
// nhiem vu dong bo streak + danh sach nhan vat vao cache cho widget man
// hinh chinh Android moi khi cac query lien quan tai xong. Bo qua tren iOS
// vi widget nay chi lam cho Android.
export function WidgetSync() {
  const { data: today } = useGamificationToday();
  const { data: charactersData } = useCharacters({});

  useEffect(() => {
    if (Platform.OS !== 'android' || today === undefined) return;
    const questsCompleted = today.quests.filter((q) => q.completed).length;
    void saveStreakWidgetCache({
      streakCount: today.streakCount,
      questsCompleted,
      questsTotal: today.quests.length,
      week: today.week.map((d) => ({ studied: d.studied, isToday: d.isToday })),
    }).then(() => requestStreakWidgetLiveUpdate());
  }, [today]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const characters = charactersData?.pages[0]?.content ?? [];
    if (characters.length === 0) return;
    void saveCharactersWidgetCache(
      characters.map((c) => ({ id: c.id, name: c.name, title: c.title })),
    ).then(() => requestStreakWidgetLiveUpdate());
  }, [charactersData]);

  return null;
}
