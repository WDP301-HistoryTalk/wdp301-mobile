import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, ScrollView,
  StyleSheet, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Text } from '@/components/ui/text';
import {
  BG,
  BORDER,
  CARD,
  GREEN,
  MUTED,
  ORANGE,
  ORANGE_TINT_FAINT,
  RED,
  SURFACE,
  TEXT,
  TEXT2,
} from '@/constants/palette';
import { useSubmitQuiz } from '@/features/quiz/hooks/use-submit-quiz';
import { useQuizStore } from '@/features/quiz/store';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizPlayScreen() {
  const router     = useRouter();
  const active     = useQuizStore((s) => s.active);
  const setAnswer  = useQuizStore((s) => s.setAnswer);
  const setElapsed = useQuizStore((s) => s.setElapsed);

  const { mutateAsync: submitQuiz, isPending: submitting } = useSubmitQuiz();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(active?.session.limitedTime ?? 0);
  const [exitConfirmVisible,   setExitConfirmVisible]   = useState(false);
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track elapsed with a ref so the interval closure never goes stale
  const elapsedRef    = useRef(0);
  const submittingRef = useRef(false);

  const questions     = active?.session.questions ?? [];
  const userAnswers   = active?.userAnswers ?? {};
  const totalQ        = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  // Animated progress bar
  const [progressAnim] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: totalQ > 0 ? answeredCount / totalQ : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [answeredCount, progressAnim, totalQ]);

  // Submit — reads fresh state from Zustand to avoid stale closure
  const doSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const snap = useQuizStore.getState().active;
    if (!snap) return;

    const answers = snap.session.questions.map((q) => ({
      questionId: q.questionId,
      selectedAnswer: snap.userAnswers[q.questionId] ?? 0,
    }));

    try {
      await submitQuiz({
        sessionId: snap.session.sessionId,
        answers,
      });
      router.replace('/quiz/result');
    } catch (e: any) {
      submittingRef.current = false;
      setErrorMessage(e?.message ?? 'Không thể nộp bài. Thử lại?');
    }
  }, [submitQuiz, router]);

  // Countdown timer — all side effects happen OUTSIDE any state updater
  useEffect(() => {
    if (!active) return;
    elapsedRef.current = 0;
    const duration = active.session.limitedTime;

    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);                         // Zustand update — outside React state setter
      const remaining = Math.max(0, duration - elapsedRef.current);
      setTimeLeft(remaining);                                  // plain value, not updater fn

      if (remaining === 0) {
        clearInterval(interval);
        void doSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.session.sessionId]);

  function handleSubmitPress() {
    if (answeredCount < totalQ) {
      setSubmitConfirmVisible(true);
    } else {
      void doSubmit();
    }
  }

  // No active session guard
  if (!active) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <AlertCircle size={40} color={MUTED} strokeWidth={1.5} />
        <Text style={{ color: MUTED }}>Không có bài quiz đang chạy</Text>
        <TouchableOpacity onPress={() => router.replace('/quiz')} style={s.pill}>
          <Text style={{ color: ORANGE }}>← Về danh sách quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const question     = questions[currentIdx];
  const selected     = question ? userAnswers[question.questionId] : undefined;
  const isLast       = currentIdx === totalQ - 1;
  const timerWarning = timeLeft > 0 && timeLeft <= 60;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top', 'bottom']}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setExitConfirmVisible(true)} style={s.exitBtn}>
          <Text style={{ color: TEXT2, fontSize: 13, fontWeight: '600' }}>✕ Thoát</Text>
        </TouchableOpacity>

        <View style={[s.timer, timerWarning && s.timerWarn]}>
          <Text style={[s.timerText, timerWarning && { color: RED }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        <Text style={{ color: MUTED, fontSize: 13, fontWeight: '600' }}>
          {answeredCount}/{totalQ}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <Animated.View
          style={[s.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]}
        />
      </View>

      {/* ── Question ───────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      >
        <Text style={s.qCounter}>Câu {currentIdx + 1} / {totalQ}</Text>

        <View style={s.questionCard}>
          <Text style={s.questionText}>{question?.content}</Text>
        </View>

        <View style={{ gap: 10 }}>
          {question?.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setAnswer(question.questionId, i)}
                activeOpacity={0.75}
                style={[s.optionBtn, isSelected && s.optionBtnSelected]}
              >
                <View style={[s.optionLetter, isSelected && s.optionLetterSelected]}>
                  <Text style={{ color: isSelected ? '#fff' : TEXT2, fontSize: 13, fontWeight: '800' }}>
                    {OPTION_LETTERS[i]}
                  </Text>
                </View>
                <Text style={[s.optionText, isSelected && { color: TEXT }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Footer nav ─────────────────────────────────────────── */}
      <View style={s.footer}>
        <TouchableOpacity
          onPress={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          activeOpacity={0.7}
          style={[s.navBtn, currentIdx === 0 && { opacity: 0.3 }]}
        >
          <Text style={{ color: TEXT, fontWeight: '700' }}>‹ Trước</Text>
        </TouchableOpacity>

        {/* Dot pager */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxWidth: 160 }}
          contentContainerStyle={{ gap: 5, alignItems: 'center', paddingHorizontal: 4 }}
        >
          {questions.map((q, i) => {
            const isAns = userAnswers[q.questionId] !== undefined;
            const isCur = i === currentIdx;
            return (
              <TouchableOpacity key={i} onPress={() => setCurrentIdx(i)}>
                <View style={[s.dot, isCur && s.dotActive, isAns && !isCur && s.dotAnswered]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLast ? (
          <TouchableOpacity
            onPress={handleSubmitPress}
            disabled={submitting}
            activeOpacity={0.8}
            style={s.submitBtn}
          >
            {submitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Nộp bài</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
            activeOpacity={0.7}
            style={s.navBtn}
          >
            <Text style={{ color: TEXT, fontWeight: '700' }}>Sau ›</Text>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmDialog
        visible={exitConfirmVisible}
        title="Thoát bài thi?"
        message="Tiến trình sẽ bị mất, không được lưu lại."
        cancelText="Ở lại"
        confirmText="Thoát"
        destructive
        onCancel={() => setExitConfirmVisible(false)}
        onConfirm={() => {
          setExitConfirmVisible(false);
          useQuizStore.getState().clearAll();
          router.replace('/quiz');
        }}
      />

      <ConfirmDialog
        visible={submitConfirmVisible}
        title="Chưa trả lời hết"
        message={`Bạn còn ${totalQ - answeredCount} câu chưa trả lời. Vẫn nộp bài?`}
        cancelText="Tiếp tục làm"
        confirmText="Nộp bài"
        destructive
        onCancel={() => setSubmitConfirmVisible(false)}
        onConfirm={() => {
          setSubmitConfirmVisible(false);
          void doSubmit();
        }}
      />

      <ConfirmDialog
        visible={!!errorMessage}
        title="Lỗi"
        message={errorMessage ?? ''}
        confirmText="Đóng"
        onConfirm={() => setErrorMessage(null)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  exitBtn: { paddingVertical: 6, paddingHorizontal: 2 },
  timer: {
    paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  timerWarn: { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.08)' },
  timerText: { color: TEXT, fontWeight: '800', fontSize: 15 },

  progressTrack: { height: 3, backgroundColor: CARD },
  progressFill:  { height: '100%', backgroundColor: ORANGE, borderRadius: 2 },

  qCounter:    { color: MUTED, fontSize: 12, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  questionCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 22, marginBottom: 24,
  },
  questionText: { color: TEXT, fontSize: 17, fontWeight: '600', lineHeight: 26, textAlign: 'center' },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  optionBtnSelected: { borderColor: ORANGE, backgroundColor: ORANGE_TINT_FAINT },
  optionLetter: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center',
  },
  optionLetterSelected: { backgroundColor: ORANGE },
  optionText: { flex: 1, color: TEXT2, fontSize: 14, fontWeight: '500', lineHeight: 20 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: BORDER,
    backgroundColor: BG,
  },
  navBtn: {
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
  },
  submitBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: ORANGE, borderRadius: 12,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  dotActive:   { backgroundColor: ORANGE, borderColor: ORANGE, width: 18 },
  dotAnswered: { backgroundColor: GREEN,  borderColor: GREEN },
  pill: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: CARD, borderRadius: 12 },
});
