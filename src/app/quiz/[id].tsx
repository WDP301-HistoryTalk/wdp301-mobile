import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Play, Star, Timer, Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Switch, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  AMBER, BG, BORDER, CARD, GREEN, MUTED, ORANGE,
  ORANGE_TINT, RED, SURFACE, TEXT, TEXT2,
} from '@/constants/palette';
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

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { data: quiz, isLoading, isError } = useQuiz(resolvedId ?? '');
  const { mutateAsync: startQuiz, isPending } = useStartQuiz();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [timeEnabled, setTimeEnabled] = useState(false);
  const [timeMins, setTimeMins] = useState('10');

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

    const mins = parseInt(timeMins, 10);
    if (timeEnabled && (!mins || mins <= 0)) {
      Alert.alert('Thời gian không hợp lệ', 'Vui lòng nhập số phút lớn hơn 0.');
      return;
    }

    const limitedTime = timeEnabled ? mins * 60 : undefined;

    try {
      await startQuiz({ quizId: quiz.quizId, limitedTime });
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
            <Text style={{ color: ec.text, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>{eraLabel}</Text>
          )}

          <Text style={ss.title}>{quiz.title}</Text>
          {quiz.contextTitle ? (
            <Text style={ss.contextTitle}>{quiz.contextTitle}</Text>
          ) : null}

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
          </View>

          {/* Time limit setting */}
          <View style={ss.timeCard}>
            <View style={ss.timeToggleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Timer size={18} color={timeEnabled ? ORANGE : MUTED} strokeWidth={1.75} />
                <View>
                  <Text style={{ color: TEXT, fontWeight: '700', fontSize: 15 }}>Giới hạn thời gian</Text>
                  <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>
                    {timeEnabled ? 'Bài làm có đếm ngược' : 'Không giới hạn'}
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
              <View style={ss.timeInputRow}>
                <Clock size={14} color={MUTED} strokeWidth={1.75} />
                <Text style={{ color: MUTED, fontSize: 13 }}>Thời gian:</Text>
                <TextInput
                  style={ss.timeInput}
                  value={timeMins}
                  onChangeText={(v) => setTimeMins(v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  selectTextOnFocus
                />
                <Text style={{ color: TEXT2, fontSize: 13 }}>phút</Text>
                {timeMins ? (
                  <Text style={{ color: MUTED, fontSize: 12, marginLeft: 4 }}>
                    ({parseInt(timeMins, 10) * 60} giây)
                  </Text>
                ) : null}
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

  title: { color: TEXT, fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 6 },
  contextTitle: { color: MUTED, fontSize: 13, marginBottom: 18 },

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

  timeCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, marginBottom: 16,
  },
  timeToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  timeInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  timeInput: {
    backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 6,
    color: TEXT, fontSize: 16, fontWeight: '700',
    minWidth: 56, textAlign: 'center',
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
