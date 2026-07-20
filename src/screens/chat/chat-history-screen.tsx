import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConfirmModal, confirmModalStyles } from "@/components/confirm-modal";
import { Text } from "@/components/ui/text";
import {
  BG,
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  SURFACE,
  TEXT,
  TEXT2,
} from "@/constants/palette";
import { characterApi } from "@/features/characters/api";
import {
  getCharacterImageUri,
  type Character,
} from "@/features/characters/types";
import { chatApi } from "@/features/chat/api";
import { useChatHistory } from "@/features/chat/hooks/use-chat-history";
import type { ChatHistoryGroup, ChatSession } from "@/features/chat/types";

type RawHistoryItem = Partial<ChatHistoryGroup & ChatSession>;

interface CharacterHistoryGroup {
  characterId: string;
  characterName: string;
  characterImage?: string;
  sessions: ChatSession[];
  latestAt: number;
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCharacterLabel(session: ChatSession) {
  return (
    session.characterName ??
    session.characterTitle ??
    "Đang tải thông tin nhân vật..."
  );
}

function isCharacter(value: Character | undefined): value is Character {
  return !!value;
}

function getDeleteErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Không thể xóa cuộc trò chuyện. Vui lòng thử lại sau.";
  if (message.toLowerCase().includes("unexpected token")) {
    return "Máy chủ trả về dữ liệu không đúng định dạng khi xóa. Vui lòng thử lại.";
  }
  return message;
}

function normalizeHistory(
  data: RawHistoryItem[] | undefined,
): ChatHistoryGroup[] {
  if (!Array.isArray(data)) return [];

  const grouped = new Map<string, ChatHistoryGroup>();

  for (const item of data) {
    if (Array.isArray(item.sessions)) {
      const contextId = item.contextId ?? "unknown";
      grouped.set(contextId, {
        contextId,
        contextName: item.contextName ?? "Khác",
        sessions: item.sessions,
      });
      continue;
    }

    if (!item.id) continue;

    const contextId = item.contextId ?? "unknown";
    const current = grouped.get(contextId) ?? {
      contextId,
      contextName: item.contextName ?? "Khác",
      sessions: [],
    };

    current.sessions.push(item as ChatSession);
    grouped.set(contextId, current);
  }

  return [...grouped.values()].filter((group) => group.sessions.length > 0);
}

function getSessionTime(session: ChatSession) {
  const value = session.lastMessageAt ?? session.updatedAt ?? session.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function groupByCharacter(groups: ChatHistoryGroup[]): CharacterHistoryGroup[] {
  const grouped = new Map<string, CharacterHistoryGroup>();

  for (const group of groups) {
    const sessions = Array.isArray(group.sessions) ? group.sessions : [];

    for (const session of sessions) {
      const characterId = session.characterId ?? `unknown-${session.id}`;
      const current = grouped.get(characterId) ?? {
        characterId,
        characterName: getCharacterLabel(session),
        characterImage: session.characterImage,
        sessions: [],
        latestAt: 0,
      };

      current.characterName =
        session.characterName ??
        session.characterTitle ??
        current.characterName;
      current.characterImage = session.characterImage ?? current.characterImage;
      current.sessions.push(session);
      current.latestAt = Math.max(current.latestAt, getSessionTime(session));
      grouped.set(characterId, current);
    }
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      sessions: group.sessions.sort(
        (a, b) => getSessionTime(b) - getSessionTime(a),
      ),
    }))
    .sort((a, b) => b.latestAt - a.latestAt);
}

