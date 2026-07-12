import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  LogOut,
  Mail,
  MessageCircle,
  Trophy,
  User
} from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CharacterCard, ContextCard } from "@/components/cards";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import {
  BG,
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  ORANGE_BORDER_MEDIUM,
  ORANGE_TINT,
  RED,
  TEXT,
  TEXT2,
} from "@/constants/palette";
import { useAuthStore } from "@/features/auth/store";
import { useCharacters } from "@/features/characters/hooks/use-characters";
import { useChatHistory } from "@/features/chat/hooks/use-chat-history";
import { useHistoricalContexts } from "@/features/historical-contexts/hooks/use-historical-contexts";
import { useQuizResults } from "@/features/quiz/hooks/use-quiz-results";

function formatRelative(iso?: string) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function CharSkeletons() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} style={{ width: 100, height: 130 }} radius={16} />
      ))}
    </ScrollView>
  );
}

function CtxSkeletons() {
  return (
    <View>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 8,
            backgroundColor: CARD,
            borderRadius: 16,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Skeleton style={{ width: 50, height: 56 }} radius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton style={{ height: 10, width: "40%" }} radius={4} />
            <Skeleton style={{ height: 14, width: "75%" }} radius={4} />
            <Skeleton style={{ height: 10, width: "50%" }} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initial = user?.userName?.charAt(0).toUpperCase() ?? "U";
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: charData, isLoading: charLoading, refetch: refetchChars } = useCharacters({});
  const { data: ctxData, isLoading: ctxLoading, refetch: refetchCtx } = useHistoricalContexts({});
  const { data: chatDataHistory, refetch: refetchChat } = useChatHistory();
  const { data: quizResultsData, refetch: refetchQuiz } = useQuizResults(0, 3);

  const characters = charData?.pages[0]?.content?.slice(0, 8) ?? [];
  const contexts = ctxData?.pages[0]?.content?.slice(0, 4) ?? [];
  const recentChats = chatDataHistory?.slice(0, 3) ?? [];
  const recentQuizzes = quizResultsData?.content ?? [];

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refetchChars(), refetchCtx(), refetchChat(), refetchQuiz()]);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={ORANGE} />
        }
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image
              source={require("@/assets/logo.png")}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
            <View>
              <Text style={{ fontSize: 11, color: TEXT2 }}>{greeting()}</Text>
              <Heading size="md" className="text-history-text">
                {user?.userName ?? "Bạn"}
              </Heading>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setMenuOpen((v) => !v)}
            activeOpacity={0.8}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: ORANGE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
              {initial}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero banner ─────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: CARD,
            borderWidth: 1,
            borderColor: BORDER,
          }}
        >
          {/* accent bar */}
          <View style={{ height: 3, backgroundColor: ORANGE }} />
          <View style={{ padding: 16 }}>
            <Heading
              size="xl"
              className="leading-7 text-history-text"
              style={{ marginBottom: 4 }}
            >
              Khám phá lịch sử qua từng nhân vật
            </Heading>
            <Text size="xs" muted style={{ lineHeight: 18, marginBottom: 12 }}>
              Trò chuyện và tìm hiểu về các sự kiện, nhân vật lịch sử nổi tiếng
              Việt Nam và thế giới.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/characters")}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: ORANGE,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                Bắt đầu ngay
              </Text>
              <ChevronRight size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Characters (Featured) [3rd position] ────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Heading size="md" className="text-history-text">
              Nhân vật nổi bật
            </Heading>
            <TouchableOpacity
              onPress={() => router.push("/characters")}
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ color: ORANGE, fontSize: 12, fontWeight: "600" }}>
                Xem tất cả
              </Text>
              <ChevronRight size={12} color={ORANGE} />
            </TouchableOpacity>
          </View>

          {charLoading ? (
            <CharSkeletons />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            >
              {characters.map((char, idx) => (
                <CharacterCard
                  key={char.id ?? `char-${idx}`}
                  char={char}
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: "/characters/[id]",
                      params: { id: char.id },
                    })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Recent Chats [4th position] ─────────────────────────── */}
        {recentChats.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Heading size="md" className="text-history-text">
                Trò chuyện gần đây
              </Heading>
              <TouchableOpacity
                onPress={() => router.push("/chat/history")}
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text
                  style={{ color: ORANGE, fontSize: 12, fontWeight: "600" }}
                >
                  Xem tất cả
                </Text>
                <ChevronRight size={12} color={ORANGE} />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8 }}>
              {recentChats.map((session, i) => (
                <TouchableOpacity
                  key={session.id ?? i}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: CARD,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    gap: 10,
                    borderWidth: 1,
                    borderColor: BORDER,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/chat/[sessionId]",
                      params: {
                        sessionId: session.id,
                        characterId: session.characterId,
                        contextId: session.contextId,
                        characterName: session.characterName ?? "",
                        characterImageUrl: session.characterImage ?? "",
                        characterModelUrl: session.characterModelUrl ?? "",
                        contextName: session.contextName ?? "",
                      },
                    })
                  }
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: ORANGE_TINT,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {session.characterImage ? (
                      <Image
                        source={{ uri: session.characterImage }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <MessageCircle size={16} color={ORANGE} />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text
                      style={{ color: TEXT, fontSize: 13, fontWeight: "700" }}
                      numberOfLines={1}
                    >
                      {session.characterName ??
                        session.title ??
                        "Cuộc trò chuyện"}
                    </Text>
                    {session.lastMessage ? (
                      <Text
                        style={{ color: TEXT2, fontSize: 11 }}
                        numberOfLines={1}
                      >
                        {session.lastMessage}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          color: ORANGE,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        Bắt đầu trò chuyện ngay →
                      </Text>
                    )}
                  </View>
                  {session.lastMessageAt || session.updatedAt ? (
                    <Text style={{ color: TEXT2, fontSize: 10 }}>
                      {formatRelative(
                        session.lastMessageAt ?? session.updatedAt,
                      )}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Contexts [5th position] ─────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Heading size="md" className="flex-1 text-history-text" numberOfLines={1}>
              Bối cảnh lịch sử
            </Heading>
            <TouchableOpacity
              onPress={() => router.push("/context")}
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ color: ORANGE, fontSize: 12, fontWeight: "600" }}>
                Xem tất cả
              </Text>
              <ChevronRight size={12} color={ORANGE} />
            </TouchableOpacity>
          </View>

          {ctxLoading ? (
            <CtxSkeletons />
          ) : (
            contexts.map((ctx, idx) => (
              <ContextCard
                key={ctx.id ?? `ctx-${idx}`}
                ctx={ctx}
                variant="compact"
                onPress={() =>
                  router.push({
                    pathname: "/context/[id]",
                    params: { id: ctx.id },
                  })
                }
              />
            ))
          )}
        </View>

        {/* ── Recent Quizzes [6th position] ───────────────────────── */}
        {recentQuizzes.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Heading size="md" className="text-history-text">
                Kết quả quiz gần đây
              </Heading>
              <TouchableOpacity
                onPress={() => router.push("/quiz")}
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text
                  style={{ color: ORANGE, fontSize: 12, fontWeight: "600" }}
                >
                  Làm quiz mới
                </Text>
                <ChevronRight size={12} color={ORANGE} />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8 }}>
              {recentQuizzes.map((item, idx) => {
                const correctCount = Math.round(
                  (item.percentage / 100) * item.totalQuestions,
                );
                const isLowScore = item.percentage < 50;
                const scoreColor =
                  item.percentage >= 70
                    ? "#22C55E"
                    : item.percentage >= 50
                      ? ORANGE
                      : "#EF4444";
                return (
                  <TouchableOpacity
                    key={item.sessionId ?? idx}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: CARD,
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      gap: 10,
                      borderWidth: 1,
                      borderColor: isLowScore ? "rgba(239,68,68,0.2)" : BORDER,
                    }}
                    onPress={() =>
                      router.push({
                        pathname: "/quiz/result",
                        params: { sessionId: item.sessionId },
                      })
                    }
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isLowScore
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(234,179,8,0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trophy
                        size={16}
                        color={isLowScore ? "#EF4444" : "#EAB308"}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{ color: TEXT, fontSize: 13, fontWeight: "700" }}
                        numberOfLines={1}
                      >
                        {item.quizTitle}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text style={{ color: TEXT2, fontSize: 11 }}>
                          Đúng {correctCount}/{item.totalQuestions} câu
                        </Text>
                        {isLowScore && (
                          <View
                            style={{
                              backgroundColor: "rgba(234,179,8,0.12)",
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: "rgba(234,179,8,0.3)",
                              paddingHorizontal: 5,
                              paddingVertical: 1,
                            }}
                          >
                            <Text
                              style={{
                                color: "#B45309",
                                fontSize: 9,
                                fontWeight: "700",
                              }}
                            >
                              Ôn tập ngay
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text
                        style={{
                          color: scoreColor,
                          fontSize: 13,
                          fontWeight: "800",
                        }}
                      >
                        {item.percentage}%
                      </Text>
                      <Text style={{ color: TEXT2, fontSize: 9 }}>
                        {new Date(item.completedAt).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Avatar dropdown menu ────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop — tap anywhere to close */}
          <Pressable
            onPress={() => setMenuOpen(false)}
            style={StyleSheet.absoluteFill}
          />

          {/* Menu card */}
          <View style={styles.menu}>
            {/* User info */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: BORDER,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: ORANGE,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}
                  >
                    {initial}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: TEXT, fontWeight: "700", fontSize: 15 }}
                    numberOfLines={1}
                  >
                    {user?.userName ?? "Người dùng"}
                  </Text>
                  <Text
                    style={{ color: TEXT2, fontSize: 12, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {user?.email ?? ""}
                  </Text>
                </View>
              </View>
              {/* Role badge */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: ORANGE_TINT,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: ORANGE_BORDER_MEDIUM,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{ color: ORANGE, fontSize: 11, fontWeight: "600" }}
                >
                  {user?.role === "CUSTOMER"
                    ? "Người dùng"
                    : (user?.role ?? "Người dùng")}
                </Text>
              </View>
            </View>

            {/* Menu items */}
            <View style={{ paddingVertical: 6 }}>
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/profile");
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <User size={16} color={MUTED} strokeWidth={1.75} />
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: "500" }}>
                  Hồ sơ cá nhân
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Mail size={16} color={MUTED} strokeWidth={1.75} />
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: "500" }}>
                  Liên hệ hỗ trợ
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: BORDER,
                  marginHorizontal: 16,
                  marginVertical: 4,
                }}
              />

              {/* Logout */}
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <LogOut size={16} color={RED} strokeWidth={1.75} />
                <Text style={{ color: RED, fontSize: 14, fontWeight: "600" }}>
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 72,
    right: 16,
    width: 260,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    zIndex: 200,
    // web shadow
    // @ts-ignore
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    elevation: 12,
    overflow: "hidden",
  },
});
