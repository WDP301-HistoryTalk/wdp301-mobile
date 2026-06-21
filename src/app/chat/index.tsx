import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, ORANGE_TINT, TEXT } from '@/constants/palette';
import { useChatHistory } from '@/features/chat/hooks/use-chat-history';
import type { ChatSession } from '@/features/chat/types';

function formatRelative(iso?: string) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

function SessionRow({ session, onPress }: { session: ChatSession; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={s.row}>
      <View style={s.avatar}>
        <MessageCircle size={20} color={ORANGE} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={1}>
          {session.title || 'Cuộc trò chuyện'}
        </Text>
        <Text style={s.time}>{formatRelative(session.lastMessageAt ?? session.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ChatSkeletons() {
  return (
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} style={{ height: 68, borderRadius: 16 }} />
      ))}
    </View>
  );
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ characterId?: string; characterName?: string }>();
  const characterId = Array.isArray(params.characterId) ? params.characterId[0] : params.characterId;
  const characterName = Array.isArray(params.characterName) ? params.characterName[0] : params.characterName;

  const { data: allSessions, isLoading, isError } = useChatHistory();
  const sessions = characterId
    ? (allSessions ?? []).filter((sess) => sess.characterId === characterId)
    : allSessions;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerSub}>{characterName ?? 'Cuộc trò chuyện'}</Text>
          <Text style={s.headerTitle}>Lịch sử chat</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ marginTop: 8 }}>
          <ChatSkeletons />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: MUTED }}>Không thể tải lịch sử chat</Text>
        </View>
      ) : (
        <FlatList
          data={sessions ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <MessageCircle size={40} color={MUTED} strokeWidth={1.25} />
              <Text style={{ color: MUTED, fontSize: 15, textAlign: 'center' }}>
                {characterId
                  ? `Chưa có cuộc trò chuyện nào với ${characterName ?? 'nhân vật này'}`
                  : 'Chưa có cuộc trò chuyện nào\nHãy bắt đầu từ một nhân vật lịch sử'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <SessionRow
              session={item}
              onPress={() =>
                router.push({
                  pathname: '/chat/[sessionId]',
                  params: { sessionId: item.id, characterName: characterName ?? '' },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: CARD, alignItems: 'center', justifyContent: 'center',
  },
  headerSub: { color: MUTED, fontSize: 12, marginBottom: 2 },
  headerTitle: { color: TEXT, fontSize: 24, fontWeight: '800' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ORANGE_TINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: TEXT, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  time: { color: MUTED, fontSize: 11 },
});