function SessionRow({
  item,
  deleting,
  onDelete,
}: {
  item: ChatSession;
  deleting: boolean;
  onDelete: (session: ChatSession) => void;
}) {
  const router = useRouter();
  const title = item.sessionTitle ?? item.title ?? item.contextName ?? "Cuộc trò chuyện";

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      style={s.sessionRow}
      onPress={() =>
        router.push({
          pathname: "/chat/[sessionId]",
          params: {
            sessionId: item.id,
            characterId: item.characterId,
            contextId: item.contextId,
            characterName: item.characterName ?? "",
            characterImageUrl: item.characterImage ?? "",
            characterModelUrl: item.characterModelUrl ?? "",
            contextName: item.contextName ?? "",
          },
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={s.sessionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={s.sessionMeta} numberOfLines={1}>
          {[item.contextName, formatDate(item.lastMessageAt)]
            .filter(Boolean)
            .join(" - ")}
        </Text>
        {item.lastMessage ? (
          <Text style={s.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        ) : null}
      </View>
      <Pressable
        hitSlop={10}
        disabled={deleting}
        onPress={(event) => {
          event.stopPropagation();
          onDelete(item);
        }}
        style={[s.deleteBtn, deleting ? s.deleteBtnPressed : null]}
        accessibilityLabel="Xóa cuộc trò chuyện"
      >
        {deleting ? (
          <ActivityIndicator size="small" color="#dc2626" />
        ) : (
          <Trash2 size={16} color="#dc2626" />
        )}
      </Pressable>
    </TouchableOpacity>
  );
}

function CharacterGroup({
  item,
  expanded,
  onToggle,
  deletingId,
  onDeleteSession,
}: {
  item: CharacterHistoryGroup;
  expanded: boolean;
  onToggle: () => void;
  deletingId?: string;
  onDeleteSession: (session: ChatSession) => void;
}) {
  return (
    <View style={s.group}>
      <Pressable onPress={onToggle} style={s.characterHeader}>
        <View style={s.characterAvatar}>
          {item.characterImage ? (
            <Image
              source={{ uri: item.characterImage }}
              style={s.avatarImage}
              contentFit="cover"
            />
          ) : (
            <MessageCircle size={18} color={ORANGE} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.characterName} numberOfLines={1}>
            {item.characterName}
          </Text>
          <Text style={s.characterMeta}>
            {item.sessions.length} cuộc trò chuyện
          </Text>
        </View>
        {expanded ? (
          <ChevronDown size={18} color={MUTED} />
        ) : (
          <ChevronRight size={18} color={MUTED} />
        )}
      </Pressable>
      {expanded ? (
        <View style={{ gap: 10 }}>
          {item.sessions.map((session) => (
            <SessionRow
              key={session.id}
              item={session}
              deleting={deletingId === session.id}
              onDelete={onDeleteSession}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [pendingDelete, setPendingDelete] = useState<ChatSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, isError, refetch, isRefetching } = useChatHistory();
  const groups = normalizeHistory(data as RawHistoryItem[] | undefined);
  const characterGroups = groupByCharacter(groups);
  const characterIds = [
    ...new Set(characterGroups.map((group) => group.characterId)),
  ].filter((id) => id && !id.startsWith("unknown-"));
  const characterQueries = useQueries({
    queries: characterIds.map((id) => ({
      queryKey: ["characters", id],
      queryFn: () => characterApi.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const characterById = new Map(
    characterQueries
      .map((query) => query.data)
      .filter(isCharacter)
      .map((character) => [character.id, character] as const),
  );
  const displayGroups = characterGroups.map((group) => {
    const character = characterById.get(group.characterId);
    return {
      ...group,
      characterName: character?.name ?? group.characterName,
      characterImage: character
        ? getCharacterImageUri(character)
        : group.characterImage,
    };
  });

  function toggleGroup(characterId: string, fallbackExpanded: boolean) {
    setExpandedGroups((current) => ({
      ...current,
      [characterId]: !(current[characterId] ?? fallbackExpanded),
    }));
  }

  const deleteSession = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onMutate: (sessionId) => setDeletingId(sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      setPendingDelete(null);
    },
    onError: (error) => {
      setErrorMessage(getDeleteErrorMessage(error));
    },
    onSettled: () => setDeletingId(undefined),
  });

  function handleDeleteSession(session: ChatSession) {
    setPendingDelete(session);
  }

  function confirmDeleteSession() {
    if (!pendingDelete || deleteSession.isPending) return;
    deleteSession.mutate(pendingDelete.id);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={["top"]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.headerBtn}>
          <ArrowLeft size={20} color={TEXT} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Lịch sử trò chuyện</Text>
          <Text style={s.subtitle}>Xem lại các cuộc trò chuyện đã tạo</Text>
        </View>
        <Pressable onPress={() => router.push("/characters")} style={s.newBtn}>
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={ORANGE} size="large" />
        </View>
      ) : (
        <FlatList
          data={displayGroups}
          keyExtractor={(item) => item.characterId}
          renderItem={({ item, index }) => {
            const expanded = expandedGroups[item.characterId] ?? index === 0;
            return (
              <CharacterGroup
                item={item}
                expanded={expanded}
                onToggle={() => toggleGroup(item.characterId, index === 0)}
                deletingId={deletingId}
                onDeleteSession={handleDeleteSession}
              />
            );
          }}
          contentContainerStyle={s.list}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyTitle}>
                {isError ? "Không thể tải lịch sử" : "Chưa có cuộc trò chuyện"}
              </Text>
              <Text style={s.emptyText}>
                {isError
                  ? "Keo xuong de thu lai."
                  : "Chon mot nhan vat de tao session chat moi."}
              </Text>
            </View>
          }
        />
      )}

      <ConfirmModal
        visible={!!pendingDelete}
        title="Xóa cuộc trò chuyện?"
        message="Cuộc trò chuyện này sẽ bị xóa vĩnh viễn và không thể khôi phục lại. Bạn có chắc chắn muốn tiếp tục?"
        cancelText="Hủy"
        confirmText="Xóa"
        variant="danger"
        loading={deleteSession.isPending}
        icon={<Trash2 size={22} color="#dc2626" />}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDeleteSession}
      >
        {pendingDelete?.title ? (
          <Text style={confirmModalStyles.detailPill} numberOfLines={2}>
            {pendingDelete.title}
          </Text>
        ) : null}
      </ConfirmModal>

      <ConfirmModal
        visible={!!errorMessage}
        title="Không thể xóa"
        message={errorMessage ?? ""}
        confirmText="Dong"
        onConfirm={() => setErrorMessage(null)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
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
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    paddingBottom: 120,
    gap: 18,
  },
  group: {
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  characterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  characterAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },
  characterName: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "900",
  },
  characterMeta: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(220,38,38,0.08)",
  },
  deleteBtnPressed: {
    opacity: 0.7,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  sessionTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
});
