import { useRouter } from 'expo-router';
import { Search, Star, Users } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  BG,
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  ORANGE_TINT,
  SURFACE,
  TEXT,
} from '@/constants/palette';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useQuizzes } from '@/features/quiz/hooks/use-quizzes';
import type { QuizLevel, QuizSummary } from '@/features/quiz/types';

const LEVEL_LABELS: Record<QuizLevel, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function QuizCard({ quiz, onPress }: { quiz: QuizSummary; onPress: () => void }) {
  const ec = ERA_COLORS[quiz.era as keyof typeof ERA_COLORS];
  const eraLabel = ERA_LABELS[quiz.era as keyof typeof ERA_LABELS] ?? quiz.era;
  const levelLabel = LEVEL_LABELS[quiz.level] ?? quiz.level;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.card}>
      <View style={[s.cardAccent, { backgroundColor: ec?.text ?? ORANGE }]} />

      <View style={{ flex: 1, paddingLeft: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <View style={[s.eraBadge, { backgroundColor: ec?.bg ?? ORANGE_TINT, borderColor: `${ec?.text ?? ORANGE}40` }]}>
            <Text style={{ color: ec?.text ?? ORANGE, fontSize: 10, fontWeight: '700' }}>{eraLabel}</Text>
          </View>
          {quiz.contextTitle ? (
            <Text style={{ color: MUTED, fontSize: 11 }} numberOfLines={1}>{quiz.contextTitle}</Text>
          ) : null}
        </View>

        <Text style={s.cardTitle} numberOfLines={2}>{quiz.title}</Text>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Star size={12} color={MUTED} strokeWidth={1.75} />
            <Text style={s.statText}>{levelLabel}</Text>
          </View>
          <View style={s.statItem}>
            <Users size={12} color={MUTED} strokeWidth={1.75} />
            <Text style={s.statText}>{quiz.playCount} lượt</Text>
          </View>
        </View>
      </View>

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
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data: quizzes, isLoading, isError } = useQuizzes(query || undefined);

  function submitSearch() {
    setQuery(search.trim());
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Heading size="3xl">Bộ câu hỏi</Heading>
        <Text size="sm" muted className="mt-1">Kiểm tra kiến thức lịch sử qua các bộ câu hỏi</Text>
      </View>

      <View style={s.searchWrap}>
        <Search size={15} color={MUTED} strokeWidth={2} />
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
            <Text style={{ color: MUTED, fontSize: 13, paddingLeft: 8 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, height: 46,
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
  statsRow: { flexDirection: 'row', gap: 14 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: MUTED, fontSize: 11 },
  cardArrow: {
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
});
