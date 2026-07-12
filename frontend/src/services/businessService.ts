/**
 * Business Service
 * ──────────────────────────────────────────────────
 * Typed wrappers for all /api/businesses/* endpoints.
 * JWT is auto-attached by the shared Axios instance.
 *
 * Endpoints:
 *   POST   /api/businesses                      → createBusiness()
 *   GET    /api/businesses/:workspaceId/businesses → getWorkspaceBusinesses()
 *   GET    /api/businesses/:id                  → getBusinessById()
 *   PATCH  /api/businesses/:id                  → updateBusiness()
 *   DELETE /api/businesses/:id                  → deleteBusiness()
 */

import apiClient from '../lib/apiClient';

// ── Types ──────────────────────────────────────────

export interface Business {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string;
  businessType: string | null;
  businessStage: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  currency: string | null;
  employees: number | null;
  profile: Record<string, unknown> | null;
  aiPreferences: Record<string, unknown> | null;
  aiContext: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessPayload {
  workspaceId: string;          // Required by backend validator
  name: string;                 // Required
  industry: string;             // Required
  description?: string;
  businessType?: string;
  businessStage?: string;
  website?: string;
  country?: string;
  city?: string;
  timezone?: string;
  currency?: string;
  employees?: number;
}

export type UpdateBusinessPayload = Partial<Omit<CreateBusinessPayload, 'workspaceId'>>;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Service Functions ──────────────────────────────

/**
 * POST /api/businesses
 * Create a new business inside a workspace.
 * Required: workspaceId, name, industry
 */
export const createBusiness = async (
  payload: CreateBusinessPayload
): Promise<Business> => {
  const { data } = await apiClient.post<ApiResponse<Business>>('/businesses', payload);
  return data.data;
};

/**
 * GET /api/businesses/:workspaceId/businesses
 * Fetch all businesses belonging to a workspace.
 */
export const getWorkspaceBusinesses = async (
  workspaceId: string
): Promise<Business[]> => {
  const { data } = await apiClient.get<ApiResponse<Business[]>>(
    `/businesses/${workspaceId}/businesses`
  );
  return data.data;
};

/**
 * GET /api/businesses/:id
 * Fetch a single business by ID.
 */
export const getBusinessById = async (id: string): Promise<Business> => {
  const { data } = await apiClient.get<ApiResponse<Business>>(`/businesses/${id}`);
  return data.data;
};

/**
 * PATCH /api/businesses/:id
 * Update any subset of business fields.
 */
export const updateBusiness = async (
  id: string,
  payload: UpdateBusinessPayload
): Promise<Business> => {
  const { data } = await apiClient.patch<ApiResponse<Business>>(
    `/businesses/${id}`,
    payload
  );
  return data.data;
};

/**
 * DELETE /api/businesses/:id
 * Permanently delete a business.
 */
export const deleteBusiness = async (id: string): Promise<void> => {
  await apiClient.delete(`/businesses/${id}`);
};
