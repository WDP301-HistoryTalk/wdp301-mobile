import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userApi } from '../user-api';

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      file,
    }: {
      userId: string;
      file: { uri: string; name: string; type: string };
    }) => userApi.uploadAvatar(userId, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
