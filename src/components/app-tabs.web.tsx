import { Link, Slot, usePathname } from 'expo-router';
import { BookOpen, House, Trophy, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TABS = [
  { href: '/',           label: 'Trang chủ', icon: House    },
  { href: '/characters', label: 'Nhân vật',  icon: Users    },
  { href: '/context',    label: 'Bối cảnh',  icon: BookOpen },
  { href: '/quiz',       label: 'Quiz',       icon: Trophy   },
] as const;

const ORANGE   = '#EA580C';
const INACTIVE = '#52525b';
const TAB_BG   = '#0f0f11';

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      {/* Content fills remaining space above the bar */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Tab bar — normal flow, never overlaps content */}
      <View style={styles.bar}>
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/');

            return (
              <Link key={href} href={href} asChild>
                <Pressable
                  style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.6 }]}
                >
                  {/* Fixed-height pill slot — always present, transparent when inactive */}
                  <View style={[styles.pill, { backgroundColor: active ? ORANGE : 'transparent' }]} />

                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                    <Icon
                      size={22}
                      color={active ? ORANGE : INACTIVE}
                      strokeWidth={active ? 2.4 : 1.75}
                    />
                  </View>

                  <Text style={[styles.tabLabel, { color: active ? ORANGE : INACTIVE }]}>
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
    backgroundColor: '#09090b',
  },
  content: {
    flex: 1,
    // @ts-ignore
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: TAB_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 20,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  tabItem: {
    width: 88,
    paddingHorizontal: 6,
    paddingTop: 0,
    paddingBottom: 4,
    alignItems: 'center',
    gap: 5,
  },

  /* Fixed-height slot so ALL tabs take identical vertical space */
  pill: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },

  iconWrap: {
    width: 44,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(234,88,12,0.12)',
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
