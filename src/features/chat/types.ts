export interface ChatSession {
  id: string;
  characterId: string;
  characterName?: string;
  characterTitle?: string;
  characterImage?: string;
  characterModelUrl?: string;
  contextId: string;
  contextName?: string;
  title?: string;
  sessionTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  messageCount?: number;
  uid?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  messageType?: ChatMessageType;
  suggestedQuestions?: string[];
  token?: number;
  createdAt: string;
}

export type ChatMessageType = 'TEXT' | 'VOICE';

export interface CreateSessionResponse {
  id?: string;
  characterId?: string;
  contextId?: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  messageCount?: number;
  session?: ChatSession;
  greetingMessage?: ChatMessage;
  suggestedQuestions?: string[];
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage?: ChatMessage;
  suggestedQuestions: string[];
  remainingTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
}

export interface SessionMessagesResponse {
  messages: ChatMessage[];
  suggestedQuestions: string[];
}

export interface ChatHistoryGroup {
  contextId: string;
  contextName: string;
  sessions: ChatSession[];
}
