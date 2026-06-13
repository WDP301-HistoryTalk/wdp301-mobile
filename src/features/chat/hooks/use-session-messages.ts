import { useQuery } from '@tanstack/react-query';

import { chatApi } from '../api';

export function useSessionMessages(sessionId: string) {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => chatApi.getMessages(sessionId),
    enabled: !!sessionId,
    staleTime: Infinity,   // managed manually via local state after load
  });
}
