import { Link } from 'expo-router';
import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BG, MUTED, ORANGE, ORANGE_TINT } from '@/constants/palette';
import { AppFonts } from '@/constants/theme';

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export function TabButton({
  href,
  label,
  icon: Icon,
  active,
  isHome,
  liftOffset = 0,
}: {
  href: string;
  label?: string;
  icon?: IconComponent;
  active: boolean;
  isHome?: boolean;
  liftOffset?: number;
}) {
  const progress = useSharedValue(active ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, progress]);

  const wrapAnimStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [isHome ? BG : 'transparent', ORANGE_TINT]
    ),
    transform: [{ scale: 1 + progress.value * 0.06 }],
  }));

  const pressAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Link href={href as never} asChild>
      <Pressable
        onPressIn={() => {
          // eslint-disable-next-line react-hooks/immutability -- mutating `.value` is Reanimated's documented API; the compiler rule doesn't yet recognize SharedValue as exempt.
          pressScale.value = withTiming(0.9, { duration: 90 });
        }}
        onPressOut={() => {
          // eslint-disable-next-line react-hooks/immutability -- see note above
          pressScale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
        style={styles.tabItem}
      >
        <Animated.View style={pressAnimStyle}>
          <Animated.View
            style={[isHome ? [styles.homeWrap, { marginTop: liftOffset }] : styles.iconWrap, wrapAnimStyle]}
          >
            {isHome ? (
              <Image source={require('@/assets/logo.png')} style={styles.homeLogo} resizeMode="contain" />
            ) : Icon ? (
              <Icon size={22} color={active ? ORANGE : MUTED} strokeWidth={active ? 2.4 : 1.8} />
            ) : null}
          </Animated.View>
          {label ? (
            <Text style={[styles.tabLabel, { color: active ? ORANGE : MUTED }]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    gap: 5,
    justifyContent: 'center',
    paddingBottom: 4,
    paddingHorizontal: 6,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 46,
  },
  homeWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeLogo: {
    width: 32,
    height: 32,
  },
  tabLabel: {
    fontFamily: AppFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
