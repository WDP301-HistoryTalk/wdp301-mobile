import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import {
  ERA_COLORS,
  ERA_LABELS,
  getCharacterImageUri,
  type Character,
  type CharacterEra,
} from '@/features/characters/types';

// ─── Shared era background colours ───────────────────────────────────────────
export const ERA_CARD_BG: Record<CharacterEra, string> = {
  ANCIENT: '#1C0E06',
  MEDIEVAL: '#120828',
  MODERN: '#061A18',
  CONTEMPORARY: '#071020',
};

// ─── Layout constants for 'lg' size ──────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 20;
const COL_GAP = 12;
export const CHAR_CARD_LG_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - COL_GAP) / 2;
export const CHAR_CARD_LG_HEIGHT = Math.round(CHAR_CARD_LG_WIDTH * (4 / 3));

// ─── Sizes ────────────────────────────────────────────────────────────────────
const SM_WIDTH = 100;
const SM_HEIGHT = 130;

// ─── Props ───────────────────────────────────────────────────────────────────
interface CharacterCardProps {
  char: Character;
  onPress: () => void;
  /** 'sm' = compact portrait for Home horizontal scroll (100×130)
   *  'lg' = full grid card for /characters page — default */
  size?: 'sm' | 'lg';
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CharacterCard({ char, onPress, size = 'lg' }: CharacterCardProps) {
  const ec = char.era ? ERA_COLORS[char.era] : null;
  const cardBg = char.era ? ERA_CARD_BG[char.era] : '#111827';
  const imageUri = getCharacterImageUri(char);

  if (size === 'sm') {
    return <SmallCard char={char} onPress={onPress} ec={ec} cardBg={cardBg} imageUri={imageUri} />;
  }

  return <LargeCard char={char} onPress={onPress} ec={ec} cardBg={cardBg} imageUri={imageUri} />;
}

// ─── Small portrait (Home horizontal scroll) ─────────────────────────────────
function SmallCard({
  char,
  onPress,
  ec,
  cardBg,
  imageUri,
}: {
  char: Character;
  onPress: () => void;
  ec: (typeof ERA_COLORS)[CharacterEra] | null;
  cardBg: string;
  imageUri?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={{ width: SM_WIDTH }}>
      <View style={[smStyles.card, { backgroundColor: cardBg }]}>
        {/* Photo or placeholder */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={smStyles.placeholder}>
            <Text style={[smStyles.placeholderInitial, { color: ec?.glow ?? '#fff' }]}>
              {char.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.55, 1]}
          style={smStyles.gradient}
        />

        {/* Bottom info */}
        <View style={smStyles.textWrap}>
          {char.era && ec ? (
            <Badge
              style={{
                backgroundColor: ec.bg,
                borderColor: `${ec.text}33`,
                marginBottom: 2,
                alignSelf: 'flex-start',
                paddingVertical: 1,
                paddingHorizontal: 4,
              }}
            >
              <BadgeText style={{ color: ec.text, fontSize: 8 }}>
                {ERA_LABELS[char.era]}
              </BadgeText>
            </Badge>
          ) : null}
          <Text style={smStyles.name} numberOfLines={2}>
            {char.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Large grid card (/characters page) ──────────────────────────────────────
function LargeCard({
  char,
  onPress,
  ec,
  cardBg,
  imageUri,
}: {
  char: Character;
  onPress: () => void;
  ec: { bg: string; text: string; glow: string; avatarBg: string } | null;
  cardBg: string;
  imageUri?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      style={[
        lgStyles.card,
        { backgroundColor: cardBg, width: CHAR_CARD_LG_WIDTH, height: CHAR_CARD_LG_HEIGHT },
      ]}
    >
      {/* Photo or placeholder */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={lgStyles.placeholderWrap}>
          <Text style={[lgStyles.placeholderInitial, { color: ec?.glow ?? '#fff' }]}>
            {char.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Era badge — top-left */}
      {char.era && ec ? (
        <View style={[lgStyles.eraBadge, { backgroundColor: ec.bg }]}>
          <Text style={[lgStyles.eraBadgeText, { color: ec.text }]}>
            {ERA_LABELS[char.era]}
          </Text>
        </View>
      ) : null}

      {/* Gradient overlay */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)',
          'rgba(30,15,10,0.55)',
          'rgba(45,20,14,0.82)',
          'rgba(45,20,14,0.92)',
        ]}
        locations={[0, 0.42, 0.75, 1]}
        style={lgStyles.gradient}
      />

      {/* Name + title */}
      <View style={lgStyles.textWrap}>
        <Text style={lgStyles.charName} numberOfLines={2}>
          {char.name}
        </Text>
        {char.title ? (
          <Text style={lgStyles.charTitle} numberOfLines={1}>
            {char.title}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles — small ───────────────────────────────────────────────────────────
const smStyles = StyleSheet.create({
  card: {
    width: SM_WIDTH,
    height: SM_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInitial: {
    fontSize: 44,
    fontWeight: '900',
    opacity: 0.18,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  textWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  name: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

// ─── Styles — large ───────────────────────────────────────────────────────────
const lgStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  placeholderWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  placeholderInitial: {
    fontSize: 64,
    fontWeight: '900',
    opacity: 0.18,
  },
  eraBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  eraBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Math.round(CHAR_CARD_LG_HEIGHT * 0.58),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  textWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 8,
  },
  charName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.15,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  charTitle: {
    color: '#E0E0E0',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.85,
    marginTop: 3,
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
