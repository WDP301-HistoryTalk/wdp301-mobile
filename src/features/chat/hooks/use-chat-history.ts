import { useQuery } from '@tanstack/react-query';

import { chatApi } from '../api';

export function useChatHistory() {
  return useQuery({
    queryKey: ['chat-history'],
    queryFn: () => chatApi.getHistory(),
    select: (groups) =>
      groups
        .flatMap((g) => g.sessions)
        .sort((a, b) => {
          const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return tb - ta;
        }),
  });
}
