export type CharacterEra = 'ANCIENT' | 'MEDIEVAL' | 'MODERN' | 'CONTEMPORARY';

export interface CharacterContext {
  contextId: {
    id: string;
    name: string;
  };
  name: string;
}

export interface Character {
  id: string;
  name: string;
  title?: string;
  background?: string;
  imageUrl?: string;
  image?: string;
  modelUrl?: string;
  bornYear?: number;
  bornMonth?: number;
  bornDay?: number;
  isBornBc?: boolean;
  deathYear?: number;
  deathMonth?: number;
  deathDay?: number;
  isDeathBc?: boolean;
  era?: CharacterEra;
  personality?: string;
  isPublished: boolean;
  isActive: boolean;
  contexts?: CharacterContext[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterPage {
  content: Character[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function getCharacterImageUri(character: Character): string | undefined {
  return character.imageUrl ?? character.image;
}

export const ERA_LABELS: Record<CharacterEra, string> = {
  ANCIENT: 'Cổ đại',
  MEDIEVAL: 'Trung đại',
  MODERN: 'Hiện đại',
  CONTEMPORARY: 'Đương đại',
};

// `text` is a dark, saturated color meant for badges sitting on a light (opaque) `bg` pill —
// readable on both the beige page/card background and directly over a dark photo hero.
// `glow` keeps the original light pastel tone, used only for the big initial-letter watermark
// drawn straight onto a dark era-colored poster background (ERA_CARD_BG / ERA_HERO_BG).
export const ERA_COLORS: Record<CharacterEra, { bg: string; text: string; glow: string; avatarBg: string }> = {
  ANCIENT:      { bg: '#FCE8C6', text: '#92400E', glow: '#FCD34D', avatarBg: '#78350F' },
  MEDIEVAL:     { bg: '#EAE0FB', text: '#6D28D9', glow: '#C4B5FD', avatarBg: '#4C1D95' },
  MODERN:       { bg: '#CFF3EA', text: '#0F766E', glow: '#5EEAD4', avatarBg: '#064E3B' },
  CONTEMPORARY: { bg: '#DCE7FB', text: '#1D4ED8', glow: '#93C5FD', avatarBg: '#1E3A5F' },
};
