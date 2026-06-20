import { Link, Slot, usePathname } from 'expo-router';
import { BookOpen, House, MessageCircle, Trophy, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BG, BORDER, CARD, MUTED, ORANGE, ORANGE_TINT } from '@/constants/palette';

const TAB_BAR_HORIZONTAL_PADDING = 16;

const TABS = [
  { href: '/', label: 'Trang chu', icon: House },
  { href: '/characters', label: 'Nhan vat', icon: Users },
  { href: '/chat/history', label: 'Chat', icon: MessageCircle },
  { href: '/context', label: 'Boi canh', icon: BookOpen },
  { href: '/quiz', label: 'Quiz', icon: Trophy },
] as const;

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
            const active =
              href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link key={href} href={href as never} asChild>
                <Pressable style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                    <Icon
                      size={22}
                      color={active ? ORANGE : MUTED}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
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
    paddingBottom: 20,
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    paddingTop: 10,
  },
  inner: {
    alignItems: 'center',
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
    paddingHorizontal: 4,
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
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
