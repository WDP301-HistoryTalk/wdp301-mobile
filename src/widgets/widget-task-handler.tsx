import type { WidgetTaskHandler } from 'react-native-android-widget';

import { StreakWidget } from './streak-widget';
import { readRandomCharacterFromWidgetCache, readStreakWidgetCache } from './widget-cache';

// Chay trong Headless JS context (khong co UI, khong co React Query) moi khi
// Android them/resize/xoa widget hoac den chu ky cap nhat dinh ky. Chi doc du
// lieu da duoc app foreground ghi san vao AsyncStorage — khong tu goi API o
// day de tranh phai mang theo auth token vao context nay.
export const widgetTaskHandler: WidgetTaskHandler = async (props) => {
  if (props.widgetAction === 'WIDGET_DELETED') return;

  const [streak, character] = await Promise.all([
    readStreakWidgetCache(),
    readRandomCharacterFromWidgetCache(),
  ]);

  props.renderWidget(
    <StreakWidget
      streakCount={streak.streakCount}
      questsCompleted={streak.questsCompleted}
      questsTotal={streak.questsTotal}
      week={streak.week}
      character={character}
    />,
  );
};
