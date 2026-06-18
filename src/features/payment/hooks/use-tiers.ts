import { useQuery } from '@tanstack/react-query';

import { paymentApi } from '../api';

export function useTiers() {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: () => paymentApi.listTiers(),
    staleTime: 1000 * 60 * 10,
  });
}
