import { useFocusEffect, useRouter } from 'expo-router';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  Flame,
  MessageCircle,
  Trophy,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import {
  BORDER,
  CARD,
  GREEN,
  MUTED,
  ORANGE,
  ORANGE_TINT_MUTED,
  SURFACE,
  TEXT,
} from '@/constants/palette';
import { useClaimQuest } from '@/features/gamification/hooks/use-claim-quest';
import { useGamificationToday } from '@/features/gamification/hooks/use-today';
import type { DailyQuest, QuestType } from '@/features/gamification/types';

/**
 * Thẻ "Hôm nay" trên Home — phong cách Duolingo:
 * - Mỗi nhiệm vụ có icon màu riêng + progress bar.
 * - Bấm vào nhiệm vụ chưa xong → dẫn thẳng tới trang tương ứng
 *   (chat → danh sách nhân vật, quiz → tab quiz, đọc → tab bối cảnh).
 * - Xong thì hiện nút nhận token; nhận rồi thì gạch tên + "Đã nhận".
 * - Tự refetch mỗi lần Home được focus lại → làm xong nhiệm vụ ở màn khác,
 *   quay về là thấy tick ngay (kể cả chat streaming không đi qua mutation).
 */

const QUEST_META: Record<QuestType, { icon: typeof MessageCircle; color: string; bg: string; route: string }> = {
  CHAT: { icon: MessageCircle, color: '#B45309', bg: 'rgba(180,83,9,0.12)', route: '/characters' },
  QUIZ: { icon: Trophy, color: '#6D28D9', bg: 'rgba(109,40,217,0.10)', route: '/quiz' },
  READ_CONTEXT: { icon: BookOpen, color: '#0F766E', bg: 'rgba(15,118,110,0.10)', route: '/context' },
};

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const STREAK_GREEN = '#16A34A';

