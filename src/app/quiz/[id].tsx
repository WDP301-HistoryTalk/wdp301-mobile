import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play, Star, Users } from 'lucide-react-native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, TEXT } from '@/constants/palette';
import { useAuthStore } from '@/features/auth/store';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useStartQuiz } from '@/features/quiz/hooks/use-start-quiz';
import { useQuiz } from '@/features/quiz/hooks/use-quiz';
import type { QuizLevel } from '@/features/quiz/types';

const LEVEL_LABELS: Record<QuizLevel, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function StatRow({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string; color?: string;
}) {
  return (
    <View style={ss.statRow}>
      <View style={[ss.statIcon, { backgroundColor: `${color ?? ORANGE}18` }]}>
        <Icon size={16} color={color ?? ORANGE} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ss.statLabel}>{label}</Text>
        <Text style={ss.statValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { data: quiz, isLoading, isError } = useQuiz(resolvedId ?? '');
  const { mutateAsync: startQuiz, isPending } = useStartQuiz();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const ec = quiz ? ERA_COLORS[quiz.era as keyof typeof ERA_COLORS] : undefined;
  const eraLabel = quiz ? (ERA_LABELS[quiz.era as keyof typeof ERA_LABELS] ?? quiz.era) : '';
  const levelLabel = quiz ? (LEVEL_LABELS[quiz.level] ?? quiz.level) : '';

  async function handleStart() {
    if (!quiz) return;
    if (!isAuthenticated) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để bắt đầu làm quiz.');
      return;
    }

    try {
      await startQuiz(quiz.quizId);
      router.push('/quiz/play');
    } catch (e: any) {
      Alert.alert('Không thể bắt đầu quiz', e?.message ?? 'Vui lòng thử lại sau.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <View style={ss.headerBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={ss.backBtn}>
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={ss.headerTitle}>Chi tiết bộ đề</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading && (
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 16 }}>
          <Skeleton style={{ height: 32, width: '70%', borderRadius: 10 }} />
          <Skeleton style={{ height: 16, width: '50%', borderRadius: 8 }} />
          <Skeleton style={{ height: 120, borderRadius: 18 }} />
        </View>
      )}

      {isError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ color: MUTED }}>Không tìm thấy bộ câu hỏi</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: ORANGE }}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {quiz && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {ec && (
            <View style={[ss.eraBadge, { backgroundColor: ec.bg, borderColor: `${ec.text}40` }]}>
              <Text style={{ color: ec.text, fontSize: 11, fontWeight: '700' }}>{eraLabel}</Text>
            </View>
          )}

          <Text style={ss.title}>{quiz.title}</Text>
          {quiz.contextTitle ? (
            <Text style={ss.contextTitle}>{quiz.contextTitle}</Text>
          ) : null}

          <View style={ss.statsCard}>
            <StatRow icon={Star} label="Độ khó" value={levelLabel} color="#f59e0b" />
            <View style={ss.divider} />
            <StatRow icon={Users} label="Bạn đã làm" value={`${quiz.playCount} lượt`} color="#60a5fa" />
          </View>
        </ScrollView>
      )}

      {quiz && (
        <View style={ss.startWrap}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={isPending}
            activeOpacity={0.85}
            style={ss.startBtn}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Play size={20} color="#fff" strokeWidth={2} fill="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>Bắt đầu làm bài</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: CARD, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: TEXT, fontSize: 17, fontWeight: '700' },

  eraBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, marginBottom: 12,
  },
  title: { color: TEXT, fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 6 },
  contextTitle: { color: MUTED, fontSize: 13, marginBottom: 18 },

  statsCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  statLabel: { color: MUTED, fontSize: 11, fontWeight: '500', marginBottom: 2 },
  statValue: { color: TEXT, fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 0 },

  startWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 32,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: ORANGE, borderRadius: 18, paddingVertical: 17,
  },
});
