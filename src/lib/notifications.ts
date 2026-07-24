import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Toan bo ham o day deu "fail soft": neu native module chua co mat (vd chua
// rebuild dev client sau khi cai expo-notifications), moi loi deu bi nuot va
// tra ve gia tri rong — khong lam crash man hinh goi no. Sau khi rebuild,
// cac ham nay tu hoat dong binh thuong ma khong can sua code.

const DAILY_REMINDER_ID = 'daily-study-reminder';
const ANDROID_CHANNEL_ID = 'default';
const PUSH_PREFERENCE_KEY = 'notifications:push-enabled';

// Preference rieng cua app (khac voi quyen he thong, thu hoi duoc boi user tu
// switch trong Profile ma khong can vao Cai dat may): mac dinh bat, de
// useRegisterPush biet co nen tu dong dang ky token voi backend hay khong.
export async function getPushPreference(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PUSH_PREFERENCE_KEY);
    return raw !== 'false';
  } catch {
    return true;
  }
}

export async function setPushPreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_PREFERENCE_KEY, enabled ? 'true' : 'false');
  } catch {
    // best-effort
  }
}

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // native module chua san sang — bo qua, khong lam crash luc import module nay
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Thông báo chung',
      // HIGH de push hien banner pop-up (heads-up) thay vi chi nam im trong
      // khay thong bao. Luu y: Android khoa importance sau khi channel duoc
      // tao lan dau — doi gia tri nay khong anh huong may da cai app tu
      // truoc, phai xoa channel cu hoac cai lai app moi ap dung.
      importance: Notifications.AndroidImportance.HIGH,
    });
  } catch {
    // native module chua san sang — bo qua
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch {
    return false;
  }
}

// Lay raw FCM device token (khong phai ExponentPushToken) — backend gui push
// truc tiep bang Firebase Admin SDK, khong qua Expo Push API, nen khong can
// projectId/eas init.
export async function getDevicePushTokenSafe(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    await ensureAndroidChannel();

    const result = await Notifications.getDevicePushTokenAsync();
    return result.data;
  } catch {
    return null;
  }
}

export async function scheduleDailyReminder(hour = 20, minute = 0): Promise<boolean> {
  try {
    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: 'Đừng bỏ lỡ chuỗi ngày học! 🔥',
        body: 'Hôm nay bạn chưa ghé HistoryTalk — vào học ngay để giữ chuỗi ngày học nhé.',
        data: { route: '/' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // chua co lich hoac native module chua san sang — bo qua
  }
}

export async function isDailyReminderScheduled(): Promise<boolean> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.some((n) => n.identifier === DAILY_REMINDER_ID);
  } catch {
    return false;
  }
}

export function addNotificationTapListener(
  onRoute: (route: string) => void,
): { remove: () => void } {
  try {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === 'string') onRoute(route);
    });
    return sub;
  } catch {
    return { remove: () => {} };
  }
}
