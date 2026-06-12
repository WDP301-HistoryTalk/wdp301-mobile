import { Link, Slot, usePathname } from 'expo-router';
import { BookOpen, House, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TABS = [
  { href: '/',           label: 'Trang chủ', icon: House    },
  { href: '/characters', label: 'Nhân vật',  icon: Users    },
  { href: '/context',    label: 'Bối cảnh',  icon: BookOpen },
] as const;

const ORANGE   = '#EA580C';
const INACTIVE = '#52525b';
const TAB_BG   = '#0f0f11';

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Bottom tab bar */}
      <View style={styles.bar}>
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} asChild>
                <Pressable
                  style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.65 }]}
                >
                  <Icon
                    size={22}
                    color={active ? ORANGE : INACTIVE}
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  <Text style={[styles.tabLabel, { color: active ? ORANGE : INACTIVE }]}>
                    {label}
                  </Text>
                  {active && <View style={styles.activeDot} />}
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
  },
  bar: {
    // @ts-ignore — position: fixed is valid in Expo / RN Web
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: TAB_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 200,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tabItem: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
});
