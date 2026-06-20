import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Plus } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, SURFACE, TEXT, TEXT2 } from '@/constants/palette';
import { useChatHistory } from '@/features/chat/hooks/use-chat-history';
import type { ChatHistoryGroup, ChatSession } from '@/features/chat/types';

type RawHistoryItem = Partial<ChatHistoryGroup & ChatSession>;

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function normalizeHistory(data: RawHistoryItem[] | undefined): ChatHistoryGroup[] {
  if (!Array.isArray(data)) return [];

  const grouped = new Map<string, ChatHistoryGroup>();

  for (const item of data) {
    if (Array.isArray(item.sessions)) {
      const contextId = item.contextId ?? 'unknown';
      grouped.set(contextId, {
        contextId,
        contextName: item.contextName ?? 'Khac',
        sessions: item.sessions,
      });
      continue;
    }

    if (!item.id) continue;

    const contextId = item.contextId ?? 'unknown';
    const current = grouped.get(contextId) ?? {
      contextId,
      contextName: item.contextName ?? 'Khac',
      sessions: [],
    };

    current.sessions.push(item as ChatSession);
    grouped.set(contextId, current);
  }

  return [...grouped.values()].filter((group) => group.sessions.length > 0);
}

function SessionRow({ item }: { item: ChatSession }) {
  const router = useRouter();
  const title = item.sessionTitle ?? item.title ?? item.characterName ?? 'Cuoc tro chuyen';

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      style={s.sessionRow}
      onPress={() =>
        router.push({
          pathname: '/chat/[sessionId]',
          params: {
            sessionId: item.id,
            characterId: item.characterId,
            contextId: item.contextId,
            characterName: item.characterName ?? '',
            characterImageUrl: item.characterImage ?? '',
            characterModelUrl: item.characterModelUrl ?? '',
            contextName: item.contextName ?? '',
          },
        })
      }
    >
      <View style={s.avatar}>
        {item.characterImage ? (
          <Image source={{ uri: item.characterImage }} style={s.avatarImage} contentFit="cover" />
        ) : (
          <MessageCircle size={18} color={ORANGE} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.sessionTitle} numberOfLines={1}>{title}</Text>
        <Text style={s.sessionMeta} numberOfLines={1}>
          {[item.characterName, formatDate(item.lastMessageAt)].filter(Boolean).join(' • ')}
        </Text>
        {item.lastMessage ? <Text style={s.lastMessage} numberOfLines={2}>{item.lastMessage}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function HistoryGroup({ item }: { item: ChatHistoryGroup }) {
  const sessions = Array.isArray(item.sessions) ? item.sessions : [];

  return (
    <View style={s.group}>
      <Text style={s.groupTitle}>{item.contextName}</Text>
      <View style={{ gap: 10 }}>
        {sessions.map((session) => <SessionRow key={session.id} item={session} />)}
      </View>
    </View>
  );
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useChatHistory();
  const groups = normalizeHistory(data as RawHistoryItem[] | undefined);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.headerBtn}>
          <ArrowLeft size={20} color={TEXT} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Lich su tro chuyen</Text>
          <Text style={s.subtitle}>Mo lai cac session chat da tao</Text>
        </View>
        <Pressable onPress={() => router.push('/characters')} style={s.newBtn}>
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={ORANGE} size="large" />
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.contextId}
          renderItem={({ item }) => <HistoryGroup item={item} />}
          contentContainerStyle={s.list}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyTitle}>{isError ? 'Khong the tai lich su' : 'Chua co cuoc tro chuyen'}</Text>
              <Text style={s.emptyText}>
                {isError ? 'Keo xuong de thu lai.' : 'Chon mot nhan vat de tao session chat moi.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 120,
    gap: 18,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    color: TEXT2,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sessionRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  sessionTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  sessionMeta: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  lastMessage: {
    color: TEXT2,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
