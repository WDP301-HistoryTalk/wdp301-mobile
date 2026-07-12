import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth/store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
  );
}
