import { useQuery } from '@tanstack/react-query';

import { documentApi } from './api';

// Public listing (auth optional) — dùng để hiển thị nguồn tài liệu trong chat
// và mục "Tài liệu tham khảo" ở trang bối cảnh.
export function usePublicCharacterDocuments(characterId?: string) {
  return useQuery({
    queryKey: ['documents', 'public-character', characterId],
    queryFn: () => documentApi.getPublicCharacterDocuments(characterId!),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePublicContextDocuments(contextId?: string) {
  return useQuery({
    queryKey: ['documents', 'public-context', contextId],
    queryFn: () => documentApi.getPublicContextDocuments(contextId!),
    enabled: !!contextId,
    staleTime: 1000 * 60 * 5,
  });
}
