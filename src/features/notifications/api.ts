import { apiClient } from '@/lib/api-client';

export const notificationsApi = {
  registerDeviceToken: (fcmToken: string, platform: 'android' | 'ios') =>
    apiClient<null>('/users/me/device-token', {
      method: 'POST',
      body: JSON.stringify({ fcmToken, platform }),
    }),

  removeDeviceToken: (fcmToken: string) =>
    apiClient<null>('/users/me/device-token', {
      method: 'DELETE',
      body: JSON.stringify({ fcmToken }),
    }),
};
