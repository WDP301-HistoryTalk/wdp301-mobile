import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Slot, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useAuthStore } from '@/features/auth/store';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  // Chờ load session từ SecureStore
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  // Chặn render giao diện chính khi chưa auth và đang chuyển hướng
  if (!isAuthenticated && !inAuthGroup) {
    return null;
  }


  return (
    <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {inAuthGroup ? (
            // Auth screens dùng Slot → (auth)/_layout.tsx → Stack
            <Slot />
          ) : (
            // App screens dùng AppTabs (NativeTabs)
            <>
              <AnimatedSplashOverlay />
              <AppTabs />
            </>
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
