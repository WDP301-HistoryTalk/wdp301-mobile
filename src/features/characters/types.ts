export type CharacterEra = 'ANCIENT' | 'MEDIEVAL' | 'MODERN' | 'CONTEMPORARY';

export interface CharacterContext {
  contextId: string;
  name: string;
}

export interface Character {
  id: string;
  name: string;
  title?: string;
  background?: string;
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

export const ERA_LABELS: Record<CharacterEra, string> = {
  ANCIENT: 'Cổ đại',
  MEDIEVAL: 'Trung đại',
  MODERN: 'Hiện đại',
  CONTEMPORARY: 'Đương đại',
};

export const ERA_COLORS: Record<CharacterEra, { bg: string; text: string; avatarBg: string }> = {
  ANCIENT:      { bg: 'rgba(180,83,9,0.22)',   text: '#FCD34D', avatarBg: '#78350F' },
  MEDIEVAL:     { bg: 'rgba(124,58,237,0.22)',  text: '#C4B5FD', avatarBg: '#4C1D95' },
  MODERN:       { bg: 'rgba(15,118,110,0.22)',  text: '#5EEAD4', avatarBg: '#064E3B' },
  CONTEMPORARY: { bg: 'rgba(29,78,216,0.22)',   text: '#93C5FD', avatarBg: '#1E3A5F' },
};
