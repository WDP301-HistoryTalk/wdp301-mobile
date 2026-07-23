import { useRouter } from 'expo-router';
import { CheckCircle2, ArrowLeft, Clock, ReceiptText, XCircle } from 'lucide-react-native';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  AMBER,
  BORDER,
  CARD,
  GREEN,
  MUTED,
  ORANGE,
  RED,
  TEXT,
  TEXT2,
} from '@/constants/palette';
import { useMyOrders } from '@/features/payment/hooks/use-my-orders';
import type { OrderStatus, PaymentHistoryItem } from '@/features/payment/types';

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PAID: { label: 'Đã thanh toán', color: GREEN, icon: CheckCircle2 },
  PENDING: { label: 'Chờ thanh toán', color: AMBER, icon: Clock },
  CANCELLED: { label: 'Đã huỷ', color: RED, icon: XCircle },
  EXPIRED: { label: 'Hết hạn', color: RED, icon: XCircle },
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
  const { data, isLoading, refetch, isRefetching } = useMyOrders();

  function renderItem({ item }: { item: PaymentHistoryItem }) {
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

        <Text style={s.tierTitle}>{item.tierTitle ? `Gói ${item.tierTitle}` : 'Gói dịch vụ'}</Text>
        <Text style={s.amount}>{formatCurrency(item.amount)}</Text>

        <View style={s.metaRow}>
          <Text style={s.metaText}>Tạo: {formatDate(item.createdAt)}</Text>
          {item.paidAt && <Text style={s.metaText}>Thanh toán: {formatDate(item.paidAt)}</Text>}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
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
          data={data ?? []}
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
});
