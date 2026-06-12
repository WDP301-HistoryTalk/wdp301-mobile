import { apiClient } from '@/lib/api-client';

import type { ContextEra, HistoricalContext, HistoricalContextPage } from './types';

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  era?: ContextEra;
}

export const historicalContextApi = {
  getAll: (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.page)   qs.set('page',   String(params.page));
    if (params.limit)  qs.set('limit',  String(params.limit));
    if (params.era)    qs.set('era',    params.era);
    const query = qs.toString();
    return apiClient<HistoricalContextPage>(`/historical-contexts${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiClient<HistoricalContext>(`/historical-contexts/${id}`),
};
