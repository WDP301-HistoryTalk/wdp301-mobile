import { useRouter } from 'expo-router';
import { GitCommitHorizontal, LayoutGrid, Search } from 'lucide-react-native';
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

import { ContextCard } from '@/components/cards';
import { ContextTimeline } from './context-timeline';
import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, SURFACE, TEXT } from '@/constants/palette';
import { ERA_COLORS } from '@/features/characters/types';
import { useHistoricalContexts } from '@/features/historical-contexts/hooks/use-historical-contexts';
import {
  type ContextEra,
} from '@/features/historical-contexts/types';

type EraFilter = ContextEra | 'ALL';
type ViewMode = 'grid' | 'timeline';

const ERA_FILTER: { key: EraFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'ANCIENT', label: 'Cổ đại' },
  { key: 'MEDIEVAL', label: 'Trung đại' },
  { key: 'MODERN', label: 'Hiện đại' },
  { key: 'CONTEMPORARY', label: 'Đương đại' },
];

// ContextCard is imported from @/components/cards

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            gap: 14,
            marginBottom: 10,
            backgroundColor: CARD,
            borderRadius: 20,
            padding: 14,
          }}
        >
          <Skeleton style={{ width: 68, height: 80 }} radius={16} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton style={{ height: 14, width: '55%' }} radius={6} />
            <Skeleton style={{ height: 16, width: '85%' }} radius={6} />
            <Skeleton style={{ height: 12, width: '65%' }} radius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── List header ──────────────────────────────────────────────────────────────
function ListHeader({
  search,
  era,
  view,
  onSearchChange,
  onEraChange,
  onViewChange,
}: {
  search: string;
  era: EraFilter;
  view: ViewMode;
  onSearchChange: (v: string) => void;
  onEraChange: (v: EraFilter) => void;
  onViewChange: (v: ViewMode) => void;
}) {
  return (
    <View>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Heading size="3xl">Bối cảnh lịch sử</Heading>
          <Text size="sm" muted className="mt-1">
            Khám phá các sự kiện và giai đoạn lịch sử nổi bật
          </Text>
        </View>

        {/* Chuyển chế độ xem: lưới ⇄ dòng thời gian (giống trang Events bên web) */}
        <View style={viewToggleStyles.wrap}>
          <TouchableOpacity
            onPress={() => onViewChange('grid')}
            activeOpacity={0.7}
            style={[viewToggleStyles.btn, view === 'grid' && viewToggleStyles.btnActive]}
            accessibilityLabel="Xem dạng lưới"
          >
            <LayoutGrid size={15} color={view === 'grid' ? '#fff' : MUTED} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onViewChange('timeline')}
            activeOpacity={0.7}
            style={[viewToggleStyles.btn, view === 'timeline' && viewToggleStyles.btnActive]}
            accessibilityLabel="Xem dạng dòng thời gian"
          >
            <GitCommitHorizontal size={15} color={view === 'timeline' ? '#fff' : MUTED} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          marginHorizontal: 20,
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
          nativeID="contexts-search"
          style={{ flex: 1, marginLeft: 10, color: TEXT, fontSize: 14 }}
          placeholder="Tìm kiếm bối cảnh lịch sử..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 18 }}
      >
        {ERA_FILTER.map(({ key, label }) => {
          const isActive = era === key;
          const activeEraColor = (key !== 'ALL' && isActive && key in ERA_COLORS)
            ? ERA_COLORS[key as ContextEra]
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

// ─── Empty / error states ─────────────────────────────────────────────────────
function LoadingState() { return <SkeletonList />; }
function ErrorState() {
  return (
    <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: 20 }}>
      <Text muted className="text-center">Không thể tải dữ liệu. Vui lòng thử lại.</Text>
    </View>
  );
}
function EmptyState() {
  return (
    <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: 20 }}>
      <Text muted className="text-center">Không tìm thấy bối cảnh lịch sử nào.</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [era, setEra] = useState<EraFilter>('ALL');
  // Mặc định xem theo dòng thời gian (giống trang Events bên web)
  const [view, setView] = useState<ViewMode>('timeline');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(text), 400);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch, isRefetching } =
    useHistoricalContexts({
      search: debouncedSearch || undefined,
      era: era === 'ALL' ? undefined : era,
    });

  const contexts = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }} edges={['top']}>
      {/* Fixed header — outside FlatList to avoid VirtualizedList key conflicts */}
      <ListHeader
        search={search}
        era={era}
        view={view}
        onSearchChange={handleSearchChange}
        onEraChange={(v) => setEra(v)}
        onViewChange={(v) => setView(v)}
      />
      {view === 'timeline' ? (
        isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState />
        ) : (
          <ContextTimeline
            contexts={contexts}
            onNearEnd={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
          />
        )
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={isLoading ? [] : contexts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ContextCard
                ctx={item}
                variant="full"
                onPress={() => router.push({ pathname: '/context/[id]', params: { id: item.id } })}
              />
            </View>
          )}
          ListEmptyComponent={isLoading ? LoadingState : isError ? ErrorState : EmptyState}
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
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  columnWrapper: {
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
});

const viewToggleStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 3,
    gap: 2,
    marginTop: 4,
  },
  btn: {
    width: 32,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: ORANGE,
  },
});
