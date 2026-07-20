import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  BG,
  BORDER,
  CARD,
  GREEN,
  MUTED,
  ORANGE,
  RED,
  TEXT,
  TEXT2,
} from '@/constants/palette';
import { useQuizResults } from '@/features/quiz/hooks/use-quiz-results';
import type { MyResult } from '@/features/quiz/types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN');
}

function scoreColor(percentage: number) {
  if (percentage >= 70) return GREEN;
  if (percentage >= 50) return ORANGE;
  return RED;
}

export default function QuizHistoryScreen() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, refetch, isRefetching } = useQuizResults(page, 10);

  function renderItem({ item }: { item: MyResult }) {
    const correctCount = Math.round((item.percentage / 100) * item.totalQuestions);
    const color = scoreColor(item.percentage);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={s.card}
        onPress={() => router.push({ pathname: '/quiz/result', params: { sessionId: item.sessionId } })}
      >
        <View style={s.iconWrap}>
          <Trophy size={18} color={color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.quizTitle} numberOfLines={1}>{item.quizTitle}</Text>
          <Text style={s.metaText}>
            Đúng {correctCount}/{item.totalQuestions} câu · {formatDate(item.completedAt)}
          </Text>
        </View>
        <Text style={[s.percentage, { color }]}>{item.percentage}%</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.iconBtn}>
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Lịch sử làm quiz</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 76, borderRadius: 16 }} />)}
        </View>
      ) : (
        <FlatList
          data={data?.content ?? []}
          keyExtractor={(item) => item.sessionId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 10 }}>
              <Trophy size={36} color={MUTED} />
              <Text style={{ color: TEXT2, fontSize: 14 }}>Bạn chưa làm bài quiz nào</Text>
            </View>
          }
          ListFooterComponent={
            data && (data.hasNext || data.hasPrevious) ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  disabled={!data.hasPrevious || isFetching}
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  style={[s.pageBtn, !data.hasPrevious && s.pageBtnDisabled]}
                >
                  <Text style={{ color: data.hasPrevious ? TEXT : MUTED, fontSize: 13 }}>Trước</Text>
                </TouchableOpacity>
                {isFetching && !isRefetching && <ActivityIndicator color={ORANGE} />}
                <TouchableOpacity
                  disabled={!data.hasNext || isFetching}
                  onPress={() => setPage((p) => p + 1)}
                  style={[s.pageBtn, !data.hasNext && s.pageBtnDisabled]}
                >
                  <Text style={{ color: data.hasNext ? TEXT : MUTED, fontSize: 13 }}>Sau</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', backgroundColor: CARD,
  },
  headerTitle: { color: TEXT, fontSize: 17, fontWeight: '700' },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(234,179,8,0.1)',
  },
  quizTitle: { color: TEXT, fontSize: 14, fontWeight: '700' },
  metaText: { color: MUTED, fontSize: 11 },
  percentage: { fontSize: 15, fontWeight: '800' },

  pageBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  pageBtnDisabled: { opacity: 0.5 },
});
