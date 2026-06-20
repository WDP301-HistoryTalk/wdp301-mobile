import { useQuery } from '@tanstack/react-query';

import { chatApi } from '../api';

export function useChatHistory() {
  return useQuery({
    queryKey: ['chat-history'],
    queryFn: () => chatApi.getHistory(),
  });
}
