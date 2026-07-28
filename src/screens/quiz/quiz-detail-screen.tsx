import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, History, Play, Star, Timer, User, Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet,
  Switch, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  AMBER, BG, BORDER, CARD, GREEN, MUTED, ORANGE,
  ORANGE_TINT, RED, SURFACE, TEXT,
} from '@/constants/palette';
import { useAuthStore } from '@/features/auth/store';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useStartQuiz } from '@/features/quiz/hooks/use-start-quiz';
import { useQuiz } from '@/features/quiz/hooks/use-quiz';
import { clearQuizProgress, loadQuizProgress, type SavedQuizProgress } from '@/features/quiz/progress-storage';
import { useQuizStore } from '@/features/quiz/store';
import type { QuizLevel } from '@/features/quiz/types';

const TIME_PRESETS = [5, 10, 15] as const;

const LEVEL_LABELS: Record<QuizLevel, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

const LEVEL_COLORS: Record<QuizLevel, { bg: string; text: string }> = {
  EASY:   { bg: `${GREEN}18`,  text: GREEN  },
  MEDIUM: { bg: `${AMBER}18`,  text: AMBER  },
  HARD:   { bg: `${RED}18`,    text: RED    },
};

function StatRow({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string; color?: string;
}) {
  return (
    <View style={ss.statRow}>
      <Icon size={16} color={color ?? MUTED} strokeWidth={1.75} />
      <View style={{ flex: 1 }}>
        <Text style={ss.statLabel}>{label}</Text>
        <Text style={[ss.statValue, color ? { color } : undefined]}>{value}</Text>
      </View>
    </View>
  );
}

