import { apiClient } from '@/lib/api-client';

import type { ContextEra, HistoricalContext, HistoricalContextPage } from './types';

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  era?: ContextEra;
}

type ApiHistoricalContext = Omit<HistoricalContext, 'id' | 'characterIds' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  contextId?: string;
  characterIds?: HistoricalContext['characterIds'];
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  updatedDate?: string;
};

function normalizeHistoricalContext(context: ApiHistoricalContext): HistoricalContext {
  return {
    ...context,
    id: context.id ?? context.contextId ?? '',
    characterIds: context.characterIds ?? [],
    createdAt: context.createdAt ?? context.createdDate ?? '',
    updatedAt: context.updatedAt ?? context.updatedDate ?? '',
  };
}

export const historicalContextApi = {
  getAll: async (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.page)   qs.set('page',   String(params.page));
    if (params.limit)  qs.set('limit',  String(params.limit));
    if (params.era)    qs.set('era',    params.era);
    const query = qs.toString();
    const page = await apiClient<HistoricalContextPage & { content: ApiHistoricalContext[] }>(`/historical-contexts${query ? `?${query}` : ''}`);
    return {
      ...page,
      content: page.content.map(normalizeHistoricalContext),
    };
  },

  getById: async (id: string) =>
    normalizeHistoricalContext(await apiClient<ApiHistoricalContext>(`/historical-contexts/${id}`)),
};
