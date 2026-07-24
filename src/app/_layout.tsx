import '../global.css';

import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { SessionExpiredModal } from '@/components/session-expired-modal';
import { BG, ORANGE } from '@/constants/palette';
import { FontAssets } from '@/constants/theme';
import { AppProviders } from '@/providers/app-providers';
import { useProtectedRoute } from '@/providers/use-protected-route';

export default function RootLayout() {
  useFonts(FontAssets);
  const { isLoading } = useProtectedRoute();

  // Chờ load session từ SecureStore
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  // Luôn render <Slot/> sau khi load xong: việc chặn/chuyển hướng theo auth
  // nằm ở layout của từng nhóm ((app)/(auth)) bằng <Redirect>. Nếu return
  // null ở đây thì navigator không bao giờ mount và app kẹt màn hình đen.
  return (
    <AppProviders>
      <Slot />
      <SessionExpiredModal />
    </AppProviders>
  );
}
