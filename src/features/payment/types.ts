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

// Query params PayOS appends to the deep link it redirects to after checkout.
export interface PayosReturnPayload {
  code: string;
  id: string;
  cancel: boolean;
  status: string;
  orderCode: number;
}

export interface PayosReturnResult {
  orderCode: number;
  resolvedStatus: OrderStatus;
  message: string;
  user: {
    uid: string;
    tierId: string | null;
    tierTitle: string | null;
    subscriptionEndTime: string | null;
    token: number;
  } | null;
}
