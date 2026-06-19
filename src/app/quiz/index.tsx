import { useRouter } from 'expo-router';
import { BookOpen, Clock, Search, Star, Trophy, Users } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, TEXT } from '@/constants/palette';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useQuizzes } from '@/features/quiz/hooks/use-quizzes';
import type { Quiz } from '@/features/quiz/types';

function formatDuration(secs: number) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  return `${m} phút`;
}

function QuizCard({ quiz, onPress }: { quiz: Quiz; onPress: () => void }) {
  const ec = ERA_COLORS[quiz.era as keyof typeof ERA_COLORS];
  const eraLabel = ERA_LABELS[quiz.era as keyof typeof ERA_LABELS] ?? quiz.era;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.card}>
      {/* Era accent */}
      <View style={[s.cardAccent, { backgroundColor: ec?.text ?? ORANGE }]} />

      <View style={{ flex: 1, paddingLeft: 14 }}>
        {/* Era + context */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <View style={[s.eraBadge, { backgroundColor: ec?.bg ?? 'rgba(234,88,12,0.15)', borderColor: `${ec?.text ?? ORANGE}40` }]}>
            <Text style={{ color: ec?.text ?? ORANGE, fontSize: 10, fontWeight: '700' }}>{eraLabel}</Text>
          </View>
          {quiz.contextTitle ? (
            <Text style={{ color: MUTED, fontSize: 11 }} numberOfLines={1}>{quiz.contextTitle}</Text>
          ) : null}
        </View>

        {/* Title */}
        <Text style={s.cardTitle} numberOfLines={2}>{quiz.title}</Text>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Clock size={12} color={MUTED} strokeWidth={1.75} />
            <Text style={s.statText}>{formatDuration(quiz.durationSeconds)}</Text>
          </View>
          <View style={s.statItem}>
            <Users size={12} color={MUTED} strokeWidth={1.75} />
            <Text style={s.statText}>{quiz.playCount} lượt</Text>
          </View>
          {quiz.grade ? (
            <View style={s.statItem}>
              <BookOpen size={12} color={MUTED} strokeWidth={1.75} />
              <Text style={s.statText}>Lớp {quiz.grade}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Arrow */}
      <View style={s.cardArrow}>
        <Text style={{ color: ORANGE, fontSize: 18, fontWeight: '300' }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function QuizSkeletons() {
  return (
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} style={{ height: 88, borderRadius: 18 }} />
      ))}
    </View>
  );
}

export default function QuizListScreen() {
  const router  = useRouter();
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');

  const { data: quizzes, isLoading, isError } = useQuizzes(query || undefined);

  function submitSearch() { setQuery(search.trim()); }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>Kiểm tra kiến thức</Text>
          <Text style={s.headerTitle}>Bộ câu hỏi</Text>
        </View>
        <View style={s.trophyWrap}>
          <Trophy size={22} color={ORANGE} strokeWidth={1.75} />
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Search size={16} color={MUTED} strokeWidth={1.75} style={{ marginRight: 10 }} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          placeholder="Tìm bộ câu hỏi..."
          placeholderTextColor={MUTED}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => { setSearch(''); setQuery(''); }}>
            <Text style={{ color: MUTED, fontSize: 13, paddingLeft: 8 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ marginTop: 8 }}>
          <QuizSkeletons />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: MUTED }}>Không thể tải bộ câu hỏi</Text>
        </View>
      ) : (
        <FlatList
          data={quizzes ?? []}
          keyExtractor={(q) => q.quizId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <Star size={40} color={MUTED} strokeWidth={1.25} />
              <Text style={{ color: MUTED, fontSize: 15 }}>
                {query ? 'Không tìm thấy kết quả' : 'Chưa có bộ câu hỏi'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <QuizCard
              quiz={item}
              onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: item.quizId } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  headerSub:   { color: MUTED, fontSize: 12, marginBottom: 2 },
  headerTitle: { color: TEXT,  fontSize: 24, fontWeight: '800' },
  trophyWrap: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: 'rgba(234,88,12,0.12)',
    borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: CARD, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER,
    overflow: 'hidden', paddingVertical: 14, paddingRight: 14,
    minHeight: 88,
  },
  cardAccent: { width: 4, alignSelf: 'stretch', borderRadius: 0 },
  eraBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  cardTitle: { color: TEXT, fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 8 },
  statsRow:  { flexDirection: 'row', gap: 14 },
  statItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:  { color: MUTED, fontSize: 11 },
  cardArrow: {
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
});
