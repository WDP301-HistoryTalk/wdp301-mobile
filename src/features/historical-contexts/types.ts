import type { CharacterEra } from '../characters/types';

export type ContextEra = CharacterEra;

export type ContextCategory = 'WAR' | 'POLITICS' | 'CULTURE' | 'SCIENCE' | 'RELIGION' | 'OTHER';

export interface ContextCharacter {
  id: string;
  name: string;
  title?: string;
  image?: string;
  era?: ContextEra;
}

export interface HistoricalContext {
  id: string;
  name: string;
  description?: string;
  era: ContextEra;
  category?: ContextCategory;
  year?: number;
  startYear?: number;
  endYear?: number;
  isBC?: boolean;
  period?: string;
  location?: string;
  image?: string;
  videoUrl?: string;
  characterIds: ContextCharacter[];
  isPublished: boolean;
  isActive: boolean;
  yearLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoricalContextPage {
  content: HistoricalContext[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const CATEGORY_LABELS: Record<ContextCategory, string> = {
  WAR:      'Chiến tranh',
  POLITICS: 'Chính trị',
  CULTURE:  'Văn hóa',
  SCIENCE:  'Khoa học',
  RELIGION: 'Tôn giáo',
  OTHER:    'Khác',
};

export const CATEGORY_COLORS: Record<ContextCategory, string> = {
  WAR:      '#EF4444',
  POLITICS: '#A855F7',
  CULTURE:  '#F59E0B',
  SCIENCE:  '#06B6D4',
  RELIGION: '#10B981',
  OTHER:    '#6B7280',
};

/** Formats year display from a HistoricalContext */
export function formatContextYear(ctx: Pick<HistoricalContext, 'yearLabel' | 'year' | 'startYear' | 'endYear' | 'isBC'>): string | null {
  if (ctx.yearLabel) return ctx.yearLabel;
  const bc = ctx.isBC ? ' TCN' : '';
  if (ctx.year) return `Năm ${ctx.year}${bc}`;
  if (ctx.startYear && ctx.endYear) return `${ctx.startYear} – ${ctx.endYear}${bc}`;
  if (ctx.startYear) return `Từ ${ctx.startYear}${bc}`;
  if (ctx.endYear) return `Đến ${ctx.endYear}${bc}`;
  return null;
}
