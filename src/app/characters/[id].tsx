import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, History, MapPin, MessageCircle, Skull } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateSession } from '@/features/chat/hooks/use-create-session';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { BG, CARD, BORDER, MUTED, SURFACE, TEXT } from '@/constants/palette';
import { useCharacter } from '@/features/characters/hooks/use-character';
import { ERA_COLORS, ERA_LABELS, getCharacterImageUri, type CharacterEra } from '@/features/characters/types';

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

const floatingBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'rgba(0,0,0,0.45)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <VStack space="sm" style={{ marginBottom: 28 }}>
      <HStack space="sm">
        <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#EA580C' }} />
        <Heading size="sm" className="text-[#2B2118]">{title}</Heading>
      </HStack>
      {children}
    </VStack>
  );
}

export default function CharacterDetailScreen() {
  const { id }     = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router     = useRouter();
  const { data: char, isLoading, isError } = useCharacter(resolvedId ?? '');
  const { mutateAsync: createSession }     = useCreateSession();
  const [creatingFor, setCreatingFor]      = useState<string | null>(null);

  async function startChat(contextId: string, contextName: string) {
    if (creatingFor) return;
    setCreatingFor(contextId);
    try {
      const result = await createSession({ characterId: resolvedId!, contextId });
      router.push({
        pathname: '/chat/[sessionId]',
        params: {
          sessionId:     result.session.id,
          characterName: char?.name ?? '',
          characterImageUrl: char ? getCharacterImageUri(char) ?? '' : '',
          contextName,
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

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Full-bleed hero ─────────────────────────────────────── */}
        <View style={{ height: 380, width: '100%', backgroundColor: heroBg }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 130, fontWeight: '900', color: ec?.glow ?? TEXT, opacity: 0.14 }}>
                {char.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* 3-layer bottom gradient — stays dark all the way down so the name/title text
              (anchored near the bottom) never lands on a light strip */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220 }}>
            <View style={{ flex: 2 }} />
            <View style={{ flex: 2, backgroundColor: 'rgba(43,33,24,0.55)' }} />
            <View style={{ flex: 3, backgroundColor: 'rgba(43,33,24,0.94)' }} />
          </View>

          {/* Floating back + chat-history buttons */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 16 }}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={floatingBtnStyle}>
                <ArrowLeft size={18} color="#f4f4f5" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/chat' as never,
                    params: { characterId: char.id, characterName: char.name },
                  })
                }
                activeOpacity={0.7}
                style={floatingBtnStyle}
              >
                <History size={18} color="#f4f4f5" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Name + era overlaid at bottom */}
          <View style={{ position: 'absolute', bottom: 50, left: 20, right: 20 }}>
            {char.era && ec ? (
              <Badge
                className="mb-2.5"
                style={{ backgroundColor: ec.bg, borderColor: `${ec.text}33` }}
              >
                <BadgeText style={{ color: ec.text, fontSize: 11 }}>
                  {ERA_LABELS[char.era]}
                </BadgeText>
              </Badge>
            ) : null}
            <Heading size="4xl" className="text-white leading-9" numberOfLines={2}>
              {char.name}
            </Heading>
            {char.title ? (
              <Text size="sm" className="text-white/55 mt-1">{char.title}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Body ───────────────────────────────────────────────── */}
        <VStack style={{ paddingHorizontal: 20, paddingTop: 24 }}>

          {/* Dates */}
          {(bornDate || deathDate) ? (
            <Card className="mb-7 flex-row gap-4">
              {bornDate ? (
                <HStack space="sm" className="flex-1">
                  <View style={{
                    width: 34, height: 34, borderRadius: 10,
                    backgroundColor: 'rgba(234,88,12,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Calendar size={15} color="#EA580C" />
                  </View>
                  <VStack space="xs">
                    <Text size="2xs" muted bold className="uppercase tracking-widest">
                      Sinh năm
                    </Text>
                    <Text size="sm" bold>{bornDate}</Text>
                  </VStack>
                </HStack>
              ) : null}
              {bornDate && deathDate ? (
                <Divider orientation="vertical" />
              ) : null}
              {deathDate ? (
                <HStack space="sm" className="flex-1">
                  <View style={{
                    width: 34, height: 34, borderRadius: 10,
                    backgroundColor: 'rgba(113,113,122,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Skull size={15} color={MUTED} />
                  </View>
                  <VStack space="xs">
                    <Text size="2xs" muted bold className="uppercase tracking-widest">
                      Mất năm
                    </Text>
                    <Text size="sm" bold>{deathDate}</Text>
                  </VStack>
                </HStack>
              ) : null}
            </Card>
          ) : null}

          {/* Tiểu sử */}
          {char.background ? (
            <Section title="Tiểu sử">
              <Text muted size="sm" style={{ lineHeight: 22 }}>{char.background}</Text>
            </Section>
          ) : null}

          {/* Tính cách */}
          {char.personality ? (
            <Section title="Tính cách">
              <Text muted size="sm" style={{ lineHeight: 22 }}>{char.personality}</Text>
            </Section>
          ) : null}

          {/* Bối cảnh lịch sử */}
          {char.contexts && char.contexts.length > 0 ? (
            <Section title="Bối cảnh lịch sử">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {char.contexts.map((ctx) => {
                  const loading = creatingFor === ctx.contextId.id;
                  return (
                    <TouchableOpacity
                      key={ctx.contextId.id}
                      onPress={() => void startChat(ctx.contextId.id, ctx.name)}
                      activeOpacity={0.7}
                      disabled={!!creatingFor}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: SURFACE,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderWidth: 1,
                        borderColor: loading ? 'rgba(234,88,12,0.6)' : 'rgba(234,88,12,0.2)',
                        opacity: creatingFor && !loading ? 0.5 : 1,
                      }}
                    >
                      {loading
                        ? <ActivityIndicator size="small" color="#EA580C" style={{ width: 11, height: 11 }} />
                        : <MapPin size={11} color="#EA580C" />}
                      <Text size="xs" className="text-[#2B2118] font-medium">
                        {ctx.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Section>
          ) : null}
        </VStack>
      </ScrollView>

      {/* ── Fixed CTA ─────────────────────────────────────────────── */}
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
    </View>
  );
}
