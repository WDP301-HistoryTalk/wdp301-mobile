import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, ReceiptText, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

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
  ORANGE_BORDER_MEDIUM,
  ORANGE_TINT_MUTED,
  RED,
  TEXT,
  TEXT2,
} from '@/constants/palette';
import { useCancelOrder } from '@/features/payment/hooks/use-cancel-order';
import { useMyOrders } from '@/features/payment/hooks/use-my-orders';
import type { OrderHistoryItem, OrderStatus } from '@/features/payment/types';

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  paid: { label: 'Đã thanh toán', color: GREEN, icon: CheckCircle2 },
  pending: { label: 'Chờ thanh toán', color: AMBER, icon: Clock },
  cancelled: { label: 'Đã huỷ', color: RED, icon: XCircle },
  expired: { label: 'Hết hạn', color: RED, icon: XCircle },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN');
}

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, refetch, isRefetching } = useMyOrders(page, 10);
  const cancelOrder = useCancelOrder();

  function confirmCancel(order: OrderHistoryItem) {
    Alert.alert('Huỷ đơn hàng', `Huỷ đơn #${order.orderCode}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ đơn', style: 'destructive',
        onPress: () => cancelOrder.mutate(order.orderCode, {
          onError: (e: any) => Alert.alert('Lỗi', e?.message ?? 'Không thể huỷ đơn hàng.'),
        }),
      },
    ]);
  }

  function renderItem({ item }: { item: OrderHistoryItem }) {
    const cfg = STATUS_CFG[item.status];
    const Icon = cfg.icon;
    return (
      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ReceiptText size={15} color={MUTED} />
            <Text style={s.orderCode}>#{item.orderCode}</Text>
          </View>
          <View style={[s.statusBadge, { borderColor: cfg.color + '55', backgroundColor: cfg.color + '14' }]}>
            <Icon size={12} color={cfg.color} />
            <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={s.tierTitle}>{item.tier?.title ? `Gói ${item.tier.title}` : 'Gói dịch vụ'}</Text>
        <Text style={s.amount}>{formatCurrency(item.amount)}</Text>

        <View style={s.metaRow}>
          <Text style={s.metaText}>Tạo: {formatDate(item.createdAt)}</Text>
          {item.paidAt && <Text style={s.metaText}>Thanh toán: {formatDate(item.paidAt)}</Text>}
        </View>

        {item.status === 'pending' && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {item.checkoutUrl && (
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(item.checkoutUrl!)}
                activeOpacity={0.8}
                style={s.smallBtn}
              >
                <ExternalLink size={13} color={ORANGE} />
                <Text style={{ color: ORANGE, fontSize: 12, fontWeight: '700' }}>Thanh toán tiếp</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => confirmCancel(item)} activeOpacity={0.8} style={s.smallBtnDanger}>
              <Text style={{ color: RED, fontSize: 12, fontWeight: '700' }}>Huỷ đơn</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.iconBtn}>
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Lịch sử thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 120, borderRadius: 16 }} />)}
        </View>
      ) : (
        <FlatList
          data={data?.content ?? []}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 10 }}>
              <ReceiptText size={36} color={MUTED} />
              <Text style={{ color: TEXT2, fontSize: 14 }}>Bạn chưa có đơn hàng nào</Text>
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
                {isFetching && <ActivityIndicator color={ORANGE} />}
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
    backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16,
  },
  orderCode: { color: TEXT, fontSize: 13, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4,
  },
  tierTitle: { color: TEXT, fontSize: 15, fontWeight: '800', marginTop: 10, textTransform: 'capitalize' },
  amount: { color: ORANGE, fontSize: 16, fontWeight: '800', marginTop: 2 },
  metaRow: { marginTop: 10, gap: 2 },
  metaText: { color: MUTED, fontSize: 11 },

  smallBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ORANGE_TINT_MUTED, borderWidth: 1, borderColor: ORANGE_BORDER_MEDIUM,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  smallBtnDanger: {
    backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },

  pageBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  pageBtnDisabled: { opacity: 0.5 },
});