// Danh gia trung binh dang 5 sao — chi hien khi da co it nhat 1 luot danh gia.
function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            color={AMBER}
            fill={i <= Math.round(rating) ? AMBER : 'transparent'}
            strokeWidth={1.5}
          />
        ))}
      </View>
      <Text style={{ color: MUTED, fontSize: 13, fontWeight: '600' }}>{rating.toFixed(1)}/5</Text>
    </View>
  );
}

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { data: quiz, isLoading, isError, refetch, isRefetching } = useQuiz(resolvedId ?? '');
  const { mutateAsync: startQuiz, isPending } = useStartQuiz();
  const restoreQuiz = useQuizStore((s) => s.restoreQuiz);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [resumeConfirm, setResumeConfirm] = useState<{ saved: SavedQuizProgress; limitedTime?: number } | null>(null);

  const [timeEnabled, setTimeEnabled] = useState(false);
  const [timeMins, setTimeMins] = useState<typeof TIME_PRESETS[number]>(10);
  // Che do luyen tap: hien dung/sai ngay sau moi cau, chay song song che do thi hien tai.
  const [mode, setMode] = useState<'exam' | 'practice'>('exam');

  const ec = quiz ? ERA_COLORS[quiz.era as keyof typeof ERA_COLORS] : undefined;
  const eraLabel = quiz ? (ERA_LABELS[quiz.era as keyof typeof ERA_LABELS] ?? quiz.era) : '';
  const levelLabel = quiz ? (LEVEL_LABELS[quiz.level] ?? quiz.level) : '';
  const lc = quiz ? LEVEL_COLORS[quiz.level] : undefined;

  async function handleStart() {
    if (!quiz) return;
    if (!isAuthenticated) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để bắt đầu làm quiz.');
      return;
    }

    // 0 nghia la khong gioi han thoi gian — phai gui tuong minh, khong duoc
    // bo qua param nay, neu khong backend se roi ve durationSeconds mac dinh
    // cua quiz du nguoi dung da tat cong tac gioi han.
    const limitedTime = timeEnabled ? timeMins * 60 : 0;

    const saved = await loadQuizProgress(quiz.quizId);
    if (saved) {
      setResumeConfirm({ saved, limitedTime });
      return;
    }
    await startFresh(limitedTime);
  }

  async function startFresh(limitedTime?: number) {
    if (!quiz) return;
    try {
      await clearQuizProgress(quiz.quizId);
      await startQuiz({ quizId: quiz.quizId, limitedTime, practiceMode: mode === 'practice' });
      router.push('/quiz/play');
    } catch (e: any) {
      Alert.alert('Không thể bắt đầu quiz', e?.message ?? 'Vui lòng thử lại sau.');
    }
  }

  function resumeSaved() {
    if (!resumeConfirm) return;
    const { saved } = resumeConfirm;
    restoreQuiz(saved.session, saved.userAnswers, saved.elapsedSeconds, saved.practiceMode);
    setResumeConfirm(null);
    router.push('/quiz/play');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <View style={ss.headerBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={ss.backBtn}>
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={ss.headerTitle}>Chi tiết bộ đề</Text>
        {quiz ? (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/quiz/history',
                params: { quizId: quiz.quizId, quizTitle: quiz.title },
              })
            }
            activeOpacity={0.7}
            style={ss.backBtn}
            accessibilityLabel="Xem lịch sử quiz này"
          >
            <History size={18} color={ORANGE} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={ORANGE} />
          }
        >
          {ec && (
            <Text style={{ color: ec.text, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>{eraLabel}</Text>
          )}

          <Text style={ss.title}>{quiz.title}</Text>
          {quiz.contextTitle ? (
            <Text style={ss.contextTitle}>{quiz.contextTitle}</Text>
          ) : null}
          {quiz.grade || quiz.chapterTitle ? (
            <Text style={ss.chapterLine}>
              {quiz.grade ? `Lớp ${quiz.grade}` : ''}
              {quiz.grade && quiz.chapterTitle ? ' · ' : ''}
              {quiz.chapterNumber ? `Chương ${quiz.chapterNumber}: ` : ''}
              {quiz.chapterTitle ?? ''}
            </Text>
          ) : null}

          {quiz.rating ? <StarRating rating={quiz.rating} /> : null}

          {/* Stats */}
          <View style={ss.statsCard}>
            <StatRow
              icon={Star}
              label="Độ khó"
              value={levelLabel}
              color={lc?.text ?? AMBER}
            />
            <View style={ss.divider} />
            <StatRow
              icon={Users}
              label="Số lần đã làm"
              value={`${quiz.playCount} lượt`}
              color="#60a5fa"
            />
            {quiz.userPlayCount ? (
              <>
                <View style={ss.divider} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: '/quiz/history',
                      params: { quizId: quiz.quizId, quizTitle: quiz.title },
                    })
                  }
                >
                  <StatRow
                    icon={User}
                    label="Bạn đã làm (Xem lịch sử)"
                    value={`${quiz.userPlayCount} lần ›`}
                    color={ORANGE}
                  />
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          {/* Che do lam bai: thi (nop roi moi biet dung/sai) vs luyen tap (biet ngay) */}
          <View style={ss.modeCard}>
            <Text style={ss.modeCardLabel}>Chế độ làm bài</Text>
            <View style={ss.modeRow}>
              <TouchableOpacity
                onPress={() => setMode('exam')}
                activeOpacity={0.8}
                style={[ss.modeBtn, mode === 'exam' && ss.modeBtnActive]}
              >
                <Timer size={16} color={mode === 'exam' ? ORANGE : MUTED} strokeWidth={2} />
                <Text style={[ss.modeBtnText, mode === 'exam' && { color: ORANGE }]}>Chế độ thi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMode('practice')}
                activeOpacity={0.8}
                style={[ss.modeBtn, mode === 'practice' && ss.modeBtnActive]}
              >
                <BookOpen size={16} color={mode === 'practice' ? ORANGE : MUTED} strokeWidth={2} />
                <Text style={[ss.modeBtnText, mode === 'practice' && { color: ORANGE }]}>Luyện tập</Text>
              </TouchableOpacity>
            </View>
            <Text style={ss.modeHint}>
              {mode === 'exam'
                ? 'Làm hết bài rồi mới biết đáp án đúng/sai, giống thi thật.'
                : 'Biết ngay đúng/sai sau mỗi câu, phù hợp để ôn bài.'}
            </Text>
          </View>

          {/* Time limit setting */}
          <View style={ss.timeCard}>
            <View style={ss.timeToggleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Timer size={18} color={timeEnabled ? ORANGE : MUTED} strokeWidth={1.75} />
                <View>
                  <Text style={{ color: TEXT, fontWeight: '700', fontSize: 15 }}>Giới hạn thời gian</Text>
                  <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>
                    {timeEnabled
                      ? 'Bài làm có đếm ngược'
                      : quiz.durationSeconds
                        ? `Không giới hạn · Gợi ý: ${Math.round(quiz.durationSeconds / 60)} phút`
                        : 'Không giới hạn'}
                  </Text>
                </View>
              </View>
              <Switch
                value={timeEnabled}
                onValueChange={setTimeEnabled}
                trackColor={{ false: BORDER, true: ORANGE }}
                thumbColor="#fff"
              />
            </View>

            {timeEnabled && (
              <View style={ss.timeChipsRow}>
                {TIME_PRESETS.map((mins) => {
                  const active = timeMins === mins;
                  return (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => setTimeMins(mins)}
                      activeOpacity={0.8}
                      style={[ss.timeChip, active && ss.timeChipActive]}
                    >
                      <Text style={[ss.timeChipText, active && { color: '#fff' }]}>{mins} phút</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
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
                <Play size={18} color="#fff" strokeWidth={2} fill="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, lineHeight: 20 }}>Bắt đầu làm bài</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ConfirmDialog
        visible={!!resumeConfirm}
        title="Tiếp tục bài làm dở?"
        message="Bạn có một bài đang làm dở cho quiz này. Tiếp tục từ chỗ đã dừng hay làm lại từ đầu?"
        cancelText="Làm lại từ đầu"
        confirmText="Tiếp tục"
        onCancel={() => {
          const limitedTime = resumeConfirm?.limitedTime;
          setResumeConfirm(null);
          void startFresh(limitedTime);
        }}
        onConfirm={resumeSaved}
      />
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

  title: { color: TEXT, fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 6 },
  contextTitle: { color: MUTED, fontSize: 13, marginBottom: 6 },
  chapterLine: { color: MUTED, fontSize: 13, marginBottom: 14 },

  statsCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
  },
  statLabel: { color: MUTED, fontSize: 11, fontWeight: '500', marginBottom: 2 },
  statValue: { color: TEXT, fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: BORDER },

  modeCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, marginBottom: 16,
  },
  modeCardLabel: { color: TEXT, fontWeight: '700', fontSize: 15, marginBottom: 10 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  modeBtnActive: { borderColor: ORANGE, backgroundColor: ORANGE_TINT },
  modeBtnText: { color: MUTED, fontWeight: '700', fontSize: 13 },
  modeHint: { color: MUTED, fontSize: 12, marginTop: 10, lineHeight: 17 },

  timeCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, marginBottom: 16,
  },
  timeToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  timeChipsRow: {
    flexDirection: 'row', gap: 8,
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  timeChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9, borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER, backgroundColor: SURFACE,
  },
  timeChipActive: { borderColor: ORANGE, backgroundColor: ORANGE },
  timeChipText: { color: MUTED, fontWeight: '700', fontSize: 13 },

  startWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 12,
  },
});
