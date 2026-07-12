import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  FileText,
  MessageSquare,
  Bot,
  Eye,
  CalendarDays,
  BarChart2,
  TrendingUp,
  FileUp,
  Sparkles,
} from 'lucide-react';
import { usePlatformStats } from '../hooks/usePlatformStats';
import { formatTimeAgo, formatDateRange } from '../utils/formatTimeAgo';
import { formatFileSize } from '../services/documentService';
import StatCard from '../components/dashboard/StatCard';
import EmptyState from '../components/dashboard/EmptyState';
import SkeletonCard, { ErrorBanner, RefreshButton } from '../components/dashboard/DashboardHelpers';
import Badge from '../components/ui/Badge';
import type { ActivityItem } from '../hooks/usePlatformStats';

const activityIcons: Record<ActivityItem['type'], typeof Bot> = {
  document: FileUp,
  chat: MessageSquare,
  report: BarChart2,
  business: Briefcase,
};

const activityColors: Record<ActivityItem['type'], string> = {
  document: 'text-cyan-400',
  chat: 'text-violet-300',
  report: 'text-emerald-300',
  business: 'text-amber-300',
};

function statusBadgeVariant(status?: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  if (!status) return 'default';
  if (status === 'extracted' || status === 'embedded') return 'success';
  if (status === 'processing' || status === 'pending' || status === 'uploaded') return 'warning';
  if (status === 'failed') return 'error';
  return 'info';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, isLoading, isRefreshing, error, refresh } = usePlatformStats();

  const healthDisplay =
    stats.avgBusinessHealth !== null ? `${stats.avgBusinessHealth}/100` : '--';

  return (
    <div className="p-4 sm:p-6 max-w-[1440px] mx-auto w-full pb-20 md:pb-6">
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[80px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] opacity-50" />
      </div>

      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#dae2fd] mb-1">
            Business Overview
          </h2>
          <p className="text-[#cbc3d7] text-sm sm:text-base">
            Live metrics from your workspaces, documents, and AI activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] px-4 py-2 rounded-xl">
            <CalendarDays className="w-5 h-5 text-violet-300" />
            <span className="text-sm font-mono text-[#dae2fd]">{formatDateRange()}</span>
          </div>
          <RefreshButton onClick={refresh} isRefreshing={isRefreshing} />
        </div>
      </section>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          label="Total Workspaces"
          value={isLoading ? '—' : stats.workspaceCount}
          sublabel="Active workspaces"
          icon={<Building2 className="w-5 h-5" />}
          accent="violet"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Businesses"
          value={isLoading ? '—' : stats.businessCount}
          sublabel="Across all workspaces"
          icon={<Briefcase className="w-5 h-5" />}
          accent="cyan"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Documents"
          value={isLoading ? '—' : stats.documentCount}
          sublabel={
            isLoading
              ? undefined
              : `${stats.documentsEmbedded} embedded · ${stats.documentsPending} pending`
          }
          icon={<FileText className="w-5 h-5" />}
          accent="emerald"
          isLoading={isLoading}
        />
        <StatCard
          label="Executive Reports"
          value={isLoading ? '—' : stats.reportCount}
          sublabel={
            stats.avgBusinessHealth !== null
              ? `Avg health score ${stats.avgBusinessHealth}/100`
              : 'No health scores yet'
          }
          icon={<TrendingUp className="w-5 h-5" />}
          accent="amber"
          isLoading={isLoading}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-5 sm:p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-[#dae2fd]">
              <Bot className="w-5 h-5 text-violet-300" />
              Latest Activity
            </h3>
            <span className="text-xs sm:text-sm text-[#958ea0]">
              Showing latest 5
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#2d3449]/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.recentActivity.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-5 h-5" />}
              title="No activity yet"
              description="Upload documents, start a chat, or generate a report to see activity here."
            />
          ) : (
            <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-[#494454]/30">
              {stats.recentActivity.map((item) => {
                const Icon = activityIcons[item.type];
                return (
                  <div
                    key={item.id}
                    className="relative pl-12 flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="absolute left-3 top-1 w-6 h-6 rounded-full bg-[#131b2e] border-2 border-violet-300/50 flex items-center justify-center z-10">
                      <Icon className={`w-3 h-3 ${activityColors[item.type]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-[#dae2fd] truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#cbc3d7] line-clamp-2">
                        {item.description}
                      </p>
                      {item.businessName && (
                        <p className="text-[10px] text-[#958ea0] mt-0.5">{item.businessName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status && (
                        <Badge variant={statusBadgeVariant(item.status)} size="sm">
                          {item.status.toUpperCase()}
                        </Badge>
                      )}
                      <span className="text-xs text-[#958ea0]">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isLoading ? (
          <SkeletonCard lines={3} />
        ) : (
          <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-5 sm:p-6 rounded-2xl flex flex-col">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#dae2fd] mb-6">
              Recent Reports
            </h3>
            <div className="space-y-3 flex-1">
              {stats.recentReports.length === 0 ? (
                <EmptyState
                  icon={<BarChart2 className="w-5 h-5" />}
                  title="No reports yet"
                  description="Generate an executive report from the chat page."
                />
              ) : (
                stats.recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-[rgba(23,31,51,0.72)] border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-violet-400/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#2d3449] flex items-center justify-center shrink-0">
                        <BarChart2 className="w-5 h-5 text-[#dae2fd]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#dae2fd] truncate">{report.title}</p>
                        <p className="text-xs text-[#958ea0] truncate">
                          {report.businessName} · {formatTimeAgo(report.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/report/${report.id}`)}
                      className="p-2 hover:bg-violet-500/10 rounded-full text-violet-300 transition-all shrink-0"
                      aria-label="View report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <Link
              to="/reports"
              className="mt-6 w-full text-center text-xs font-semibold uppercase tracking-wider text-violet-300 hover:underline transition-all block"
            >
              View All Reports
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {isLoading ? (
          <SkeletonCard lines={3} />
        ) : (
          <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-5 sm:p-6 rounded-2xl">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#dae2fd] mb-6">
              Recent Businesses
            </h3>
            <div className="space-y-3">
              {stats.recentBusinesses.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="w-5 h-5" />}
                  title="No businesses yet"
                  description="Create a business inside a workspace to get started."
                />
              ) : (
                stats.recentBusinesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-[rgba(23,31,51,0.72)] border border-white/10 p-4 rounded-xl hover:border-violet-400/20 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#dae2fd] truncate">{biz.name}</h4>
                      <Badge variant="primary" size="sm">
                        {biz.industry}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#958ea0]">
                      {biz.workspaceName} · {formatTimeAgo(biz.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Link
              to="/business"
              className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-violet-300 hover:underline"
            >
              Manage Businesses
            </Link>
          </div>
        )}

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-300" />
            <h3 className="text-xl sm:text-2xl font-semibold text-[#dae2fd]">Recent Documents</h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-28 bg-[#2d3449]/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : stats.recentDocuments.length === 0 ? (
            <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
              <EmptyState
                icon={<FileUp className="w-5 h-5" />}
                title="No documents uploaded"
                description="Upload PDF, DOCX, or TXT files to power your AI knowledge base."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.recentDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/business/${doc.businessId}/documents`)}
                  className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 rounded-2xl text-left hover:border-violet-400/20 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-300 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[#dae2fd] truncate">{doc.filename}</h4>
                      <p className="text-xs text-[#cbc3d7] mt-1">
                        {doc.businessName} · {formatFileSize(doc.fileSize)}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant={statusBadgeVariant(doc.status)} size="sm">
                          {doc.status}
                        </Badge>
                        <Badge variant={statusBadgeVariant(doc.embeddingStatus)} size="sm">
                          {doc.embeddingStatus}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[#958ea0] mt-2">
                        {formatTimeAgo(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 p-5 rounded-2xl border-l-4 border-l-cyan-400/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-1">
              Platform Health Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#dae2fd]">{healthDisplay}</span>
              {stats.avgBusinessHealth === null && (
                <span className="text-xs text-[#958ea0]">Coming Soon — generate reports first</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
