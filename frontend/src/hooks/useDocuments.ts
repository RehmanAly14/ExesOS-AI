/**
 * useDocuments
 * ──────────────────────────────────────────────────
 * Manages all document state for UploadDocumentsPage.
 * Scoped to a businessId — re-fetches when it changes.
 *
 * Upload flow:
 *   Files are uploaded ONE AT A TIME sequentially so
 *   individual progress is tracked per file. Each upload
 *   response already has the final status because the
 *   backend extracts text synchronously.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getBusinessDocuments,
  uploadDocument,
  deleteDocument,
  validateFile,
  type Document,
  type UploadProgressCallback,
} from '../services/documentService';

// ── Per-file upload state ──────────────────────────

export interface QueuedFile {
  id: string;          // local UUID for React key
  file: File;
  progress: number;    // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  error: string | null;
}

interface UseDocumentsReturn {
  documents: Document[];
  queue: QueuedFile[];                         // files staged for upload
  isLoading: boolean;
  deletingId: string | null;
  isUploading: boolean;                        // any file currently uploading
  error: string | null;

  // Queue management
  addToQueue: (files: File[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;

  // API actions
  uploadAll: () => Promise<void>;
  deleteDoc: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

let queueIdCounter = 0;
const newQueueId = () => `q-${++queueIdCounter}-${Date.now()}`;

export function useDocuments(businessId: string | null): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch document list ────────────────────────────
  const refresh = useCallback(async () => {
    if (!businessId) { setDocuments([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBusinessDocuments(businessId);
      setDocuments(data);
    } catch (err) {
      setError(extract(err, 'Failed to load documents.'));
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Queue management ───────────────────────────────
  const addToQueue = useCallback((files: File[]) => {
    setError(null);
    const items: QueuedFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const err = validateFile(file);
      if (err) { errors.push(err); continue; }
      items.push({ id: newQueueId(), file, progress: 0, status: 'pending', error: null });
    }

    if (errors.length) setError(errors.join('\n'));
    if (items.length) setQueue(prev => [...prev, ...items]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  // ── Upload all queued files sequentially ───────────
  const uploadAll = useCallback(async () => {
    if (!businessId) return;

    const pending = queue.filter(f => f.status === 'pending');
    if (pending.length === 0) return;

    setIsUploading(true);

    for (const item of pending) {
      // Mark as uploading
      setQueue(prev =>
        prev.map(f => f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f)
      );

      const onProgress: UploadProgressCallback = (percent) => {
        setQueue(prev =>
          prev.map(f => f.id === item.id ? { ...f, progress: percent } : f)
        );
      };

      try {
        await uploadDocument(businessId, item.file, onProgress);
        // Mark file as done
        setQueue(prev =>
          prev.map(f => f.id === item.id ? { ...f, status: 'done', progress: 100 } : f)
        );
      } catch (err) {
        const msg = extract(err, 'Upload failed.');
        setQueue(prev =>
          prev.map(f => f.id === item.id ? { ...f, status: 'error', error: msg } : f)
        );
      }
    }

    setIsUploading(false);

    // Refresh the list and remove successfully uploaded files from queue
    await refresh();
    setQueue(prev => prev.filter(f => f.status !== 'done'));
  }, [businessId, queue, refresh]);

  // ── Delete document ────────────────────────────────
  const deleteDoc = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(extract(err, 'Failed to delete document.'));
      await refresh();
    } finally {
      setDeletingId(null);
    }
  }, [refresh]);

  const clearError = useCallback(() => setError(null), []);

  return {
    documents, queue, isLoading, isUploading, deletingId, error,
    addToQueue, removeFromQueue, clearQueue,
    uploadAll, deleteDoc, refresh, clearError,
  };
}

function extract(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
