import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950 justify-center items-center">
      <BookOpen size={48} color="#FB923C" />
      <Text className="text-xl font-bold text-zinc-100 mt-4">Thư viện</Text>
      <Text className="text-sm text-zinc-400 mt-2">Các cuộc trò chuyện đã lưu của bạn</Text>
    </SafeAreaView>
  );
}
