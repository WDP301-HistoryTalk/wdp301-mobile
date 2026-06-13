import { apiClient } from '@/lib/api-client';

import type {
  ChatSession,
  CreateSessionResponse,
  SendMessageResponse,
  SessionMessagesResponse,
} from './types';

export const chatApi = {
  createSession: (characterId: string, contextId: string) =>
    apiClient<CreateSessionResponse>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ characterId, contextId }),
    }),

  getMessages: (sessionId: string) =>
    apiClient<SessionMessagesResponse>(`/chat/sessions/${sessionId}/messages`),

  sendMessage: (sessionId: string, content: string) =>
    apiClient<SendMessageResponse>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ sessionId, content }),
    }),

  getSessions: (params?: { characterId?: string; contextId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.characterId) qs.set('characterId', params.characterId);
    if (params?.contextId)   qs.set('contextId',   params.contextId);
    return apiClient<ChatSession[]>(`/chat/sessions?${qs.toString()}`);
  },

  deleteSession: (sessionId: string) =>
    apiClient<null>(`/chat/sessions/${sessionId}`, { method: 'DELETE' }),
};
