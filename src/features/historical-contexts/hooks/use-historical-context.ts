import { useQuery } from '@tanstack/react-query';

import { historicalContextApi } from '../api';

export function useHistoricalContext(id: string) {
  return useQuery({
    queryKey: ['historical-contexts', id],
    queryFn: () => historicalContextApi.getById(id),
    enabled: !!id,
  });
}
