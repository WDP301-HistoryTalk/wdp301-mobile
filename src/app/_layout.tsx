import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DefaultTheme, Slot, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { BG, ORANGE } from '@/constants/palette';
import { FontAssets } from '@/constants/theme';
import { useAuthStore } from '@/features/auth/store';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FontAssets);
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
  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  // Chặn render giao diện chính khi chưa auth và đang chuyển hướng
  if (!isAuthenticated && !inAuthGroup) {
    return null;
  }


  return (
    // App mặc định dùng theme sáng, không theo system color scheme.
    <GluestackUIProvider mode="light">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
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
