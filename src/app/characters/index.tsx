import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  BG,
  BORDER,
  MUTED,
  ORANGE,
  SURFACE,
  TEXT,
} from '@/constants/palette';
import { useCharacters } from '@/features/characters/hooks/use-characters';
import {
  ERA_COLORS,
  ERA_LABELS,
  getCharacterImageUri,
  type Character,
  type CharacterEra,
} from '@/features/characters/types';

// ─── Layout constants ─────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING     = 20; // horizontal screen padding
const COL_GAP       = 12; // gap between columns
const CARD_WIDTH    = (SCREEN_WIDTH - H_PADDING * 2 - COL_GAP) / 2;
const CARD_HEIGHT   = Math.round(CARD_WIDTH * (4 / 3)); // 3:4 portrait ratio

// ─── Era data ─────────────────────────────────────────────────────────────────
type EraFilter = CharacterEra | 'ALL';

const ERA_FILTER_OPTIONS: { key: EraFilter; label: string }[] = [
  { key: 'ALL',          label: 'Tất cả'    },
  { key: 'ANCIENT',      label: 'Cổ đại'    },
  { key: 'MEDIEVAL',     label: 'Trung đại' },
  { key: 'MODERN',       label: 'Hiện đại'  },
  { key: 'CONTEMPORARY', label: 'Đương đại' },
];

const ERA_CARD_BG: Record<CharacterEra, string> = {
  ANCIENT:      '#1C0E06',
  MEDIEVAL:     '#120828',
  MODERN:       '#061A18',
  CONTEMPORARY: '#071020',
};

