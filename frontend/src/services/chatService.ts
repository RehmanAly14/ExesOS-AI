/**
 * Chat Service
 * ──────────────────────────────────────────────────
 * API wrappers for POST /api/chat and GET /api/chat/history.
 */

import apiClient from '../lib/apiClient';

// ── Types ──────────────────────────────────────────

export interface ChatRequest {
  businessId: string;
  message: string;
}

export interface ChatRetrievalSource {
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  title: string;
  score: number;
  contentPreview: string;
}

export interface ChatRetrievalMetadata {
  sourceCount: number;
  missingContext: boolean;
  scores: number[];
  sources: ChatRetrievalSource[];
}

export interface ApiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  answer: string;
  businessId: string;
  message: string;
  retrieval: ChatRetrievalMetadata;
  messages?: ApiChatMessage[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Service ────────────────────────────────────────

/**
 * GET /api/chat/history?businessId=...
 * Returns messages ordered oldest → newest.
 */
export const getChatHistory = async (
  businessId: string
): Promise<ApiChatMessage[]> => {
  const { data } = await apiClient.get<ApiResponse<ApiChatMessage[]>>(
    '/chat/history',
    { params: { businessId } }
  );
  return data.data;
};

/**
 * POST /api/chat
 * Sends a user message and returns the AI answer with persisted messages.
 */
export const sendChatMessage = async (
  businessId: string,
  message: string
): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ApiResponse<ChatResponse>>('/chat', {
    businessId,
    message,
  });
  return data.data;
};
