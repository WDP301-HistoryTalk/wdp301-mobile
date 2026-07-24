import { useEffect } from 'react';
import { Platform } from 'react-native';

import { getDevicePushTokenSafe, getPushPreference } from '@/lib/notifications';

import { notificationsApi } from '../api';

// Dang ky raw FCM device token voi backend ngay sau khi da dang nhap. Best-effort:
// neu xin quyen bi tu choi hoac native module chua san sang (chua rebuild dev
// client sau khi cai expo-notifications), getDevicePushTokenSafe tra ve null va
// ham nay chi lang le bo qua — khong anh huong phan con lai cua app.
// Ton trong preference rieng cua app (switch "Nhan thong bao" trong Profile) —
// neu user da tat thi khong tu dong dang ky lai token.
export function useRegisterPush(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;

    let cancelled = false;
    void (async () => {
      const enabled = await getPushPreference();
      if (!enabled || cancelled) return;

      const token = await getDevicePushTokenSafe();
      if (!token || cancelled) return;
      try {
        await notificationsApi.registerDeviceToken(token, Platform.OS);
      } catch {
        // best-effort — khong lam gi them neu backend loi
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
