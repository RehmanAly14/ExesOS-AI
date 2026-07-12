/**
 * useBusinesses
 * ──────────────────────────────────────────────────
 * Manages all business state + CRUD for BusinessPage.
 * Scoped to a workspaceId — re-fetches whenever it changes.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getWorkspaceBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  type Business,
  type CreateBusinessPayload,
  type UpdateBusinessPayload,
} from '../services/businessService';

interface UseBusinessesReturn {
  businesses: Business[];
  isLoading: boolean;
  isSubmitting: boolean;   // create or update in-flight
  deletingId: string | null;
  error: string | null;
  createBiz: (payload: CreateBusinessPayload) => Promise<void>;
  updateBiz: (id: string, payload: UpdateBusinessPayload) => Promise<void>;
  deleteBiz: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useBusinesses(workspaceId: string | null): UseBusinessesReturn {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setBusinesses([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkspaceBusinesses(workspaceId);
      setBusinesses(data);
    } catch (err) {
      setError(extractMessage(err, 'Failed to load businesses.'));
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Create ────────────────────────────────────────
  const createBiz = useCallback(async (payload: CreateBusinessPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createBusiness(payload);
      await refresh();
    } catch (err) {
      const msg = extractMessage(err, 'Failed to create business.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [refresh]);

  // ── Update ────────────────────────────────────────
  const updateBiz = useCallback(async (id: string, payload: UpdateBusinessPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateBusiness(id, payload);
      // Optimistic update — replace the record in state
      setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err) {
      const msg = extractMessage(err, 'Failed to update business.');
      setError(msg);
      await refresh(); // Re-sync on failure
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [refresh]);

  // ── Delete ────────────────────────────────────────
  const deleteBiz = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteBusiness(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(extractMessage(err, 'Failed to delete business.'));
      await refresh();
    } finally {
      setDeletingId(null);
    }
  }, [refresh]);

  const clearError = useCallback(() => setError(null), []);

  return {
    businesses,
    isLoading,
    isSubmitting,
    deletingId,
    error,
    createBiz,
    updateBiz,
    deleteBiz,
    refresh,
    clearError,
  };
}

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
