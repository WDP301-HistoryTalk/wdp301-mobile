import { apiClient } from '@/lib/api-client';
import type { RagDocument } from './types';

type ApiDocument = {
  id?: string;
  docId?: string;
  _id?: string;
  title?: string;
  content?: string;
  type?: string;
  fileUrl?: string | null;
  characterId?: string;
  contextId?: string;
};

function normalizeDocument(raw: ApiDocument): RagDocument {
  return {
    id: raw.id ?? raw.docId ?? raw._id ?? '',
    title: raw.title ?? '',
    content: raw.content ?? '',
    type: 'TEXT',
    fileUrl: raw.fileUrl ?? null,
    characterId: raw.characterId,
    contextId: raw.contextId,
  };
}

export const documentApi = {
  // GET /characters/{id}/documents — public, dùng cho trích dẫn trong chat
  getPublicCharacterDocuments: async (characterId: string): Promise<RagDocument[]> => {
    const list = await apiClient<ApiDocument[]>(`/characters/${characterId}/documents`);
    return (list ?? []).map(normalizeDocument);
  },

  // GET /historical-contexts/{id}/documents — public, dùng cho trích dẫn trong chat
  // và mục "Tài liệu tham khảo" ở trang bối cảnh.
  getPublicContextDocuments: async (contextId: string): Promise<RagDocument[]> => {
    const list = await apiClient<ApiDocument[]>(`/historical-contexts/${contextId}/documents`);
    return (list ?? []).map(normalizeDocument);
  },
};
