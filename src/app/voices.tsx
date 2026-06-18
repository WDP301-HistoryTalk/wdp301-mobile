import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Headphones } from 'lucide-react-native';

export default function VoicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F2E8D5] justify-center items-center">
      <Headphones size={48} color="#EA580C" />
      <Text className="text-xl font-bold text-[#2B2118] mt-4">Giọng nói</Text>
      <Text className="text-sm text-[#6B5B3E] mt-2">Chọn giọng nhân vật lịch sử yêu thích</Text>
    </SafeAreaView>
  );
}
