import { create } from 'zustand';

import { secureStorage as SecureStore } from '@/lib/secure-storage';
import { authApi } from './api';
import type { AuthResponse, AuthUser } from './types';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
} as const;

// expo-secure-store's getItemAsync() can hang indefinitely on Android
// (https://github.com/expo/expo/issues/6179, #13978) instead of rejecting.
// Bound it so a stuck native call can't freeze the app on startup.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SecureStore timed out')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  // URL avatar da resolve (co the xem duoc ngay) — dung chung 1 nguon cho moi
  // noi hien avatar (header trang chu, trang ho so...) de doi anh o dau cung
  // thay doi dong bo o noi khac. Khong persist: chi la cache hien thi, luon
  // duoc tinh lai tu profile + (neu can) signed URL khi app khoi dong.
  avatarUrl: string | null;

  initialize: () => Promise<void>;
  setAuth: (data: AuthResponse) => Promise<void>;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  setAvatarUrl: (url: string | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  avatarUrl: null,

  initialize: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await withTimeout(
        Promise.all([
          SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
          SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),
          SecureStore.getItemAsync(KEYS.USER),
        ]),
        8000,
      );

      if (accessToken && refreshToken && userJson) {
        try {
          // Validate session bằng cách refresh ngay khi khởi động
          const refreshed = await authApi.refreshToken(refreshToken);
          const user = JSON.parse(userJson) as AuthUser;

          await Promise.all([
            SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, refreshed.accessToken),
            SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshed.refreshToken),
          ]);

          set({
            isLoading: false,
            isAuthenticated: true,
            user,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
          });
          return;
        } catch {
          // Refresh thất bại → xóa session cũ
          await Promise.all(Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k)));
        }
      }
    } catch {
      // ignore
    }
    set({ isLoading: false, isAuthenticated: false, user: null, accessToken: null, refreshToken: null });
  },

  setAuth: async (data: AuthResponse) => {
    const user: AuthUser = {
      uid: data.uid,
      userName: data.userName,
      email: data.email,
      role: data.role,
    };

    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, data.accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, data.refreshToken),
      SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user)),
    ]);

    set({ isAuthenticated: true, user, accessToken: data.accessToken, refreshToken: data.refreshToken });
  },

  updateTokens: (accessToken: string, refreshToken?: string) => {
    void SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) void SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken }));
  },

  setAvatarUrl: (url: string | null) => set({ avatarUrl: url }),

  logout: async () => {
    const { accessToken } = get();
    if (accessToken) {
      // Go device token khoi backend truoc khi mat session — dynamic import
      // de tranh vong phu thuoc module (notifications/api.ts -> api-client.ts
      // -> store.ts).
      try {
        const [{ getDevicePushTokenSafe }, { notificationsApi }] = await Promise.all([
          import('@/lib/notifications'),
          import('@/features/notifications/api'),
        ]);
        const token = await getDevicePushTokenSafe();
        if (token) await notificationsApi.removeDeviceToken(token);
      } catch { /* ignore — best-effort */ }

      try { await authApi.logout(accessToken); } catch { /* ignore */ }
    }
    await Promise.all(Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k)));

    // Xoa cache widget Android de khong hien du lieu cu cua user da logout.
    // Dynamic import de tranh vong phu thuoc module + Platform check cho iOS.
    try {
      const { Platform } = await import('react-native');
      if (Platform.OS === 'android') {
        const { clearWidgetCache } = await import('@/widgets/widget-cache');
        await clearWidgetCache();
      }
    } catch { /* best-effort */ }

    set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null, avatarUrl: null });
  },
}));
