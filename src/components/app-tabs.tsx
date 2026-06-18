import { Link, Slot, usePathname } from 'expo-router';
import { BookOpen, House, Trophy, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BG, BORDER, CARD, MUTED, ORANGE, ORANGE_TINT } from '@/constants/palette';

// NativeTabs (the platform tab bar) doesn't expose any way to control the
// spacing between items, so we use a plain custom bar here instead — it's
// the only way to give items breathing room and match the beige theme.
const TABS = [
  { href: '/',           label: 'Trang chủ', icon: House    },
  { href: '/characters', label: 'Nhân vật',  icon: Users    },
  { href: '/context',    label: 'Bối cảnh',  icon: BookOpen },
  { href: '/quiz',       label: 'Quiz',       icon: Trophy   },
] as const;

export default function AppTabs() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Content fills remaining space above the bar */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Tab bar — normal flow, never overlaps content */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/');

            return (
              <Link key={href} href={href as any} asChild>
                <Pressable
                  style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.6 }]}
                >
                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                    <Icon
                      size={22}
                      color={active ? ORANGE : MUTED}
                      strokeWidth={active ? 2.4 : 1.75}
                    />
                  </View>

                  <Text style={[styles.tabLabel, { color: active ? ORANGE : MUTED }]}>
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
    backgroundColor: CARD,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    gap: 18,
    paddingHorizontal: 12,
  },

  tabItem: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  iconWrap: {
    width: 46,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: ORANGE_TINT,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
