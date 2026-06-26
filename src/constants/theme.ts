/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

import { HistoryTalkColors } from './palette';

export const Colors = {
  light: {
    text: HistoryTalkColors.light.textPrimary,
    background: HistoryTalkColors.light.bgMain,
    backgroundElement: HistoryTalkColors.light.surface,
    backgroundSelected: HistoryTalkColors.light.border,
    textSecondary: HistoryTalkColors.light.textSecondary,
  },
  dark: {
    text: HistoryTalkColors.dark.textPrimary,
    background: HistoryTalkColors.dark.bgMain,
    backgroundElement: HistoryTalkColors.dark.surface,
    backgroundSelected: HistoryTalkColors.dark.border,
    textSecondary: HistoryTalkColors.dark.textSecondary,
  },
} as const;

export const BrandColors = {
  primary: HistoryTalkColors.light.accent,
  primarySoft: HistoryTalkColors.light.accentSoft,
  primaryMuted: 'rgba(114,56,61,0.08)',
  primarySubtle: 'rgba(114,56,61,0.15)',
  primaryFocus: 'rgba(114,56,61,0.25)',
  primaryBorder: 'rgba(114,56,61,0.28)',
  primaryStrongBorder: 'rgba(114,56,61,0.35)',
  overlay: 'rgba(0,0,0,0.28)',
  overlayMedium: 'rgba(0,0,0,0.45)',
  pageOverlay: 'rgba(9,9,11,0.55)',
  overlayStrong: 'rgba(9,9,11,0.72)',
  pageOverlayStrong: 'rgba(9,9,11,0.82)',
  white: '#ffffff',
  muted: HistoryTalkColors.light.textSecondary,
  borderSubtle: HistoryTalkColors.light.border,
  borderFaint: 'rgba(50,45,41,0.10)',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const AppFonts = {
  body: 'VLOutfit-Regular',
  bodyMedium: 'VLOutfit-Medium',
  bodySemiBold: 'VLOutfit-SemiBold',
  bodyBold: 'VLOutfit-Bold',
  bodyExtraBold: 'VLOutfit-ExtraBold',
  display: 'VLZolina-Medium',
  displayBlack: 'VLZolina-Black',
} as const;

export const FontAssets = {
  [AppFonts.body]: require('@/assets/fonts/VL Outfit-Regular.otf'),
  [AppFonts.bodyMedium]: require('@/assets/fonts/VL Outfit-Medium.otf'),
  [AppFonts.bodySemiBold]: require('@/assets/fonts/VL Outfit-SemiBold.otf'),
  [AppFonts.bodyBold]: require('@/assets/fonts/VL Outfit-Bold.otf'),
  [AppFonts.bodyExtraBold]: require('@/assets/fonts/VL Outfit-ExtraBold.otf'),
  [AppFonts.display]: require('@/assets/fonts/VL ZOLINA-MEDIUM.ttf'),
  [AppFonts.displayBlack]: require('@/assets/fonts/VL ZOLINA-BLACK.ttf'),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
