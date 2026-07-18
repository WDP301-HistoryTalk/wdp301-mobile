import { apiClient } from '@/lib/api-client';

import type { ClaimResult, GamificationToday } from './types';

export const gamificationApi = {
  getToday: () => apiClient<GamificationToday>('/gamification/today'),

  claim: (questId: string) =>
    apiClient<ClaimResult>('/gamification/claim', {
      method: 'POST',
      body: JSON.stringify({ questId }),
    }),
};
