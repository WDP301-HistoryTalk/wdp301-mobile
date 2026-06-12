import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authApi } from '../api';
import { useAuthStore } from '../store';
import type { LoginInput } from '../schemas';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => authApi.login(email, password),
    onSuccess: async (data) => {
      await setAuth(data);
      router.replace('/');
    },
  });
}
