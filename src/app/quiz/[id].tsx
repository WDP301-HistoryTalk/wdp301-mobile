import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, BookOpen, CheckCircle2, Clock, Play, Star, Users,
} from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useStartQuiz } from '@/features/quiz/hooks/use-start-quiz';
import { useQuiz } from '@/features/quiz/hooks/use-quiz';

const BG     = '#09090b';
const CARD   = '#18181b';
const BORDER = 'rgba(255,255,255,0.07)';
const ORANGE = '#EA580C';
const MUTED  = '#52525b';
const TEXT   = '#f4f4f5';
const TEXT2  = '#a1a1aa';

function formatDuration(secs: number) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m} phút ${s} giây` : `${m} phút`;
}

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

  const ec       = quiz ? ERA_COLORS[quiz.era as keyof typeof ERA_COLORS] : undefined;
  const eraLabel = quiz ? (ERA_LABELS[quiz.era as keyof typeof ERA_LABELS] ?? quiz.era) : '';

  async function handleStart() {
    if (!quiz) return;
    try {
      await startQuiz(quiz.quizId);
      router.push('/quiz/play');
    } catch (e: any) {
      // error handled by mutation
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      {/* Header */}
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
          <Skeleton style={{ height: 80,  borderRadius: 18 }} />
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
          {/* Era badge */}
          {ec && (
            <View style={[ss.eraBadge, { backgroundColor: ec.bg, borderColor: `${ec.text}40` }]}>
              <Text style={{ color: ec.text, fontSize: 11, fontWeight: '700' }}>{eraLabel}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={ss.title}>{quiz.title}</Text>
          {quiz.contextTitle ? (
            <Text style={ss.contextTitle}>{quiz.contextTitle}</Text>
          ) : null}

          {/* Description */}
          {quiz.description ? (
            <View style={ss.descCard}>
              <Text style={{ color: TEXT2, fontSize: 14, lineHeight: 22 }}>{quiz.description}</Text>
            </View>
          ) : null}

          {/* Stats */}
          <View style={ss.statsCard}>
            <StatRow icon={Clock}    label="Thời gian làm bài"    value={formatDuration(quiz.durationSeconds)} />
            <View style={ss.divider} />
            <StatRow icon={Users}    label="Lượt làm"              value={`${quiz.playCount} lượt`} color="#60a5fa" />
            {quiz.grade ? (
              <>
                <View style={ss.divider} />
                <StatRow icon={BookOpen} label="Lớp" value={`Lớp ${quiz.grade}`} color="#a78bfa" />
              </>
            ) : null}
            {quiz.chapterTitle ? (
              <>
                <View style={ss.divider} />
                <StatRow icon={Star} label="Chương" value={quiz.chapterTitle} color="#34d399" />
              </>
            ) : null}
          </View>

          {/* Tip */}
          <View style={ss.tipCard}>
            <CheckCircle2 size={16} color="#22c55e" strokeWidth={1.75} style={{ marginTop: 2 }} />
            <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 20, flex: 1 }}>
              Đọc kỹ câu hỏi trước khi chọn đáp án. Bạn có thể xem lại câu trả lời sau khi nộp bài.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Start button — fixed at bottom */}
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
  title:        { color: TEXT,  fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 6 },
  contextTitle: { color: MUTED, fontSize: 13, marginBottom: 18 },

  descCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    padding: 16, marginBottom: 16,
  },

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
  statValue: { color: TEXT,  fontSize: 14, fontWeight: '700' },
  divider:   { height: 1, backgroundColor: BORDER, marginHorizontal: 0 },

  tipCard: {
    flexDirection: 'row', gap: 12, padding: 14,
    backgroundColor: 'rgba(34,197,94,0.07)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
  },

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
