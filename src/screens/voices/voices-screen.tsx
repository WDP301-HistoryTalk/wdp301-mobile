import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Headphones } from 'lucide-react-native';

import { ORANGE } from '@/constants/palette';

export default function VoicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-history-bg justify-center items-center">
      <Headphones size={48} color={ORANGE} />
      <Text className="text-xl font-bold text-history-text mt-4">Giọng nói</Text>
      <Text className="text-sm text-history-muted mt-2">Chọn giọng nhân vật lịch sử yêu thích</Text>
    </SafeAreaView>
  );
}
