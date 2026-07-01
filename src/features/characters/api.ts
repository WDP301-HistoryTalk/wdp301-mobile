import { apiClient } from '@/lib/api-client';
import type { Character, CharacterContext, CharacterEra, CharacterPage } from './types';

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  era?: CharacterEra;
}

type ApiCharacterContext = {
  contextId: string | { id?: string; contextId?: string; name?: string };
  name: string;
};

type ApiCharacter = Omit<Character, 'id' | 'contexts' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  characterId?: string;
  contexts?: ApiCharacterContext[];
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  updatedDate?: string;
};

function normalizeContext(ctx: ApiCharacterContext): CharacterContext {
  if (typeof ctx.contextId === 'string') {
    return {
      contextId: {
        id: ctx.contextId,
        name: ctx.name,
      },
      name: ctx.name,
    };
  }

  return {
    contextId: {
      id: ctx.contextId.id ?? ctx.contextId.contextId ?? '',
      name: ctx.contextId.name ?? ctx.name,
    },
    name: ctx.name,
  };
}

function normalizeCharacter(character: ApiCharacter): Character {
  return {
    ...character,
    id: character.id ?? character.characterId ?? '',
    contexts: character.contexts?.map(normalizeContext),
    createdAt: character.createdAt ?? character.createdDate ?? '',
    updatedAt: character.updatedAt ?? character.updatedDate ?? '',
  };
}

export const characterApi = {
  getAll: async (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.page)   qs.set('page',   String(params.page));
    if (params.limit)  qs.set('limit',  String(params.limit));
    if (params.era)    qs.set('era',    params.era);
    const query = qs.toString();
    const page = await apiClient<CharacterPage & { content: ApiCharacter[] }>(`/characters${query ? `?${query}` : ''}`);
    return {
      ...page,
      content: page.content.map(normalizeCharacter),
    };
  },

  getById: async (id: string) =>
    normalizeCharacter(await apiClient<ApiCharacter>(`/characters/${id}`)),

  getContexts: async (id: string) =>
    (await apiClient<ApiCharacterContext[]>(`/characters/${id}/contexts`)).map(normalizeContext),

  getByContextId: async (contextId: string) => {
    const list = await apiClient<ApiCharacter[]>(`/characters/context/${contextId}`);
    return list.map(normalizeCharacter);
  },
};
