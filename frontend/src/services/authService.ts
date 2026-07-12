/**
 * Auth Service
 * ──────────────────────────────────────────────────
 * Thin API layer wrapping all /api/auth/* endpoints.
 * Returns strongly-typed response data. Throws on error.
 */

import apiClient from '../lib/apiClient';

// ── Types ──────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// ── Token / User Storage Helpers ───────────────────
const TOKEN_KEY = 'exesos_token';
const USER_KEY = 'exesos_user';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
};

export const userStorage = {
  get: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  set: (user: User): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: (): void => localStorage.removeItem(USER_KEY),
};

// ── Auth API Functions ─────────────────────────────

/**
 * POST /api/auth/login
 * Authenticates a user and returns JWT + user object.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse['data']> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data.data;
};

/**
 * POST /api/auth/register
 * Registers a new user and returns JWT + user object.
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse['data']> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
  return data.data;
};

/**
 * POST /api/auth/logout
 * Clears the HttpOnly cookie on the server side.
 * The client should also remove the token from localStorage.
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * GET /api/auth/me
 * Fetches the currently authenticated user.
 * Requires a valid JWT (handled by the request interceptor).
 */
export const getCurrentUser = async (): Promise<User> => {
  const { data } = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
  return data.data.user;
};
