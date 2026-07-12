/**
 * Auth Context
 * ──────────────────────────────────────────────────
 * Provides global auth state (user, token, loading) and
 * actions (login, register, logout) to the entire app.
 *
 * On mount it restores state from localStorage and
 * re-validates with the /me endpoint to guard against
 * stale / tampered tokens.
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  tokenStorage,
  userStorage,
  type User,
  type LoginCredentials,
  type RegisterCredentials,
} from '../services/authService';

// ── State Shape ────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;       // true while restoring session or during auth actions
  isInitialized: boolean;   // true once the initial session check is done
  error: string | null;
}

// ── Actions ────────────────────────────────────────

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'INIT_FAILURE' }
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// ── Reducer ────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, isLoading: true, isInitialized: false };

    case 'INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case 'INIT_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isInitialized: true,
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Restore session on mount ──────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'INIT_START' });

      const storedToken = tokenStorage.get();

      if (!storedToken) {
        dispatch({ type: 'INIT_FAILURE' });
        return;
      }

      try {
        // Re-validate stored token with the server
        const user = await getCurrentUser();
        dispatch({ type: 'INIT_SUCCESS', payload: { user, token: storedToken } });
      } catch {
        // Token is expired or invalid — clear everything
        tokenStorage.remove();
        userStorage.remove();
        dispatch({ type: 'INIT_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  // ── Login action ──────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await apiLogin(credentials);

      // Persist to localStorage
      tokenStorage.set(token);
      userStorage.set(user);

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Invalid email or password.');
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw new Error(message); // Re-throw so the form can react
    }
  }, []);

  // ── Register action ───────────────────────────────
  const register = useCallback(async (credentials: RegisterCredentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await apiRegister(credentials);

      tokenStorage.set(token);
      userStorage.set(user);

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Registration failed. Please try again.');
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw new Error(message);
    }
  }, []);

  // ── Logout action ─────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiLogout(); // Clear server-side cookie
    } catch {
      // Even if the server call fails, we clear the client
    } finally {
      tokenStorage.remove();
      userStorage.remove();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // ── Clear error ───────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ── Helper ────────────────────────────────────────
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
