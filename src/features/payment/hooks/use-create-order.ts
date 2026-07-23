import { useMutation } from '@tanstack/react-query';

import { paymentApi } from '../api';

export function useCreateOrder() {
  return useMutation({
    mutationFn: (tierId: string) => paymentApi.checkout(tierId),
  });
}
