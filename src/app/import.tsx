import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

export default function ImportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950 justify-center items-center">
      <Plus size={48} color="#FB923C" className="mb-4" />
      <Text className="text-xl font-bold text-zinc-100">Import</Text>
      <Text className="text-sm text-zinc-400 mt-2">Nhập tài liệu lịch sử của bạn tại đây</Text>
    </SafeAreaView>
  );
}
