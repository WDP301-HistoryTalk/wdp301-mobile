import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, RefreshCw, RotateCcw, XCircle } from 'lucide-react-native';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, GREEN, MUTED, ORANGE, RED, TEXT, TEXT_TINT_FAINT, TEXT2 } from '@/constants/palette';
import { useQuizStore } from '@/features/quiz/store';
import { quizApi } from '@/features/quiz/api';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function ScoreRing({ percentage }: { percentage: number }) {
  const color = percentage >= 70 ? GREEN : percentage >= 50 ? ORANGE : RED;
  const label = percentage >= 80 ? 'Xuất sắc' : percentage >= 60 ? 'Tốt' : percentage >= 40 ? 'Khá' : 'Cần cố gắng';

  return (
    <View style={{ alignItems: 'center', marginBottom: 8 }}>
      <View style={[ss.ring, { borderColor: color }]}>
        <Text style={[ss.ringScore, { color }]}>{percentage}%</Text>
        <Text style={ss.ringLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function QuizResultScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const router    = useRouter();
  const finishedStore = useQuizStore((s) => s.finished);
  const clearAll  = useQuizStore((s) => s.clearAll);

  const { data: detailData, isLoading } = useQuery({
    queryKey: ['quiz-result-detail', sessionId],
    queryFn: () => quizApi.getMyResultBySession(sessionId!),
    enabled: !!sessionId,
  });

  const finished = sessionId && detailData
    ? {
        quizTitle: detailData.quizTitle,
        result: {
          resultId: detailData.sessionId,
          score: detailData.score,
          totalQuestions: detailData.totalQuestions,
          percentage: detailData.percentage,
          startTime: detailData.startedAt,
          endTime: detailData.completedAt,
          correctAnswers: Array(detailData.questions.filter((q) => q.selectedAnswer === q.correctAnswer).length).fill(0),
          wrongAnswers: Array(detailData.totalQuestions - detailData.questions.filter((q) => q.selectedAnswer === q.correctAnswer).length).fill(0),
        },
        questions: detailData.questions,
        userAnswers: detailData.questions.reduce((acc, q) => {
          acc[q.questionId] = q.selectedAnswer;
          return acc;
        }, {} as Record<string, number>),
      }
    : finishedStore;

  function goHome() { clearAll(); router.replace('/quiz'); }
  function retry()  { clearAll(); router.replace('/quiz'); }

  if (sessionId && isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={ORANGE} />
      </SafeAreaView>
    );
  }

  if (!finished) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={{ color: MUTED }}>Không có kết quả</Text>
        <TouchableOpacity onPress={() => router.replace('/quiz')} style={{ padding: 12, backgroundColor: CARD, borderRadius: 12 }}>
          <Text style={{ color: ORANGE }}>← Về danh sách quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { result, questions, userAnswers, quizTitle } = finished;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <View style={ss.hero}>
          <Text style={ss.quizTitle} numberOfLines={2}>{quizTitle}</Text>

          <ScoreRing percentage={result.percentage} />

          {/* Score stats */}
          <View style={ss.scoreRow}>
            <View style={[ss.scoreCard, { borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.07)' }]}>
              <Text style={[ss.scoreNum, { color: GREEN }]}>{result.correctAnswers.length}</Text>
              <Text style={ss.scoreCardLabel}>Đúng</Text>
            </View>
            <View style={[ss.scoreCard, { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.07)' }]}>
              <Text style={[ss.scoreNum, { color: RED }]}>{result.wrongAnswers.length}</Text>
              <Text style={ss.scoreCardLabel}>Sai</Text>
            </View>
            <View style={[ss.scoreCard, { borderColor: BORDER, backgroundColor: CARD }]}>
              <Text style={[ss.scoreNum, { color: ORANGE }]}>{result.score.toFixed(1)}</Text>
              <Text style={ss.scoreCardLabel}>Điểm</Text>
            </View>
          </View>
        </View>

        {/* ── Review ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={ss.sectionTitle}>Xem lại đáp án</Text>

          {questions.map((q, qi) => {
            const answerIdx  = userAnswers[q.questionId];
            const isCorrect  = answerIdx === q.correctAnswer;
            const wasAnswered = answerIdx !== undefined;

            return (
              <View key={q.questionId} style={ss.reviewCard}>
                {/* Question header */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  {isCorrect
                    ? <CheckCircle2 size={18} color={GREEN} strokeWidth={2} style={{ marginTop: 2 }} />
                    : <XCircle      size={18} color={RED}   strokeWidth={2} style={{ marginTop: 2 }} />}
                  <Text style={ss.qIndex}>Câu {qi + 1}</Text>
                </View>

                <Text style={ss.qContent}>{q.content}</Text>

                {/* Options */}
                <View style={{ gap: 8 }}>
                  {q.options.map((opt, oi) => {
                    const isUserAnswer  = wasAnswered && answerIdx === oi;
                    const isCorrectOpt  = oi === q.correctAnswer;
                    let borderColor: string = BORDER;
                    let bgColor: string = 'transparent';
                    let textColor: string = TEXT2;

                    if (isCorrectOpt) { borderColor = 'rgba(34,197,94,0.5)'; bgColor = 'rgba(34,197,94,0.08)'; textColor = GREEN; }
                    if (isUserAnswer && !isCorrect) { borderColor = 'rgba(239,68,68,0.5)'; bgColor = 'rgba(239,68,68,0.08)'; textColor = RED; }

                    return (
                      <View key={oi} style={[ss.reviewOpt, { borderColor, backgroundColor: bgColor }]}>
                        <Text style={[ss.optLetter, { color: textColor }]}>{OPTION_LETTERS[oi]}</Text>
                        <Text style={{ flex: 1, color: textColor, fontSize: 13, lineHeight: 18 }}>{opt}</Text>
                        {isCorrectOpt && <CheckCircle2 size={14} color={GREEN} strokeWidth={2.5} />}
                        {isUserAnswer && !isCorrect && <XCircle size={14} color={RED} strokeWidth={2.5} />}
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                {q.explanation ? (
                  <View style={ss.explanation}>
                    <Text style={{ color: TEXT2, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Giải thích:</Text>
                    <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 19 }}>{q.explanation}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Action buttons ──────────────────────────────────────────── */}
      <View style={ss.actions}>
        <TouchableOpacity onPress={retry} activeOpacity={0.8} style={ss.actionSecondary}>
          <RotateCcw size={16} color={TEXT2} strokeWidth={2} />
          <Text style={{ color: TEXT2, fontWeight: '600' }}>Làm lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goHome} activeOpacity={0.8} style={ss.actionPrimary}>
          <RefreshCw size={16} color="#fff" strokeWidth={2} />
          <Text style={{ color: '#fff', fontWeight: '800' }}>Về danh sách</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  hero: {
    alignItems: 'center', padding: 24, paddingBottom: 28,
    borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 24,
  },
  quizTitle: { color: TEXT, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 24 },

  ring: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  ringScore: { fontSize: 36, fontWeight: '900' },
  ringLabel: { color: MUTED, fontSize: 12, fontWeight: '600', marginTop: 2 },

  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 16, borderWidth: 1,
  },
  scoreNum:       { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  scoreCardLabel: { color: MUTED, fontSize: 11, fontWeight: '600' },

  sectionTitle: { color: TEXT, fontSize: 18, fontWeight: '800', marginBottom: 14 },

  reviewCard: {
    backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: BORDER,
    padding: 18, marginBottom: 14,
  },
  qIndex:   { color: MUTED, fontSize: 11, fontWeight: '700', marginBottom: 0, marginTop: 1 },
  qContent: { color: TEXT, fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 14 },

  reviewOpt: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  optLetter: { fontWeight: '800', fontSize: 12, width: 18 },

  explanation: {
    marginTop: 12, padding: 12,
    backgroundColor: TEXT_TINT_FAINT,
    borderRadius: 10, borderLeftWidth: 3, borderLeftColor: ORANGE,
  },

  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 32,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER,
  },
  actionSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingVertical: 14,
  },
  actionPrimary: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ORANGE, borderRadius: 16, paddingVertical: 14,
  },
});
