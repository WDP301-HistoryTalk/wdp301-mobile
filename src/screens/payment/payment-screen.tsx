import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowLeft, BadgeCheck, Check, Clock, Crown, History, ShieldCheck, Sparkles, XCircle,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  AMBER,
  BG,
  BORDER,
  CARD,
  GREEN,
  MUTED,
  ORANGE,
  ORANGE_BORDER,
  ORANGE_BORDER_STRONG,
  ORANGE_TINT_MUTED,
  RED,
  TEXT,
  TEXT_TINT_FAINT,
  TEXT2,
} from '@/constants/palette';
import { useMe } from '@/features/auth/hooks/use-me';
import { useCreateOrder } from '@/features/payment/hooks/use-create-order';
import { useMyOrders } from '@/features/payment/hooks/use-my-orders';
import { useTiers } from '@/features/payment/hooks/use-tiers';
import type { OrderStatus, Tier } from '@/features/payment/types';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

function tierFeatureSummary(title: string): string {
  const v = title.toLowerCase();
  if (v.includes('pro')) return 'Nội dung, chat, call, video call, quiz';
  if (v.includes('plus')) return 'Nội dung, chat, call, quiz';
  return 'Nội dung, chat, quiz';
}

const RESULT_LABEL: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PAID: { label: 'Thanh toán thành công! Gói đã được kích hoạt.', color: GREEN, icon: BadgeCheck },
  PENDING: { label: 'PayOS đang xử lý. Hãy kiểm tra lại sau ít phút.', color: AMBER, icon: Clock },
  CANCELLED: { label: 'Giao dịch đã bị hủy.', color: RED, icon: XCircle },
  EXPIRED: { label: 'Liên kết thanh toán đã hết hạn.', color: RED, icon: XCircle },
};

