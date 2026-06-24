import { Slot, usePathname } from "expo-router";
import { BookOpen, Trophy, User, Users } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { TabButton } from "@/components/tab-button";
import { BG, BORDER, CARD } from "@/constants/palette";

const TAB_BAR_HORIZONTAL_PADDING = 16;

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

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.bar}>
        <View style={styles.inner}>
          {TABS.map(({ href, label, icon }) => (
            <TabButton
              key={href}
              href={href}
              label={label}
              icon={icon}
              isHome={href === "/"}
              liftOffset={-5}
              active={isActive(pathname, href)}
            />
          ))}
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
    overflow: "hidden",
  },
  bar: {
    alignItems: "center",
    backgroundColor: CARD,
    borderTopColor: BORDER,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 5,
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    paddingTop: 12,
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
