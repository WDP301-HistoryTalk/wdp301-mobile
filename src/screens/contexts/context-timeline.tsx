import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Dimensions,
  type FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/ui/text';
import {
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  ORANGE_BORDER,
  ORANGE_TINT_MUTED,
  SURFACE,
  TEXT,
} from '@/constants/palette';
import { ERA_LABELS } from '@/features/characters/types';
import {
  getContextImageUri,
  type HistoricalContext,
} from '@/features/historical-contexts/types';

// Bản mobile của trang Events bên web (event-timeline + timeline-strip +
// timeline-card): trục năm ngang có mốc chấm, mũi tên trước/sau, carousel
// card sự kiện (vuốt ngang, card kế bên ló ra hai mép), chấm phân trang i/N.
// Dữ liệu là historical contexts thật (web đang dùng mock).

const STRIP_ITEM_W = 76;
const STRIP_H = 64;

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 64; // card kế bên ló ~22px mỗi mép
const CARD_GAP = 12;
const SNAP = CARD_W + CARD_GAP;

function shortYearLabel(ctx: HistoricalContext): string {
  if (ctx.yearLabel) return ctx.yearLabel;
  const bc = ctx.isBC ? ' TCN' : ' SCN';
  if (ctx.year != null) return `${Math.abs(ctx.year)}${bc}`;
  if (ctx.startYear != null) return `${Math.abs(ctx.startYear)}${bc}`;
  return '—';
}

function sortYear(ctx: HistoricalContext): number {
  const y = ctx.year ?? ctx.startYear ?? ctx.endYear;
  if (y == null) return Number.MAX_SAFE_INTEGER;
  return ctx.isBC ? -Math.abs(y) : y;
}

