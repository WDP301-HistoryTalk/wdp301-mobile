import { useMutation, useQueryClient } from '@tanstack/react-query';

import { gamificationApi } from '../api';

export function useClaimQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) => gamificationApi.claim(questId),
    onSuccess: () => {
      // Cập nhật lại trạng thái quest + số dư token trên profile
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'today'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
