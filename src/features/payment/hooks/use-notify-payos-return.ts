import { useMutation } from '@tanstack/react-query';

import { paymentApi } from '../api';

export function useNotifyPayosReturn() {
  return useMutation({
    mutationFn: paymentApi.notifyReturn,
  });
}
