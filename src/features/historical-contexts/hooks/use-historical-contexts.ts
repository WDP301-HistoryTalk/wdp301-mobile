import { useInfiniteQuery } from '@tanstack/react-query';

import { historicalContextApi } from '../api';
import type { ContextEra } from '../types';

interface Filters {
  search?: string;
  era?: ContextEra;
}

export function useHistoricalContexts(filters: Filters = {}) {
  return useInfiniteQuery({
    queryKey: ['historical-contexts', filters],
    queryFn: ({ pageParam }) =>
      historicalContextApi.getAll({ ...filters, page: pageParam as number, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.currentPage + 2 : undefined),
  });
}
