import { useMutation, useQueryClient } from '@tanstack/react-query';

import { chatApi } from '../api';
import type { ChatMessageType } from '../types';

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, content, messageType = 'TEXT' }: {
      sessionId: string;
      content: string;
      messageType?: ChatMessageType;
    }) => chatApi.sendMessage(sessionId, content, messageType),
    onSuccess: () => {
      // Gửi tin xong → tiến độ nhiệm vụ ngày đổi ngay
      // (chat streaming không đi qua mutation này — đã có focus-refetch ở thẻ Hôm nay lo)
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'today'] });
    },
  });
}
