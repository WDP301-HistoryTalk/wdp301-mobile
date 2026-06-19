export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

export interface Tier {
  id: string;
  title: 'free' | 'plus' | 'pro' | string;
  amount: number;
  noMonth: number;
  limitedToken: number;
  isActive: boolean;
}

export interface CreateOrderResponse {
  orderId: string;
  orderCode: number;
  amount: number;
  status: OrderStatus;
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
  bin: string;
  accountNumber: string;
  accountName: string;
  expiresAt: string;
}

export interface OrderStatusResponse {
  orderId: string;
  orderCode: number;
  amount: number;
  status: OrderStatus;
  tierId: string;
  checkoutUrl?: string;
  qrCode?: string;
  paidAt: string | null;
  createdAt: string;
}

export interface OrderHistoryItem {
  orderId: string;
  orderCode: number;
  amount: number;
  status: OrderStatus;
  tier: { title: string; amount: number; noMonth: number } | null;
  checkoutUrl?: string;
  paidAt: string | null;
  createdAt: string;
}

export interface OrderHistoryPage {
  content: OrderHistoryItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
