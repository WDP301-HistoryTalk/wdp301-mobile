import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userApi } from '../user-api';
import type { UpdateProfileInput } from '../types';

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => userApi.updateMe(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
