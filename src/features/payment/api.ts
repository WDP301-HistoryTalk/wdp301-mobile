import { apiClient } from '@/lib/api-client';

import type { CheckoutResponse, PaymentHistoryItem, Tier } from './types';

export const paymentApi = {
  getTiers: () => apiClient<Tier[]>('/payments/tiers'),

  checkout: (tierId: string) =>
    apiClient<CheckoutResponse>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ tierId }),
    }),

  // Khong co endpoint tra cuu/huy 1 don le — backend chi cho xem toan bo lich
  // su thanh toan cua minh (mang phang, khong phan trang).
  getMyHistory: () => apiClient<PaymentHistoryItem[]>('/payments/me'),
};
