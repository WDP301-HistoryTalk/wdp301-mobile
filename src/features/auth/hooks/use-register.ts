import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authApi } from '../api';
import type { RegisterInput } from '../schemas';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ userName, email, password, confirmPassword }: RegisterInput) =>
      authApi.register(userName, email, password, confirmPassword),
    onSuccess: () => {
      router.replace('/(auth)/login');
    },
  });
}
