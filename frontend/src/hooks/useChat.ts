/**
 * useChat
 * ──────────────────────────────────────────────────
 * Manages chat state for ChatPage.
 * - Loads persisted history from GET /api/chat/history
 * - Sends messages via POST /api/chat with optimistic UI
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getChatHistory,
  sendChatMessage,
  type ApiChatMessage,
} from '../services/chatService';

export type ChatMessageRole = 'user' | 'ai' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  pending?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isHistoryLoading: boolean;
  isSending: boolean;
  historyError: string | null;
  sendError: string | null;
  sendMessage: (text: string) => Promise<void>;
  reloadHistory: () => Promise<void>;
  clearSendError: () => void;
  clearHistoryError: () => void;
}

const mapApiMessage = (message: ApiChatMessage): ChatMessage => ({
  id: message.id,
  role: message.role === 'assistant' ? 'ai' : 'user',
  content: message.content,
  timestamp: new Date(message.createdAt),
});

const extractError = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

export function useChat(businessId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const reloadHistory = useCallback(async () => {
    if (!businessId) {
      setMessages([]);
      setHistoryError(null);
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const history = await getChatHistory(businessId);
      setMessages(history.map(mapApiMessage));
    } catch (err) {
      setHistoryError(extractError(err, 'Failed to load chat history.'));
      setMessages([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    reloadHistory();
  }, [reloadHistory]);

  const sendMessage = useCallback(async (text: string) => {
    if (!businessId || !text.trim() || isSending) return;

    const trimmed = text.trim();
    const tempId = `temp-user-${Date.now()}`;

    const optimisticUser: ChatMessage = {
      id: tempId,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticUser]);
    setIsSending(true);
    setSendError(null);

    try {
      const response = await sendChatMessage(businessId, trimmed);

      if (response.retrieval?.sourceCount > 0) {
        console.debug('[Chat RAG]', {
          sourceCount: response.retrieval.sourceCount,
          scores: response.retrieval.scores,
          sources: response.retrieval.sources,
        });
      }

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((message) => message.id !== tempId);

        if (response.messages && response.messages.length > 0) {
          return [...withoutOptimistic, ...response.messages.map(mapApiMessage)];
        }

        return [
          ...withoutOptimistic,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: response.message,
            timestamp: new Date(),
          },
          {
            id: `ai-${Date.now()}`,
            role: 'ai',
            content: response.answer,
            timestamp: new Date(),
          },
        ];
      });
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      setSendError(extractError(err, 'Failed to get a response. Please try again.'));
    } finally {
      setIsSending(false);
    }
  }, [businessId, isSending]);

  const clearSendError = useCallback(() => setSendError(null), []);
  const clearHistoryError = useCallback(() => setHistoryError(null), []);

  return {
    messages,
    isHistoryLoading,
    isSending,
    historyError,
    sendError,
    sendMessage,
    reloadHistory,
    clearSendError,
    clearHistoryError,
  };
}
