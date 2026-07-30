import axios from 'axios';

import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const http = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

interface ApiClientOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

function extractJson(data: unknown, status: number, path: string): any {
  if (data === '' || data === undefined || data === null) return null;
  if (typeof data === 'string') {
    const preview = data.replace(/\s+/g, ' ').trim().slice(0, 120);
    throw new Error(`API trả về dữ liệu không phải JSON (${status}) tại ${BASE_URL}${path}: ${preview}`);
  }
  return data;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { skipAuth = false, method = 'GET', body, headers } = options;

  const doRequest = async () => {
    const token = useAuthStore.getState().accessToken;
    return http.request({
      url: path,
      method,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  };

  let res = await doRequest();

  // Token hết hạn → thử refresh
  if (res.status === 401 && !skipAuth) {
    const storedRefresh = useAuthStore.getState().refreshToken;
    if (storedRefresh) {
      try {
        const tokens = await authApi.refreshToken(storedRefresh);
        useAuthStore.getState().updateTokens(tokens.accessToken, tokens.refreshToken);
        res = await doRequest();
      } catch {
        void useAuthStore.getState().logout('expired');
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
    } else {
      void useAuthStore.getState().logout('expired');
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
  }

  const json = extractJson(res.data, res.status, path);
  if (res.status < 200 || res.status >= 300) throw new Error(json?.message ?? 'Yêu cầu thất bại');
  return json?.data as T;
}
