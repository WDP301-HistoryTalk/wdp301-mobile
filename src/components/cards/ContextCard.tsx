import { Image } from 'expo-image';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { BORDER, CARD, FontSize, MUTED, TEXT, TEXT2 } from '@/constants/palette';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatContextYear,
  getContextImageUri,
  type HistoricalContext,
} from '@/features/historical-contexts/types';
import { ERA_CARD_BG } from './CharacterCard';

// ─── Props ───────────────────────────────────────────────────────────────────
interface ContextCardProps {
  ctx: HistoricalContext;
  onPress: () => void;
  /** 'compact' = row for Home preview
   *  'full'    = grid card for /context page — default */
  variant?: 'compact' | 'full';
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ContextCard({ ctx, onPress, variant = 'full' }: ContextCardProps) {
  if (variant === 'compact') {
    return <CompactRow ctx={ctx} onPress={onPress} />;
  }
  return <FullCard ctx={ctx} onPress={onPress} />;
}

// ─── Compact row (Home preview) ──────────────────────────────────────────────
function CompactRow({ ctx, onPress }: { ctx: HistoricalContext; onPress: () => void }) {
  const ec = ERA_COLORS[ctx.era] ?? ERA_COLORS.ANCIENT;
  const cardBg = ERA_CARD_BG[ctx.era] ?? '#1C0E06';
  const imgUri = getContextImageUri(ctx);
  const yearTxt = formatContextYear(ctx);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={rowStyles.container}>
      {/* Thumbnail */}
      <View style={[rowStyles.thumb, { backgroundColor: cardBg }]}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text style={[rowStyles.thumbInitial, { color: ec.glow }]}>
            {ctx.name.charAt(0)}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
        <Badge
          style={{
            backgroundColor: ec.bg,
            borderColor: `${ec.text}30`,
            alignSelf: 'flex-start',
            paddingVertical: 1,
            paddingHorizontal: 4,
          }}
        >
          <BadgeText style={{ color: ec.text, fontSize: 8 }}>
            {ERA_LABELS[ctx.era]}
          </BadgeText>
        </Badge>
        <Text style={rowStyles.name} numberOfLines={1}>
          {ctx.name}
        </Text>
        {(yearTxt ?? ctx.location) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {ctx.location ? <MapPin size={9} color={TEXT2} /> : null}
            <Text style={{ color: TEXT2, fontSize: 10 }} numberOfLines={1} ellipsizeMode="tail">
              {[yearTxt, ctx.location].filter(Boolean).join(' · ')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ justifyContent: 'center' }}>
        <ChevronRight size={14} color={MUTED} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Full grid card (/context page) ──────────────────────────────────────────
function FullCard({ ctx, onPress }: { ctx: HistoricalContext; onPress: () => void }) {
  const ec = ERA_COLORS[ctx.era] ?? ERA_COLORS.ANCIENT;
  const cardBg = ERA_CARD_BG[ctx.era] ?? '#1C0E06';
  const imgUri = getContextImageUri(ctx);
  const yearText = formatContextYear(ctx);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyles.container}>
      {/* Thumbnail */}
      <View style={[cardStyles.thumb, { backgroundColor: cardBg }]}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: ec.glow, opacity: 0.65 }}>
              {ctx.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={cardStyles.body}>
        <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: ec.text }}>
          {ERA_LABELS[ctx.era]}
        </Text>

        {ctx.category ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: `${CATEGORY_COLORS[ctx.category]}18`,
              borderRadius: 99,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: CATEGORY_COLORS[ctx.category] }}>
              {CATEGORY_LABELS[ctx.category]}
            </Text>
          </View>
        ) : null}

        <Heading numberOfLines={2} style={{ fontSize: FontSize.lg, lineHeight: 20 }}>
          {ctx.name}
        </Heading>

        {(yearText ?? ctx.location) ? (
          <Text muted numberOfLines={1} style={{ fontSize: FontSize.xs }}>
            {[yearText, ctx.location].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        <Text numberOfLines={2} style={{ fontSize: FontSize.sm, color: TEXT2, lineHeight: 17 }}>
          {ctx.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles — compact row ─────────────────────────────────────────────────────
const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 10,
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  thumb: {
    width: 50,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbInitial: {
    fontSize: 22,
    fontWeight: '900',
    opacity: 0.65,
  },
  name: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
});

// ─── Styles — full card ───────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  body: {
    padding: 10,
    gap: 4,
    flex: 1,
  },
});