export default function PaymentScreen() {
  const router = useRouter();
  const { data: profile, refetch: refetchMe } = useMe();
  const { data: tiers, isLoading, refetch: refetchTiers } = useTiers();
  const createOrder = useCreateOrder();
  const { refetch: refetchOrders } = useMyOrders();
  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refetchMe(), refetchTiers()]);
    } finally {
      setRefreshing(false);
    }
  }

  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<OrderStatus | null>(null);

  const activeTiers = (tiers ?? []).filter((t) => t.isActive).sort((a, b) => a.amount - b.amount);

  // Khong co endpoint tra ve trang thai 1 don rieng — sau khi dong trinh duyet
  // trong app (PayOS da xu ly + goi webhook), doi chieu bang cach doc lai lich
  // su thanh toan cua minh va tim don vua tao theo orderCode.
  async function handleCheckout(tier: Tier) {
    if (tier.amount <= 0) return;
    setResultStatus(null);
    setLoadingTierId(tier.tierId);
    try {
      const order = await createOrder.mutateAsync(tier.tierId);
      await WebBrowser.openBrowserAsync(order.checkoutUrl);

      const [{ data: history }] = await Promise.all([refetchOrders(), refetchMe(), refetchTiers()]);
      const matched = history?.find((o) => o.orderCode === order.orderCode);
      setResultStatus(matched?.status ?? 'PENDING');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể tạo đơn thanh toán. Vui lòng thử lại.');
    } finally {
      setLoadingTierId(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.iconBtn}>
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nâng cấp gói</Text>
        <TouchableOpacity onPress={() => router.push('/payment/history')} activeOpacity={0.7} style={s.iconBtn}>
          <History size={19} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={ORANGE} />
        }
      >
        {resultStatus && (
          <View style={[s.resultBanner, { borderColor: RESULT_LABEL[resultStatus].color + '55' }]}>
            {(() => {
              const Icon = RESULT_LABEL[resultStatus].icon;
              return <Icon size={20} color={RESULT_LABEL[resultStatus].color} />;
            })()}
            <Text style={{ color: RESULT_LABEL[resultStatus].color, flex: 1, fontSize: 13, fontWeight: '600' }}>
              {RESULT_LABEL[resultStatus].label}
            </Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 16 }}>
          <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 19 }}>
            Chọn gói phù hợp để mở khóa toàn bộ tính năng HistoryTalk. Thanh toán an toàn qua PayOS — chuyển khoản ngân hàng & QR.
          </Text>
        </View>

        {isLoading && (
          <View style={{ paddingHorizontal: 20, gap: 14 }}>
            {[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 180, borderRadius: 20 }} />)}
          </View>
        )}

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {activeTiers.map((tier, index) => {
            const isFree = tier.amount === 0;
            const isCurrent = profile?.tierId === tier.tierId;
            const isFeatured = index === activeTiers.length - 1 && !isFree;
            const isBusy = loadingTierId === tier.tierId;

            return (
              <View key={tier.tierId} style={[s.tierCard, isFeatured && s.tierCardFeatured]}>
                <View style={s.tierHead}>
                  <Crown size={18} color={isFeatured ? ORANGE : MUTED} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.tierTitle}>{tier.title}</Text>
                    <Text style={s.tierSub}>{tier.noMonth} tháng sử dụng</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
                  <Text style={s.tierPrice}>{isFree ? 'Miễn phí' : formatCurrency(tier.amount)}</Text>
                  {!isFree && <Text style={s.tierPriceUnit}>/{tier.noMonth} tháng</Text>}
                </View>

                <View style={{ marginTop: 16, gap: 8 }}>
                  <View style={s.featureRow}>
                    {isFeatured ? <Sparkles size={14} color={ORANGE} /> : <Check size={14} color={MUTED} />}
                    <Text style={s.featureText}>Token AI: {tier.limitedToken.toLocaleString('vi-VN')}</Text>
                  </View>
                  <View style={s.featureRow}>
                    {isFeatured ? <Sparkles size={14} color={ORANGE} /> : <Check size={14} color={MUTED} />}
                    <Text style={s.featureText}>{tierFeatureSummary(tier.title)}</Text>
                  </View>
                </View>

                {isFree || isCurrent ? (
                  <View style={[s.actionBtn, s.actionBtnCurrent]}>
                    <Text style={{ color: TEXT2, fontWeight: '700', fontSize: 14 }}>Gói hiện tại</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleCheckout(tier)}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    style={[s.actionBtn, isFeatured ? s.actionBtnFeatured : s.actionBtnDefault]}
                  >
                    {isBusy
                      ? <ActivityIndicator color={isFeatured ? '#fff' : ORANGE} />
                      : <Text style={{ color: isFeatured ? '#fff' : ORANGE, fontWeight: '700', fontSize: 14 }}>Đăng ký ngay</Text>}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={s.footNote}>
          <ShieldCheck size={14} color={MUTED} />
          <Text style={{ color: MUTED, fontSize: 11 }}>Thanh toán an toàn qua PayOS</Text>
        </View>
      </ScrollView>
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

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 16, padding: 14,
    borderRadius: 14, borderWidth: 1, backgroundColor: CARD,
  },

  tierCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 18,
  },
  tierCardFeatured: { borderColor: ORANGE_BORDER_STRONG },
  tierHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tierTitle: { color: TEXT, fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  tierSub: { color: MUTED, fontSize: 12, marginTop: 2 },
  tierPrice: { color: TEXT, fontSize: 24, fontWeight: '800' },
  tierPriceUnit: { color: MUTED, fontSize: 12 },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: TEXT2, fontSize: 13 },

  actionBtn: {
    marginTop: 18, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnDefault: { backgroundColor: ORANGE_TINT_MUTED, borderWidth: 1, borderColor: ORANGE_BORDER },
  actionBtnFeatured: { backgroundColor: ORANGE },
  actionBtnCurrent: { backgroundColor: TEXT_TINT_FAINT, borderWidth: 1, borderColor: BORDER },

  footNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 24,
  },
});
