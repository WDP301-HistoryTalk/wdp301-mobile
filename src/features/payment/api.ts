import { apiClient } from '@/lib/api-client';

import type {
  CheckoutResponse, PaymentHistoryItem, PayosReturnPayload, PayosReturnResult, Tier,
} from './types';

export const paymentApi = {
  getTiers: () => apiClient<Tier[]>('/payments/tiers'),

  // platform: 'mobile' bao BE tra ve deep link (mobilehistorytalk://payment/result)
  // lam returnUrl/cancelUrl cho PayOS thay vi URL web FE.
  checkout: (tierId: string) =>
    apiClient<CheckoutResponse>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ tierId, platform: 'mobile' }),
    }),

  // Bao BE biet ket qua PayOS redirect ve (code/id/cancel/status/orderCode tu
  // deep link) de doi chieu ngay, thay vi cho webhook tu xu ly rieng.
  notifyReturn: (payload: PayosReturnPayload) =>
    apiClient<PayosReturnResult>('/payments/payos/return', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Khong co endpoint tra cuu/huy 1 don le — backend chi cho xem toan bo lich
  // su thanh toan cua minh (mang phang, khong phan trang).
  getMyHistory: () => apiClient<PaymentHistoryItem[]>('/payments/me'),
};
