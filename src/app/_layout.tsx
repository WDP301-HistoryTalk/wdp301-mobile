import '../global.css';

import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { BG, ORANGE } from '@/constants/palette';
import { FontAssets } from '@/constants/theme';
import { AppProviders } from '@/providers/app-providers';
import { useProtectedRoute } from '@/providers/use-protected-route';

export default function RootLayout() {
  useFonts(FontAssets);
  const { isLoading, isAuthenticated, inAuthGroup } = useProtectedRoute();

  // Chờ load session từ SecureStore
  if (isLoading) {
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
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
