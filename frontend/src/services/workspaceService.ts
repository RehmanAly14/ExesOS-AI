/**
 * Workspace Service
 * ──────────────────────────────────────────────────
 * Wraps all /api/workspaces/* endpoints.
 * Uses the shared Axios instance so the JWT token is
 * automatically attached on every request.
 *
 * Available backend endpoints:
 *   GET    /api/workspaces          → getWorkspaces()
 *   POST   /api/workspaces          → createWorkspace()
 *   GET    /api/workspaces/:id      → getWorkspaceById()
 *   DELETE /api/workspaces/:id      → deleteWorkspace()
 */

import apiClient from '../lib/apiClient';

// ── Types ──────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    businesses: number;
  };
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

// ── API Response wrapper ───────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Service functions ──────────────────────────────

/**
 * GET /api/workspaces
 * Returns all workspaces owned by the authenticated user.
 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
  const { data } = await apiClient.get<ApiResponse<Workspace[]>>('/workspaces');
  return data.data;
};

/**
 * GET /api/workspaces/:id
 * Returns a single workspace by ID.
 */
export const getWorkspaceById = async (id: string): Promise<Workspace> => {
  const { data } = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
  return data.data;
};

/**
 * POST /api/workspaces
 * Creates a new workspace for the authenticated user.
 * Requires: name (3-100 chars), optional: description (max 500 chars)
 */
export const createWorkspace = async (payload: CreateWorkspacePayload): Promise<Workspace> => {
  const { data } = await apiClient.post<ApiResponse<Workspace>>('/workspaces', payload);
  return data.data;
};

/**
 * DELETE /api/workspaces/:id
 * Permanently deletes a workspace.
 */
export const deleteWorkspace = async (id: string): Promise<void> => {
  await apiClient.delete(`/workspaces/${id}`);
};
