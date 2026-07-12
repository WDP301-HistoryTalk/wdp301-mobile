import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store';

/**
 * Khởi tạo session từ SecureStore khi app mở.
 * Việc chuyển hướng theo trạng thái auth KHÔNG nằm ở đây nữa mà được khai báo
 * bằng <Redirect> trong layout của từng nhóm:
 * - (app)/_layout.tsx  — chưa đăng nhập → về /login
 * - (auth)/_layout.tsx — đã đăng nhập  → về trang chủ
 * Cách khai báo này không phụ thuộc việc navigator đã mount hay chưa.
 */
export function useProtectedRoute() {
  const { isLoading, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return { isLoading, isAuthenticated };
}
