import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Clock, MessageCircle, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/confirm-modal';
import { chatApi } from '@/features/chat/api';
import { useCreateSession } from '@/features/chat/hooks/use-create-session';
import type { ChatSession } from '@/features/chat/types';

import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  BG,
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  SURFACE,
  TEXT,
  TEXT2,
} from '@/constants/palette';
import { useCharacter } from '@/features/characters/hooks/use-character';
import { ERA_COLORS, getCharacterImageUri, type CharacterEra } from '@/features/characters/types';

function formatDate(y?: number, m?: number, d?: number, bc?: boolean): string | null {
  if (!y) return null;
  const parts: string[] = [];
  if (d) parts.push(String(d).padStart(2, '0'));
  if (m) parts.push(String(m).padStart(2, '0'));
  parts.push(String(y));
  return parts.join('/') + (bc ? ' TCN' : '');
}

const ERA_HERO_BG: Record<CharacterEra, string> = {
  ANCIENT:      '#2C1810',
  MEDIEVAL:     '#1A0E38',
  MODERN:       '#0A2420',
  CONTEMPORARY: '#0D1B2A',
};

function getSessionTime(session: ChatSession) {
  const value = session.lastMessageAt ?? session.updatedAt ?? session.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function getLatestSession(sessions: ChatSession[], contextId: string) {
  return sessions
    .filter((session) => session.contextId === contextId)
    .sort((a, b) => getSessionTime(b) - getSessionTime(a))[0];
}

function formatSessionDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function CharacterDetailScreen() {
  const { id }     = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: char, isLoading, isError } = useCharacter(resolvedId ?? '');
  const { mutateAsync: createSession }     = useCreateSession();
  const [creatingFor, setCreatingFor]      = useState<string | null>(null);
  const [pendingDelete, setPendingDelete]  = useState<ChatSession | null>(null);
  const [deletingId, setDeletingId]        = useState<string | undefined>();

  const { data: sessions = [] } = useQuery({
    queryKey: ['character-sessions', resolvedId],
    queryFn: async () => {
      if (!char?.contexts?.length) return [];
      const results = await Promise.all(
        char.contexts.map((ctx) =>
          chatApi.getSessions({ characterId: resolvedId!, contextId: ctx.contextId.id }),
        ),
      );
      return results.flat().sort((a, b) => getSessionTime(b) - getSessionTime(a));
    },
    enabled: !!resolvedId && !!char,
  });

  const deleteSession = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onMutate: (sessionId) => setDeletingId(sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['character-sessions', resolvedId] });
      await queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      setPendingDelete(null);
    },
    onError: (e: any) => Alert.alert('Lỗi', e?.message ?? 'Không thể xoá cuộc trò chuyện'),
    onSettled: () => setDeletingId(undefined),
  });

  async function startChat(contextId: string, contextName: string) {
    if (creatingFor) return;
    setCreatingFor(contextId);
    try {
      const existingSessions = await chatApi.getSessions({ characterId: resolvedId!, contextId });
      const latestSession = getLatestSession(existingSessions, contextId);
      const result = latestSession ? null : await createSession({ characterId: resolvedId!, contextId });
      const session = latestSession ?? result?.session ?? result;
      if (!session.id) throw new Error('Missing chat session id');
      router.push({
        pathname: '/chat/[sessionId]',
        params: {
          sessionId:     session.id,
          characterId:   resolvedId!,
          contextId,
          characterName: char?.name ?? '',
          characterImageUrl: char ? getCharacterImageUri(char) ?? '' : '',
          characterModelUrl: char?.modelUrl ?? '',
          contextName,
          greetingMessage: result?.greetingMessage ? JSON.stringify(result.greetingMessage) : '',
          suggestedQuestions: result?.suggestedQuestions ? JSON.stringify(result.suggestedQuestions) : '',
        },
      });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể bắt đầu cuộc trò chuyện');
    } finally {
      setCreatingFor(null);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !char) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <Heading size="md" className="mb-3 text-center">Không tìm thấy nhân vật</Heading>
        <TouchableOpacity onPress={() => router.back()}>
          <Text size="sm" className="text-primary-500 font-semibold">← Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ec        = char.era ? ERA_COLORS[char.era] : null;
  const heroBg    = char.era ? ERA_HERO_BG[char.era] : CARD;
  const bornDate  = formatDate(char.bornYear,  char.bornMonth,  char.bornDay,  char.isBornBc);
  const deathDate = formatDate(char.deathYear, char.deathMonth, char.deathDay, char.isDeathBc);
  const imageUri  = getCharacterImageUri(char);
  const dateRange = [bornDate, deathDate].filter(Boolean).join('  –  ');

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero image ─────────────────────────────────────── */}
        <View style={{ height: 360, width: '100%', backgroundColor: heroBg }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 130, fontWeight: '900', color: ec?.glow ?? TEXT, opacity: 0.14 }}>
                {char.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* ── Character info ─────────────────────────────────── */}
        <VStack style={{ paddingHorizontal: 24, paddingTop: 28, alignItems: 'center' }}>

          {/* Name */}
          <Heading size="3xl" style={{ textAlign: 'center', marginBottom: 8 }}>
            {char.name}
          </Heading>

          {/* Title */}
          {char.title ? (
            <Text style={{ color: ORANGE, fontWeight: '600', textAlign: 'center', marginBottom: 4, fontSize: 15 }}>
              {char.title}
            </Text>
          ) : null}

          {/* Date range */}
          {dateRange ? (
            <Text style={{ color: ORANGE, textAlign: 'center', marginBottom: 28, fontSize: 14 }}>
              {dateRange}
            </Text>
          ) : null}

          {/* Context list */}
          {char.contexts && char.contexts.length > 0 ? (
            <View style={{ width: '100%', marginBottom: 28, gap: 10 }}>
              {char.contexts.map((ctx) => (
                <TouchableOpacity
                  key={ctx.contextId.id}
                  onPress={() => router.push({ pathname: '/context/[id]', params: { id: ctx.contextId.id } })}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: SURFACE,
                    borderRadius: 14,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: `${ORANGE}33`,
                  }}
                >
                  <View style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: ORANGE,
                    marginRight: 12,
                  }} />
                  <Text style={{ flex: 1, fontWeight: '600', fontSize: 14 }}>
                    {ctx.name}
                  </Text>
                  <ChevronRight size={18} color={ORANGE} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Tiểu sử */}
          {char.background ? (
            <Text style={{ lineHeight: 24, fontSize: 15, alignSelf: 'stretch', marginBottom: 16 }}>
              {char.background}
            </Text>
          ) : null}

          {/* Tính cách */}
          {char.personality ? (
            <Text style={{ lineHeight: 24, fontSize: 15, alignSelf: 'stretch', marginBottom: 28 }}>
              {char.personality}
            </Text>
          ) : null}

          {/* ── Lịch sử trò chuyện ─────────────────────────── */}
          {sessions.length > 0 ? (
            <View style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Clock size={16} color={ORANGE} />
                <Heading size="md">Lịch sử trò chuyện</Heading>
              </View>
              <View style={{ gap: 10 }}>
                {sessions.map((session) => {
                  const title = session.sessionTitle ?? session.title ?? session.contextName ?? 'Cuộc trò chuyện';
                  const isDeleting = deletingId === session.id;
                  return (
                    <TouchableOpacity
                      key={session.id}
                      activeOpacity={0.75}
                      onPress={() =>
                        router.push({
                          pathname: '/chat/[sessionId]',
                          params: {
                            sessionId: session.id,
                            characterId: session.characterId,
                            contextId: session.contextId,
                            characterName: char.name,
                            characterImageUrl: getCharacterImageUri(char) ?? '',
                            characterModelUrl: char.modelUrl ?? '',
                            contextName: session.contextName ?? '',
                          },
                        })
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: CARD,
                        borderWidth: 1,
                        borderColor: BORDER,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: TEXT, fontSize: 14, fontWeight: '800' }} numberOfLines={1}>
                          {title}
                        </Text>
                        <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                          {[session.contextName, formatSessionDate(session.lastMessageAt)].filter(Boolean).join(' · ')}
                        </Text>
                        {session.lastMessage ? (
                          <Text style={{ color: TEXT2, fontSize: 12, lineHeight: 17, marginTop: 5 }} numberOfLines={2}>
                            {session.lastMessage}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        hitSlop={10}
                        disabled={isDeleting}
                        onPress={(e) => { e.stopPropagation(); setPendingDelete(session); }}
                        style={({ pressed }) => ({
                          width: 34, height: 34, borderRadius: 10,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: 'rgba(220,38,38,0.08)',
                          opacity: pressed || isDeleting ? 0.6 : 1,
                        })}
                      >
                        {isDeleting
                          ? <ActivityIndicator size="small" color="#dc2626" />
                          : <Trash2 size={15} color="#dc2626" />}
                      </Pressable>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

        </VStack>
      </ScrollView>

      {/* ── Sticky back button ─────────────────────────────── */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingTop: insets.top,
        pointerEvents: 'box-none',
      }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.92)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color="#1c1917" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Fixed CTA ─────────────────────────────────────── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
        backgroundColor: BG,
        borderTopWidth: 1, borderTopColor: BORDER,
      }}>
        <Button
          size="lg"
          className="rounded-[18px] h-[54px]"
          disabled={!!creatingFor || !char.contexts?.length}
          onPress={() => {
            const first = char.contexts?.[0];
            if (first) void startChat(first.contextId.id, first.name);
          }}
        >
          {creatingFor
            ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            : <ButtonIcon as={MessageCircle} size={20} />}
          <ButtonText size="md">Chat với {char.name}</ButtonText>
        </Button>
      </View>

      {/* ── Confirm delete modal ───────────────────────────── */}
      <ConfirmModal
        visible={!!pendingDelete}
        title="Xoá cuộc trò chuyện?"
        message="Cuộc trò chuyện này sẽ bị xoá vĩnh viễn và không thể khôi phục lại."
        cancelText="Huỷ"
        confirmText="Xoá"
        variant="danger"
        loading={deleteSession.isPending}
        icon={<Trash2 size={22} color="#dc2626" />}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete && !deleteSession.isPending) deleteSession.mutate(pendingDelete.id);
        }}
      />
    </View>
  );
}