// ─── Character portrait card (2-col grid) ─────────────────────────────────────
function CharacterCard({ item, onPress }: { item: Character; onPress: () => void }) {
  const ec       = item.era ? ERA_COLORS[item.era] : null;
  const cardBg   = item.era ? ERA_CARD_BG[item.era] : '#111827';
  const imageUri = getCharacterImageUri(item);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      style={[styles.card, { backgroundColor: cardBg, width: CARD_WIDTH, height: CARD_HEIGHT }]}
    >
      {/* ── Photo or initial placeholder ── */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <View style={styles.placeholderWrap}>
          <RNText style={[styles.placeholderInitial, { color: ec?.glow ?? '#fff' }]}>
            {item.name.charAt(0).toUpperCase()}
          </RNText>
        </View>
      )}

      {/* ── Era badge — top-left corner ── */}
      {item.era && ec ? (
        <View style={[styles.eraBadge, { backgroundColor: ec.bg }]}>
          <RNText style={[styles.eraBadgeText, { color: ec.text }]}>
            {ERA_LABELS[item.era]}
          </RNText>
        </View>
      ) : null}

      {/* ── Full-width bottom-to-top gradient overlay ── */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)',
          'rgba(30,15,10,0.55)',
          'rgba(45,20,14,0.82)',
          'rgba(45,20,14,0.92)',
        ]}
        locations={[0, 0.42, 0.75, 1]}
        style={styles.gradient}
      />

      {/* ── Text pinned bottom-left over gradient ── */}
      <View style={styles.textWrap}>
        <RNText style={styles.charName} numberOfLines={2}>
          {item.name}
        </RNText>
        {item.title ? (
          <RNText style={styles.charTitle} numberOfLines={1}>
            {item.title}
          </RNText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── List header ──────────────────────────────────────────────────────────────
function ListHeader({
  search,
  era,
  onSearchChange,
  onEraChange,
}: {
  search: string;
  era: EraFilter;
  onSearchChange: (v: string) => void;
  onEraChange: (v: EraFilter) => void;
}) {
  return (
    <View>
      <View style={{ paddingHorizontal: H_PADDING, paddingTop: 20, paddingBottom: 16 }}>
        <Heading size="3xl">Nhân vật lịch sử</Heading>
        <Text size="sm" muted className="mt-1">
          Khám phá các nhân vật nổi bật qua các thời đại
        </Text>
      </View>

      {/* Search bar */}
      <View
        style={{
          marginHorizontal: H_PADDING,
          marginBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: SURFACE,
          borderRadius: 16,
          paddingHorizontal: 14,
          height: 46,
          borderWidth: 1,
          borderColor: BORDER,
        }}
      >
        <Search size={15} color={MUTED} strokeWidth={2} />
        <TextInput
          style={{ flex: 1, marginLeft: 10, color: TEXT, fontSize: 14 }}
          placeholder="Tìm kiếm nhân vật..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {/* Era filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: 8, paddingBottom: 18 }}
      >
        {ERA_FILTER_OPTIONS.map(({ key, label }) => {
          const isActive = era === key;
          // For non-ALL active era, tint the pill with the era color
          const activeEraColor = (key !== 'ALL' && isActive && key in ERA_COLORS)
            ? ERA_COLORS[key as CharacterEra]
            : null;

          return (
            <Pressable
              key={key}
              onPress={() => onEraChange(key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 99,
                backgroundColor: isActive
                  ? (activeEraColor ? activeEraColor.bg : ORANGE)
                  : SURFACE,
                borderWidth: 1,
                borderColor: isActive
                  ? (activeEraColor ? `${activeEraColor.text}55` : 'transparent')
                  : BORDER,
              }}
            >
              <Text
                size="xs"
                bold
                style={{
                  color: isActive
                    ? (activeEraColor ? activeEraColor.text : '#fff')
                    : MUTED,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Skeleton loading grid ────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <View style={{ paddingHorizontal: H_PADDING }}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={{ flexDirection: 'row', gap: COL_GAP, marginBottom: COL_GAP }}>
          {[0, 1].map((col) => (
            <Skeleton
              key={col}
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
              radius={20}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CharactersScreen() {
  const router  = useRouter();
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [era, setEra]                   = useState<EraFilter>('ALL');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(text), 400);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useCharacters({
      search: debouncedSearch || undefined,
      era:    era === 'ALL' ? undefined : era,
    });

  const characters = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <FlatList
        data={isLoading ? [] : characters}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columnWrapper}
        ItemSeparatorComponent={() => <View style={{ height: COL_GAP }} />}
        renderItem={({ item }) => (
          <CharacterCard
            item={item}
            onPress={() => router.push({ pathname: '/characters/[id]', params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={
          <ListHeader
            search={search}
            era={era}
            onSearchChange={handleSearchChange}
            onEraChange={(v) => setEra(v)}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <SkeletonGrid />
          ) : isError ? (
            <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: H_PADDING }}>
              <Text muted className="text-center">
                Không thể tải dữ liệu. Vui lòng thử lại.
              </Text>
            </View>
          ) : (
            <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: H_PADDING }}>
              <Text muted className="text-center">
                Không tìm thấy nhân vật nào.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={ORANGE} style={{ marginVertical: 20 }} />
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Column wrapper: fixed padding + gap so odd items don't stretch
  columnWrapper: {
    gap: COL_GAP,
    paddingHorizontal: H_PADDING,
  },

  // Portrait card shell
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  // Placeholder when no image
  placeholderWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  placeholderInitial: {
    fontSize: 64,
    fontWeight: '900',
    opacity: 0.18,
  },

  // Era badge — top-left corner overlay
  eraBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    // subtle shadow so badge pops over bright images
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

  // Full-width gradient: transparent → deep dark brown, covering bottom ~55%
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // extra 1px top overshoot ensures no seam on sub-pixel screens
    height: Math.round(CARD_HEIGHT * 0.58),
    // corners match the card's borderRadius
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  // Text container: bottom-left anchored, padded inside the dark zone
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
    // Pure white — using RNText so NativeWind classes don't interfere
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.15,
    // text shadow for extra punch on bright images
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  charTitle: {
    // #E0E0E0 at 85% opacity — clearly subordinate to the name
    color: '#E0E0E0',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.85,
    marginTop: 3,
    lineHeight: 14,
    // match the shadow style for consistency
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
