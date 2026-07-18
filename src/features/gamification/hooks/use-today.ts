import { useQuery } from '@tanstack/react-query';

import { gamificationApi } from '../api';

export function useGamificationToday() {
  return useQuery({
    queryKey: ['gamification', 'today'],
    queryFn: () => gamificationApi.getToday(),
    // Tiến độ quest đổi khi user chat/làm quiz — để stale ngắn cho tươi
    staleTime: 1000 * 30,
  });
}
