import { useAuthStore } from '@/features/auth/store';
import { BASE_URL, apiClient } from '@/lib/api-client';

import type { ChangePasswordInput, UpdateProfileInput, UserProfile } from './types';

export interface AvatarUrlResponse {
  url: string;
  expiresIn: number;
}

export const userApi = {
  getMe: () => apiClient<UserProfile>('/users/me'),

  updateMe: (data: UpdateProfileInput) =>
    apiClient<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordInput) =>
    apiClient<null>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // multipart/form-data — khong dung apiClient vi no luon ep Content-Type
  // application/json; de fetch tu sinh boundary dung cho FormData.
  uploadAvatar: async (
    userId: string,
    file: { uri: string; name: string; type: string },
  ): Promise<AvatarUrlResponse> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);

    const res = await fetch(`${BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const raw = await res.text();
    const json = raw ? JSON.parse(raw) : null;
    if (!res.ok) throw new Error(json?.message ?? 'Không thể tải lên avatar');
    return json.data as AvatarUrlResponse;
  },

  getAvatarViewUrl: (userId: string) =>
    apiClient<AvatarUrlResponse>(`/users/${userId}/avatar/view-url`),
};
