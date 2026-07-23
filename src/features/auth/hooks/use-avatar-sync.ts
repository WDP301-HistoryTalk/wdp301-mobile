import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '../store';
import { userApi } from '../user-api';
import { useMe } from './use-me';

// avatarUrl tra ve tu API co the la link ngoai dung duoc thang (vd Google),
// hoac 1 storage path noi bo (sau khi tu upload) — phai doi lay signed URL
// moi xem duoc. Ghi ket qua vao Zustand store de moi noi hien avatar (header
// trang chu, trang ho so...) dung chung 1 nguon, doi anh o dau cung thay o
// noi khac ngay ma khong can tu resolve rieng.
export function useAvatarSync() {
  const { data: profile } = useMe();
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);

  const rawAvatarUrl = profile?.avatarUrl;
  const isDirectUrl = !!rawAvatarUrl && /^https?:\/\//.test(rawAvatarUrl);

  const { data: signed } = useQuery({
    queryKey: ['avatar-view-url', profile?._id, rawAvatarUrl],
    queryFn: () => userApi.getAvatarViewUrl(profile!._id),
    enabled: !!profile?._id && !!rawAvatarUrl && !isDirectUrl,
    staleTime: 1000 * 60 * 30,
  });

  const resolvedUrl = isDirectUrl ? (rawAvatarUrl ?? null) : (signed?.url ?? null);

  useEffect(() => {
    setAvatarUrl(resolvedUrl);
  }, [resolvedUrl, setAvatarUrl]);
}
