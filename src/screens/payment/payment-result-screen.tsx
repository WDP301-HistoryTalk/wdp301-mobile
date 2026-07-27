import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { BG, ORANGE, TEXT2 } from '@/constants/palette';
import { useNotifyPayosReturn } from '@/features/payment/hooks/use-notify-payos-return';

// Fallback cho truong hop mobilehistorytalk://payment/result mo lai app tu
// trang thai bi kill (deferred deep link) thay vi duoc bat truc tiep boi
// WebBrowser.openAuthSessionAsync trong payment-screen.tsx.
export default function PaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string; id?: string; cancel?: string; status?: string; orderCode?: string;
  }>();
  const notifyReturn = useNotifyPayosReturn();
  const queryClient = useQueryClient();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const orderCodeNum = Number(params.orderCode ?? '0');
    if (!orderCodeNum) {
      router.replace('/payment');
      return;
    }

    notifyReturn
      .mutateAsync({
        code: params.code ?? '',
        id: params.id ?? '',
        cancel: params.cancel === 'true',
        status: params.status ?? '',
        orderCode: orderCodeNum,
      })
      .catch(() => {})
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['me'] });
        router.replace('/payment');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color={ORANGE} />
        <Text style={{ color: TEXT2, fontSize: 13 }}>Đang xác nhận thanh toán...</Text>
      </View>
    </SafeAreaView>
  );
}
