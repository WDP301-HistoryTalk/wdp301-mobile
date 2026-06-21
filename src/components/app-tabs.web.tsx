import { Link, Slot, usePathname } from 'expo-router';
import { BookOpen, Trophy, User, Users } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BG, BORDER, CARD, MUTED, ORANGE, ORANGE_TINT } from '@/constants/palette';

const TAB_BAR_HORIZONTAL_PADDING = 16;

const TABS = [
  { href: '/characters', label: 'Nhân vật', icon: Users },
  { href: '/context', label: 'Bối cảnh', icon: BookOpen },
  { href: '/', label: 'Trang chủ', icon: undefined },
  { href: '/quiz', label: 'Quiz', icon: Trophy },
  { href: '/profile', label: 'Hồ sơ', icon: User },
] as const;

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.bar}>
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const isHome = href === '/';

            if (isHome) {
              return (
                <Link key={href} href={href as never} asChild>
                  <Pressable style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
                    <View style={[styles.homeWrap, active && styles.homeWrapActive]}>
                      <Image source={require('@/assets/logo.png')} style={styles.homeLogo} resizeMode="contain" />
                    </View>
                  </Pressable>
                </Link>
              );
            }

            return (
              <Link key={href} href={href as never} asChild>
                <Pressable style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                    {Icon ? <Icon size={22} color={active ? ORANGE : MUTED} strokeWidth={active ? 2.4 : 1.8} /> : null}
                  </View>
                  <Text style={[styles.tabLabel, { color: active ? ORANGE : MUTED }]} numberOfLines={1}>
                    {label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
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
    overflow: 'hidden',
  },
  bar: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderTopColor: BORDER,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    paddingTop: 10,
  },
  inner: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
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
  pressed: {
    opacity: 0.65,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 46,
  },
  iconWrapActive: {
    backgroundColor: ORANGE_TINT,
  },
  homeWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
  },
  homeWrapActive: {
    backgroundColor: ORANGE_TINT,
  },
  homeLogo: {
    width: 40,
    height: 40,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
