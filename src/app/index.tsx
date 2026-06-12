import { useRouter } from 'expo-router';
import {
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  MessageCircle,
  Search,
  Sparkles,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';

// ─── Mock data ────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: '1', label: 'Chat\nvới nhân vật', icon: MessageCircle, color: '#EFF6FF', iconColor: '#3B82F6' },
  { id: '2', label: 'Khám\nphá sự kiện', icon: Compass, color: '#F0FDF4', iconColor: '#22C55E' },
  { id: '3', label: 'Tìm\nkiếm chủ đề', icon: Search, color: '#FFF7ED', iconColor: '#F97316' },
  { id: '4', label: 'Đọc\ntài liệu', icon: BookOpen, color: '#FDF4FF', iconColor: '#A855F7' },
] as const;

const FEATURED_TOPICS = [
  { id: '1', title: 'Lịch sử Việt Nam', subtitle: 'Hành trình dựng nước', bg: '#1D4ED8', emoji: '🇻🇳' },
  { id: '2', title: 'Thế chiến II', subtitle: 'Xung đột toàn cầu', bg: '#7C3AED', emoji: '⚔️' },
  { id: '3', title: 'Cách mạng Pháp', subtitle: 'Tự do · Bình đẳng', bg: '#0F766E', emoji: '🗼' },
  { id: '4', title: 'Đế quốc La Mã', subtitle: 'Nền tảng văn minh', bg: '#B45309', emoji: '🏛️' },
] as const;

const CHARACTERS = [
  { id: '1', name: 'Hồ Chí Minh', era: 'TK. XX', emoji: '⭐', bg: '#FEF3C7' },
  { id: '2', name: 'Nguyễn Huệ', era: 'TK. XVIII', emoji: '🔥', bg: '#FEE2E2' },
  { id: '3', name: 'Hai Bà Trưng', era: 'TK. I SCN', emoji: '⚔️', bg: '#E0E7FF' },
  { id: '4', name: 'Trần Hưng Đạo', era: 'TK. XIII', emoji: '🛡️', bg: '#D1FAE5' },
  { id: '5', name: 'Napoleon', era: 'TK. XIX', emoji: '👑', bg: '#FCE7F3' },
] as const;

const FILTER_TABS = ['Dành cho bạn', 'Phổ biến', 'Gần đây'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<FilterTab>('Dành cho bạn');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28"
      >
        {/* ── Header ────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('@/assets/logo.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-bold text-gray-900">Home</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Bell size={18} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center"
              onPress={() => {}}
            >
              <User size={18} color="#208AEF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Greeting ──────────────────────────────────────── */}
        <View className="px-5 mb-4">
          <Text className="text-sm text-gray-500">Chào mừng trở lại,</Text>
          <Text className="text-base font-semibold text-gray-900">
            {user?.userName ?? 'Học giả'} 👋
          </Text>
        </View>

        {/* ── Filter tabs ───────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 gap-2 mb-6"
        >
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab ? 'bg-gray-900' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === tab ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Quick actions ─────────────────────────────────── */}
        <View className="px-5 mb-7">
          <Text className="text-base font-semibold text-gray-900 mb-4">
            Khám phá &amp; học hỏi
          </Text>
          <View className="flex-row gap-3">
            {QUICK_ACTIONS.map(({ id, label, icon: Icon, color, iconColor }) => (
              <TouchableOpacity
                key={id}
                className="flex-1 rounded-2xl py-4 px-2 items-center gap-2"
                style={{ backgroundColor: color }}
                activeOpacity={0.8}
              >
                <Icon size={22} color={iconColor} />
                <Text className="text-xs text-gray-700 text-center leading-4">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Featured topics (horizontal scroll) ───────────── */}
        <View className="mb-7">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <Text className="text-base font-semibold text-gray-900">Chủ đề nổi bật</Text>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-primary-500 text-sm">Xem tất cả</Text>
              <ChevronRight size={14} color="#208AEF" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 gap-4"
          >
            {FEATURED_TOPICS.map(({ id, title, subtitle, bg, emoji }) => (
              <TouchableOpacity
                key={id}
                className="w-44 h-28 rounded-2xl overflow-hidden justify-end p-4"
                style={{ backgroundColor: bg }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 32, position: 'absolute', top: 12, right: 12 }}>
                  {emoji}
                </Text>
                <Text className="text-white font-bold text-base leading-5">{title}</Text>
                <Text className="text-white/70 text-xs mt-0.5">{subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Historical characters ─────────────────────────── */}
        <View className="mb-7">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#208AEF" />
              <Text className="text-base font-semibold text-gray-900">Nhân vật lịch sử</Text>
            </View>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-primary-500 text-sm">Tất cả</Text>
              <ChevronRight size={14} color="#208AEF" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 gap-3"
          >
            {CHARACTERS.map(({ id, name, era, emoji, bg }) => (
              <TouchableOpacity
                key={id}
                className="items-center w-24"
                activeOpacity={0.8}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: bg }}
                >
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </View>
                <Text className="text-xs font-semibold text-gray-800 text-center leading-4">
                  {name}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">{era}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Recent activity ───────────────────────────────── */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#6B7280" />
              <Text className="text-base font-semibold text-gray-900">Gần đây</Text>
            </View>
          </View>

          {/* Empty state */}
          <View className="bg-gray-50 rounded-2xl px-5 py-8 items-center gap-3">
            <MessageCircle size={36} color="#D1D5DB" />
            <Text className="text-gray-500 text-sm text-center">
              Bạn chưa có cuộc trò chuyện nào.{'\n'}Hãy bắt đầu chat với một nhân vật lịch sử!
            </Text>
            <TouchableOpacity className="mt-1 bg-primary-500 rounded-full px-5 py-2.5">
              <Text className="text-white text-sm font-semibold">Bắt đầu ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Dev: Logout button ────────────────────────────── */}
        {__DEV__ && (
          <TouchableOpacity
            className="mx-5 mt-8 border border-red-200 rounded-xl py-3 items-center"
            onPress={() => void logout()}
          >
            <Text className="text-red-500 text-sm font-medium">DEV: Đăng xuất</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
