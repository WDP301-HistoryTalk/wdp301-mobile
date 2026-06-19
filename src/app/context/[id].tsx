import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Play, Trophy, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { BrandColors, Colors } from '@/constants/theme';
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
        <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: BrandColors.primary }} />
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
          backgroundColor: Colors.dark.backgroundSelected,
          borderWidth: 2, borderColor: BrandColors.primaryStrongBorder,
          overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {char.image ? (
          <Image source={{ uri: char.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: 24, fontWeight: '900', color: BrandColors.primary, opacity: 0.8 }}>
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

function getYoutubeEmbedUrl(source: string): string | null {
  try {
    const url = new URL(source);
    const host = url.hostname.replace(/^www\./, '');
    let videoId: string | null = null;

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v');
      if (url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2] ?? null;
      if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2] ?? null;
    }

    if (host === 'youtu.be') {
      videoId = url.pathname.replace('/', '');
    }

    if (!videoId) return null;
    const start = Number(url.searchParams.get('t')?.replace('s', '') ?? 0);
    const qs = new URLSearchParams({
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      autoplay: '1',
      enablejsapi: '1',
      origin: 'https://www.youtube.com',
    });
    if (start > 0) qs.set('start', String(start));
    return `https://www.youtube.com/embed/${videoId}?${qs.toString()}`;
  } catch {
    return null;
  }
}

function DirectVideoPlayer({ source, onEnd }: { source: string; onEnd: () => void }) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = false;
    player.play();
  });
  useEventListener(player, 'playToEnd', onEnd);

  return (
    <VideoView
      player={player}
      style={introStyles.video}
      contentFit="contain"
      nativeControls
      fullscreenOptions={{ enable: true }}
    />
  );
}

function YoutubeExternalPlayer({ source, title, onClose }: { source: string; title: string; onClose: () => void }) {
  return (
    <View style={introStyles.youtubeFallback}>
      <View style={introStyles.playBadgeLarge}>
        <Play size={28} color={Colors.dark.text} fill={Colors.dark.text} />
      </View>
      <Heading size="xl" className="text-white text-center" numberOfLines={2}>
        {title}
      </Heading>
      <Text muted size="sm" className="text-center" style={{ lineHeight: 21 }}>
        Video YouTube này không cho phát nhúng trong ứng dụng. Hãy mở bằng YouTube, sau đó quay lại để tiếp tục xem nhân vật liên quan.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={introStyles.youtubeButton}
        onPress={() => void Linking.openURL(source)}
      >
        <Text style={introStyles.youtubeButtonText}>Mở trên YouTube</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.75} onPress={onClose} style={introStyles.continueButton}>
        <Text style={introStyles.continueText}>Tiếp tục xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );
}