export function ContextTimeline({
  contexts,
  onNearEnd,
}: {
  contexts: HistoricalContext[];
  /** Gọi khi người dùng xem tới gần cuối danh sách — để tải thêm trang. */
  onNearEnd?: () => void;
}) {
  const router = useRouter();
  const events = useMemo(
    () => [...contexts].sort((a, b) => sortYear(a) - sortYear(b)),
    [contexts],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const stripRef = useRef<ScrollView>(null);
  const stripWidthRef = useRef(0);
  const cardListRef = useRef<FlatList<HistoricalContext>>(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;

  const clampedIdx = Math.min(activeIdx, Math.max(0, events.length - 1));

  function select(idx: number, scrollCard = true) {
    if (idx < 0 || idx >= events.length) return;
    setActiveIdx(idx);
    if (scrollCard) {
      cardListRef.current?.scrollToOffset({ offset: idx * SNAP, animated: true });
    }
    if (idx >= events.length - 2) onNearEnd?.();
  }

  // Cuộn dải năm để mốc đang chọn nằm giữa
  useEffect(() => {
    const w = stripWidthRef.current;
    if (!w) return;
    const x = clampedIdx * STRIP_ITEM_W + STRIP_ITEM_W / 2 - w / 2;
    stripRef.current?.scrollTo({ x: Math.max(0, x), animated: true });
  }, [clampedIdx]);

  // Danh sách đổi (lọc thời đại / tải thêm trang): giữ nguyên vị trí đang xem
  // (đã clamp), đồng bộ lại offset carousel không animation.
  const prevEventsRef = useRef(events);
  useEffect(() => {
    if (prevEventsRef.current === events) return;
    prevEventsRef.current = events;
    const idx = Math.min(activeIdx, Math.max(0, events.length - 1));
    cardListRef.current?.scrollToOffset({ offset: idx * SNAP, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  if (events.length === 0) {
    return (
      <View style={{ paddingTop: 80, alignItems: 'center', paddingHorizontal: 20 }}>
        <Text muted className="text-center">
          Không có sự kiện nào trong thời đại này.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Dải năm: mũi tên + trục + mốc ─────────────────────────── */}
      <View style={s.stripRow}>
        <TouchableOpacity
          onPress={() => select(clampedIdx - 1)}
          disabled={clampedIdx === 0}
          activeOpacity={0.7}
          style={[s.navBtn, clampedIdx === 0 && { opacity: 0.3 }]}
          accessibilityLabel="Sự kiện trước"
        >
          <ChevronLeft size={16} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>

        <View
          style={s.stripOuter}
          onLayout={(e) => {
            stripWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          {/* Trục ngang */}
          <View style={s.axis} />
          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {events.map((ev, i) => {
              const isActive = i === clampedIdx;
              return (
                <TouchableOpacity
                  key={ev.id}
                  onPress={() => select(i)}
                  activeOpacity={0.7}
                  style={s.stripItem}
                  accessibilityLabel={`Chọn sự kiện năm ${shortYearLabel(ev)}`}
                >
                  <Text
                    style={[
                      s.stripYear,
                      i % 2 === 0 ? { bottom: 6 } : { top: 6 },
                      isActive && { color: ORANGE, fontWeight: '800' },
                    ]}
                    numberOfLines={1}
                  >
                    {shortYearLabel(ev)}
                  </Text>
                  <View style={[s.dot, isActive && s.dotActive]} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => select(clampedIdx + 1)}
          disabled={clampedIdx === events.length - 1}
          activeOpacity={0.7}
          style={[s.navBtn, clampedIdx === events.length - 1 && { opacity: 0.3 }]}
          accessibilityLabel="Sự kiện tiếp theo"
        >
          <ChevronRight size={16} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Chấm phân trang + i/N ─────────────────────────────────── */}
      <View style={s.dotsRow}>
        <View style={{ flexDirection: 'row', gap: 4, flexShrink: 1, flexWrap: 'wrap' }}>
          {events.map((ev, i) => (
            <TouchableOpacity key={ev.id} onPress={() => select(i)} hitSlop={6}>
              <View
                style={[
                  s.pageDot,
                  i === clampedIdx && { width: 18, backgroundColor: ORANGE },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ color: MUTED, fontSize: 11 }}>
          {clampedIdx + 1} / {events.length}
        </Text>
      </View>

      {/* ── Carousel card sự kiện: vuốt ngang, card kế bên ló hai mép ── */}
      <RNAnimated.FlatList
        ref={cardListRef}
        data={events}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        bounces={false}
        style={{ marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: (SCREEN_W - CARD_W) / 2 }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.max(
            0,
            Math.min(events.length - 1, Math.round(e.nativeEvent.contentOffset.x / SNAP)),
          );
          if (idx !== clampedIdx) select(idx, false);
        }}
        getItemLayout={(_, index) => ({ length: SNAP, offset: SNAP * index, index })}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.93, 1, 0.93],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: 'clamp',
          });
          const imageUri = getContextImageUri(item);
          return (
            <RNAnimated.View style={{ width: CARD_W, transform: [{ scale }], opacity }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({ pathname: '/context/[id]', params: { id: item.id } })
                }
                style={s.card}
                accessibilityLabel={`Xem chi tiết sự kiện ${item.name}`}
              >
                <View style={s.cardImageWrap}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={250}
                    />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: SURFACE }]} />
                  )}
                  <View style={s.yearBadge}>
                    <Text style={s.yearBadgeText}>{shortYearLabel(item)}</Text>
                  </View>
                </View>

                <View style={{ padding: 16 }}>
                  {item.era ? (
                    <Text style={s.eraLabel}>{ERA_LABELS[item.era] ?? item.era}</Text>
                  ) : null}
                  <Text style={s.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text style={s.cardSummary} numberOfLines={3}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={s.cardFooter}>
                    {item.location ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          flex: 1,
                          marginRight: 10,
                        }}
                      >
                        <MapPin size={12} color={MUTED} strokeWidth={2} />
                        <Text
                          style={{ color: MUTED, fontSize: 11, flexShrink: 1 }}
                          numberOfLines={1}
                        >
                          {item.location}
                        </Text>
                      </View>
                    ) : (
                      <View />
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Text style={{ color: ORANGE, fontSize: 12, fontWeight: '700' }}>
                        Xem chi tiết
                      </Text>
                      <ChevronRight size={13} color={ORANGE} strokeWidth={2.5} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </RNAnimated.View>
          );
        }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stripOuter: {
    flex: 1,
    height: STRIP_H,
    overflow: 'hidden',
  },
  axis: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: STRIP_H / 2 - 1,
    height: 2,
    backgroundColor: BORDER,
  },
  stripItem: {
    width: STRIP_ITEM_W,
    height: STRIP_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripYear: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: BORDER,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ORANGE,
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 10,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BORDER,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  cardImageWrap: {
    height: 190,
    backgroundColor: SURFACE,
  },
  yearBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: ORANGE_TINT_MUTED,
    borderWidth: 1,
    borderColor: ORANGE_BORDER,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  yearBadgeText: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '800',
  },
  eraLabel: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardTitle: {
    color: TEXT,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 6,
  },
  cardSummary: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
