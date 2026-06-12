import { useQuery } from '@tanstack/react-query';

import { userApi } from '../user-api';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.getMe(),
    staleTime: 1000 * 60 * 5,
  });
}
