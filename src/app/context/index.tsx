import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, SURFACE, TEXT, TEXT2 } from '@/constants/palette';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useHistoricalContexts } from '@/features/historical-contexts/hooks/use-historical-contexts';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatContextYear,
  type ContextEra,
  type HistoricalContext,
} from '@/features/historical-contexts/types';

type EraFilter = ContextEra | 'ALL';

const ERA_FILTER: { key: EraFilter; label: string }[] = [
  { key: 'ALL',          label: 'Tất cả'    },
  { key: 'ANCIENT',      label: 'Cổ đại'    },
  { key: 'MEDIEVAL',     label: 'Trung đại' },
  { key: 'MODERN',       label: 'Hiện đại'  },
  { key: 'CONTEMPORARY', label: 'Đương đại' },
];

const ERA_CARD_BG: Record<ContextEra, string> = {
  ANCIENT:      '#1C0E06',
  MEDIEVAL:     '#120828',
  MODERN:       '#061A18',
  CONTEMPORARY: '#071020',
};

// ─── Context card ─────────────────────────────────────────────────────────────
function ContextCard({ item, onPress }: { item: HistoricalContext; onPress: () => void }) {
  const ec       = ERA_COLORS[item.era] ?? ERA_COLORS.ANCIENT;
  const cardBg   = ERA_CARD_BG[item.era] ?? '#1C0E06';
  const yearText = formatContextYear(item);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 20,
        padding: 14,
        gap: 14,
        marginBottom: 10,
      }}
    >
      {/* Era-coloured thumbnail */}
      <View
        style={{
          width: 68,
          height: 80,
          borderRadius: 16,
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {((item as any).imageUrl ?? item.image) ? (
          <Image
            source={{ uri: (item as any).imageUrl ?? item.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <Text style={{ fontSize: 32, fontWeight: '900', color: ec.glow, opacity: 0.7 }}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, gap: 5 }}>
        {/* Badges */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          <Badge style={{ backgroundColor: ec.bg, borderColor: `${ec.text}30` }}>
            <BadgeText style={{ color: ec.text, fontSize: 9 }}>
              {ERA_LABELS[item.era]}
            </BadgeText>
          </Badge>
          {item.category ? (
            <Badge
              style={{
                backgroundColor: `${CATEGORY_COLORS[item.category]}18`,
                borderColor: `${CATEGORY_COLORS[item.category]}35`,
              }}
            >
              <BadgeText style={{ color: CATEGORY_COLORS[item.category], fontSize: 9 }}>
                {CATEGORY_LABELS[item.category]}
              </BadgeText>
            </Badge>
          ) : null}
        </View>

        {/* Name */}
        <Heading size="sm" className="text-history-text leading-5" numberOfLines={2}>
          {item.name}
        </Heading>

        {/* Year · location */}
        {(yearText ?? item.location) ? (
          <Text size="xs" muted numberOfLines={1}>
            {[yearText, item.location].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        {/* Description preview */}
        {item.description ? (
          <Text numberOfLines={2} style={{ fontSize: 11, color: TEXT2, lineHeight: 17 }}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <View style={{ justifyContent: 'center' }}>
        <Text style={{ color: MUTED, fontSize: 20, lineHeight: 20 }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

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
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Heading size="3xl">Bối cảnh lịch sử</Heading>
        <Text size="sm" muted className="mt-1">
          Khám phá các sự kiện và giai đoạn lịch sử nổi bật
        </Text>
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
        {ERA_FILTER.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => onEraChange(key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 99,
              backgroundColor: era === key ? ORANGE : SURFACE,
              borderWidth: 1,
              borderColor: era === key ? 'transparent' : BORDER,
            }}
          >
            <Text size="xs" bold style={{ color: era === key ? '#fff' : MUTED }}>
              {label}
            </Text>
          </Pressable>
        ))}
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
    useHistoricalContexts({
      search: debouncedSearch || undefined,
      era:    era === 'ALL' ? undefined : era,
    });

  const contexts = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      {/* Fixed header — outside FlatList to avoid VirtualizedList key conflicts */}
      <ListHeader
        search={search}
        era={era}
        onSearchChange={handleSearchChange}
        onEraChange={(v) => setEra(v)}
      />
      <FlatList
        style={{ flex: 1 }}
        data={isLoading ? [] : contexts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <ContextCard
              item={item}
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
      />
    </SafeAreaView>
  );
}
