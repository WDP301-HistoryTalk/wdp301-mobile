import { useMutation } from '@tanstack/react-query';

import { chatApi } from '../api';
import type { ChatMessageType } from '../types';

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ sessionId, content, messageType = 'TEXT' }: {
      sessionId: string;
      content: string;
      messageType?: ChatMessageType;
    }) => chatApi.sendMessage(sessionId, content, messageType),
  });
}
