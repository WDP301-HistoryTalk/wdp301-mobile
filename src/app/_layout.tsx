import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Redirect, Slot, ThemeProvider, useSegments } from 'expo-router';
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

  useEffect(() => {
    void initialize();
  }, [initialize]);

  // Chờ load session từ SecureStore
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  // Chưa đăng nhập và không ở trong group (auth) → redirect sang login
  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
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
