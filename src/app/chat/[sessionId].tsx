import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { BG, BORDER, CARD, MUTED, ORANGE, SURFACE, TEXT, TEXT2 } from '@/constants/palette';
import { chatApi } from '@/features/chat/api';
import { useSessionMessages } from '@/features/chat/hooks/use-session-messages';
import { useSendMessage } from '@/features/chat/hooks/use-send-message';
import type { ChatMessage } from '@/features/chat/types';

// ─── typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 3), 450);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={s.aiBubble}>
      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 4 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              s.typingDot,
              { opacity: frame === i ? 1 : 0.3, transform: [{ scale: frame === i ? 1.2 : 1 }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── message bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message, initial,
}: {
  message: ChatMessage;
  initial: string;
}) {
  const isUser = message.role === 'USER';

  if (isUser) {
    return (
      <View style={s.userRow}>
        <View style={s.userBubble}>
          <Text style={s.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.aiRow}>
      {/* Character avatar */}
      <View style={s.aiAvatar}>
        <Text style={s.aiAvatarText}>{initial}</Text>
      </View>
      <View style={[s.aiBubble, { maxWidth: '80%' }]}>
        <Text style={s.aiText}>{message.content}</Text>
      </View>
    </View>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router     = useRouter();
  const params     = useLocalSearchParams<{
    sessionId: string;
    characterName?: string;
    contextName?: string;
  }>();

  const sessionId     = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const characterName = Array.isArray(params.characterName) ? params.characterName[0] : (params.characterName ?? 'Nhân vật');
  const contextName   = Array.isArray(params.contextName)   ? params.contextName[0]   : (params.contextName ?? '');
  const initial       = characterName.charAt(0).toUpperCase();

  const { data: sessionData, isLoading: loadingMessages } = useSessionMessages(sessionId);
  const { mutateAsync: sendMessage, isPending: sending }  = useSendMessage();

  const [messages,     setMessages]     = useState<ChatMessage[]>([]);
  const [suggestions,  setSuggestions]  = useState<string[]>([]);
  const [input,        setInput]        = useState('');
  const [isTyping,     setIsTyping]     = useState(false);

  const listRef  = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  // Load initial messages from API
  useEffect(() => {
    if (!sessionData) return;
    setMessages(sessionData.messages);
    // Grab suggestions from last AI message
    const last = [...sessionData.messages].reverse().find((m) => m.role === 'ASSISTANT');
    setSuggestions(last?.suggestedQuestions ?? []);
  }, [sessionData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length === 0) return;
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending || isTyping) return;

    setInput('');
    setSuggestions([]);
    setIsTyping(true);

    // Optimistically add user message
    const optimisticUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const result = await sendMessage({ sessionId, content });
      setMessages((prev) => {
        // Replace optimistic user message + add real user + AI messages
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticUser.id);
        return [...withoutOptimistic, result.userMessage, result.assistantMessage];
      });
      setSuggestions(result.suggestedQuestions ?? []);
    } catch (e: any) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      Alert.alert('Lỗi', e?.message ?? 'Không thể gửi tin nhắn. Thử lại?');
    } finally {
      setIsTyping(false);
    }
  }, [input, sending, isTyping, sessionId, sendMessage]);

  function handleDeleteSession() {
    Alert.alert(
      'Xoá cuộc trò chuyện?',
      'Toàn bộ lịch sử chat sẽ bị xoá vĩnh viễn.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatApi.deleteSession(sessionId);
              router.back();
            } catch {
              router.back();
            }
          },
        },
      ]
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.headerBtn}>
            <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={s.headerName} numberOfLines={1}>{characterName}</Text>
            {contextName ? (
              <Text style={s.headerContext} numberOfLines={1}>{contextName}</Text>
            ) : null}
          </View>

          {/* Character avatar in header */}
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarText}>{initial}</Text>
          </View>

          <TouchableOpacity onPress={handleDeleteSession} activeOpacity={0.7} style={[s.headerBtn, { marginLeft: 8 }]}>
            <Trash2 size={18} color={MUTED} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        <View style={s.divider} />

        {/* Messages */}
        {loadingMessages ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={ORANGE} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={s.messageList}
            showsVerticalScrollIndicator={false}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
                <Text style={{ color: MUTED, fontSize: 14 }}>Bắt đầu cuộc trò chuyện...</Text>
              </View>
            }
            renderItem={({ item }) => (
              <MessageBubble message={item} initial={initial} />
            )}
            ListFooterComponent={isTyping ? <TypingDots /> : null}
          />
        )}

        {/* Suggested questions */}
        {suggestions.length > 0 && !isTyping && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.suggestionsBar}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            {suggestions.map((q, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => void handleSend(q)}
                activeOpacity={0.75}
                style={s.suggestionChip}
              >
                <Text style={s.suggestionText} numberOfLines={2}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input bar */}
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
          <Pressable
            onPress={() => void handleSend()}
            disabled={!input.trim() || sending || isTyping}
            style={({ pressed }) => [
              s.sendBtn,
              (!input.trim() || sending || isTyping) && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
          >
            {sending || isTyping
              ? <ActivityIndicator color="#fff" size="small" />
              : <Send size={18} color="#fff" strokeWidth={2} />}
          </Pressable>
        </View>

        {/* Safe area bottom spacer */}
        <View style={{ height: Platform.OS === 'ios' ? 0 : 8 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: CARD, alignItems: 'center', justifyContent: 'center',
  },
  headerName: {
    color: TEXT, fontSize: 16, fontWeight: '700',
  },
  headerContext: {
    color: MUTED, fontSize: 11, marginTop: 1,
  },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  divider: { height: 1, backgroundColor: BORDER },

  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },

  // User bubble — right-aligned
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: ORANGE,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  userText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },

  // AI bubble — left-aligned
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: SURFACE,
    borderWidth: 1, borderColor: 'rgba(234,88,12,0.3)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  aiAvatarText: { color: ORANGE, fontSize: 13, fontWeight: '800' },
  aiBubble: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  aiText: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 22,
  },

  // Typing dots
  typingDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: MUTED,
  },

  // Suggestions
  suggestionsBar: {
    borderTopWidth: 1, borderTopColor: BORDER,
    maxHeight: 100,
  },
  suggestionChip: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 220,
  },
  suggestionText: {
    color: TEXT2,
    fontSize: 12,
    lineHeight: 17,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: BORDER,
    backgroundColor: BG,
  },
  textInput: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    color: TEXT,
    fontSize: 14,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: ORANGE,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
});
