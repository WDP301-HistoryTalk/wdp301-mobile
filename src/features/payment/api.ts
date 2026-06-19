import { apiClient } from '@/lib/api-client';

import type { CreateOrderResponse, OrderHistoryPage, OrderStatusResponse, Tier } from './types';

export const paymentApi = {
  listTiers: () => apiClient<Tier[]>('/tiers'),

  createOrder: (tierId: string) =>
    apiClient<CreateOrderResponse>('/payments/orders', {
      method: 'POST',
      body: JSON.stringify({ tierId }),
    }),

  getOrderStatus: (orderCode: number) =>
    apiClient<OrderStatusResponse>(`/payments/orders/${orderCode}`),

  cancelOrder: (orderCode: number) =>
    apiClient<{ orderCode: number; status: string }>(`/payments/orders/${orderCode}/cancel`, {
      method: 'POST',
    }),

  listMyOrders: (page = 0, size = 10) =>
    apiClient<OrderHistoryPage>(`/payments/orders?page=${page}&size=${size}`),
};
