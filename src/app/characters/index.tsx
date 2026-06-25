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
import {
  BG,
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  SURFACE,
  TEXT,
  TEXT_OVERLAY_MEDIUM,
  TEXT_OVERLAY_STRONG,
} from '@/constants/palette';
import { useCharacters } from '@/features/characters/hooks/use-characters';
import { ERA_COLORS, ERA_LABELS, getCharacterImageUri, type Character, type CharacterEra } from '@/features/characters/types';

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

// ─── Character card ────────────────────────────────────────────────────────────
function CharacterCard({ item, onPress }: { item: Character; onPress: () => void }) {
  const ec     = item.era ? ERA_COLORS[item.era] : null;
  const cardBg = item.era ? ERA_CARD_BG[item.era] : CARD;
  const imageUri = getCharacterImageUri(item);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flex: 1,
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Image or large initial */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          contentFit="cover"
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
          <Text
            style={{ fontSize: 72, fontWeight: '900', color: ec?.glow ?? TEXT, opacity: item.era ? 0.18 : 0.3 }}
          >
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* 3-layer pseudo-gradient overlay */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: 1, backgroundColor: TEXT_OVERLAY_MEDIUM }} />
        <View style={{ flex: 1, backgroundColor: TEXT_OVERLAY_STRONG }} />
      </View>

      {/* Era badge + name */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 }}>
        {item.era && ec ? (
          <Badge
            className="mb-1.5"
            style={{ backgroundColor: ec.bg, borderColor: `${ec.text}33` }}
          >
            <BadgeText style={{ color: ec.text, fontSize: 9 }}>
              {ERA_LABELS[item.era]}
            </BadgeText>
          </Badge>
        ) : null}
        <Heading size="xs" className="text-white" numberOfLines={1}>
          {item.name}
        </Heading>
        {item.title ? (
          <Text size="2xs" className="text-white/45 mt-0.5" numberOfLines={1}>
            {item.title}
          </Text>
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
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Heading size="3xl">Nhân vật lịch sử</Heading>
        <Text size="sm" muted className="mt-1">
          Khám phá các nhân vật nổi bật qua các thời đại
        </Text>
      </View>

      {/* Search bar */}
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
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 18 }}
      >
        {ERA_FILTER_OPTIONS.map(({ key, label }) => (
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
            <Text
              size="xs"
              bold
              style={{ color: era === key ? '#fff' : MUTED }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Skeleton loading grid ────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {[0, 1].map((col) => (
            <Skeleton
              key={col}
              style={{ flex: 1, height: 220 }}
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
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
            <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: 20 }}>
              <Text muted className="text-center">
                Không thể tải dữ liệu. Vui lòng thử lại.
              </Text>
            </View>
          ) : (
            <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: 20 }}>
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
