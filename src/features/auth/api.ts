import type { ApiResponse, AuthResponse, RefreshTokenResponse } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data;
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
