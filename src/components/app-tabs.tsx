import { Slot, usePathname } from "expo-router";
import { BookOpen, Trophy, User, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { TabButton } from "@/components/tab-button";
import { BG, BORDER, CARD } from "@/constants/palette";

const TAB_BAR_HORIZONTAL_PADDING = 12;

const TABS = [
  { href: "/characters", label: "Nhân vật", icon: Users },
  { href: "/context", label: "Bối cảnh", icon: BookOpen },
  { href: "/", label: "Trang chủ", icon: undefined },
  { href: "/quiz", label: "Quiz", icon: Trophy },
  { href: "/profile", label: "Hồ sơ", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppTabs() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Hide the tab bar entirely while an active quiz session is running, so the
  // only way out is the in-screen "Thoát" confirm — no escaping via a tab tap.
  const hideTabBar = pathname === "/quiz/play";
  const hideProgress = useSharedValue(hideTabBar ? 1 : 0);
  const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    hideProgress.value = withTiming(hideTabBar ? 1 : 0, { duration: 250 });
  }, [hideTabBar, hideProgress]);

  const barAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hideProgress.value * barHeight }],
    marginBottom: -hideProgress.value * barHeight,
  }));

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      <Animated.View
        onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
        pointerEvents={hideTabBar ? "none" : "auto"}
        style={[
          styles.bar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            paddingLeft: Math.max(insets.left, TAB_BAR_HORIZONTAL_PADDING),
            paddingRight: Math.max(insets.right, TAB_BAR_HORIZONTAL_PADDING),
          },
          barAnimStyle,
        ]}
      >
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon }) => (
            <TabButton
              key={href}
              href={href}
              label={label}
              icon={icon}
              isHome={href === "/"}
              liftOffset={6}
              active={isActive(pathname, href)}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  bar: {
    alignItems: "center",
    backgroundColor: CARD,
    borderTopColor: BORDER,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
