import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

// Nhóm route đã đăng nhập: bọc mọi màn hình trong tab bar tuỳ biến (AppTabs).
export default function AppLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}
