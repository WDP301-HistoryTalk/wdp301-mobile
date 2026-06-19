/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#ffffff',
    background: '#121212',
    backgroundElement: '#1e1e1e',
    backgroundSelected: '#2a2a2a',
    textSecondary: '#a1a1aa',
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    backgroundElement: '#1e1e1e',
    backgroundSelected: '#2a2a2a',
    textSecondary: '#a1a1aa',
  },
} as const;

export const BrandColors = {
  primary: '#EA580C',
  primarySoft: '#FED7AA',
  primaryMuted: 'rgba(234,88,12,0.08)',
  primarySubtle: 'rgba(234,88,12,0.15)',
  primaryFocus: 'rgba(234,88,12,0.25)',
  primaryBorder: 'rgba(234,88,12,0.28)',
  primaryStrongBorder: 'rgba(234,88,12,0.35)',
  overlay: 'rgba(0,0,0,0.28)',
  overlayMedium: 'rgba(0,0,0,0.45)',
  pageOverlay: 'rgba(9,9,11,0.55)',
  overlayStrong: 'rgba(9,9,11,0.72)',
  pageOverlayStrong: 'rgba(9,9,11,0.82)',
  white: '#ffffff',
  muted: '#71717a',
  borderSubtle: 'rgba(255,255,255,0.18)',
  borderFaint: 'rgba(255,255,255,0.15)',
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
