import { useQueries, useQuery } from '@tanstack/react-query';

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

// Một nhân vật có thể liên kết nhiều bối cảnh lịch sử, mỗi bối cảnh có tài liệu
// riêng — khi đối chiếu trích dẫn của AI phải gộp tài liệu của TẤT CẢ bối cảnh
// đó lại, không chỉ bối cảnh đang active của phiên chat hiện tại (giống web,
// xem features/documents/hooks.ts bên HistoryTalk-FE).
export function usePublicContextsDocuments(contextIds: string[]) {
  const uniqueIds = Array.from(new Set(contextIds.filter(Boolean)));

  const results = useQueries({
    queries: uniqueIds.map((contextId) => ({
      queryKey: ['documents', 'public-context', contextId],
      queryFn: () => documentApi.getPublicContextDocuments(contextId),
      staleTime: 1000 * 60 * 5,
    })),
  });

  return {
    data: results.flatMap((r) => r.data ?? []),
    isLoading: results.some((r) => r.isLoading),
  };
}
