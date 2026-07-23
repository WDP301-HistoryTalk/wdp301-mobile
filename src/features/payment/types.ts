export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface Tier {
  tierId: string;
  title: 'free' | 'plus' | 'pro' | string;
  amount: number;
  noMonth: number;
  limitedToken: number;
  isActive: boolean;
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: number;
  paymentLinkId: string;
  checkoutUrl: string;
  qrCode: string;
  amount: number;
  status: OrderStatus;
  expiredAt: string | null;
}

export interface PaymentHistoryItem {
  orderId: string;
  orderCode: number;
  tierId: string | null;
  tierTitle: string | null;
  amount: number;
  status: OrderStatus;
  paymentLinkId: string;
  createdAt: string;
  paidAt: string | null;
  expiredAt: string | null;
}
