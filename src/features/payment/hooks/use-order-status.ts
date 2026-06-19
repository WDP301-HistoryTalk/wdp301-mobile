import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paymentApi } from '../api';

/** Checks PayOS-reconciled order status. Invalidates `me` so token/tier refresh on success. */
export function useOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderCode: number) => paymentApi.getOrderStatus(orderCode),
    onSuccess: (data) => {
      if (data.status === 'paid') {
        void qc.invalidateQueries({ queryKey: ['me'] });
      }
    },
  });
}
