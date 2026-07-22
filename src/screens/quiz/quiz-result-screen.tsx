import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ChevronRight, Flag, MessageCircle, Minus, RotateCcw, Star, TrendingDown, TrendingUp, XCircle, Zap } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, GREEN, MUTED, ORANGE, ORANGE_BORDER_STRONG, ORANGE_TINT, ORANGE_TINT_FAINT, RED, SURFACE, TEXT, TEXT2, TEXT_TINT_FAINT } from '@/constants/palette';
import { useCharactersByContext } from '@/features/characters/hooks/use-characters-by-context';
import { getCharacterImageUri } from '@/features/characters/types';
import { quizApi } from '@/features/quiz/api';
import { useRateQuiz } from '@/features/quiz/hooks/use-rate-quiz';
import { useReportQuestion } from '@/features/quiz/hooks/use-report-question';
import { useStartQuiz } from '@/features/quiz/hooks/use-start-quiz';
import { useQuizStore } from '@/features/quiz/store';
import type { PreviousAttempt } from '@/features/quiz/types';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function ScoreRing({ percentage }: { percentage: number }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const color = percentage >= 70 ? GREEN : percentage >= 50 ? ORANGE : RED;
  const label = percentage >= 80 ? 'Xuất sắc' : percentage >= 60 ? 'Tốt' : percentage >= 40 ? 'Khá' : 'Cần cố gắng';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ alignItems: 'center', marginBottom: 24, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
      <View style={[ss.ring, { borderColor: color, shadowColor: color }]}>
        <Text style={[ss.ringScore, { color }]}>{percentage}%</Text>
        <Text style={ss.ringLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function ScoreStats({ correct, wrong, score }: { correct: number; wrong: number; score: number }) {
  const slideInAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideInAnim, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[ss.scoreRowContainer, { transform: [{ translateY: slideInAnim }], opacity: opacityAnim }]}>
      {/* Correct */}
      <View style={ss.scoreCardWrapper}>
        <View style={[ss.scoreCard, ss.scoreCardCorrect]}>
          <Text style={[ss.scoreNum, { color: GREEN }]}>{correct}</Text>
          <Text style={ss.scoreCardLabel}>Đúng</Text>
        </View>
      </View>

      {/* Wrong */}
      <View style={ss.scoreCardWrapper}>
        <View style={[ss.scoreCard, ss.scoreCardWrong]}>
          <Text style={[ss.scoreNum, { color: RED }]}>{wrong}</Text>
          <Text style={ss.scoreCardLabel}>Sai</Text>
        </View>
      </View>

      {/* Score */}
      <View style={ss.scoreCardWrapper}>
        <View style={[ss.scoreCard, ss.scoreCardScore]}>
          <Text style={[ss.scoreNum, { color: ORANGE }]}>{score.toFixed(1)}</Text>
          <Text style={ss.scoreCardLabel}>Điểm</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// So sanh % lan nay voi lan gan nhat truoc do cua cung quiz (chi co khi xem
// ket qua qua sessionId — xem QuizResultScreen).
function ComparisonBadge({ percentage, previous }: { percentage: number; previous: PreviousAttempt }) {
  const delta = percentage - previous.percentage;
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const color = delta > 0 ? GREEN : delta < 0 ? RED : MUTED;
  const text =
    delta === 0
      ? `Bằng lần trước (${previous.percentage}%)`
      : `${delta > 0 ? '+' : ''}${delta}% so với lần trước (${previous.percentage}%)`;

  return (
    <View style={[ss.comparisonBadge, { borderColor: `${color}55`, backgroundColor: `${color}14` }]}>
      <Icon size={13} color={color} strokeWidth={2.25} />
      <Text style={[ss.comparisonBadgeText, { color }]}>{text}</Text>
    </View>
  );
}

// Sau khi lam sai vai cau, goi y quay lai tro chuyen voi nhan vat cua chinh
// boi canh do de on lai kien thuc (giong tinh nang da co san ben web).
function RecommendCharacters({ contextId, wrongCount }: { contextId: string; wrongCount: number }) {
  const router = useRouter();
  const { data: characters } = useCharactersByContext(contextId);
  const top = (characters ?? []).slice(0, 3);

  if (top.length === 0) return null;

  return (
    <View style={ss.recommendSection}>
      <Text style={ss.recommendTitle}>Ôn lại cùng nhân vật</Text>
      <Text style={ss.recommendSubtitle}>
        Có vẻ bạn đã trả lời chưa đúng {wrongCount} câu — hãy thử hỏi lại các nhân vật lịch sử để ôn lại kiến thức nhé!
      </Text>
      <View style={{ gap: 10 }}>
        {top.map((character) => {
          const imageUri = getCharacterImageUri(character);
          return (
            <TouchableOpacity
              key={character.id}
              activeOpacity={0.75}
              style={ss.recommendCard}
              onPress={() =>
                router.push({ pathname: '/characters/[id]', params: { id: character.id } })
              }
            >
              <View style={ss.recommendAvatar}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <MessageCircle size={18} color={ORANGE} strokeWidth={2} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ss.recommendName} numberOfLines={1}>{character.name}</Text>
                {character.title ? (
                  <Text style={ss.recommendRole} numberOfLines={1}>{character.title}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Cho phep nguoi dung danh gia quiz (1-5 sao) ngay sau khi xem ket qua, de
// tinh nang rating trung binh (Quiz.rating/ratingCount) co du lieu thuc.
function RateQuizCard({ quizId }: { quizId: string }) {
  const { data: myRatingData } = useQuery({
    queryKey: ['quiz-my-rating', quizId],
    queryFn: () => quizApi.getMyRating(quizId),
    enabled: !!quizId,
  });
  const { mutate: rate, isPending } = useRateQuiz(quizId);
  const [localValue, setLocalValue] = useState<number | null>(null);
  const [justRated, setJustRated] = useState(false);

  const value = localValue ?? myRatingData?.myRating ?? 0;

  function handlePress(star: number) {
    setLocalValue(star);
    setJustRated(false);
    rate(star, { onSuccess: () => setJustRated(true) });
  }

  return (
    <View style={ss.rateSection}>
      <Text style={ss.rateTitle}>Bạn thấy quiz này thế nào?</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handlePress(star)}
            disabled={isPending}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Star
              size={28}
              color={star <= value ? ORANGE : BORDER}
              fill={star <= value ? ORANGE : 'transparent'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        ))}
      </View>
      {justRated && <Text style={ss.rateThanks}>Cảm ơn bạn đã đánh giá!</Text>}
    </View>
  );
}

// Cho phep nguoi dung mo ta ngan gon van de gap phai truoc khi gui report —
// giup staff hieu ro hon la chi biet "co report" ma khong ro ly do.
function ReportQuestionDialog({
  visible,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [text, setText] = useState('');

  if (!visible) return null;

  function submit() {
    onSubmit(text.trim());
    setText('');
  }

  return (
    <View style={ss.reportOverlay}>
      <Pressable style={ss.reportBackdrop} onPress={onCancel} />
      <View style={ss.reportCard}>
        <Text style={ss.reportTitle}>Câu này có vấn đề?</Text>
        <Text style={ss.reportSubtitle}>
          Mô tả ngắn gọn vấn đề bạn gặp phải để đội ngũ hỗ trợ xem lại chính xác hơn (không bắt buộc).
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ví dụ: đáp án đúng đang bị sai, câu hỏi khó hiểu..."
          placeholderTextColor={MUTED}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={ss.reportInput}
        />
        <View style={ss.reportActions}>
          <TouchableOpacity onPress={onCancel} style={ss.reportCancelBtn}>
            <Text style={{ color: MUTED, fontWeight: '700' }}>Huỷ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={submit} style={ss.reportSubmitBtn}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Gửi báo cáo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function QuizResultScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const finishedStore = useQuizStore((s) => s.finished);
  const clearAll = useQuizStore((s) => s.clearAll);
  const { mutateAsync: startQuiz, isPending: retrying } = useStartQuiz();
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong'>('all');
  const { mutate: reportQuestion } = useReportQuestion();
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const [reportTarget, setReportTarget] = useState<string | null>(null);

  function handleReportPress(questionId: string) {
    if (reportedIds.has(questionId)) return;
    setReportTarget(questionId);
  }

  function submitReport(reason: string) {
    const questionId = reportTarget;
    if (!questionId) return;
    setReportTarget(null);
    setReportedIds((prev) => new Set(prev).add(questionId));
    reportQuestion(
      { questionId, reason: reason || undefined },
      { onError: () => setReportedIds((prev) => { const next = new Set(prev); next.delete(questionId); return next; }) },
    );
  }

  const { data: detailData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['quiz-result-detail', sessionId],
    queryFn: () => quizApi.getMyResultBySession(sessionId!),
    enabled: !!sessionId,
  });

  const finished = sessionId && detailData
    ? {
      quizTitle: detailData.quizTitle,
      quizId: detailData.quizId,
      contextId: detailData.contextId,
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

  function goHome() {
    clearAll();
    router.replace('/quiz');
  }

  // Lam lai chinh quiz vua xong ngay lap tuc, khong bat quay ve danh sach roi
  // tu bam vao lai (xem QuizStore.startQuiz — se dua ve man play voi phien moi).
  async function retry() {
    const quizId = finished?.quizId;
    clearAll();
    if (!quizId) {
      router.replace('/quiz');
      return;
    }
    try {
      await startQuiz({ quizId });
      router.replace('/quiz/play');
    } catch (e: any) {
      Alert.alert('Không thể bắt đầu lại', e?.message ?? 'Vui lòng thử lại từ danh sách quiz.');
      router.replace('/quiz');
    }
  }

  if (sessionId && isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={ORANGE} />
      </SafeAreaView>
    );
  }

  if (!finished) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <XCircle size={48} color={MUTED} strokeWidth={1.5} style={{ marginBottom: 12 }} />
          <Text style={{ color: TEXT, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>Không có kết quả</Text>
          <Text style={{ color: MUTED, fontSize: 13 }}>Hãy hoàn thành một bài quiz để xem kết quả</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/quiz')} style={[ss.actionPrimary, { marginTop: 16, width: '100%' }]}>
          <ChevronRight size={16} color="#fff" strokeWidth={2} />
          <Text style={{ color: '#fff', fontWeight: '700' }}>Về danh sách quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { result, questions, userAnswers, quizTitle } = finished;
  const correctCount = Array.isArray(result.correctAnswers)
    ? result.correctAnswers.length
    : typeof result.correctAnswers === 'number'
      ? result.correctAnswers
      : questions.filter((q) => userAnswers[q.questionId] === q.correctAnswer).length;

  const wrongCount = Array.isArray(result.wrongAnswers)
    ? result.wrongAnswers.length
    : typeof result.wrongAnswers === 'number'
      ? result.wrongAnswers
      : questions.length - correctCount;

  const totalQuestions = result.totalQuestions || questions.length || 1;
  const percentage = typeof result.percentage === 'number'
    ? result.percentage
    : Math.round((correctCount / totalQuestions) * 100);

  const score = typeof result.score === 'number'
    ? result.score
    : (correctCount / totalQuestions) * 10;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        refreshControl={
          sessionId ? (
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={ORANGE} />
          ) : undefined
        }
      >
        {/* ── Hero ────────────────────────────────────────────────── */}
        <View style={ss.hero}>
          <Text style={ss.quizTitle} numberOfLines={2}>
            {quizTitle}
          </Text>

          <ScoreRing percentage={percentage} />

          <ScoreStats correct={correctCount} wrong={wrongCount} score={score} />

          {detailData?.previousAttempt && (
            <ComparisonBadge percentage={percentage} previous={detailData.previousAttempt} />
          )}

          {/* Performance badge */}
          {percentage >= 70 && (
            <View style={ss.performanceBadge}>
              <Zap size={14} color={GREEN} strokeWidth={2} />
              <Text style={ss.performanceBadgeText}>Kết quả xuất sắc!</Text>
            </View>
          )}
        </View>

        {finished.quizId ? (
          <View style={{ paddingHorizontal: 20 }}>
            <RateQuizCard quizId={finished.quizId} />
          </View>
        ) : null}

        {wrongCount > 0 && finished.contextId ? (
          <View style={{ paddingHorizontal: 20 }}>
            <RecommendCharacters contextId={finished.contextId} wrongCount={wrongCount} />
          </View>
        ) : null}

        {/* ── Review ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={ss.sectionHeader}>
            <Text style={ss.sectionTitle}>Xem lại đáp án</Text>
            <Text style={ss.sectionSubtitle}>{correctCount}/{questions.length} câu đúng</Text>
          </View>

          {wrongCount > 0 && (
            <View style={ss.reviewFilterRow}>
              <TouchableOpacity
                onPress={() => setReviewFilter('all')}
                style={[ss.reviewFilterChip, reviewFilter === 'all' && ss.reviewFilterChipActive]}
              >
                <Text style={[ss.reviewFilterText, reviewFilter === 'all' && ss.reviewFilterTextActive]}>
                  Tất cả ({questions.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setReviewFilter('wrong')}
                style={[ss.reviewFilterChip, reviewFilter === 'wrong' && ss.reviewFilterChipWrong]}
              >
                <Text style={[ss.reviewFilterText, reviewFilter === 'wrong' && { color: RED }]}>
                  Câu sai ({wrongCount})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {questions.map((q, qi) => {
            const answerIdx = userAnswers[q.questionId];
            const isCorrect = answerIdx === q.correctAnswer;
            const wasAnswered = answerIdx !== undefined;

            if (reviewFilter === 'wrong' && isCorrect) return null;

            return (
              <View key={q.questionId} style={ss.reviewCard}>
                {/* Question header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <View style={[ss.questionNumberBadge, isCorrect ? ss.badgeCorrect : ss.badgeWrong]}>
                    <Text style={[ss.questionNumber, { color: isCorrect ? GREEN : RED }]}>
                      {qi + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ss.questionStatus}>{isCorrect ? '✓ Đúng' : '✗ Sai'}</Text>
                  </View>
                  {isCorrect ? (
                    <CheckCircle2 size={20} color={GREEN} strokeWidth={2} />
                  ) : (
                    <XCircle size={20} color={RED} strokeWidth={2} />
                  )}
                </View>

                <Text style={ss.qContent}>{q.content}</Text>

                {/* Options */}
                <View style={{ gap: 10, marginTop: 14 }}>
                  {q.options.map((opt, oi) => {
                    const isUserAnswer = wasAnswered && answerIdx === oi;
                    const isCorrectOpt = oi === q.correctAnswer;
                    let borderColor: string = BORDER;
                    let bgColor: string = 'transparent';
                    let textColor: string = TEXT2;
                    let borderWidth = 1;

                    if (isCorrectOpt) {
                      borderColor = GREEN;
                      bgColor = 'rgba(74, 140, 98, 0.08)';
                      textColor = TEXT;
                      borderWidth = 2;
                    }
                    if (isUserAnswer && !isCorrect) {
                      borderColor = RED;
                      bgColor = 'rgba(154, 63, 67, 0.08)';
                      textColor = TEXT;
                      borderWidth = 2;
                    }

                    return (
                      <View
                        key={oi}
                        style={[
                          ss.reviewOpt,
                          { borderColor, backgroundColor: bgColor, borderWidth },
                        ]}
                      >
                        <View style={[ss.optLetterBadge, { borderColor, backgroundColor: bgColor }]}>
                          <Text style={[ss.optLetter, { color: borderColor }]}>
                            {OPTION_LETTERS[oi]}
                          </Text>
                        </View>
                        <Text style={{ flex: 1, color: textColor, fontSize: 14, lineHeight: 20, fontWeight: '500' }}>
                          {opt}
                        </Text>
                        {isCorrectOpt && <CheckCircle2 size={16} color={GREEN} strokeWidth={2.5} />}
                        {isUserAnswer && !isCorrect && <XCircle size={16} color={RED} strokeWidth={2.5} />}
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                {q.explanation && (
                  <View style={ss.explanation}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                      <Text style={{ color: TEXT2, fontSize: 12, fontWeight: '700' }}>Giải thích</Text>
                    </View>
                    <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 20 }}>
                      {q.explanation}
                    </Text>
                  </View>
                )}

                {/* Bao loi cau hoi cho staff */}
                <TouchableOpacity
                  onPress={() => handleReportPress(q.questionId)}
                  disabled={reportedIds.has(q.questionId)}
                  activeOpacity={0.7}
                  style={ss.reportBtn}
                >
                  <Flag size={13} color={reportedIds.has(q.questionId) ? GREEN : MUTED} strokeWidth={2} />
                  <Text style={[ss.reportBtnText, reportedIds.has(q.questionId) && { color: GREEN }]}>
                    {reportedIds.has(q.questionId) ? 'Đã gửi báo cáo, cảm ơn bạn!' : 'Câu này có vấn đề?'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Action buttons ──────────────────────────────────────────── */}
      <View style={[ss.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          onPress={() => void retry()}
          disabled={retrying}
          activeOpacity={0.7}
          style={[ss.actionSecondary, retrying && { opacity: 0.6 }]}
        >
          {retrying ? (
            <ActivityIndicator color={ORANGE} size="small" />
          ) : (
            <>
              <RotateCcw size={18} color={ORANGE} strokeWidth={2} />
              <Text style={{ color: ORANGE, fontWeight: '700', fontSize: 15 }}>Làm lại</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goHome}
          disabled={retrying}
          activeOpacity={0.85}
          style={ss.actionPrimary}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Về danh sách</Text>
          <ChevronRight size={18} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ReportQuestionDialog
        visible={!!reportTarget}
        onCancel={() => setReportTarget(null)}
        onSubmit={submitReport}
      />
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  reportOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 20,
  },
  reportBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(43,33,24,0.45)',
  },
  reportCard: {
    width: '88%',
    maxWidth: 400,
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
  },
  reportTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  reportSubtitle: { color: TEXT2, fontSize: 13, lineHeight: 19, marginBottom: 14 },
  reportInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    color: TEXT,
    fontSize: 14,
    backgroundColor: SURFACE,
    marginBottom: 16,
  },
  reportActions: { flexDirection: 'row', gap: 10 },
  reportCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: 'rgba(43,33,24,0.06)', alignItems: 'center',
  },
  reportSubmitBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: ORANGE, alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 24,
    backgroundColor: CARD,
  },
  quizTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },

  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ringScore: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 48,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  ringLabel: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  scoreRowContainer: {
    width: '100%',
    marginTop: 8,

    flexDirection: 'row',
    gap: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreCardWrapper: {
    flex: 1,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  scoreCardCorrect: {
    borderColor: 'rgba(74, 140, 98, 0.4)',
    backgroundColor: 'rgba(74, 140, 98, 0.06)',
  },
  scoreCardWrong: {
    borderColor: 'rgba(154, 63, 67, 0.4)',
    backgroundColor: 'rgba(154, 63, 67, 0.06)',
  },
  scoreCardScore: {
    borderColor: ORANGE_BORDER_STRONG,
    backgroundColor: ORANGE_TINT_FAINT,
  },
  scoreNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  scoreCardLabel: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '700',
  },

  performanceBadge: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 140, 98, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 140, 98, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  performanceBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },

  comparisonBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comparisonBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  reviewFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  reviewFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  reviewFilterChipActive: {
    borderColor: ORANGE,
    backgroundColor: ORANGE_TINT_FAINT,
  },
  reviewFilterChipWrong: {
    borderColor: RED,
    backgroundColor: 'rgba(154, 63, 67, 0.08)',
  },
  reviewFilterText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewFilterTextActive: {
    color: ORANGE,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },

  reviewCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },
  questionNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeCorrect: {
    borderColor: GREEN,
    backgroundColor: 'rgba(74, 140, 98, 0.1)',
  },
  badgeWrong: {
    borderColor: RED,
    backgroundColor: 'rgba(154, 63, 67, 0.1)',
  },
  questionNumber: {
    fontWeight: '800',
    fontSize: 14,
  },
  questionStatus: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qContent: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },

  reviewOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  optLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    flexShrink: 0,
  },
  optLetter: {
    fontWeight: '900',
    fontSize: 12,
  },

  explanation: {
    marginTop: 16,
    padding: 12,
    backgroundColor: TEXT_TINT_FAINT,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
  },

  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  reportBtnText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },

  rateSection: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  rateTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
  rateThanks: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },

  recommendSection: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ORANGE_BORDER_STRONG,
    padding: 16,
    marginBottom: 24,
  },
  recommendTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  recommendSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  recommendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE_TINT_FAINT,
    borderWidth: 1,
    borderColor: ORANGE_BORDER_STRONG,
  },
  recommendName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  recommendRole: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
  },

  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  actionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ORANGE_TINT,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ORANGE,
    paddingVertical: 14,
  },
  actionPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});