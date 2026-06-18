import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

export default function ImportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F2E8D5] justify-center items-center">
      <Plus size={48} color="#EA580C" className="mb-4" />
      <Text className="text-xl font-bold text-[#2B2118]">Import</Text>
      <Text className="text-sm text-[#6B5B3E] mt-2">Nhập tài liệu lịch sử của bạn tại đây</Text>
    </SafeAreaView>
  );
}
