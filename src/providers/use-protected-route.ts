import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store';

/**
 * Điều hướng dựa trên trạng thái auth:
 * - Chưa đăng nhập mà đứng ngoài nhóm (auth) → đẩy về /login
 * - Đã đăng nhập mà còn trong nhóm (auth) → đẩy về trang chủ
 */
export function useProtectedRoute() {
  const { isLoading, isAuthenticated, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, inAuthGroup, isLoading, router]);

  return { isLoading, isAuthenticated, inAuthGroup };
}
