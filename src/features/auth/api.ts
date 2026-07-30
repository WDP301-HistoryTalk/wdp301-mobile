import axios from 'axios';

import type { ApiResponse, AuthResponse, RefreshTokenResponse } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const http = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

function parseJsonResponse<T>(data: unknown, status: number, path: string): ApiResponse<T> | null {
  if (data === '' || data === undefined || data === null) return null;
  if (typeof data === 'string') {
    const preview = data.replace(/\s+/g, ' ').trim().slice(0, 120);
    throw new Error(`API trả về dữ liệu không phải JSON (${status}) tại ${BASE_URL}${path}: ${preview}`);
  }
  return data as ApiResponse<T>;
}

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await http.post(path, body, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = parseJsonResponse<T>(res.data, res.status, path);
  if (res.status < 200 || res.status >= 300) throw new Error(json?.message || 'Request failed');
  return json?.data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthResponse>('/auth/login', { email, password }),

  register: (userName: string, email: string, password: string, confirmPassword: string) =>
    post<null>('/auth/register', { userName, email, password, confirmPassword }),

  googleLogin: (idToken: string) =>
    post<AuthResponse>('/auth/google', { idToken }),

  refreshToken: (refreshToken: string) =>
    post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken }),

  logout: (accessToken: string) =>
    post<null>('/auth/logout', {}, accessToken),

  forgotPassword: (email: string) =>
    post<null>('/auth/forgot-password', { email }),
};
