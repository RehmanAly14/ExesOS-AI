import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Briefcase,
  Server,
  LogOut,
  Palette,
  Bell,
  Bot,
  Users,
  CreditCard,
  Key,
  Plug,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { getWorkspaceBusinesses, type Business } from '../services/businessService';
import { getWorkspaces } from '../services/workspaceService';
import Badge from '../components/ui/Badge';
import StatCard from '../components/dashboard/StatCard';
import EmptyState from '../components/dashboard/EmptyState';
import { RefreshButton } from '../components/dashboard/DashboardHelpers';

// ── Helpers ────────────────────────────────────────

function displayValue(value: string | null | undefined, fallback = 'Not Available'): string {
  return value?.trim() ? value : fallback;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not Available';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function userInitials(name: string | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Sub-components ─────────────────────────────────

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8">
      <div className="flex items-start gap-3 mb-5 sm:mb-6">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-300 shrink-0">{icon}</div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#dae2fd]">{title}</h2>
          {description && <p className="text-xs sm:text-sm text-[#cbc3d7] mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const unavailable = value === 'Not Available';
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-white/5 last:border-0">
      <span className="text-xs sm:text-sm text-[#cbc3d7]">{label}</span>
      <span
        className={`text-sm font-medium truncate max-w-full sm:max-w-[60%] sm:text-right ${
          unavailable ? 'text-[#958ea0] italic' : 'text-[#dae2fd]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: 'connected' | 'active' | 'operational' | 'checking' | 'error' }) {
  const config = {
    connected: { dot: 'bg-emerald-400', text: 'Connected', variant: 'success' as const },
    active: { dot: 'bg-emerald-400', text: 'Active', variant: 'success' as const },
    operational: { dot: 'bg-emerald-400', text: 'Operational', variant: 'success' as const },
    checking: { dot: 'bg-amber-400 animate-pulse', text: 'Checking…', variant: 'warning' as const },
    error: { dot: 'bg-rose-400', text: 'Unavailable', variant: 'error' as const },
  }[status];

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-[#cbc3d7]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <Badge variant={config.variant} size="sm">
          {config.text}
        </Badge>
      </div>
    </div>
  );
}

const upcomingFeatures = [
  { label: 'Theme Preferences', icon: Palette, description: 'Light, dark, and custom themes' },
  { label: 'Notification Settings', icon: Bell, description: 'Email and in-app alerts' },
  { label: 'Agent Preferences', icon: Bot, description: 'Configure AI agent behavior' },
  { label: 'Team Management', icon: Users, description: 'Invite and manage team members' },
  { label: 'Billing & Subscription', icon: CreditCard, description: 'Plans and payment methods' },
  { label: 'API Keys', icon: Key, description: 'Manage programmatic access' },
  { label: 'Integrations', icon: Plug, description: 'Connect third-party tools' },
];

// ── Main Page ──────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitialized, logout } = useAuth();
  const { workspaces, isLoading: workspacesLoading, refresh: refreshWorkspaces } = useWorkspaces();

  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const loadBusinesses = useCallback(async () => {
    if (workspaces.length === 0) {
      setAllBusinesses([]);
      return;
    }
    setBusinessesLoading(true);
    try {
      const results = await Promise.allSettled(
        workspaces.map((ws) => getWorkspaceBusinesses(ws.id))
      );
      const businesses = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
      setAllBusinesses(businesses);
    } finally {
      setBusinessesLoading(false);
    }
  }, [workspaces]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    let cancelled = false;
    setApiStatus('checking');
    getWorkspaces()
      .then(() => {
        if (!cancelled) setApiStatus('connected');
      })
      .catch(() => {
        if (!cancelled) setApiStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = () => {
    refreshWorkspaces();
    loadBusinesses();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currentWorkspace = workspaces.length > 0
    ? [...workspaces].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null;

  const activeBusiness = allBusinesses.length > 0
    ? [...allBusinesses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null;

  const accountLoading = !isInitialized;
  const overviewLoading = workspacesLoading || businessesLoading;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              Settings
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#dae2fd] tracking-tight">
            Account & Workspace
          </h1>
          <p className="text-[#cbc3d7] mt-2 text-sm">
            Manage your account, workspace overview, and platform preferences.
          </p>
        </div>
        <RefreshButton onClick={handleRefresh} isRefreshing={overviewLoading} />
      </div>

      <div className="space-y-6">
        {/* ── Section 1: Account ─────────────────── */}
        <SectionCard
          title="Account"
          description="Your authenticated profile information"
          icon={<User size={18} />}
        >
          {accountLoading ? (
            <div className="flex items-center gap-3 py-6 text-[#cbc3d7]">
              <Loader2 className="w-5 h-5 animate-spin text-violet-300" />
              <span className="text-sm">Loading account…</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center border border-violet-400/30 shrink-0">
                  <span className="text-lg font-bold text-[#dae2fd]">{userInitials(user?.name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#dae2fd] truncate">
                    {displayValue(user?.name)}
                  </p>
                  <p className="text-sm text-[#cbc3d7] truncate">{displayValue(user?.email)}</p>
                  {isAuthenticated && (
                    <Badge variant="success" size="sm" className="mt-1.5">
                      Authenticated
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-[#131b2e]/50 px-4">
                <InfoRow label="Full Name" value={displayValue(user?.name)} />
                <InfoRow label="Email Address" value={displayValue(user?.email)} />
                <InfoRow label="User ID" value={displayValue(user?.id)} />
                <InfoRow label="Account Created" value={formatDate(user?.createdAt)} />
              </div>
            </>
          )}
        </SectionCard>

        {/* ── Sections 2 & 3: Workspace + Business ─ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <SectionCard
            title="Workspace Overview"
            description="Your workspace configuration"
            icon={<Building2 size={18} />}
          >
            {overviewLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-24 bg-[#2d3449] rounded" />
                <div className="h-8 w-16 bg-[#2d3449] rounded" />
                <div className="h-12 bg-[#2d3449]/60 rounded-xl" />
              </div>
            ) : workspaces.length === 0 ? (
              <EmptyState
                icon={<Building2 className="w-5 h-5" />}
                title="No workspaces yet"
                description="Create a workspace to organize your businesses and documents."
              />
            ) : (
              <>
                <StatCard
                  label="Total Workspaces"
                  value={workspaces.length}
                  accent="violet"
                  className="mb-4 !p-4"
                />
                <div className="rounded-xl bg-[#131b2e]/50 px-4">
                  <InfoRow
                    label="Current Workspace"
                    value={displayValue(currentWorkspace?.name)}
                  />
                  <InfoRow
                    label="Description"
                    value={displayValue(currentWorkspace?.description ?? undefined)}
                  />
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard
            title="Business Overview"
            description="Businesses across your workspaces"
            icon={<Briefcase size={18} />}
          >
            {overviewLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-24 bg-[#2d3449] rounded" />
                <div className="h-8 w-16 bg-[#2d3449] rounded" />
                <div className="h-12 bg-[#2d3449]/60 rounded-xl" />
              </div>
            ) : allBusinesses.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="w-5 h-5" />}
                title="No businesses yet"
                description="Add a business inside a workspace to start uploading documents."
              />
            ) : (
              <>
                <StatCard
                  label="Total Businesses"
                  value={allBusinesses.length}
                  accent="cyan"
                  className="mb-4 !p-4"
                />
                <div className="rounded-xl bg-[#131b2e]/50 px-4">
                  <InfoRow
                    label="Active Business"
                    value={displayValue(activeBusiness?.name)}
                  />
                  <InfoRow
                    label="Industry"
                    value={displayValue(activeBusiness?.industry)}
                  />
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* ── Section 4: System Status ───────────── */}
        <SectionCard
          title="System Status"
          description="Platform health and connectivity"
          icon={<Server size={18} />}
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-300">System Healthy</span>
          </div>
          <div className="rounded-xl bg-[#131b2e]/50 px-4">
            <StatusRow
              label="Backend API"
              status={apiStatus === 'checking' ? 'checking' : apiStatus === 'connected' ? 'connected' : 'error'}
            />
            <StatusRow
              label="Authentication"
              status={isAuthenticated ? 'active' : accountLoading ? 'checking' : 'error'}
            />
            <StatusRow
              label="Database"
              status={apiStatus === 'connected' ? 'operational' : apiStatus === 'checking' ? 'checking' : 'error'}
            />
          </div>
        </SectionCard>

        {/* ── Section 5: Upcoming Features ───────── */}
        <SectionCard
          title="Upcoming Features"
          description="Planned settings and customization options"
          icon={<Sparkles size={18} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-60 cursor-not-allowed select-none"
                aria-disabled="true"
              >
                <div className="p-2 rounded-lg bg-[#2d3449] text-[#958ea0] shrink-0">
                  <feature.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#cbc3d7]">{feature.label}</p>
                    <Badge variant="default" size="sm">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-xs text-[#958ea0] mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 6: Logout ──────────────────── */}
        <section className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-300 shrink-0">
                <LogOut size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#dae2fd]">Sign Out</h2>
                <p className="text-xs sm:text-sm text-[#cbc3d7] mt-0.5">
                  End your current session and return to the login page.
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-semibold hover:bg-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing out…
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  Log Out
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
