import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Toan bo ham o day deu "fail soft": neu native module chua co mat (vd chua
// rebuild dev client sau khi cai expo-notifications), moi loi deu bi nuot va
// tra ve gia tri rong — khong lam crash man hinh goi no. Sau khi rebuild,
// cac ham nay tu hoat dong binh thuong ma khong can sua code.
//
// Dung require() (khong phai static import): tren Expo Go Android SDK 53+,
// ban than expo-notifications throw ngay khi module duoc load (no dang ky mot
// push-token listener o top-level), truoc khi bat ky try/catch nao trong file
// nay kip chay. require() trong try/catch la cach duy nhat "bat" duoc loi do.
type NotificationsModule = typeof import('expo-notifications');
let Notifications: NotificationsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

function notif(): NotificationsModule {
  if (!Notifications) throw new Error('expo-notifications unavailable');
  return Notifications;
}

const DAILY_REMINDER_ID = 'daily-study-reminder';
const ANDROID_CHANNEL_ID = 'default';
const PUSH_PREFERENCE_KEY = 'notifications:push-enabled';
const REMINDER_TIME_KEY = 'notifications:daily-reminder-time';
const DEFAULT_REMINDER_HOUR = 20;
const DEFAULT_REMINDER_MINUTE = 0;

// Gio nhac hoc nguoi dung tu chon (doc lap voi viec lich co dang bat hay
// khong) — luu truoc de: (1) hien dung gio da chon ngay ca khi dang tat,
// (2) scheduleDailyReminder() luon co gio dung de dat lai khi bat lien.
export async function getReminderTime(): Promise<{ hour: number; minute: number }> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_TIME_KEY);
    if (!raw) return { hour: DEFAULT_REMINDER_HOUR, minute: DEFAULT_REMINDER_MINUTE };
    const [hourStr, minuteStr] = raw.split(':');
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
      return { hour: DEFAULT_REMINDER_HOUR, minute: DEFAULT_REMINDER_MINUTE };
    }
    return { hour, minute };
  } catch {
    return { hour: DEFAULT_REMINDER_HOUR, minute: DEFAULT_REMINDER_MINUTE };
  }
}

export async function setReminderTime(hour: number, minute: number): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDER_TIME_KEY, `${hour}:${minute}`);
  } catch {
    // best-effort
  }
}

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
  notif().setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // native module chua san sang (hoac dang chay Expo Go) — bo qua, khong lam
  // crash luc import module nay
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await notif().setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Thông báo chung',
      // HIGH de push hien banner pop-up (heads-up) thay vi chi nam im trong
      // khay thong bao. Luu y: Android khoa importance sau khi channel duoc
      // tao lan dau — doi gia tri nay khong anh huong may da cai app tu
      // truoc, phai xoa channel cu hoac cai lai app moi ap dung.
      importance: notif().AndroidImportance.HIGH,
    });
  } catch {
    // native module chua san sang — bo qua
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await notif().getPermissionsAsync();
    if (current.status === 'granted') return true;
    const requested = await notif().requestPermissionsAsync();
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

    const result = await notif().getDevicePushTokenAsync();
    return result.data;
  } catch {
    return null;
  }
}

export async function scheduleDailyReminder(
  hour = DEFAULT_REMINDER_HOUR,
  minute = DEFAULT_REMINDER_MINUTE,
): Promise<boolean> {
  try {
    await cancelDailyReminder();
    await notif().scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: 'Đừng bỏ lỡ chuỗi ngày học! 🔥',
        body: 'Hôm nay bạn chưa ghé HistoryTalk — vào học ngay để giữ chuỗi ngày học nhé.',
        data: { route: '/' },
      },
      trigger: {
        type: notif().SchedulableTriggerInputTypes.DAILY,
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
    await notif().cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // chua co lich hoac native module chua san sang — bo qua
  }
}

export async function isDailyReminderScheduled(): Promise<boolean> {
  try {
    const scheduled = await notif().getAllScheduledNotificationsAsync();
    return scheduled.some((n) => n.identifier === DAILY_REMINDER_ID);
  } catch {
    return false;
  }
}

export function addNotificationTapListener(
  onRoute: (route: string) => void,
): { remove: () => void } {
  try {
    const sub = notif().addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === 'string') onRoute(route);
    });
    return sub;
  } catch {
    return { remove: () => {} };
  }
}