function IntroVideo({ source, title, onClose }: { source: string; title: string; onClose: () => void }) {
  const youtubeEmbedUrl = getYoutubeEmbedUrl(source);

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={introStyles.wrap}>
        {youtubeEmbedUrl ? (
          <YoutubeExternalPlayer source={source} title={title} onClose={onClose} />
        ) : (
          <DirectVideoPlayer source={source} onEnd={onClose} />
        )}
        <SafeAreaView edges={['top']} style={introStyles.topBar}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={introStyles.closeButton}>
          <X size={18} color={Colors.dark.text} />
            <Text style={introStyles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </SafeAreaView>
        {youtubeEmbedUrl ? (
          <View style={introStyles.caption}>
            <View style={introStyles.playBadge}>
              <Play size={16} color={Colors.dark.text} fill={Colors.dark.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text size="2xs" bold className="uppercase tracking-widest" style={{ color: BrandColors.primarySoft }}>
                Video bối cảnh
              </Text>
              <Heading size="xl" className="text-white mt-1" numberOfLines={2}>
                {title}
              </Heading>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function VideoReplayCard({ imageUri, title, onPress }: { imageUri?: string; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={videoCardStyles.card}>
      <View style={videoCardStyles.thumb}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={videoCardStyles.thumbImage} contentFit="cover" />
        ) : null}
        <View style={videoCardStyles.thumbOverlay} />
        <View style={videoCardStyles.playButton}>
          <Play size={18} color={Colors.dark.text} fill={Colors.dark.text} />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text size="2xs" muted bold className="uppercase tracking-widest">
          Video bối cảnh
        </Text>
        <Text style={videoCardStyles.title} numberOfLines={2}>
          Xem lại: {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ContextDetailScreen() {
  const { id }     = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router     = useRouter();
  const { data: ctx, isLoading, isError } = useHistoricalContext(resolvedId ?? '');
  const [skippedIntroId, setSkippedIntroId] = useState<string | null>(null);
  const [manualVideoId, setManualVideoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !ctx) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <Heading size="md" className="mb-3 text-center">Không tìm thấy bối cảnh</Heading>
        <TouchableOpacity onPress={() => router.back()}>
          <Text size="sm" className="text-primary-500 font-semibold">← Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ec       = ERA_COLORS[ctx.era];
  const heroBg   = ERA_HERO_BG[ctx.era] ?? Colors.dark.backgroundElement;
  const yearText = formatContextYear(ctx);
  const imageUri = (ctx as any).imageUrl ?? ctx.image;
  const videoUri = ctx.videoUrl?.trim();
  const hasSkippedIntro = skippedIntroId === resolvedId;
  const shouldAutoShowIntro = !!videoUri && !hasSkippedIntro;
  const shouldShowVideo = shouldAutoShowIntro || (!!videoUri && manualVideoId === resolvedId);
  const closeVideo = () => {
    setSkippedIntroId(resolvedId ?? null);
    setManualVideoId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      {shouldShowVideo ? (
        <IntroVideo source={videoUri} title={ctx.name} onClose={closeVideo} />
      ) : null}
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
              <Text style={{ fontSize: 110, fontWeight: '900', color: ec?.text ?? BrandColors.white, opacity: 0.1 }}>
                {ctx.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180 }}>
            <View style={{ flex: 2 }} />
            <View style={{ flex: 2, backgroundColor: BrandColors.pageOverlay }} />
            <View style={{ flex: 2, backgroundColor: BrandColors.pageOverlayStrong }} />
            <View style={{ height: 50, backgroundColor: Colors.dark.background }} />
          </View>

          {/* Back button */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                margin: 16, width: 40, height: 40, borderRadius: 20,
                backgroundColor: BrandColors.overlayMedium,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: BrandColors.borderFaint,
              }}
            >
              <ArrowLeft size={18} color={Colors.dark.text} />
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
                    backgroundColor: BrandColors.primarySubtle,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Calendar size={14} color={BrandColors.primary} />
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

          {videoUri ? (
            <VideoReplayCard
              imageUri={imageUri}
              title={ctx.name}
              onPress={() => setManualVideoId(resolvedId ?? null)}
            />
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
              <Trophy size={26} color={BrandColors.primary} strokeWidth={1.75} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={quizStyles.bannerTitle}>Kiểm tra kiến thức</Text>
              <Text style={quizStyles.bannerSub}>Làm bộ câu hỏi liên quan đến giai đoạn này</Text>
            </View>
            <Text style={{ color: BrandColors.primary, fontSize: 20, fontWeight: '300', marginLeft: 8 }}>›</Text>
          </TouchableOpacity>

        </VStack>
      </ScrollView>
    </View>
  );
}

const quizStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: BrandColors.primaryMuted,
    borderRadius: 18, borderWidth: 1, borderColor: BrandColors.primaryFocus,
    padding: 16, marginBottom: 16,
  },
  bannerIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: BrandColors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { color: Colors.dark.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  bannerSub:   { color: BrandColors.muted, fontSize: 12, lineHeight: 17 },
});

const introStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.overlayStrong,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  closeText: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: '800',
  },
  caption: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 28,
  },
  playBadgeLarge: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  youtubeButton: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: 16,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  youtubeButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '800',
  },
  continueButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  continueText: {
    color: BrandColors.primarySoft,
    fontSize: 13,
    fontWeight: '700',
  },
});

const videoCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BrandColors.primaryBorder,
    backgroundColor: BrandColors.primaryMuted,
    padding: 12,
  },
  thumb: {
    width: 92,
    height: 62,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BrandColors.overlay,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 4,
  },
});
