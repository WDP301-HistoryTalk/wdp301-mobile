import { useQuery } from '@tanstack/react-query';

import { characterApi } from '../api';

export function useCharactersByContext(contextId: string) {
  return useQuery({
    queryKey: ['characters', 'by-context', contextId],
    queryFn: () => characterApi.getByContextId(contextId),
    enabled: !!contextId,
  });
}
