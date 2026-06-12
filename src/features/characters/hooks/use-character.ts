import { useQuery } from '@tanstack/react-query';

import { characterApi } from '../api';

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ['characters', id],
    queryFn: () => characterApi.getById(id),
    enabled: !!id,
  });
}
