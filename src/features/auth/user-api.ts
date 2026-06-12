import { apiClient } from '@/lib/api-client';

import type { ChangePasswordInput, UpdateProfileInput, UserProfile } from './types';

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
};
