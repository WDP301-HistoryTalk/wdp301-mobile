import { useMutation } from '@tanstack/react-query';

import { chatApi } from '../api';

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      chatApi.sendMessage(sessionId, content),
  });
}
