import {
  BookOpen,
  ChevronRight,
  Filter,
  Flame,
  Globe,
  Search,
  Shield,
  Star,
  Swords,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Mock data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'vietnam', label: 'Việt Nam' },
  { id: 'world', label: 'Thế giới' },
  { id: 'war', label: 'Chiến tranh' },
  { id: 'culture', label: 'Văn hoá' },
  { id: 'people', label: 'Nhân vật' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

const TOPICS = [
  {
    id: '1',
    title: 'Kháng chiến chống Mỹ',
    desc: 'Cuộc chiến tranh giải phóng dân tộc 1954–1975',
    category: 'vietnam',
    icon: Shield,
    color: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3B82F6',
    hot: true,
  },
  {
    id: '2',
    title: 'Chiến tranh Thế giới II',
    desc: 'Xung đột toàn cầu lớn nhất lịch sử loài người',
    category: 'war',
    icon: Swords,
    color: 'rgba(217, 119, 6, 0.15)',
    iconColor: '#D97706',
    hot: true,
  },
  {
    id: '3',
    title: 'Triều đại nhà Nguyễn',
    desc: 'Triều đại phong kiến cuối cùng của Việt Nam',
    category: 'vietnam',
    icon: Star,
    color: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#A855F7',
    hot: false,
  },
  {
    id: '4',
    title: 'Đế chế Mông Cổ',
    desc: 'Đế quốc lớn nhất trong lịch sử thế giới',
    category: 'world',
    icon: Globe,
    color: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10B981',
    hot: false,
  },
  {
    id: '5',
    title: 'Cách mạng tháng Tám',
    desc: 'Sự kiện lịch sử trọng đại năm 1945',
    category: 'vietnam',
    icon: Flame,
    color: 'rgba(239, 68, 68, 0.15)',
    iconColor: '#EF4444',
    hot: true,
  },
  {
    id: '6',
    title: 'Văn hoá Đông Sơn',
    desc: 'Nền văn minh cổ đại trên lãnh thổ Việt Nam',
    category: 'culture',
    icon: BookOpen,
    color: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#22C55E',
    hot: false,
  },
  {
    id: '7',
    title: 'Danh nhân thế giới',
    desc: 'Những nhân vật thay đổi dòng chảy lịch sử',
    category: 'people',
    icon: Users,
    color: 'rgba(14, 165, 233, 0.15)',
    iconColor: '#0EA5E9',
    hot: false,
  },
  {
    id: '8',
    title: 'Chiến tranh Lạnh',
    desc: 'Cuộc đối đầu Mỹ – Xô sau WWII',
    category: 'war',
    icon: Swords,
    color: 'rgba(100, 116, 139, 0.15)',
    iconColor: '#64748B',
    hot: false,
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

  const filtered = TOPICS.filter((t) => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchQ =
      query.trim() === '' ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* ── Header ──────────────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-xl font-bold text-zinc-100 mb-4">Khám phá</Text>

        {/* Search bar */}
        <View className="flex-row items-center bg-zinc-900 rounded-2xl px-4 h-12 gap-3">
          <Search size={18} color="#71717a" />
          <TextInput
            className="flex-1 text-zinc-100 text-sm"
            placeholder="Tìm kiếm chủ đề lịch sử..."
            placeholderTextColor="#71717a"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Text className="text-zinc-400 text-base">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category tabs ───────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-5 gap-2 pb-4"
      >
        {CATEGORIES.map(({ id, label }) => (
          <Pressable
            key={id}
            onPress={() => setActiveCategory(id)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === id ? 'bg-primary-500' : 'bg-zinc-900'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeCategory === id ? 'text-white' : 'text-zinc-400'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Results count + filter ───────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-sm text-zinc-500">
          {filtered.length} chủ đề
        </Text>
        <TouchableOpacity className="flex-row items-center gap-1.5 bg-zinc-900 rounded-full px-3 py-1.5">
          <Filter size={13} color="#a1a1aa" />
          <Text className="text-xs text-zinc-300 font-medium">Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* ── Topic list ──────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 gap-3 pb-28"
      >
        {filtered.length === 0 ? (
          <View className="items-center py-16 gap-3">
            <Search size={40} color="#4b5563" />
            <Text className="text-zinc-500 text-sm text-center">
              Không tìm thấy kết quả phù hợp.{'\n'}Thử từ khóa khác nhé!
            </Text>
          </View>
        ) : (
          filtered.map(({ id, title, desc, icon: Icon, color, iconColor, hot }) => (
            <TouchableOpacity
              key={id}
              className="flex-row items-center bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 gap-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
              activeOpacity={0.8}
            >
              {/* Icon */}
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <Icon size={24} color={iconColor} />
              </View>

              {/* Text */}
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-zinc-100" numberOfLines={1}>
                    {title}
                  </Text>
                  {hot && (
                    <View className="bg-red-950/50 rounded-full px-2 py-0.5">
                      <Text className="text-red-400 text-xs font-medium">HOT</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-zinc-400 leading-4" numberOfLines={2}>
                  {desc}
                </Text>
              </View>

              <ChevronRight size={16} color="#4b5563" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
