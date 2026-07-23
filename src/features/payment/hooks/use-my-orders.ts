import { useQuery } from '@tanstack/react-query';

import { paymentApi } from '../api';

// Backend chi tra ve toan bo lich su thanh toan cua minh, khong phan trang.
export function useMyOrders() {
  return useQuery({
    queryKey: ['payments', 'me'],
    queryFn: () => paymentApi.getMyHistory(),
    staleTime: 1000 * 30,
  });
}
