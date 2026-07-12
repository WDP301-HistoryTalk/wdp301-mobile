import { Redirect } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useAuthStore } from '@/features/auth/store';

// Nhóm route đã đăng nhập: bọc mọi màn hình trong tab bar tuỳ biến (AppTabs).
export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}
