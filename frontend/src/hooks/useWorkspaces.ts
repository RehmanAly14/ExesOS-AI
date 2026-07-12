/**
 * useWorkspaces
 * ──────────────────────────────────────────────────
 * Custom hook that manages all workspace state and
 * CRUD operations for the WorkspacePage.
 *
 * Returns:
 *   workspaces   - array of the user's workspaces
 *   isLoading    - true while fetching
 *   error        - error message string or null
 *   createWs     - creates a workspace then refreshes list
 *   deleteWs     - deletes a workspace then refreshes list
 *   refresh      - manually re-fetches the list
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
  type Workspace,
  type CreateWorkspacePayload,
} from '../services/workspaceService';
import { getWorkspaceBusinesses } from '../services/businessService';

interface UseWorkspacesReturn {
  workspaces: Workspace[];
  isLoading: boolean;
  isCreating: boolean;
  deletingId: string | null;
  error: string | null;
  createWs: (payload: CreateWorkspacePayload) => Promise<void>;
  deleteWs: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useWorkspaces(): UseWorkspacesReturn {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch workspaces + business counts in parallel ─
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkspaces();

      // Fire one business-list request per workspace concurrently.
      // Promise.allSettled ensures a single failure never blocks the rest.
      const countResults = await Promise.allSettled(
        data.map(ws => getWorkspaceBusinesses(ws.id))
      );

      const enriched = data.map((ws, i) => {
        const result = countResults[i];
        const count = result.status === 'fulfilled' ? result.value.length : 0;
        return {
          ...ws,
          _count: { businesses: count },
        };
      });

      setWorkspaces(enriched);
    } catch (err: unknown) {
      setError(extractMessage(err, 'Failed to load workspaces.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Create workspace ──────────────────────────────
  const createWs = useCallback(async (payload: CreateWorkspacePayload) => {
    setIsCreating(true);
    setError(null);
    try {
      await createWorkspace(payload);
      await refresh(); // Auto-refresh after create
    } catch (err: unknown) {
      const msg = extractMessage(err, 'Failed to create workspace.');
      setError(msg);
      throw new Error(msg); // Re-throw so form can catch it
    } finally {
      setIsCreating(false);
    }
  }, [refresh]);

  // ── Delete workspace ──────────────────────────────
  const deleteWs = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteWorkspace(id);
      // Optimistically remove from state, then confirm with refresh
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch (err: unknown) {
      setError(extractMessage(err, 'Failed to delete workspace.'));
      await refresh(); // Re-sync state on error
    } finally {
      setDeletingId(null);
    }
  }, [refresh]);

  const clearError = useCallback(() => setError(null), []);

  return {
    workspaces,
    isLoading,
    isCreating,
    deletingId,
    error,
    createWs,
    deleteWs,
    refresh,
    clearError,
  };
}

// ── Helper ─────────────────────────────────────────
function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
