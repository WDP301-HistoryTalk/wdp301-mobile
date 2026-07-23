import { useEventListener } from "expo";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { ArrowLeft, FileText, Play, Trophy, X } from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  BG,
  CARD,
  MUTED,
  ORANGE,
  ORANGE_BORDER,
  SURFACE,
  TEXT,
} from "@/constants/palette";
import { BrandColors, Colors } from "@/constants/theme";
import { useCharactersByContext } from "@/features/characters/hooks/use-characters-by-context";
import { ERA_COLORS, getCharacterImageUri, type Character } from "@/features/characters/types";
import { DocumentCitationModal } from "@/features/documents/DocumentCitationModal";
import { usePublicContextDocuments } from "@/features/documents/hooks";
import type { RagDocument } from "@/features/documents/types";
import { useHistoricalContext } from "@/features/historical-contexts/hooks/use-historical-context";
import { formatContextYear, getContextImageUri } from "@/features/historical-contexts/types";

const ERA_HERO_BG: Record<string, string> = {
  ANCIENT: "#2C1810",
  MEDIEVAL: "#1A0E38",
  MODERN: "#0A2420",
  CONTEMPORARY: "#0D1B2A",
};

function CharacterChip({
  char,
  onPress,
}: {
  char: Character;
  onPress: () => void;
}) {
  const initial = char.name.charAt(0).toUpperCase();
  const imageUri = getCharacterImageUri(char);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ alignItems: "center", width: 72 }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: SURFACE,
          borderWidth: 2,
          borderColor: ORANGE_BORDER,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: ORANGE,
              opacity: 0.8,
            }}
          >
            {initial}
          </Text>
        )}
      </View>
      <Text
        size="2xs"
        className="text-history-muted text-center mt-1.5"
        numberOfLines={2}
        style={{ maxWidth: 68 }}
      >
        {char.name}
      </Text>
    </TouchableOpacity>
  );
}

function DocumentRow({ doc, onPress }: { doc: RagDocument; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={documentStyles.row}
    >
      <View style={documentStyles.iconWrap}>
        <FileText size={16} color={ORANGE} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={documentStyles.title} numberOfLines={2}>
          {doc.title || "Tài liệu tham khảo"}
        </Text>
      </View>
      <Text style={{ color: ORANGE, fontSize: 18, fontWeight: "300" }}>›</Text>
    </TouchableOpacity>
  );
}

function getYoutubeEmbedUrl(source: string): string | null {
  try {
    const url = new URL(source);
    const host = url.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v");
      if (url.pathname.startsWith("/shorts/"))
        videoId = url.pathname.split("/")[2] ?? null;
      if (url.pathname.startsWith("/embed/"))
        videoId = url.pathname.split("/")[2] ?? null;
    }
    if (host === "youtu.be") {
      videoId = url.pathname.replace("/", "");
    }
    if (!videoId) return null;

    const start = Number(url.searchParams.get("t")?.replace("s", "") ?? 0);
    const qs = new URLSearchParams({
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      autoplay: "1",
      enablejsapi: "1",
      origin: "https://www.youtube.com",
    });
    if (start > 0) qs.set("start", String(start));
    return `https://www.youtube.com/embed/${videoId}?${qs.toString()}`;
  } catch {
    return null;
  }
}

function DirectVideoPlayer({
  source,
  onEnd,
}: {
  source: string;
  onEnd: () => void;
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.play();
  });
  useEventListener(player, "playToEnd", onEnd);
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

function YoutubeExternalPlayer({
  source,
  title,
  onClose,
}: {
  source: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <View style={introStyles.youtubeFallback}>
      <View style={introStyles.playBadgeLarge}>
        <Play size={28} color={Colors.dark.text} fill={Colors.dark.text} />
      </View>
      <Heading size="xl" className="text-center text-white" numberOfLines={2}>
        {title}
      </Heading>
      <Text muted size="sm" className="text-center" style={{ lineHeight: 21 }}>
        Video YouTube này không cho phát nhúng trong ứng dụng. Hãy mở bằng
        YouTube, sau đó quay lại để tiếp tục xem nhân vật liên quan.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={introStyles.youtubeButton}
        onPress={() => void Linking.openURL(source)}
      >
        <Text style={introStyles.youtubeButtonText}>Mở trên YouTube</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onClose}
        style={introStyles.continueButton}
      >
        <Text style={introStyles.continueText}>Tiếp tục xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );
}

