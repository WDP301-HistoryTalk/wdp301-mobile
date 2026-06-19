import { Link, Slot, usePathname } from 'expo-router';
import { BookOpen, House, Trophy, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TAB_BAR_HORIZONTAL_PADDING = 16;

const TABS = [
  { href: '/', label: 'Trang chủ', icon: House },
  { href: '/characters', label: 'Nhân vật', icon: Users },
  { href: '/context', label: 'Bối cảnh', icon: BookOpen },
  { href: '/quiz', label: 'Quiz', icon: Trophy },
] as const;

export default function AppTabs() {
  const pathname = usePathname();
  const colors = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.backgroundElement,
            borderTopColor: BrandColors.borderSubtle,
          },
        ]}>
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link key={href} href={href as never} asChild>
                <Pressable style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
                  <View style={[styles.pill, active && styles.pillActive]} />

                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                    <Icon
                      size={22}
                      color={active ? BrandColors.primary : colors.textSecondary}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                  </View>

                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? BrandColors.primary : colors.textSecondary },
                    ]}
                    numberOfLines={1}>
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
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  bar: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 20,
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 520,
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
  pill: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    height: 3,
    marginBottom: 6,
  },
  pillActive: {
    backgroundColor: BrandColors.primary,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 11,
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  iconWrapActive: {
    backgroundColor: BrandColors.primarySubtle,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
