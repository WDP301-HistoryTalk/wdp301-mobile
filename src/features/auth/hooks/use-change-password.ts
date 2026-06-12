import { useMutation } from '@tanstack/react-query';

import { userApi } from '../user-api';
import type { ChangePasswordInput } from '../types';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => userApi.changePassword(data),
  });
}
