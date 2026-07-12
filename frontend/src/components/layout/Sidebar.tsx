import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  FileText,
  BarChart3,
  Settings,
  LifeBuoy,
  BookOpen,
  Building2,
  Briefcase,
  X,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { name: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",  group: "main" },
  { name: "Workspace",         icon: Building2,        path: "/workspace",  group: "main" },
  { name: "Business",          icon: Briefcase,        path: "/business",   group: "main" },
  { name: "AI Chat",           icon: MessageSquare,    path: "/chat",       group: "main" },
  { name: "Projects",          icon: FolderKanban,     path: "/projects",   group: "insight" },
  { name: "Executive Reports", icon: FileText,         path: "/reports",    group: "insight" },
  { name: "Analytics",         icon: BarChart3,        path: "/analytics",  group: "insight" },
  { name: "Settings",          icon: Settings,         path: "/settings",   group: "system" },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  const isActive = (item: { path: string }) =>
    location.pathname === item.path ||
    (item.path === "/business" && location.pathname.startsWith("/business/"));

  const groups = [
    { label: "CORE",    keys: ["main"] },
    { label: "INSIGHT", keys: ["insight"] },
    { label: "SYSTEM",  keys: ["system"] },
  ];

  return (
    <aside className="flex h-full w-72 flex-col bg-[#080f1f] border-r border-white/[0.06] overflow-hidden">
      {/* ── Subtle gradient orb ───────────────────────── */}
      <div className="pointer-events-none absolute top-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

      {/* ── Header ───────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Zap className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">
              <span className="text-violet-300">ExecOS</span>
              <span className="text-white"> AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">Enterprise</p>
          </div>
        </Link>

        {/* Close - mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map(({ label, keys }) => {
          const items = menu.filter((m) => keys.includes(m.group));
          return (
            <div key={label}>
              <p className="px-3 mb-1.5 text-[9px] font-bold tracking-[0.18em] text-slate-600 uppercase">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        relative flex items-center gap-3 rounded-xl px-3 py-2.5
                        text-sm font-medium transition-all duration-150 group
                        ${active
                          ? "bg-violet-500/15 text-violet-200"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                        }
                      `}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-400" />
                      )}

                      {/* Icon container */}
                      <span className={`
                        flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors
                        ${active
                          ? "bg-violet-500/25 text-violet-300"
                          : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.07] group-hover:text-slate-300"
                        }
                      `}>
                        <Icon size={15} />
                      </span>

                      <span className="truncate">{item.name}</span>

                      {active && (
                        <ChevronRight size={13} className="ml-auto text-violet-400/60 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Deploy Agent CTA ─────────────────────────── */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <button className="
          w-full flex items-center justify-center gap-2
          rounded-xl py-2.5 text-sm font-semibold
          bg-gradient-to-r from-violet-500 to-violet-700
          text-white shadow-lg shadow-violet-500/20
          hover:shadow-violet-500/40 hover:from-violet-400 hover:to-violet-600
          active:scale-[0.98] transition-all duration-200
        ">
          <Zap size={14} className="fill-current" />
          Deploy Agent
        </button>
      </div>

      {/* ── User Profile ─────────────────────────────── */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 flex items-center justify-center text-xs font-bold text-violet-200 ring-1 ring-white/10">
            {initials}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ""}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sign out"
          >
            <LifeBuoy size={14} className="hidden" />
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-between mt-2 px-1">
          <button className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
            <LifeBuoy size={11} />
            Support
          </button>
          <button className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
            <BookOpen size={11} />
            Docs
          </button>
        </div>
      </div>
    </aside>
  );
}