export function DailyQuestsCard() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGamificationToday();
  const { mutateAsync: claim, isPending: claiming } = useClaimQuest();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  // Quay lại Home (sau khi chat/làm quiz/đọc bối cảnh) → đồng bộ tiến độ ngay
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  // Không có dữ liệu (đang tải lần đầu / lỗi mạng) → ẩn thẻ, không chặn Home
  if (isLoading || isError || !data) return null;

  async function handleClaim(quest: DailyQuest) {
    if (claiming) return;
    setClaimingId(quest.id);
    try {
      await claim(quest.id);
      setJustClaimed(quest.id);
      setTimeout(() => setJustClaimed(null), 2500);
    } catch {
      // Lỗi (đã nhận rồi / chưa xong) — invalidate của hook sẽ tự đồng bộ lại UI
    } finally {
      setClaimingId(null);
    }
  }

  const doneCount = data.quests.filter((q) => q.completed).length;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.card}>
      {/* ── Khối streak (theo mẫu: số to + 7 chấm tuần + 2 chỉ số) ── */}
      <View style={s.streakHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Flame
            size={17}
            color={ORANGE}
            strokeWidth={2.2}
            fill={data.studiedToday ? ORANGE : 'transparent'}
          />
          <Text style={s.title}>Chuỗi ngày học</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={s.streakBig}>{data.streakCount}</Text>
          <Text style={s.streakUnit}>ngày</Text>
        </View>
      </View>

      {/* 7 chấm tuần T2 → CN */}
      <View style={s.weekRow}>
        {data.week.map((d, i) => (
          <View key={d.date} style={s.weekDay}>
            <View
              style={[
                s.weekDot,
                d.studied && s.weekDotStudied,
                d.isToday && !d.studied && s.weekDotToday,
              ]}
            >
              {d.studied ? <Check size={13} color="#fff" strokeWidth={3} /> : null}
            </View>
            <Text
              style={[
                s.weekLabel,
                d.studied && { color: STREAK_GREEN, fontWeight: '800' },
                d.isToday && !d.studied && { color: ORANGE, fontWeight: '800' },
              ]}
            >
              {WEEKDAY_LABELS[i]}
            </Text>
          </View>
        ))}
      </View>

      {/* Kỷ lục + tổng ngày học */}
      <View style={s.statsRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.statLabel}>Chuỗi dài nhất</Text>
          <Text style={s.statValue}>{data.longestStreak} ngày</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={s.statLabel}>Tổng ngày học</Text>
          <Text style={s.statValue}>{data.totalStudyDays}</Text>
        </View>
      </View>

      <View style={s.divider} />

      {/* ── Nhiệm vụ hôm nay ── */}
      <View style={s.headerRow}>
        <Text style={s.title}>Nhiệm vụ hôm nay</Text>
        <Text style={s.subtitle}>
          {doneCount}/{data.quests.length} hoàn thành
        </Text>
      </View>

      {/* Danh sách quest */}
      <View style={{ gap: 8 }}>
        {data.quests.map((q) => {
          const meta = QUEST_META[q.type] ?? QUEST_META.CHAT;
          const Icon = meta.icon;
          const busy = claimingId === q.id;
          const celebrated = justClaimed === q.id;
          const tappable = !q.completed; // chưa xong → bấm để đi làm

          return (
            <TouchableOpacity
              key={q.id}
              activeOpacity={tappable ? 0.7 : 1}
              disabled={!tappable}
              onPress={() => router.push(meta.route as never)}
              style={[s.questRow, q.claimed && { opacity: 0.75 }]}
              accessibilityLabel={
                tappable ? `Đi làm nhiệm vụ: ${q.title}` : q.title
              }
            >
              {/* Icon màu theo loại nhiệm vụ */}
              <View style={[s.questIcon, { backgroundColor: meta.bg }]}>
                {q.completed ? (
                  <CheckCircle2 size={18} color={GREEN} strokeWidth={2.2} />
                ) : (
                  <Icon size={17} color={meta.color} strokeWidth={2.1} />
                )}
              </View>

              {/* Tên + progress bar */}
              <View style={{ flex: 1, gap: 5 }}>
                <Text
                  style={[s.questTitle, q.claimed && s.questTitleDone]}
                  numberOfLines={1}
                >
                  {q.title}
                </Text>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        backgroundColor: q.completed ? GREEN : meta.color,
                        width: `${Math.round((q.progress / q.target) * 100)}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Bên phải: thưởng / nút nhận / đã nhận / mũi tên */}
              {q.claimed ? (
                celebrated ? (
                  <Animated.View entering={ZoomIn.duration(250)} style={s.claimedBadge}>
                    <Text style={s.claimedText}>+{q.rewardTokens} 🎉</Text>
                  </Animated.View>
                ) : (
                  <Text style={s.claimedText}>Đã nhận</Text>
                )
              ) : q.completed ? (
                <TouchableOpacity
                  onPress={() => void handleClaim(q)}
                  disabled={busy}
                  activeOpacity={0.8}
                  style={s.claimBtn}
                  accessibilityLabel={`Nhận ${q.rewardTokens} token cho nhiệm vụ ${q.title}`}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Coins size={12} color="#fff" strokeWidth={2.2} />
                      <Text style={s.claimBtnText}>+{q.rewardTokens}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={s.rightHint}>
                  <View style={s.rewardHint}>
                    <Coins size={11} color={MUTED} strokeWidth={2} />
                    <Text style={s.rewardHintText}>{q.rewardTokens}</Text>
                  </View>
                  <ChevronRight size={15} color={MUTED} strokeWidth={2.2} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: MUTED,
    fontSize: 11,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  streakBig: {
    color: TEXT,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  streakUnit: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  weekDay: {
    alignItems: 'center',
    gap: 4,
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotStudied: {
    backgroundColor: STREAK_GREEN,
  },
  weekDotToday: {
    backgroundColor: ORANGE_TINT_MUTED,
    borderWidth: 1.5,
    borderColor: ORANGE,
  },
  weekLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    color: MUTED,
    fontSize: 11,
  },
  statValue: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  questIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '600',
  },
  questTitleDone: {
    color: MUTED,
    textDecorationLine: 'line-through',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: BORDER,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ORANGE,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 64,
    justifyContent: 'center',
  },
  claimBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  claimedBadge: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  claimedText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '700',
  },
  rightHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardHintText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },
});
