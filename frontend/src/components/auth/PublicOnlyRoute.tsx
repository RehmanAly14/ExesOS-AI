/**
 * PublicOnlyRoute
 * ──────────────────────────────────────────────────
 * Prevents already-authenticated users from accessing
 * public-only pages (e.g., /auth).
 *
 * Behaviour:
 *  - While session is being restored → shows spinner
 *  - Authenticated                   → redirects to /dashboard
 *  - Unauthenticated                 → renders the child route
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized } = useAuth()

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b1326]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
          <div className="absolute inset-[22px] rounded-full bg-violet-400/80 animate-pulse" />
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
