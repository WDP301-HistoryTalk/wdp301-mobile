import { apiClient } from '@/lib/api-client';
import type { Character, CharacterContext, CharacterEra, CharacterPage } from './types';

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  era?: CharacterEra;
}

export const characterApi = {
  getAll: (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.page)   qs.set('page',   String(params.page));
    if (params.limit)  qs.set('limit',  String(params.limit));
    if (params.era)    qs.set('era',    params.era);
    const query = qs.toString();
    return apiClient<CharacterPage>(`/characters${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiClient<Character>(`/characters/${id}`),

  getContexts: (id: string) =>
    apiClient<CharacterContext[]>(`/characters/${id}/contexts`),
};
