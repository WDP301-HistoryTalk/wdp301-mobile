import { useQuery } from '@tanstack/react-query';

import { paymentApi } from '../api';

export function useTiers() {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: () => paymentApi.getTiers(),
    staleTime: 1000 * 60 * 10,
  });
}
