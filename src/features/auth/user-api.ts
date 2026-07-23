import * as FileSystem from 'expo-file-system/legacy';

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

  // Dung expo-file-system thay vi fetch()+FormData: FormData voi phan {uri,
  // name, type} hay bi native networking module bao "Unsupported FormDataPart
  // implementation" tren mot so thiet bi/kien truc RN — uploadAsync goi thang
  // API upload native, khong di qua duong FormData hay loi nay.
  uploadAvatar: async (
    userId: string,
    file: { uri: string; name: string; type: string },
  ): Promise<AvatarUrlResponse> => {
    const token = useAuthStore.getState().accessToken;
    const result = await FileSystem.uploadAsync(`${BASE_URL}/users/${userId}/avatar`, file.uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType: file.type,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const json = result.body ? JSON.parse(result.body) : null;
    if (result.status < 200 || result.status >= 300) {
      throw new Error(json?.message ?? 'Không thể tải lên avatar');
    }
    return json.data as AvatarUrlResponse;
  },

  getAvatarViewUrl: (userId: string) =>
    apiClient<AvatarUrlResponse>(`/users/${userId}/avatar/view-url`),
};
