import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ERA_COLORS, ERA_LABELS } from '@/features/characters/types';
import { useHistoricalContext } from '@/features/historical-contexts/hooks/use-historical-context';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatContextYear,
  type ContextCharacter,
} from '@/features/historical-contexts/types';

const ERA_HERO_BG: Record<string, string> = {
  ANCIENT:      '#2C1810',
  MEDIEVAL:     '#1A0E38',
  MODERN:       '#0A2420',
  CONTEMPORARY: '#0D1B2A',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <VStack space="sm" style={{ marginBottom: 28 }}>
      <HStack space="sm" style={{ alignItems: 'center' }}>
        <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#EA580C' }} />
        <Heading size="sm" className="text-zinc-100">{title}</Heading>
      </HStack>
      {children}
    </VStack>
  );
}

function CharacterChip({ char, onPress }: { char: ContextCharacter; onPress: () => void }) {
  const initial = char.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={{ alignItems: 'center', width: 72 }}>
      <View
        style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: '#27272a',
          borderWidth: 2, borderColor: 'rgba(234,88,12,0.35)',
          overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {char.image ? (
          <Image source={{ uri: char.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#EA580C', opacity: 0.8 }}>
            {initial}
          </Text>
        )}
      </View>
      <Text size="2xs" className="text-zinc-300 text-center mt-1.5" numberOfLines={2} style={{ maxWidth: 68 }}>
        {char.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function ContextDetailScreen() {
  const { id }     = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router     = useRouter();
  const { data: ctx, isLoading, isError } = useHistoricalContext(resolvedId ?? '');

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !ctx) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <Heading size="md" className="mb-3 text-center">Không tìm thấy bối cảnh</Heading>
        <TouchableOpacity onPress={() => router.back()}>
          <Text size="sm" className="text-primary-500 font-semibold">← Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ec       = ERA_COLORS[ctx.era];
  const heroBg   = ERA_HERO_BG[ctx.era] ?? '#18181b';
  const yearText = formatContextYear(ctx);
  const imageUri = (ctx as any).imageUrl ?? ctx.image;

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <View style={{ height: 300, width: '100%', backgroundColor: heroBg }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 110, fontWeight: '900', color: ec?.text ?? '#ffffff', opacity: 0.1 }}>
                {ctx.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180 }}>
            <View style={{ flex: 2 }} />
            <View style={{ flex: 2, backgroundColor: 'rgba(9,9,11,0.55)' }} />
            <View style={{ flex: 2, backgroundColor: 'rgba(9,9,11,0.82)' }} />
            <View style={{ height: 50, backgroundColor: '#09090b' }} />
          </View>

          {/* Back button */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                margin: 16, width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.45)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <ArrowLeft size={18} color="#f4f4f5" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Name + badges at bottom */}
          <View style={{ position: 'absolute', bottom: 44, left: 20, right: 20 }}>
            <HStack space="sm" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
              {ec ? (
                <Badge style={{ backgroundColor: ec.bg, borderColor: `${ec.text}33` }}>
                  <BadgeText style={{ color: ec.text, fontSize: 11 }}>{ERA_LABELS[ctx.era]}</BadgeText>
                </Badge>
              ) : null}
              {ctx.category ? (
                <Badge style={{
                  backgroundColor: `${CATEGORY_COLORS[ctx.category]}18`,
                  borderColor: `${CATEGORY_COLORS[ctx.category]}40`,
                }}>
                  <BadgeText style={{ color: CATEGORY_COLORS[ctx.category], fontSize: 11 }}>
                    {CATEGORY_LABELS[ctx.category]}
                  </BadgeText>
                </Badge>
              ) : null}
            </HStack>
            <Heading size="3xl" className="text-white leading-9" numberOfLines={3}>
              {ctx.name}
            </Heading>
          </View>
        </View>

        {/* ── Body ───────────────────────────────────────────────── */}
        <VStack style={{ paddingHorizontal: 20, paddingTop: 20 }}>

          {/* Info card */}
          {(yearText || ctx.period || ctx.location) ? (
            <Card className="mb-7 gap-3">
              {yearText ? (
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 9,
                    backgroundColor: 'rgba(234,88,12,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Calendar size={14} color="#EA580C" />
                  </View>
                  <VStack space="xs">
                    <Text size="2xs" muted bold className="uppercase tracking-widest">Thời gian</Text>
                    <Text size="sm" bold>{yearText}</Text>
                  </VStack>
                </HStack>
              ) : null}
              {ctx.period ? (
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 9,
                    backgroundColor: 'rgba(168,85,247,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: 14 }}>⏳</Text>
                  </View>
                  <VStack space="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="2xs" muted bold className="uppercase tracking-widest">Giai đoạn</Text>
                    <Text size="sm" bold numberOfLines={1} ellipsizeMode="tail">{ctx.period}</Text>
                  </VStack>
                </HStack>
              ) : null}
              {ctx.location ? (
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 9,
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <MapPin size={14} color="#10B981" />
                  </View>
                  <VStack space="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="2xs" muted bold className="uppercase tracking-widest">Địa điểm</Text>
                    <Text size="sm" bold numberOfLines={1} ellipsizeMode="tail">{ctx.location}</Text>
                  </VStack>
                </HStack>
              ) : null}
            </Card>
          ) : null}

          {/* Description */}
          {ctx.description ? (
            <Section title="Mô tả">
              <Text muted size="sm" style={{ lineHeight: 22 }}>{ctx.description}</Text>
            </Section>
          ) : null}

          {/* Characters */}
          {ctx.characterIds && ctx.characterIds.length > 0 ? (
            <Section title="Nhân vật liên quan">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
                {ctx.characterIds.map((char) => (
                    <CharacterChip
                      key={char.id}
                      char={char}
                      onPress={() => router.push({ pathname: '/characters/[id]', params: { id: char.id } })}
                    />
                ))}
              </ScrollView>
            </Section>
          ) : null}

          {/* Quiz banner */}
          <TouchableOpacity
            onPress={() => router.push('/quiz')}
            activeOpacity={0.85}
            style={quizStyles.banner}
          >
            <View style={quizStyles.bannerIconWrap}>
              <Trophy size={26} color="#EA580C" strokeWidth={1.75} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={quizStyles.bannerTitle}>Kiểm tra kiến thức</Text>
              <Text style={quizStyles.bannerSub}>Làm bộ câu hỏi liên quan đến giai đoạn này</Text>
            </View>
            <Text style={{ color: '#EA580C', fontSize: 20, fontWeight: '300', marginLeft: 8 }}>›</Text>
          </TouchableOpacity>

        </VStack>
      </ScrollView>
    </View>
  );
}

const quizStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(234,88,12,0.08)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)',
    padding: 16, marginBottom: 16,
  },
  bannerIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(234,88,12,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { color: '#f4f4f5', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  bannerSub:   { color: '#71717a', fontSize: 12, lineHeight: 17 },
});
