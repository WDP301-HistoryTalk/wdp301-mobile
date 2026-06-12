import { useInfiniteQuery } from '@tanstack/react-query';

import { characterApi } from '../api';
import type { CharacterEra } from '../types';

interface Filters {
  search?: string;
  era?: CharacterEra;
}

export function useCharacters(filters: Filters = {}) {
  return useInfiniteQuery({
    queryKey: ['characters', filters],
    queryFn: ({ pageParam }) =>
      characterApi.getAll({ ...filters, page: pageParam as number, limit: 15 }),
    initialPageParam: 1,
    // backend trả currentPage là 0-indexed; hasNext tức còn trang kế
    getNextPageParam: (last) => (last.hasNext ? last.currentPage + 2 : undefined),
  });
}
