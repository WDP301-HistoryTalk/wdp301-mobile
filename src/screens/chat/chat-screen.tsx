import VoiceNative from "@react-native-voice/voice";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import {
  ArrowLeft,
  Box,
  Ellipsis,
  History,
  MessageCircle,
  Mic,
  Phone,
  PhoneOff,
  Send,
  Trash2,
  UserRound,
  Video,
  Volume2,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import {
  BG,
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  ORANGE_BORDER,
  ORANGE_BORDER_MEDIUM,
  ORANGE_BORDER_MUTED,
  ORANGE_BORDER_SOFT,
  ORANGE_TINT_MUTED,
  ORANGE_TINT_SOLID,
  ORANGE_TINT_STRONG,
  SURFACE,
  TEXT,
  TEXT2,
} from "@/constants/palette";
import { useCharacter } from "@/features/characters/hooks/use-character";
import { getCharacterImageUri } from "@/features/characters/types";
import { chatApi } from "@/features/chat/api";
import { useCreateSession } from "@/features/chat/hooks/use-create-session";
import { useSendMessage } from "@/features/chat/hooks/use-send-message";
import { useSessionMessages } from "@/features/chat/hooks/use-session-messages";
import type { ChatMessage, ChatMessageType } from "@/features/chat/types";
import { speakWithAzure, stopAzureSpeech } from "@/lib/azure-speech";

const CALL_GROUP_GAP_MS = 2 * 60 * 1000;

type ChatTimelineItem =
  | { type: "message"; message: ChatMessage }
  | {
    type: "voice-call";
    id: string;
    startedAt: string;
    endedAt: string;
    messages: ChatMessage[];
  };

type ActiveCall = {
  mode: "2D" | "3D";
  startedAt: number;
};

type NativeVoiceResultsEvent = {
  value?: string[];
};

type NativeVoiceErrorEvent = {
  error?: {
    message?: string;
  } | string;
};

type NativeVoiceLike = {
  start: (locale: string) => Promise<unknown>;
  stop: () => Promise<unknown>;
  destroy: () => Promise<unknown>;
  removeAllListeners: () => void;
  isAvailable: () => Promise<0 | 1>;
  onSpeechResults?: (event: NativeVoiceResultsEvent) => void;
  onSpeechPartialResults?: (event: NativeVoiceResultsEvent) => void;
  onSpeechVolumeChanged?: (event: { value?: number }) => void;
  onSpeechEnd?: (event?: unknown) => void;
  onSpeechError?: (event: NativeVoiceErrorEvent) => void;
};

function getMessageTime(message: ChatMessage) {
  const time = new Date(message.createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

// Web hien thi content trong <p> (HTML gop moi khoang trang/xuong dong thanh 1
// space). RN <Text> thi giu nguyen \n thanh dong moi, gay khoang cach le ra
// khong co tren web. Chuan hoa de mobile khop web.
function normalizeMessageText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Marker "bat dau call" (content = CALL_2D:.../CALL_3D:...) la di san tu ban
// mobile cu — ban moi KHONG gui marker nua (mo call la thao tac UI cuc bo,
// giong web). Van can nhan dien marker de: (1) loc loi chao cu trong DB,
// (2) an noi dung marker khi hien transcript cuoc goi.
function isCallStartMarker(message: ChatMessage): boolean {
  return (
    message.messageType === "VOICE" &&
    (message.content.startsWith("CALL_2D:") ||
      message.content.startsWith("CALL_3D:"))
  );
}

// Nhan vat khong con tu chao truoc khi bat dau call nua (xem handleStartCall).
// Nhung neu backend dang chay ban code cu (chua deploy fix bo qua AI cho tin
// nhan marker), no van sinh + luu 1 assistantMessage chao hoi ngay sau marker
// trong DB — se "hien lai" moi khi tai lai lich su tin nhan tu server du FE da
// khong hien no ngay luc goi. Loc bo cap marker+reply do o day de dong bo du
// backend co deploy fix hay chua.
function stripCallGreetingReplies(messages: ChatMessage[]): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (isCallStartMarker(message)) {
      result.push(message);
      const next = messages[i + 1];
      if (next?.role === "ASSISTANT") i++; // bo qua loi chao ngay sau marker
      continue;
    }
    result.push(message);
  }
  return result;
}

// Gop timeline giong het web (chat-main.tsx > groupChatDisplayItems): moi chuoi
// tin nhan VOICE lien tiep (cach nhau <= 2 phut) la 1 "Cuoc goi voice"; gap tin
// nhan thuong thi ket thuc chuoi. Khong dua vao marker CALL_2D/CALL_3D nua —
// nho vay cuoc goi thuc hien tren web (khong co marker) cung hien dung the.
function groupTimelineMessages(messages: ChatMessage[]): ChatTimelineItem[] {
  const items: ChatTimelineItem[] = [];
  let activeVoiceCall: Extract<
    ChatTimelineItem,
    { type: "voice-call" }
  > | null = null;
  let previousVoiceAt = 0;

  for (const message of messages) {
    if (message.messageType !== "VOICE") {
      activeVoiceCall = null;
      previousVoiceAt = 0;
      items.push({ type: "message", message });
      continue;
    }

    const currentTime = getMessageTime(message);
    if (activeVoiceCall && currentTime - previousVoiceAt <= CALL_GROUP_GAP_MS) {
      activeVoiceCall.messages.push(message);
      activeVoiceCall.endedAt = message.createdAt;
    } else {
      activeVoiceCall = {
        type: "voice-call",
        id: `voice-call-${message.id}`,
        startedAt: message.createdAt,
        endedAt: message.createdAt,
        messages: [message],
      };
      items.push(activeVoiceCall);
    }
    previousVoiceAt = currentTime;
  }

  return items;
}

function formatCallTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCallDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function TypingDots() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 3), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        paddingVertical: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            s.typingDot,
            {
              opacity: frame === i ? 1 : 0.3,
              transform: [{ scale: frame === i ? 1.2 : 1 }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// Vien song lan toa quanh call stage khi nhan vat dang noi (khong lam anh nhay)
function SpeakingRipple({ active }: { active: boolean }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      ring1.setValue(0);
      ring2.setValue(0);
      return;
    }

    const makeLoop = (value: Animated.Value) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      );

    const loop1 = makeLoop(ring1);
    const loop2 = makeLoop(ring2);
    loop1.start();
    const delay = setTimeout(() => loop2.start(), 800);

    return () => {
      clearTimeout(delay);
      loop1.stop();
      loop2.stop();
    };
  }, [active, ring1, ring2]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[ring1, ring2].map((ring, i) => (
        <Animated.View
          key={i}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 18,
              borderWidth: 2.5,
              borderColor: ORANGE,
              opacity: ring.interpolate({
                inputRange: [0, 0.15, 1],
                outputRange: [0, 0.6, 0],
              }),
              transform: [
                {
                  scale: ring.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1.04],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

// Keep voice call card
function VoiceCallCard({
  item,
}: {
  item: Extract<ChatTimelineItem, { type: "voice-call" }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const startedAt = formatCallTime(item.startedAt);
  const endedAt = formatCallTime(item.endedAt);
  const timeLabel =
    startedAt && endedAt && startedAt !== endedAt
      ? `${startedAt} - ${endedAt}`
      : startedAt;
  // An marker CALL_2D/CALL_3D cu (di san mobile cu) khoi transcript
  const transcript = item.messages.filter((m) => !isCallStartMarker(m));

  return (
    <View style={s.callRow}>
      <TouchableOpacity
        activeOpacity={transcript.length > 0 ? 0.75 : 1}
        onPress={() => {
          if (transcript.length > 0) setExpanded((v) => !v);
        }}
        style={s.callCard}
      >
        <View style={s.callIcon}>
          <Phone size={16} color={ORANGE} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.callTitle}>Cuộc gọi voice</Text>
          <Text style={s.callMeta}>
            {timeLabel ? `Đã call lúc ${timeLabel}` : "Đã call voice"}
            {transcript.length > 0
              ? ` · ${transcript.length} tin nhắn${expanded ? "" : " — bấm để xem"}`
              : ""}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && transcript.length > 0 ? (
        <View style={s.callTranscript}>
          {transcript.map((m) => (
            <View key={m.id} style={s.callTranscriptRow}>
              <Text style={s.callTranscriptRole}>
                {m.role === "USER" ? "Bạn" : "Nhân vật"}
              </Text>
              <Text style={s.callTranscriptText}>
                {normalizeMessageText(m.content)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function MessageBubble({
  message,
  initial,
  characterImageUrl,
}: {
  message: ChatMessage;
  initial: string;
  characterImageUrl?: string;
}) {
  const isUser = message.role === "USER";
  const isVoice = message.messageType === "VOICE";
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = useCallback(async () => {
    if (!message.content || speaking) return;
    setSpeaking(true);
    try {
      const player = await speakWithAzure(message.content);
      player.addListener("playbackStatusUpdate", (status) => {
        if (status.didJustFinish) setSpeaking(false);
      });
    } catch (e: any) {
      setSpeaking(false);
      Alert.alert(
        "Khong the phat am thanh",
        e?.message ?? "Da xay ra loi khi doc tin nhan.",
      );
    }
  }, [message.content, speaking]);

  if (isUser) {
    return (
      <View style={s.userRow}>
        <View style={[s.userBubble, isVoice && s.userBubbleVoice]}>
          {isVoice && (
            <View style={s.voiceBadgeRow}>
              <Mic size={11} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
              <Text style={s.voiceBadgeTextUser}>Giọng nói</Text>
            </View>
          )}
          <Text className="text-white" style={s.userText}>{normalizeMessageText(message.content)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.aiRow}>
      <View style={s.aiAvatar}>
        {characterImageUrl ? (
          <Image
            source={{ uri: characterImageUrl }}
            style={s.avatarImage}
            contentFit="cover"
          />
        ) : (
          <Text style={s.aiAvatarText}>{initial}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[s.aiBubble, isVoice && s.aiBubbleVoice, { maxWidth: "80%" }]}
        activeOpacity={0.7}
        disabled={!message.content}
        onPress={handleSpeak}
      >
        {message.content ? (
          <>
            {isVoice && (
              <View style={s.voiceBadgeRow}>
                <Mic size={11} color={ORANGE} strokeWidth={2.4} />
                <Text style={s.voiceBadgeTextAi}>Giọng nói</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
              <Text style={[s.aiText, { flexShrink: 1 }]}>{normalizeMessageText(message.content)}</Text>
              <Volume2
                size={14}
                color={speaking ? ORANGE : MUTED}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
            </View>
          </>
        ) : (
          <TypingDots />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    characterId?: string;
    characterName?: string;
    characterImageUrl?: string;
    characterModelUrl?: string;
    contextId?: string;
    contextName?: string;
    greetingMessage?: string;
    suggestedQuestions?: string;
  }>();

  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const characterId = Array.isArray(params.characterId)
    ? params.characterId[0]
    : (params.characterId ?? "");
  const contextId = Array.isArray(params.contextId)
    ? params.contextId[0]
    : (params.contextId ?? "");
  const characterName = Array.isArray(params.characterName)
    ? params.characterName[0]
    : (params.characterName ?? "Nhan vat");
  const characterImageUrl = Array.isArray(params.characterImageUrl)
    ? params.characterImageUrl[0]
    : (params.characterImageUrl ?? "");
  const characterModelUrlParam = Array.isArray(params.characterModelUrl)
    ? params.characterModelUrl[0]
    : (params.characterModelUrl ?? "");
  const contextName = Array.isArray(params.contextName)
    ? params.contextName[0]
    : (params.contextName ?? "");
  const greetingMessageParam = Array.isArray(params.greetingMessage)
    ? params.greetingMessage[0]
    : (params.greetingMessage ?? "");
  const suggestedQuestionsParam = Array.isArray(params.suggestedQuestions)
    ? params.suggestedQuestions[0]
    : (params.suggestedQuestions ?? "");
  const initial = characterName.charAt(0).toUpperCase();

  const { data: sessionData, isLoading: loadingMessages } =
    useSessionMessages(sessionId);
  const { data: character } = useCharacter(characterId);
  const { mutateAsync: sendMessage, isPending: sending } = useSendMessage();
  const { mutateAsync: createSession, isPending: creatingSession } =
    useCreateSession();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timelineItems, setTimelineItems] = useState<ChatTimelineItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callElapsed, setCallElapsed] = useState(0);

  const listRef = useRef<FlatList<ChatTimelineItem>>(null);
  const inputRef = useRef<TextInput>(null);
  const micScale = useRef(new Animated.Value(1)).current;
  const callTranscriptRef = useRef("");
  const [isCallListening, setIsCallListening] = useState(false);
  const [isCallProcessing, setIsCallProcessing] = useState(false);
  const [isCharacterSpeaking, setIsCharacterSpeaking] = useState(false);

  // Refs mirroring state ma cac callback cua @react-native-voice/voice can
  // doc gia tri moi nhat (cac callback duoc gan 1 lan khi Voice.start(), nen
  // doc thang tu state co the bi stale qua nhieu vong lang nghe -> gui -> noi).
  const activeCallRef = useRef<ActiveCall | null>(null);
  const isCallListeningRef = useRef(false);
  const isCharacterSpeakingRef = useRef(false);
  const isCallProcessingRef = useRef(false);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);
  useEffect(() => {
    isCallListeningRef.current = isCallListening;
  }, [isCallListening]);
  useEffect(() => {
    isCharacterSpeakingRef.current = isCharacterSpeaking;
  }, [isCharacterSpeaking]);
  useEffect(() => {
    isCallProcessingRef.current = isCallProcessing;
  }, [isCallProcessing]);

  const nativeVoiceRef = useRef<NativeVoiceLike | null>(null);
  const resolvedCharacterImageUrl =
    characterImageUrl ||
    (character ? (getCharacterImageUri(character) ?? "") : "");
  const resolvedCharacterModelUrl =
    characterModelUrlParam || character?.modelUrl || "";

  useEffect(() => {
    if (!sessionData) return;
    const id = setTimeout(() => {
      let initialMessages = sessionData.messages;
      if (initialMessages.length === 0 && greetingMessageParam) {
        try {
          initialMessages = [JSON.parse(greetingMessageParam) as ChatMessage];
        } catch {
          initialMessages = sessionData.messages;
        }
      }

      let initialSuggestions = sessionData.suggestedQuestions ?? [];
      if (initialSuggestions.length === 0 && suggestedQuestionsParam) {
        try {
          const parsed = JSON.parse(suggestedQuestionsParam);
          initialSuggestions = Array.isArray(parsed) ? parsed : [];
        } catch {
          initialSuggestions = [];
        }
      }

      setMessages(stripCallGreetingReplies(initialMessages));
      setSuggestions(initialSuggestions);
    }, 0);
    return () => clearTimeout(id);
  }, [greetingMessageParam, sessionData, suggestedQuestionsParam]);

  useEffect(() => {
    const id = setTimeout(
      () => setTimelineItems(groupTimelineMessages(messages)),
      0,
    );
    return () => clearTimeout(id);
  }, [messages]);


  useEffect(
    () => () => {
      void Speech.stop();
      stopAzureSpeech();
      void nativeVoiceRef.current?.destroy();
      nativeVoiceRef.current?.removeAllListeners();
    },
    [],
  );

  // Dem gio tu luc bam nut call — mo call la vao ngay (giong web), khong con
  // buoc "dang ket noi" nen khong can moc thoi gian rieng.
  useEffect(() => {
    const resetId = setTimeout(() => setCallElapsed(0), 0);
    if (!activeCall) return () => clearTimeout(resetId);

    const { startedAt } = activeCall;
    const intervalId = setInterval(() => {
      setCallElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      clearTimeout(resetId);
      clearInterval(intervalId);
    };
  }, [activeCall]);

  const handleSend = useCallback(
    async (text?: string, messageType: ChatMessageType = "TEXT") => {
      const content = (text ?? input).trim();
      if (!content || sending || isTyping) return;

      setInput("");
      setSuggestions([]);
      setIsTyping(true);

      const optimisticUser: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: "USER",
        content,
        messageType,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);

      try {
        if (messageType === "TEXT") {
          const assistantId = `stream-${Date.now()}`;
          const assistantMessage: ChatMessage = {
            id: assistantId,
            sessionId,
            role: "ASSISTANT",
            content: "",
            messageType: "TEXT",
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          const streamed = await chatApi.streamMessage(
            sessionId,
            content,
            (token) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: `${m.content}${token}` }
                    : m,
                ),
              );
            },
          );

          try {
            const synced = await chatApi.getMessages(sessionId);
            setMessages(stripCallGreetingReplies(synced.messages));
            setSuggestions(synced.suggestedQuestions ?? []);
          } catch {
            if (!streamed)
              setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          }

          if (streamed && autoSpeak) void speakWithAzure(streamed);
        } else {
          const result = await sendMessage({ sessionId, content, messageType });
          setMessages((prev) => {
            const withoutOptimistic = prev.filter(
              (m) => m.id !== optimisticUser.id,
            );
            const next = [...withoutOptimistic, result.userMessage];
            if (result.assistantMessage) next.push(result.assistantMessage);
            return next;
          });
          setSuggestions(result.suggestedQuestions ?? []);
          if (result.assistantMessage?.content && autoSpeak) {
            void speakWithAzure(result.assistantMessage.content);
          }
        }
      } catch (e: any) {
        setMessages((prev) =>
          prev.filter(
            (m) => m.id !== optimisticUser.id && !m.id.startsWith("stream-"),
          ),
        );
        const message = e?.message ?? "Khong the gui tin nhan. Thu lai?";
        if (message.toLowerCase().includes("token")) {
          Alert.alert("Het token", message, [
            { text: "De sau", style: "cancel" },
            { text: "Nap them", onPress: () => router.push("/payment") },
          ]);
        } else {
          Alert.alert("Loi", message);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, router, sending, sendMessage, sessionId, autoSpeak],
  );

  function handleStartCall(mode: "2D" | "3D") {
    if (activeCallRef.current) return;
    if (mode === "3D" && !resolvedCharacterModelUrl) {
      Alert.alert(
        "Chua co model 3D",
        "Nhan vat nay chua co modelUrl de call 3D.",
      );
      return;
    }

    // Giong web: mo call chi la thao tac UI cuc bo — khong goi backend, khong
    // co trang thai "dang ket noi". Bam la vao call ngay, mic dung duoc lien.
    // (Cuoc goi hien trong lich su nho cac tin nhan VOICE gui trong luc call
    // duoc gop thanh the "Cuoc goi voice", giong het chat-main.tsx ben web.)
    stopAzureSpeech();
    // Reset phong thu cac co co the bi ket tu cuoc goi truoc (vd cup may dung
    // luc nhan vat dang noi lam promise phat audio khong bao gio resolve).
    setIsCallListening(false);
    setIsCallProcessing(false);
    setIsCharacterSpeaking(false);
    setActiveCall({ mode, startedAt: Date.now() });
  }

  function endActiveCall() {
    activeCallRef.current = null;
    void nativeVoiceRef.current?.stop().catch(() => {});
    void stopAzureSpeech();
    setIsCallListening(false);
    setIsCallProcessing(false);
    setIsCharacterSpeaking(false);
    setActiveCall(null);
  }

  async function handleNewSession() {
    if (!characterId || !contextId || creatingSession) {
      Alert.alert(
        "Chua du thong tin",
        "Hay tao Cuộc trò chuyện moi tu trang nhan vat.",
      );
      return;
    }

    try {
      const result = await createSession({ characterId, contextId });
      const session = result.session ?? result;
      if (!session.id) throw new Error("Missing chat session id");
      router.replace({
        pathname: "/chat/[sessionId]",
        params: {
          sessionId: session.id,
          characterId,
          contextId,
          characterName,
          characterImageUrl,
          characterModelUrl: resolvedCharacterModelUrl,
          contextName,
          greetingMessage: result.greetingMessage
            ? JSON.stringify(result.greetingMessage)
            : "",
          suggestedQuestions: result.suggestedQuestions
            ? JSON.stringify(result.suggestedQuestions)
            : "",
        },
      });
    } catch (e: any) {
      Alert.alert("Loi", e?.message ?? "Khong the tao Cuộc trò chuyện moi.");
    }
  }

  function handleDeleteSession() {
    Alert.alert(
      "Xoa Cuộc trò chuyện?",
      "Cuộc trò chuyện se duoc dua vao thung rac.",
      [
        { text: "Huy", style: "cancel" },
        {
          text: "Xoa",
          style: "destructive",
          onPress: async () => {
            try {
              await chatApi.deleteSession(sessionId);
            } finally {
              router.back();
            }
          },
        },
      ],
    );
  }

  function handleMenu() {
    setMenuOpen((open) => !open);
  }

  function openCharacterProfile() {
    setMenuOpen(false);
    if (characterId)
      router.push({
        pathname: "/characters/[id]",
        params: { id: characterId },
      });
  }

  function openChatHistory() {
    setMenuOpen(false);
    if (characterId) {
      router.push({
        pathname: "/chat" as never,
        params: { characterId, characterName },
      });
    }
  }

  function createNewSessionFromMenu() {
    setMenuOpen(false);
    void handleNewSession();
  }

  function deleteSessionFromMenu() {
    setMenuOpen(false);
    handleDeleteSession();
  }

  // ── Voice call: bam mic de noi, nhan vat tra loi bang giong doc ──
  async function speakCallText(text: string) {
    setIsCharacterSpeaking(true);
    try {
      const player = await speakWithAzure(text);
      await new Promise<void>((resolve) => {
        let finished = false;
        let idleTicks = 0;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearInterval(pollId);
          resolve();
        };

        player.addListener("playbackStatusUpdate", (status) => {
          if (status.didJustFinish) finish();
        });

        // Chong ket: didJustFinish co the KHONG bao gio ban — audio ngan phat
        // xong truoc khi listener kip gan, hoac player bi remove() giua chung
        // (cup may goi stopAzureSpeech()). Neu chi cho listener thi promise
        // treo vinh vien -> isCharacterSpeaking/isCallProcessing ket true ->
        // mic bi disable mai (trieu chung "mic doi luc khong hoat dong").
        // Poll trang thai lam duong thoat: doi 3 tick lien tiep khong phat
        // (~1.2s) de khong nham luc player con dang load file.
        const pollId = setInterval(() => {
          try {
            if (player.playing) {
              idleTicks = 0;
              return;
            }
            idleTicks += 1;
            if (idleTicks >= 3) finish();
          } catch {
            finish(); // player da bi giai phong
          }
        }, 400);
      });
    } finally {
      setIsCharacterSpeaking(false);
    }
  }

  async function sendCallMessage(content: string) {
    setIsCallProcessing(true);
    try {
      const result = await sendMessage({ sessionId, content, messageType: "VOICE" });
      setMessages((prev) => {
        const next = [...prev, result.userMessage];
        if (result.assistantMessage?.content) next.push(result.assistantMessage);
        return next;
      });
      setSuggestions(result.suggestedQuestions ?? []);
      if (result.assistantMessage?.content) {
        await speakCallText(result.assistantMessage.content);
      }
    } catch (e: any) {
      Alert.alert("Loi", e?.message ?? "Khong the gui tin nhan.");
    } finally {
      setIsCallProcessing(false);
    }
  }

  async function startCallListening() {
    if (
      !activeCallRef.current ||
      isCallListeningRef.current ||
      isCharacterSpeakingRef.current ||
      isCallProcessingRef.current
    ) {
      return;
    }
    try {
      if (!NativeModules.RCTVoice) {
        Alert.alert(
          "Can build lai app",
          "Thu vien STT native chua co trong app dang chay. Hay chay development build/native build sau khi cai @react-native-voice/voice; Expo Go se khong dung duoc tinh nang nay.",
        );
        return;
      }

      const Voice = VoiceNative as unknown as NativeVoiceLike;
      const available = await Voice.isAvailable();
      if (!available) {
        Alert.alert("Chua co STT", "Thiet bi nay chua co dich vu nhan dang giong noi.");
        return;
      }

      // @react-native-voice/voice chi gan lai native event listener o lan
      // Voice.start() dau tien; destroy() de buoc no dang ky lai voi handler moi nhat.
      await Voice.destroy().catch(() => {});

      callTranscriptRef.current = "";
      Voice.onSpeechPartialResults = (event) => {
        const t = event.value?.[0]?.trim();
        if (t) callTranscriptRef.current = t;
      };
      Voice.onSpeechResults = (event) => {
        const t = event.value?.[0]?.trim();
        if (t) callTranscriptRef.current = t;
        void finishCallListening();
      };
      Voice.onSpeechVolumeChanged = (event) => {
        // Native STT co the con ban vai su kien volume-changed du tra ve trong
        // luc dang teardown (sau khi da goi stop()) — bo qua neu ta khong con
        // thuc su o trang thai dang nghe, tranh mic hien "nay" du nhan vat dang noi.
        if (!isCallListeningRef.current) return;
        if (event.value == null) return;
        const level = Math.max(0, Math.min(1, event.value / 10));
        Animated.spring(micScale, {
          toValue: 1 + level * 0.35,
          speed: 20,
          bounciness: 6,
          useNativeDriver: true,
        }).start();
      };
      Voice.onSpeechEnd = () => {};
      // No match / timeout (vd im lang khi bam nham mic) -> dung ghi am nhu
      // binh thuong, finishCallListening() se khong gui gi vi transcript rong.
      Voice.onSpeechError = () => {
        void finishCallListening();
      };

      nativeVoiceRef.current = Voice;
      await Voice.start("vi-VN");

      // Voice.start() la async — trong luc cho, trang thai co the da doi (vd
      // nhan vat bat dau noi do 1 luot xu ly khac vua xong rat nhanh). Neu het
      // dieu kien de nghe nua thi dung ngay, khong danh dau isCallListening,
      // tranh de lai 1 phien STT "mo côi" (native van dang nghe that nhung app
      // lai tuong chua nghe -> phai tat/bat mic thu cong moi het ket dinh).
      if (
        !activeCallRef.current ||
        isCharacterSpeakingRef.current ||
        isCallProcessingRef.current
      ) {
        await Voice.stop().catch(() => {});
        return;
      }
      setIsCallListening(true);
    } catch (e: any) {
      setIsCallListening(false);
      // Loi that su (vd: khong co quyen mic) -> bao 1 lan, khong tu dong lap lai vo han.
      Alert.alert(
        "Khong the bat micro",
        e?.message ??
        "Can chay bang development build/native build sau khi cai @react-native-voice/voice.",
      );
    }
  }

  // Bam mic de noi (giong het nut mic o thanh nhap text): bam 1 lan de bat
  // dau ghi, bam lan nua (hoac de STT tu phat hien het cau) de dung va gui.
  // Khong tu dong nghe lai — nguoi dung chu dong bam moi khi muon noi tiep.
  async function finishCallListening() {
    if (!isCallListeningRef.current) return;
    setIsCallListening(false);
    Animated.spring(micScale, { toValue: 1, useNativeDriver: true }).start();

    try {
      await nativeVoiceRef.current?.stop();
    } catch {
      // ignore
    }

    const transcript = callTranscriptRef.current.trim();
    callTranscriptRef.current = "";
    // Bo qua transcript qua ngan (1 ky tu) — thuong la nhieu/ao giac cua STT
    // luc im lang (hay gap tren emulator khong co mic that), khong phai loi
    // nguoi dung noi that su. Nguoi dung noi that se luon ra tu/cau dai hon.
    if (transcript.length >= 2) {
      await sendCallMessage(transcript);
    }
  }

  return (
    // Tab bar bi an trong man hoi thoai (xem app-tabs.tsx) nen phai tu chua
    // safe-area duoi — giong quiz-play.
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={s.headerBtn}
          >
            <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={s.headerName} numberOfLines={1}>
              {characterName}
            </Text>
            {contextName ? (
              <Text style={s.headerContext} numberOfLines={1}>
                {contextName}
              </Text>
            ) : null}
          </View>

          <View style={s.headerAvatar}>
            {resolvedCharacterImageUrl ? (
              <Image
                source={{ uri: resolvedCharacterImageUrl }}
                style={s.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={s.headerAvatarText}>{initial}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleMenu}
            activeOpacity={0.7}
            style={[s.headerBtn, { marginLeft: 8 }]}
          >
            <Ellipsis size={20} color={MUTED} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {menuOpen ? (
          <>
            <Pressable
              style={s.menuBackdrop}
              onPress={() => setMenuOpen(false)}
            />
            <View style={s.menuPopover}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={s.menuItem}
                onPress={openCharacterProfile}
              >
                <View style={s.menuIcon}>
                  <UserRound size={16} color={ORANGE} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>Thông tin nhân vật</Text>
                  <Text style={s.menuHint} numberOfLines={1}>
                    {characterName}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={s.menuItem}
                onPress={openChatHistory}
              >
                <View style={s.menuIcon}>
                  <History size={16} color={ORANGE} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>Xem lịch sử chat</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={s.menuItem}
                onPress={createNewSessionFromMenu}
              >
                <View style={s.menuIcon}>
                  <MessageCircle size={16} color={ORANGE} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>Tạo cuộc trò chuyện mới</Text>
                </View>
              </TouchableOpacity>

              <View style={s.menuItem}>
                <View style={s.menuIcon}>
                  <Volume2 size={16} color={ORANGE} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>Tự động đọc tin nhắn mới</Text>
                </View>
                <Switch
                  value={autoSpeak}
                  onValueChange={setAutoSpeak}
                  trackColor={{ true: ORANGE, false: BORDER }}
                  thumbColor="#fff"
                />
              </View>

              <View style={s.menuDivider} />

              <TouchableOpacity
                activeOpacity={0.75}
                style={s.menuItem}
                onPress={deleteSessionFromMenu}
              >
                <View style={[s.menuIcon, s.menuDangerIcon]}>
                  <Trash2 size={16} color="#dc2626" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuDangerLabel}>Xóa cuộc trò chuyện</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        <View style={s.divider} />

        {activeCall ? (
          <View style={s.callOverlay}>
            <View style={s.callStage}>
              {activeCall.mode === "2D" ? (
                resolvedCharacterImageUrl ? (
                  <Image
                    source={{ uri: resolvedCharacterImageUrl }}
                    style={s.callPortrait}
                    contentFit="cover"
                  />
                ) : (
                  <View style={s.callInitial}>
                    <Text style={s.callInitialText}>{initial}</Text>
                  </View>
                )
              ) : (
                <View style={s.callModelStage}>
                  <View style={s.callModelBox}>
                    <Box size={54} color="#fff" strokeWidth={1.7} />
                  </View>
                  <Text style={s.callModelTitle}>3D model ready</Text>
                  <Text style={s.callModelUrl} numberOfLines={2}>
                    {resolvedCharacterModelUrl}
                  </Text>
                </View>
              )}

              <View style={s.callShade} />
              <SpeakingRipple active={isCharacterSpeaking} />
              <View style={s.callInfo}>
                <Text style={s.callModeLabel}>
                  {activeCall.mode === "2D" ? "Call 2D" : "Call 3D"}
                </Text>
                <Text style={s.callName}>{characterName}</Text>
                <Text style={s.callTimer}>
                  {formatCallDuration(callElapsed)}
                </Text>
              </View>

              <View style={s.callControls}>
                <Animated.View style={{ transform: [{ scale: micScale }] }}>
                  <Pressable
                    disabled={isCallProcessing || isCharacterSpeaking}
                    onPress={() =>
                      isCallListening
                        ? void finishCallListening()
                        : void startCallListening()
                    }
                    style={[
                      s.callControlBtn,
                      isCallListening && s.callControlBtnActive,
                      (isCallProcessing || isCharacterSpeaking) && {
                        opacity: 0.5,
                      },
                    ]}
                  >
                    {isCallProcessing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Mic size={20} color="#fff" strokeWidth={2} />
                    )}
                  </Pressable>
                </Animated.View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={s.callEndBtn}
                  onPress={endActiveCall}
                >
                  <PhoneOff size={22} color="#fff" strokeWidth={2.3} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {!activeCall ? (
          <View style={s.callActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={s.callActionBtn}
              onPress={() => handleStartCall("2D")}
              disabled={sending || isTyping}
            >
              <Video size={15} color={ORANGE} strokeWidth={2} />
              <Text style={s.callActionText}>Call 2D</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                s.callActionBtn,
                !resolvedCharacterModelUrl && { opacity: 0.45 },
              ]}
              onPress={() => handleStartCall("3D")}
              disabled={sending || isTyping || !resolvedCharacterModelUrl}
            >
              <Box size={15} color={ORANGE} strokeWidth={2} />
              <Text style={s.callActionText}>Call 3D</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loadingMessages ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color={ORANGE} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            inverted
            data={timelineItems.slice().reverse()}
            keyExtractor={(item) =>
              item.type === "message" ? item.message.id : item.id
            }
            contentContainerStyle={s.messageList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  marginTop: 40,
                  gap: 10,
                  transform: [{ scaleY: -1 }],
                }}
              >
                <Text style={{ color: MUTED, fontSize: 14 }}>
                  Bat dau Cuộc trò chuyện...
                </Text>
              </View>
            }
            renderItem={({ item }) =>
              item.type === "voice-call" ? (
                <VoiceCallCard item={item} />
              ) : (
                <MessageBubble
                  message={item.message}
                  initial={initial}
                  characterImageUrl={resolvedCharacterImageUrl}
                />
              )
            }
          />
        )}

        {suggestions.length > 0 && !isTyping && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.suggestionsBar}
            contentContainerStyle={{
              gap: 8,
              paddingHorizontal: 16,
              alignItems: 'center',
            }}
          >
            {suggestions.map((q, i) => (
              <TouchableOpacity
                key={`${q}-${i}`}
                onPress={() => void handleSend(q)}
                activeOpacity={0.75}
                style={s.suggestionChip}
              >
                <Text style={s.suggestionText} numberOfLines={1}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={s.inputBar}>
          <TextInput
            ref={inputRef}
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={`Hỏi ${characterName}...`}
            placeholderTextColor={MUTED}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => void handleSend()}
            disabled={!input.trim() || sending || isTyping}
            style={[
              s.sendBtn,
              (!input.trim() || sending || isTyping) && { opacity: 0.4 },
            ]}
          >
            <Send size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={{ height: Platform.OS === "ios" ? 0 : 8 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  headerContext: {
    color: MUTED,
    fontSize: 11,
    marginTop: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  menuBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  menuPopover: {
    position: "absolute",
    right: 12,
    top: 58,
    zIndex: 30,
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ORANGE_TINT_MUTED,
  },
  menuDangerIcon: {
    backgroundColor: "rgba(220,38,38,0.1)",
  },
  menuLabel: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },
  menuDangerLabel: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "800",
  },
  menuHint: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 6,
  },
  divider: { height: 1, backgroundColor: BORDER },
  callOverlay: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: BG,
  },
  callStage: {
    height: 360,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1f130c",
    borderWidth: 1,
    borderColor: ORANGE_BORDER_MUTED,
  },
  callPortrait: {
    width: "100%",
    height: "100%",
  },
  callInitial: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c1810",
  },
  callInitialText: {
    color: "rgba(255,255,255,0.32)",
    fontSize: 120,
    fontWeight: "900",
  },
  callModelStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#111827",
  },
  callModelBox: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ORANGE_TINT_STRONG,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  callModelTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 18,
  },
  callModelUrl: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    textAlign: "center",
  },
  callShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    backgroundColor: "rgba(0,0,0,0.46)",
  },
  callInfo: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 96,
    alignItems: "center",
  },
  callModeLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  callName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },
  callTimer: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  callControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  callControlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  callControlBtnActive: {
    backgroundColor: ORANGE_TINT_SOLID,
    borderColor: "rgba(255,255,255,0.28)",
  },
  callEndBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
  },
  callActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  callActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ORANGE_TINT_STRONG,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  callActionText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "80%",
    backgroundColor: ORANGE,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  userBubbleVoice: {
    backgroundColor: "#8a4a1f",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  voiceBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  voiceBadgeTextUser: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  voiceBadgeTextAi: {
    fontSize: 10,
    fontWeight: "700",
    color: ORANGE,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  userText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: ORANGE_BORDER_MEDIUM,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  aiAvatarText: { color: ORANGE, fontSize: 13, fontWeight: "800" },
  aiBubble: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  aiBubbleVoice: {
    backgroundColor: ORANGE_TINT_MUTED,
    borderColor: ORANGE_BORDER,
  },
  aiText: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 22,
  },
  callRow: {
    alignItems: "center",
  },
  callCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "86%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ORANGE_BORDER_SOFT,
    backgroundColor: SURFACE,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  callIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ORANGE_TINT_MUTED,
  },
  callTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },
  callMeta: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  callTranscript: {
    alignSelf: "stretch",
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  callTranscriptRow: {
    gap: 2,
  },
  callTranscriptRole: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: "800",
  },
  callTranscriptText: {
    color: TEXT2,
    fontSize: 13,
    lineHeight: 19,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: MUTED,
  },
  suggestionsBar: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    height: 56,
    flexShrink: 0,
  },
  suggestionChip: {
    alignSelf: 'center',
    maxWidth: 240,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ORANGE_BORDER_MUTED,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    color: TEXT2,
    fontSize: 12,
    lineHeight: 17,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: BG,
  },
  textInput: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    color: TEXT,
    fontSize: 14,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
