/**
 * ProtectedRoute
 * ──────────────────────────────────────────────────
 * Wraps any route that requires authentication.
 *
 * Behaviour:
 *  - While session is being restored  → shows a full-screen spinner
 *  - Authenticated                    → renders the child route
 *  - Unauthenticated                  → redirects to /auth
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Wait until the auth state has been restored from localStorage + /me check
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b1326]">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Logo Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-300/50 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
            <div className="absolute inset-[22px] rounded-full bg-violet-400/80 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-violet-300/70 tracking-widest uppercase animate-pulse">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
