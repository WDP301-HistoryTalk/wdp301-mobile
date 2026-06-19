export interface ChatSession {
  id: string;
  uid: string;
  characterId: string;
  contextId: string;
  title?: string;
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  suggestedQuestions?: string[];
  token?: number;
  createdAt: string;
}

export interface CreateSessionResponse {
  session: ChatSession;
  greetingMessage: ChatMessage;
  suggestedQuestions: string[];
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  suggestedQuestions: string[];
}

export interface SessionMessagesResponse {
  session: ChatSession;
  messages: ChatMessage[];
}
