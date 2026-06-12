import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const doFetch = async (): Promise<Response> => {
    const token = useAuthStore.getState().accessToken;
    return fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
    });
  };

  let res = await doFetch();

  // Token hết hạn → thử refresh
  if (res.status === 401 && !skipAuth) {
    const storedRefresh = useAuthStore.getState().refreshToken;
    if (storedRefresh) {
      try {
        const tokens = await authApi.refreshToken(storedRefresh);
        useAuthStore.getState().updateTokens(tokens.accessToken, tokens.refreshToken);
        res = await doFetch();
      } catch {
        void useAuthStore.getState().logout();
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
    } else {
      void useAuthStore.getState().logout();
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Yêu cầu thất bại');
  return json.data as T;
}
