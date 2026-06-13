import { useMutation } from '@tanstack/react-query';

import { chatApi } from '../api';

export function useCreateSession() {
  return useMutation({
    mutationFn: ({ characterId, contextId }: { characterId: string; contextId: string }) =>
      chatApi.createSession(characterId, contextId),
  });
}
