import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterCard, CHAR_CARD_LG_WIDTH, CHAR_CARD_LG_HEIGHT } from '@/components/cards';
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }} edges={['top']}>
      <FlatList
        data={isLoading ? [] : characters}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columnWrapper}
        ItemSeparatorComponent={() => <View style={{ height: COL_GAP }} />}
        renderItem={({ item }) => (
          <CharacterCard
            char={item}
            size="lg"
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
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
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
});
