import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Headphones } from 'lucide-react-native';

export default function VoicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950 justify-center items-center">
      <Headphones size={48} color="#FB923C" />
      <Text className="text-xl font-bold text-zinc-100 mt-4">Giọng nói</Text>
      <Text className="text-sm text-zinc-400 mt-2">Chọn giọng nhân vật lịch sử yêu thích</Text>
    </SafeAreaView>
  );
}
