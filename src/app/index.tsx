import { Image } from 'expo-image';
import {
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  MessageCircle,
  Search,
  Star,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - 60;

const TABS = [
  { key: 'foryou', label: 'Dành cho bạn', icon: BookOpen },
  { key: 'following', label: 'Theo dõi', icon: Star },
  { key: 'recent', label: 'Gần đây', icon: Clock },
] as const;
type TabKey = (typeof TABS)[number]['key'];

const ACTIONS = [
  { label: 'Chat\nAI', icon: MessageCircle },
  { label: 'Khám\nphá', icon: Compass },
  { label: 'Tìm\nkiếm', icon: Search },
  { label: 'Tài\nliệu', icon: BookOpen },
] as const;

const FEATURED = [
  {
    id: '1',
    title: 'Lịch sử Việt Nam',
    desc: 'Hành trình nghìn năm dựng nước và bảo vệ Tổ quốc của dân tộc Việt Nam',
    bg: '#1E3A5F',
    emoji: '🇻🇳',
  },
  {
    id: '2',
    title: 'Thế chiến II',
    desc: 'Cuộc xung đột toàn cầu định hình lại trật tự thế giới hiện đại',
    bg: '#3B1D6E',
    emoji: '⚔️',
  },
  {
    id: '3',
    title: 'Cách mạng Pháp',
    desc: 'Phong trào lịch sử mang tư tưởng Tự do · Bình đẳng · Bác ái',
    bg: '#064E3B',
    emoji: '🗼',
  },
  {
    id: '4',
    title: 'Đế quốc La Mã',
    desc: 'Nền văn minh đặt nền móng cho luật pháp và kiến trúc châu Âu',
    bg: '#78350F',
    emoji: '🏛️',
  },
] as const;

const CHARACTERS = [
  { id: '1', name: 'Hồ Chí Minh', sub: 'Chủ tịch đầu tiên · TK. XX', emoji: '⭐', bg: 'rgba(251,191,36,0.18)' },
  { id: '2', name: 'Nguyễn Huệ', sub: 'Hoàng đế Quang Trung · TK. XVIII', emoji: '🔥', bg: 'rgba(239,68,68,0.18)' },
  { id: '3', name: 'Hai Bà Trưng', sub: 'Anh hùng dân tộc · TK. I SCN', emoji: '⚔️', bg: 'rgba(99,102,241,0.18)' },
  { id: '4', name: 'Trần Hưng Đạo', sub: 'Quốc công tiết chế · TK. XIII', emoji: '🛡️', bg: 'rgba(16,185,129,0.18)' },
] as const;

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState<TabKey>('foryou');
  const initial = user?.userName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-28">

        {/* ── Header ─────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('@/assets/logo.png')}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
            <Text className="text-2xl font-bold text-zinc-100">Trang chủ</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
              <Search size={17} color="#a1a1aa" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
              <Text className="text-zinc-100 font-bold text-sm">{initial}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filter tabs ────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 gap-2 mb-8"
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full ${
                tab === key ? 'bg-zinc-100' : 'bg-zinc-800'
              }`}
            >
              <Icon size={13} color={tab === key ? '#18181b' : '#71717a'} strokeWidth={2} />
              <Text
                className={`text-sm font-semibold ${
                  tab === key ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Quick actions ──────────────────────────────────── */}
        <View className="px-5 mb-9">
          <Text className="text-xl font-bold text-zinc-100 mb-5">Khám phá &amp; học hỏi</Text>
          <View className="flex-row gap-3">
            {ACTIONS.map(({ label, icon: Icon }) => (
              <TouchableOpacity
                key={label}
                className="flex-1 bg-zinc-900 rounded-2xl items-center justify-center py-5 gap-2.5"
                activeOpacity={0.65}
              >
                <Icon size={24} color="#e4e4e7" strokeWidth={1.5} />
                <Text className="text-xs text-zinc-400 text-center font-medium leading-[18px]">
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Featured topics ────────────────────────────────── */}
        <View className="mb-2">
          <Text className="text-xl font-bold text-zinc-100 px-5 mb-5">Chủ đề nổi bật</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 gap-4"
            snapToInterval={CARD_W + 16}
            decelerationRate="fast"
          >
            {FEATURED.map(({ id, title, desc, bg, emoji }) => (
              <TouchableOpacity key={id} style={{ width: CARD_W }} activeOpacity={0.9}>
                <View
                  style={{ backgroundColor: bg, height: 260 }}
                  className="rounded-3xl overflow-hidden mb-4"
                >
                  <Text
                    style={{ fontSize: 90, position: 'absolute', right: 12, top: 12, opacity: 0.7 }}
                  >
                    {emoji}
                  </Text>
                  <View className="absolute top-4 left-4 bg-primary-500 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-semibold">Nổi bật</Text>
                  </View>
                  <View className="absolute bottom-0 left-0 right-0 p-5">
                    <Text className="text-white/50 text-xs font-semibold mb-1 uppercase tracking-widest">
                      HistoryTalk
                    </Text>
                    <Text className="text-white text-2xl font-bold leading-7">{title}</Text>
                  </View>
                </View>
                <Text className="text-[17px] font-bold text-zinc-100">{title}</Text>
                <Text className="text-sm text-zinc-500 mt-1.5 leading-5">{desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Characters ─────────────────────────────────────── */}
        <View className="px-5 mt-9">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-zinc-100">Nhân vật lịch sử</Text>
            <TouchableOpacity className="flex-row items-center gap-0.5">
              <Text className="text-primary-500 text-sm font-semibold">Tất cả</Text>
              <ChevronRight size={14} color="#EA580C" />
            </TouchableOpacity>
          </View>
          <View className="gap-2.5">
            {CHARACTERS.map(({ id, name, sub, emoji, bg }) => (
              <TouchableOpacity
                key={id}
                className="flex-row items-center bg-zinc-900 rounded-2xl p-3"
                activeOpacity={0.7}
              >
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: bg }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-zinc-100">{name}</Text>
                  <Text className="text-xs text-zinc-500 mt-0.5">{sub}</Text>
                </View>
                <ChevronRight size={16} color="#3f3f46" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── DEV logout ─────────────────────────────────────── */}
        {__DEV__ && (
          <TouchableOpacity
            className="mx-5 mt-8 border border-zinc-800 rounded-xl py-3 items-center"
            onPress={() => void logout()}
          >
            <Text className="text-red-500 text-sm font-medium">DEV: Đăng xuất</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
