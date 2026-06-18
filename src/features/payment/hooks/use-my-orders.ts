import { useQuery } from '@tanstack/react-query';

import { paymentApi } from '../api';

export function useMyOrders(page = 0, size = 10) {
  return useQuery({
    queryKey: ['payments', 'orders', page, size],
    queryFn: () => paymentApi.listMyOrders(page, size),
    staleTime: 1000 * 30,
  });
}
