import { useAuthStore } from "@/features/auth/store";
import { BASE_URL, apiClient } from "@/lib/api-client";

import type {
  ChatHistoryGroup,
  ChatMessageType,
  ChatSession,
  CreateSessionResponse,
  SendMessageResponse,
  SessionMessagesResponse,
} from "./types";

async function authedHeaders(extra?: HeadersInit) {
  const token = useAuthStore.getState().accessToken;
  return {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function readSsePayload(chunk: string): string[] {
  return chunk
    .split(/\n\n+/)
    .flatMap((event) =>
      event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s?/, "").trim()),
    )
    .filter(Boolean);
}

function readTokenFromPayload(data: string): string {
  if (!data || data === "[DONE]") return "";

  try {
    const parsed = JSON.parse(data);
    if (parsed && parsed.success === false) {
      throw new Error(parsed.message ?? "Yeu cau that bai");
    }
    if (typeof parsed === "string") return parsed;
    if (typeof parsed.content === "string") return parsed.content;
    if (typeof parsed.token === "string") return parsed.token;
    if (typeof parsed.delta === "string") return parsed.delta;
    if (typeof parsed.text === "string") return parsed.text;
    if (typeof parsed.data === "string") return parsed.data;
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.assistantMessage?.content === "string")
      return parsed.assistantMessage.content;
    if (typeof parsed.choices?.[0]?.delta?.content === "string")
      return parsed.choices[0].delta.content;
    if (typeof parsed.choices?.[0]?.text === "string")
      return parsed.choices[0].text;
    return "";
  } catch (error) {
    if (error instanceof Error) throw error;
    return data;
  }
}

function readTextFromSse(raw: string, onToken?: (token: string) => void) {
  let assistantText = "";
  const payloads = readSsePayload(raw);
  const values = payloads.length > 0 ? payloads : [raw];

  for (const data of values) {
    const token = readTokenFromPayload(data);
    if (!token) continue;
    assistantText += token;
    onToken?.(token);
  }

  return assistantText;
}

export const chatApi = {
  getHistory: () => apiClient<ChatHistoryGroup[]>('/chat/history'),

  createSession: (characterId: string, contextId: string) =>
    apiClient<CreateSessionResponse>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ characterId, contextId }),
    }),

  getMessages: (sessionId: string) =>
    apiClient<SessionMessagesResponse>(`/chat/sessions/${sessionId}/messages`),

  sendMessage: (
    sessionId: string,
    content: string,
    messageType: ChatMessageType = "TEXT",
  ) =>
    apiClient<SendMessageResponse>("/chat/messages", {
      method: "POST",
      body: JSON.stringify({ sessionId, content, messageType }),
    }),

  streamMessage: async (
    sessionId: string,
    content: string,
    onToken: (token: string) => void,
    messageType: ChatMessageType = "TEXT",
  ) => {
    const res = await fetch(`${BASE_URL}/chat/messages/stream`, {
      method: "POST",
      headers: await authedHeaders(),
      body: JSON.stringify({ sessionId, content, messageType }),
    });

    if (!res.ok) {
      const raw = await res.text();
      try {
        const parsed = JSON.parse(raw);
        throw new Error(parsed.message ?? raw);
      } catch (error) {
        if (error instanceof Error && error.message !== raw) throw error;
        throw new Error(raw || "Khong the gui tin nhan streaming");
      }
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return readTextFromSse(await res.text(), onToken);
    }

    const decoder = new TextDecoder();
    let assistantText = "";
    let buffered = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffered += decoder.decode(value, { stream: true });
      const completeEvents = buffered.split(/\n\n+/);
      buffered = completeEvents.pop() ?? "";

      assistantText += readTextFromSse(completeEvents.join("\n\n"), onToken);
    }

    assistantText += readTextFromSse(buffered, onToken);

    return assistantText;
  },

  getSessions: (params?: { characterId?: string; contextId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.characterId) qs.set("characterId", params.characterId);
    if (params?.contextId) qs.set("contextId", params.contextId);
    return apiClient<ChatSession[]>(`/chat/sessions?${qs.toString()}`);
  },

  deleteSession: async (sessionId: string) => {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(
      `${BASE_URL}/chat/sessions/${sessionId}/soft-delete`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json, text/plain, */*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    const raw = await res.text();
    let parsed: any = null;

    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { message: raw };
      }
    }

    if (!res.ok) {
      throw new Error(
        parsed?.message ?? raw ?? "Không thể xóa cuộc trò chuyện",
      );
    }

    return {};
  },
};
