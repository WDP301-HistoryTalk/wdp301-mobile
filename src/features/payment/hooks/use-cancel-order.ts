import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paymentApi } from '../api';

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderCode: number) => paymentApi.cancelOrder(orderCode),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['payments', 'orders'] });
    },
  });
}
