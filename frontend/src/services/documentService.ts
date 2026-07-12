/**
 * Document Service
 * ──────────────────────────────────────────────────
 * Typed wrappers for all /api/documents/* endpoints.
 * JWT is auto-attached by the shared Axios instance.
 *
 * IMPORTANT — Upload mechanics:
 *   • Must use multipart/form-data (FormData)
 *   • Multer field name is "file"   (single file)
 *   • businessId sent as a FormData field (not JSON)
 *   • Allowed types: .pdf .docx .txt  (max 20 MB each)
 *   • Text extraction is synchronous — response already
 *     contains the final status ("extracted" or "failed")
 *
 * Endpoints:
 *   POST   /api/documents                       → uploadDocument()
 *   GET    /api/documents/business/:businessId  → getBusinessDocuments()
 *   GET    /api/documents/:id                   → getDocumentById()
 *   DELETE /api/documents/:id                   → deleteDocument()
 */

import apiClient from '../lib/apiClient';

// ── Types ──────────────────────────────────────────

export type DocumentStatus = 'processing' | 'extracted' | 'failed' | 'uploaded';
export type EmbeddingStatus = 'pending' | 'embedded' | 'failed';

export interface Document {
  id: string;
  businessId: string;
  filename: string;
  fileType: string;           // "pdf" | "docx" | "txt"
  fileSize: number;           // bytes
  storagePath: string;
  extractedText: string | null;
  status: DocumentStatus;
  embeddingStatus: EmbeddingStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Upload progress callback type ─────────────────

export type UploadProgressCallback = (percent: number) => void;

// ── Service Functions ──────────────────────────────

/**
 * POST /api/documents
 *
 * Sends multipart/form-data with:
 *   - file:       the File object (field name must be "file")
 *   - businessId: string in the FormData body
 *
 * The backend extracts text synchronously during this request.
 * When the Promise resolves the status is already final.
 *
 * @param businessId  ID of the business this document belongs to
 * @param file        The File object selected by the user
 * @param onProgress  Optional callback(0-100) for upload progress
 */
export const uploadDocument = async (
  businessId: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<Document> => {
  const formData = new FormData();
  formData.append('businessId', businessId);  // body field expected by validator
  formData.append('file', file);              // multer field name is "file"

  const { data } = await apiClient.post<ApiResponse<Document>>(
    '/documents',
    formData,
    {
      headers: {
        // Let the browser set Content-Type with the correct boundary
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );

  return data.data;
};

/**
 * GET /api/documents/business/:businessId
 *
 * Fetches all documents for a business.
 * Optionally filter by status via query param.
 */
export const getBusinessDocuments = async (
  businessId: string,
  status?: DocumentStatus
): Promise<Document[]> => {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<ApiResponse<Document[]>>(
    `/documents/business/${businessId}`,
    { params }
  );
  return data.data;
};

/**
 * GET /api/documents/:id
 * Fetches a single document by ID.
 */
export const getDocumentById = async (id: string): Promise<Document> => {
  const { data } = await apiClient.get<ApiResponse<Document>>(`/documents/${id}`);
  return data.data;
};

/**
 * DELETE /api/documents/:id
 * Deletes a document record AND the file on disk (handled by backend).
 */
export const deleteDocument = async (id: string): Promise<void> => {
  await apiClient.delete(`/documents/${id}`);
};

// ── Helpers ────────────────────────────────────────

/**
 * Formats a file size in bytes to a human-readable string.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Returns the allowed MIME types and extensions for the file input.
 * Matches the backend whitelist exactly.
 */
export const ALLOWED_FILE_TYPES = {
  extensions: ['.pdf', '.docx', '.txt'],
  accept: '.pdf,.docx,.txt',
  maxSizeBytes: 20 * 1024 * 1024,   // 20 MB
  maxSizeLabel: '20 MB',
};

/**
 * Validates a file before upload, returning an error string or null.
 */
export const validateFile = (file: File): string | null => {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_FILE_TYPES.extensions.includes(ext)) {
    return `"${file.name}" is not supported. Only PDF, DOCX, and TXT files are allowed.`;
  }
  if (file.size > ALLOWED_FILE_TYPES.maxSizeBytes) {
    return `"${file.name}" exceeds the 20 MB limit (${formatFileSize(file.size)}).`;
  }
  return null;
};
