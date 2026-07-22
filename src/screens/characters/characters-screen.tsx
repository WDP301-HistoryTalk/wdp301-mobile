import { useRouter } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterCard, CHAR_CARD_LG_WIDTH, CHAR_CARD_LG_HEIGHT } from '@/components/cards';
import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  BORDER,
  MUTED,
  ORANGE,
  ORANGE_TINT_FAINT,
  SURFACE,
  TEXT,
} from '@/constants/palette';
import { useCharacters } from '@/features/characters/hooks/use-characters';
import {
  ERA_COLORS,
  ERA_LABELS,
  type Character,
  type CharacterEra,
} from '@/features/characters/types';

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_WIDTH  = CHAR_CARD_LG_WIDTH;
const CARD_HEIGHT = CHAR_CARD_LG_HEIGHT;
const H_PADDING   = 20;
const COL_GAP     = 12;

// ─── Era data ─────────────────────────────────────────────────────────────────
type EraFilter = CharacterEra | 'ALL';

const ERA_FILTER_OPTIONS: { key: EraFilter; label: string }[] = [
  { key: 'ALL',          label: 'Tất cả'    },
  { key: 'ANCIENT',      label: 'Cổ đại'    },
  { key: 'MEDIEVAL',     label: 'Trung đại' },
  { key: 'MODERN',       label: 'Hiện đại'  },
  { key: 'CONTEMPORARY', label: 'Đương đại' },
];

// CharacterCard is imported from @/components/cards

// ─── Timeline grouping (era = 'ALL', no search) ──────────────────────────────
// Bien danh sach phang thanh cac "khoi" theo thu tu ky nguyen, moi khoi la 1
// header ky nguyen hoac 1 hang toi da 2 the — de tao cam giac "di doc lich
// su" thay vi 1 luoi phang khong phan biet moc thoi gian.
const ERA_ORDER: CharacterEra[] = ['ANCIENT', 'MEDIEVAL', 'MODERN', 'CONTEMPORARY'];
// Moi khoi thoi dai chi "nhu" toi da 2 hang (4 the) trong man duyet timeline —
// xem het thi bam "Xem thêm" de nhay sang che do loc phang theo dung era do.
const MAX_PER_ERA = 4;

type TimelineBlock =
  | { type: 'header'; key: string; era: CharacterEra | null }
  | { type: 'row'; key: string; items: Character[] }
  | { type: 'more'; key: string; era: CharacterEra; remaining: number };

function buildTimelineBlocks(characters: Character[]): TimelineBlock[] {
  const groups = new Map<CharacterEra | null, Character[]>();
  for (const c of characters) {
    const key = c.era ?? null;
    const list = groups.get(key);
    if (list) list.push(c);
    else groups.set(key, [c]);
  }

  const orderedKeys: (CharacterEra | null)[] = [...ERA_ORDER.filter((e) => groups.has(e))];
  if (groups.has(null)) orderedKeys.push(null);

  const blocks: TimelineBlock[] = [];
  for (const key of orderedKeys) {
    blocks.push({ type: 'header', key: `header-${key ?? 'unknown'}`, era: key });
    const items = groups.get(key) ?? [];
    const shown = items.slice(0, MAX_PER_ERA);
    for (let i = 0; i < shown.length; i += 2) {
      const pair = shown.slice(i, i + 2);
      blocks.push({ type: 'row', key: `row-${pair.map((c) => c.id).join('-')}`, items: pair });
    }
    // Chi hien nut "Xem thêm" khi biet ro era (khong co pill loc cho nhom "chua xac dinh").
    if (key && items.length > MAX_PER_ERA) {
      blocks.push({ type: 'more', key: `more-${key}`, era: key, remaining: items.length - MAX_PER_ERA });
    }
  }
  return blocks;
}

function TimelineSectionHeader({ era }: { era: CharacterEra | null }) {
  const ec = era ? ERA_COLORS[era] : null;
  const label = era ? ERA_LABELS[era] : 'Chưa xác định';
  const color = ec?.text ?? MUTED;

  return (
    <View style={timelineStyles.sectionWrap}>
      <Text style={[timelineStyles.sectionLabel, { color, borderBottomColor: color }]}>{label}</Text>
      <View style={[timelineStyles.sectionLine, { backgroundColor: BORDER }]} />
    </View>
  );
}

function TimelineMoreButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={timelineStyles.moreWrap}>
      <Text style={timelineStyles.moreText}>Xem thêm</Text>
      <ChevronRight size={14} color={ORANGE} strokeWidth={2.5} />
    </Pressable>
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
          nativeID="characters-search"
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch, isRefetching } =
    useCharacters({
      search: debouncedSearch || undefined,
      era:    era === 'ALL' ? undefined : era,
    });

  const characters = data?.pages.flatMap((p) => p.content) ?? [];

  // Che do "duyet theo dong thoi gian": chi bat khi dang xem "Tat ca" va
  // khong tim kiem — loc theo 1 ky nguyen cu the hoac dang search van tra ve
  // ket qua phang nhu cu (khong can header ky nguyen lap lai).
  const isTimeline = era === 'ALL' && !debouncedSearch;
  const blocks = isTimeline ? buildTimelineBlocks(characters) : [];

  const headerComponent = (
    <ListHeader
      search={search}
      era={era}
      onSearchChange={handleSearchChange}
      onEraChange={(v) => setEra(v)}
    />
  );
  const emptyComponent = isLoading ? (
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
  );
  const footerComponent = isFetchingNextPage ? (
    <ActivityIndicator color={ORANGE} style={{ marginVertical: 20 }} />
  ) : null;
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };
  const goToCharacter = (id: string) => router.push({ pathname: '/characters/[id]', params: { id } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }} edges={['top']}>
      {isTimeline ? (
        <FlatList
          key="timeline"
          data={isLoading ? [] : blocks}
          keyExtractor={(block) => block.key}
          renderItem={({ item: block }) => {
            if (block.type === 'header') return <TimelineSectionHeader era={block.era} />;
            if (block.type === 'more') {
              return (
                <View style={{ paddingHorizontal: H_PADDING, marginBottom: COL_GAP, alignItems: 'center' }}>
                  <TimelineMoreButton onPress={() => setEra(block.era)} />
                </View>
              );
            }
            return (
              <View style={[styles.columnWrapper, { flexDirection: 'row', marginBottom: COL_GAP }]}>
                {block.items.map((c) => (
                  <CharacterCard key={c.id} char={c} size="lg" onPress={() => goToCharacter(c.id)} />
                ))}
                {block.items.length === 1 ? <View style={{ width: CARD_WIDTH }} /> : null}
              </View>
            );
          }}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={footerComponent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      ) : (
        <FlatList
          key="grid"
          data={isLoading ? [] : characters}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.columnWrapper}
          ItemSeparatorComponent={() => <View style={{ height: COL_GAP }} />}
          renderItem={({ item }) => (
            <CharacterCard char={item} size="lg" onPress={() => goToCharacter(item.id)} />
          )}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={footerComponent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      )}
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
});

const timelineStyles = StyleSheet.create({
  sectionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: H_PADDING,
    marginTop: 18,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    borderBottomWidth: 2,
    paddingBottom: 3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  moreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 99,
    backgroundColor: ORANGE_TINT_FAINT,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '700',
    color: ORANGE,
  },
});