function IntroVideo({
  source,
  title,
  onClose,
}: {
  source: string;
  title: string;
  onClose: () => void;
}) {
  const youtubeEmbedUrl = getYoutubeEmbedUrl(source);
  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={introStyles.wrap}>
        {youtubeEmbedUrl ? (
          <YoutubeExternalPlayer
            source={source}
            title={title}
            onClose={onClose}
          />
        ) : (
          <DirectVideoPlayer source={source} onEnd={onClose} />
        )}
        <View style={introStyles.topBar}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.75}
            style={introStyles.closeButton}
          >
            <X size={18} color={Colors.dark.text} />
            <Text className="text-[#f7f1e8]" style={introStyles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
        {youtubeEmbedUrl ? (
          <View style={introStyles.caption}>
            <View style={introStyles.playBadge}>
              <Play
                size={16}
                color={Colors.dark.text}
                fill={Colors.dark.text}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                size="2xs"
                bold
                className="tracking-widest uppercase"
                style={{ color: BrandColors.primarySoft }}
              >
                Video bối cảnh
              </Text>
              <Heading size="xl" className="mt-1 text-white" numberOfLines={2}>
                {title}
              </Heading>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function VideoReplayCard({
  imageUri,
  title,
  onPress,
}: {
  imageUri?: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={videoCardStyles.card}
    >
      <View style={videoCardStyles.thumb}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={videoCardStyles.thumbImage}
            contentFit="cover"
          />
        ) : null}
        <View style={videoCardStyles.thumbOverlay} />
        <View style={videoCardStyles.playButton}>
          <Play size={18} color={Colors.dark.text} fill={Colors.dark.text} />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text size="2xs" muted bold className="tracking-widest uppercase">
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: ctx,
    isLoading,
    isError,
    refetch: refetchCtx,
  } = useHistoricalContext(resolvedId ?? "");
  const { data: relatedCharacters = [], refetch: refetchCharacters } = useCharactersByContext(resolvedId ?? "");
  const { data: documents = [] } = usePublicContextDocuments(resolvedId ?? "");
  const [skippedIntroId, setSkippedIntroId] = useState<string | null>(null);
  const [manualVideoId, setManualVideoId] = useState<string | null>(null);
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refetchCtx(), refetchCharacters()]);
    } finally {
      setRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !ctx) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Heading size="md" className="mb-3 text-center">
          Không tìm thấy bối cảnh
        </Heading>
        <TouchableOpacity onPress={() => router.back()}>
          <Text size="sm" className="font-semibold text-primary-500">
            ← Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ec = ERA_COLORS[ctx.era];
  const heroBg = ERA_HERO_BG[ctx.era] ?? CARD;
  const yearText = formatContextYear(ctx);
  const imageUri = getContextImageUri(ctx);
  const videoUri = ctx.videoUrl?.trim();

  const hasSkippedIntro = skippedIntroId === resolvedId;
  const shouldAutoShowIntro = !!videoUri && !hasSkippedIntro;
  const shouldShowVideo =
    shouldAutoShowIntro || (!!videoUri && manualVideoId === resolvedId);
  const closeVideo = () => {
    setSkippedIntroId(resolvedId ?? null);
    setManualVideoId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      {shouldShowVideo ? (
        <IntroVideo source={videoUri} title={ctx.name} onClose={closeVideo} />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={ORANGE} />
        }
      >
        {/* ── Hero image ─────────────────────────────────────── */}
        <View style={{ height: 360, width: "100%", backgroundColor: heroBg }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 110,
                  fontWeight: "900",
                  color: ec?.glow ?? TEXT,
                  opacity: 0.12,
                }}
              >
                {ctx.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* ── Info section ──────────────────────────────────── */}
        <VStack
          style={{
            paddingHorizontal: 24,
            paddingTop: 28,
            alignItems: "center",
          }}
        >
          {/* Name */}
          <Heading size="3xl" style={{ textAlign: "center", marginBottom: 8 }}>
            {ctx.name}
          </Heading>

          {/* Year / period / location */}
          {yearText || ctx.period || ctx.location ? (
            <VStack style={{ alignItems: "center", marginBottom: 28, gap: 4 }}>
              {yearText ? (
                <Text
                  style={{
                    color: ORANGE,
                    fontWeight: "600",
                    fontSize: 15,
                    textAlign: "center",
                  }}
                >
                  {yearText}
                </Text>
              ) : null}
              {ctx.period ? (
                <Text
                  style={{ color: ORANGE, fontSize: 14, textAlign: "center" }}
                >
                  {ctx.period}
                </Text>
              ) : null}
              {ctx.location ? (
                <Text
                  style={{ color: ORANGE, fontSize: 14, textAlign: "center" }}
                >
                  {ctx.location}
                </Text>
              ) : null}
            </VStack>
          ) : (
            <View style={{ marginBottom: 28 }} />
          )}

          {/* Video replay */}
          {videoUri ? (
            <VideoReplayCard
              imageUri={imageUri}
              title={ctx.name}
              onPress={() => setManualVideoId(resolvedId ?? null)}
            />
          ) : null}

          {/* Description */}
          {ctx.description ? (
            <Text
              style={{
                lineHeight: 24,
                fontSize: 15,
                alignSelf: "stretch",
                marginBottom: 28,
              }}
            >
              {ctx.description}
            </Text>
          ) : null}

          {/* Related characters */}
          {relatedCharacters.length > 0 ? (
            <View style={{ width: "100%", marginBottom: 28 }}>
              <Heading size="sm" style={{ marginBottom: 12 }}>
                Nhân vật liên quan
              </Heading>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
              >
                {relatedCharacters.map((char) => (
                  <CharacterChip
                    key={char.id}
                    char={char}
                    onPress={() =>
                      router.push({
                        pathname: "/characters/[id]",
                        params: { id: char.id },
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Reference documents */}
          {documents.length > 0 ? (
            <View style={{ width: "100%", marginBottom: 28, gap: 8 }}>
              <Heading size="sm" style={{ marginBottom: 4 }}>
                Tài liệu tham khảo
              </Heading>
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onPress={() => setOpenDocumentId(doc.id)}
                />
              ))}
            </View>
          ) : null}

          {/* Quiz banner */}
          <TouchableOpacity
            onPress={() => router.push("/quiz")}
            activeOpacity={0.85}
            style={quizStyles.banner}
          >
            <View style={quizStyles.bannerIconWrap}>
              <Trophy
                size={26}
                color={BrandColors.primary}
                strokeWidth={1.75}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={quizStyles.bannerTitle}>Kiểm tra kiến thức</Text>
              <Text style={quizStyles.bannerSub}>
                Làm bộ câu hỏi liên quan đến giai đoạn này
              </Text>
            </View>
            <Text
              style={{
                color: BrandColors.primary,
                fontSize: 20,
                fontWeight: "300",
                marginLeft: 8,
              }}
            >
              ›
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>

      {/* ── Sticky back button ─────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top,
          pointerEvents: "box-none",
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} color="#1c1917" />
          </TouchableOpacity>
        </View>
      </View>

      <DocumentCitationModal
        visible={!!openDocumentId}
        onClose={() => setOpenDocumentId(null)}
        initialDocumentId={openDocumentId}
        contextId={resolvedId}
      />
    </View>
  );
}

const documentStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ORANGE_BORDER,
    backgroundColor: SURFACE,
    padding: 12,
    width: "100%",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
  },
  title: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});

const quizStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: BrandColors.primaryMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BrandColors.primaryFocus,
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  bannerIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: BrandColors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  bannerSub: { color: MUTED, fontSize: 12, lineHeight: 17 },
});

const introStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.dark.background },
  video: { width: "100%", height: "100%" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 52,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: BrandColors.overlayStrong,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  closeText: { color: Colors.dark.text, fontSize: 13, fontWeight: "800" },
  caption: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 28,
  },
  playBadgeLarge: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  youtubeButton: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    borderRadius: 16,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  youtubeButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "800",
  },
  continueButton: { paddingHorizontal: 16, paddingVertical: 10 },
  continueText: {
    color: BrandColors.primarySoft,
    fontSize: 13,
    fontWeight: "700",
  },
});

const videoCardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BrandColors.primaryBorder,
    backgroundColor: BrandColors.primaryMuted,
    padding: 12,
    width: "100%",
  },
  thumb: {
    width: 92,
    height: 62,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.dark.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImage: { width: "100%", height: "100%", position: "absolute" },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BrandColors.overlay,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 4,
  },
});
