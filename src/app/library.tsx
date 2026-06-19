import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F2E8D5] justify-center items-center">
      <BookOpen size={48} color="#EA580C" />
      <Text className="text-xl font-bold text-[#2B2118] mt-4">Thư viện</Text>
      <Text className="text-sm text-[#6B5B3E] mt-2">Các cuộc trò chuyện đã lưu của bạn</Text>
    </SafeAreaView>
  );
}
