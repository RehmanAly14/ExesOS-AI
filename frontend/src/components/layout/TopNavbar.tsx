import { Bell, Search, ChevronDown, Users, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your business" },
  "/workspace": { title: "Workspace", subtitle: "Manage your workspaces" },
  "/business": { title: "Business", subtitle: "Manage your businesses" },
  "/chat": { title: "AI Chat", subtitle: "Chat with your AI executive team" },
  "/projects": { title: "Projects", subtitle: "Manage your projects" },
  "/reports": { title: "Executive Reports", subtitle: "AI-synthesized intelligence briefings" },
  "/analytics": { title: "Analytics", subtitle: "Comprehensive performance metrics" },
  "/settings": { title: "Settings", subtitle: "Manage your workspace preferences" },
};

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive initials from the authenticated user's name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/auth', { replace: true });
  };

  const currentPage = pageTitles[location.pathname] || { 
    title: "ExecOS AI", 
    subtitle: "Autonomous Business Operating System" 
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-18 items-center justify-between bg-[#080f1f]/90 backdrop-blur-2xl px-4 sm:px-6 md:px-8 border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.35)]">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Hamburger Menu - Mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#cbc3d7] hover:text-white transition-colors p-1.5 -ml-1.5"
          aria-label="Toggle menu"
        >
          <Menu size={22} className="sm:size-6" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#dae2fd] truncate">
            {currentPage.title}
          </h1>
          <p className="hidden text-xs text-[#cbc3d7] md:block truncate">
            {currentPage.subtitle}
          </p>
        </div>
        
        {/* Workspace Switcher */}
        <button className="hidden lg:flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#cbc3d7] transition hover:bg-white/5 hover:text-[#dae2fd] whitespace-nowrap">
          <Users size={14} />
          <span>Team Workspace</span>
          <ChevronDown size={14} className="opacity-50" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
        
        {/* Search */}
        <div className={`hidden md:flex relative items-center transition-all duration-300 ${
          isSearchFocused ? "w-40 sm:w-56 lg:w-64" : "w-28 sm:w-36 lg:w-40"
        }`}>
          <Search 
            size={15}
            className={`absolute left-3 transition-colors sm:size-4 ${
              isSearchFocused ? "text-violet-300" : "text-[#958ea0]"
            }`} 
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 sm:py-2 pl-8 pr-3 text-sm text-[#dae2fd] placeholder-[#958ea0] outline-none transition-all duration-300 focus:border-violet-400/30 focus:bg-white/10 focus:ring-1 focus:ring-violet-400/30"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <kbd className="absolute right-3 hidden text-xs text-[#958ea0] lg:block">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            className={`relative flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-200 hover:bg-white/10 ${
              showNotifications ? "ring-1 ring-violet-400/30" : ""
            }`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={18} className="sm:size-5 text-[#cbc3d7] transition group-hover:text-[#dae2fd]" />
            <span className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-violet-400 ring-2 ring-[#0b1326] animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 rounded-2xl border border-white/10 bg-[#0f172a] py-2 shadow-xl backdrop-blur-xl z-50">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
                Notifications
              </div>
              <div className="border-t border-white/5 px-4 py-3 text-sm text-[#cbc3d7]">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <button className="hidden sm:flex relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-400 to-violet-600 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 font-semibold text-[#340080] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.25)] active:scale-[0.98] text-xs sm:text-sm">
          <span className="relative flex items-center gap-2 whitespace-nowrap">
            Save Changes
            <span className="hidden text-xs opacity-70 lg:inline">⌘S</span>
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 hover:translate-x-full" />
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 text-xs sm:text-sm font-semibold text-[#dae2fd] ring-1 ring-white/10 transition hover:scale-105"
            aria-label="User menu"
          >
            {initials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0f172a] py-2 shadow-xl backdrop-blur-xl z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-semibold text-[#dae2fd] truncate">{user?.name}</p>
                <p className="text-xs text-[#958ea0] truncate">{user?.email}</p>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}