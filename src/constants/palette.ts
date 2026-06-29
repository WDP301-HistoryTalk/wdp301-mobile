/**
 * HistoryTalk mobile palette aligned with the website design system.
 * Legacy export names are kept so existing screens inherit the new colors.
 */
export const HistoryTalkColors = {
  light: {
    accent: '#72383D',
    accentSoft: '#8D4A50',
    bgMain: '#EFE9E1',
    surface: '#F7F1EA',
    textPrimary: '#322D29',
    textSecondary: '#5F554E',
    border: 'rgba(50,45,41,0.14)',
  },
  dark: {
    accent: '#EA7A0A',
    accentSoft: '#e2c77a',
    bgMain: '#0e1a2b',
    surface: '#1a2436',
    textPrimary: '#f7f1e8',
    textSecondary: '#dfdab5',
    border: 'rgba(231,221,200,0.12)',
  },
  toast: {
    success: '#4A8C62',
    error: '#9A3F43',
    warning: '#B88C3C',
    info: '#72383D',
    default: '#72383D',
  },
} as const;

export const BG = HistoryTalkColors.light.bgMain;
export const CARD = HistoryTalkColors.light.surface;
export const SURFACE = HistoryTalkColors.light.surface;
export const BORDER = HistoryTalkColors.light.border;

export const ORANGE = HistoryTalkColors.light.accent;
export const ORANGE_DARK = HistoryTalkColors.light.accentSoft;
export const ORANGE_TINT_FAINT = 'rgba(114,56,61,0.08)';
export const ORANGE_TINT_SOFT = 'rgba(114,56,61,0.10)';
export const ORANGE_TINT_MUTED = 'rgba(114,56,61,0.12)';
export const ORANGE_TINT = 'rgba(114,56,61,0.15)';
export const ORANGE_TINT_BADGE = 'rgba(114,56,61,0.18)';
export const ORANGE_TINT_STRONG = 'rgba(114,56,61,0.28)';
export const ORANGE_TINT_SOLID = 'rgba(114,56,61,0.78)';
export const ORANGE_BORDER_FAINT = 'rgba(114,56,61,0.20)';
export const ORANGE_BORDER_SOFT = 'rgba(114,56,61,0.22)';
export const ORANGE_BORDER_MUTED = 'rgba(114,56,61,0.25)';
export const ORANGE_BORDER = 'rgba(114,56,61,0.35)';
export const ORANGE_BORDER_MEDIUM = 'rgba(114,56,61,0.30)';
export const ORANGE_BORDER_STRONG = 'rgba(114,56,61,0.40)';
export const ORANGE_BORDER_FOCUS = 'rgba(114,56,61,0.50)';
export const ORANGE_BORDER_ACTIVE = 'rgba(114,56,61,0.60)';

export const TEXT = HistoryTalkColors.light.textPrimary;
export const TEXT2 = HistoryTalkColors.light.textSecondary;
export const MUTED = HistoryTalkColors.light.textSecondary;
export const TEXT_TINT_FAINT = 'rgba(50,45,41,0.04)';
export const TEXT_TINT_SOFT = 'rgba(50,45,41,0.05)';
export const TEXT_OVERLAY_MEDIUM = 'rgba(50,45,41,0.45)';
export const TEXT_OVERLAY = 'rgba(50,45,41,0.55)';
export const TEXT_OVERLAY_STRONG = 'rgba(50,45,41,0.82)';
export const TEXT_OVERLAY_DARK = 'rgba(50,45,41,0.85)';
export const TEXT_OVERLAY_SOLID = 'rgba(50,45,41,0.94)';

export const GREEN = HistoryTalkColors.toast.success;
export const RED = HistoryTalkColors.toast.error;
export const AMBER = HistoryTalkColors.toast.warning;

export const Radius = {
  badge: 6,
  button: 10,
  card: 16,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,   // micro labels, timestamps, hints
  sm: 12,   // pills, badges, metadata, captions
  md: 14,   // body text, inputs, list items
  lg: 15,   // card titles, item titles
  xl: 17,   // section headers, prominent numbers
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;
