import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BG, ORANGE } from '@/constants/palette';

// Đích đến của redirect_uri sau khi Google OAuth hoàn tất (xem use-google-auth.ts).
// expo-auth-session tự bắt kết quả qua WebBrowser.openAuthSessionAsync, nhưng OS
// vẫn gửi Intent của URI này về app khiến expo-router cố khớp route — thiếu file
// này thì hiện "Unmatched Route". Chỉ cần điều hướng về "/", layout của (app)/(auth)
// sẽ tự redirect tiếp theo đúng trạng thái đăng nhập.
export default function OAuthRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG }}>
      <ActivityIndicator size="large" color={ORANGE} />
    </View>
  );
}
