import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

import { ORANGE } from '@/constants/palette';

export default function ImportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-history-bg justify-center items-center">
      <Plus size={48} color={ORANGE} className="mb-4" />
      <Text className="text-xl font-bold text-history-text">Import</Text>
      <Text className="text-sm text-history-muted mt-2">Nhập tài liệu lịch sử của bạn tại đây</Text>
    </SafeAreaView>
  );
}
