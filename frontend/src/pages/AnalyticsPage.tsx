import {
  Building2,
  Briefcase,
  FileText,
  MessageSquare,
  BarChart3,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { usePlatformStats } from '../hooks/usePlatformStats';
import StatCard from '../components/dashboard/StatCard';
import EmptyState from '../components/dashboard/EmptyState';
import SkeletonCard, { ErrorBanner, RefreshButton } from '../components/dashboard/DashboardHelpers';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-2 sm:p-3 rounded-lg">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-1">
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-xs sm:text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { stats, isLoading, isRefreshing, error, refresh } = usePlatformStats();

  const hasUploadData = stats.uploadsOverTime.some((d) => d.uploaded > 0 || d.embedded > 0);
  const hasChatData = stats.chatActivityByDay.some((d) => d.messages > 0);
  const maxFileType = Math.max(...stats.fileTypeChart.map((c) => c.value), 1);

  const kpis = [
    {
      label: 'Workspaces',
      value: isLoading ? '—' : stats.workspaceCount.toString(),
      icon: Building2,
      color: 'text-[#4cd7f6]',
      available: true,
    },
    {
      label: 'Businesses',
      value: isLoading ? '—' : stats.businessCount.toString(),
      icon: Briefcase,
      color: 'text-[#0566d9]',
      available: true,
    },
    {
      label: 'Documents Uploaded',
      value: isLoading ? '—' : stats.documentCount.toString(),
      icon: FileText,
      color: 'text-[#d0bcff]',
      available: true,
    },
    {
      label: 'Chat Queries',
      value: isLoading ? '—' : stats.chatMessageCount.toString(),
      icon: MessageSquare,
      color: 'text-[#d0bcff]',
      available: true,
    },
  ];

  const pipelineKpis = [
    { label: 'Processed', value: stats.documentsProcessed, color: '#4cd7f6' },
    { label: 'Embedded', value: stats.documentsEmbedded, color: '#34d399' },
    { label: 'Pending Embed', value: stats.documentsPending, color: '#fbbf24' },
    { label: 'Failed', value: stats.documentsFailed, color: '#f87171' },
  ];

  return (
    <div className="p-3 sm:p-6 max-w-[1440px] mx-auto w-full pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#dae2fd] mb-1">
            Detailed Analytics
          </h1>
          <p className="text-sm sm:text-base text-[#cbc3d7]">
            Real-time metrics from your documents, embeddings, and chat activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#958ea0] px-3 py-1.5 rounded-lg bg-[#131b2e] border border-white/10">
            Live Data
          </span>
          <RefreshButton onClick={refresh} isRefreshing={isRefreshing} />
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={<kpi.icon className="w-5 h-5" />}
            isLoading={isLoading}
          />
        ))}
      </div>

      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {pipelineKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-xl"
            >
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-1">
                {kpi.label}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-[#dae2fd]">{kpi.value}</p>
              <div className="w-full bg-[#2d3449] h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: stats.documentCount
                      ? `${Math.min(100, (kpi.value / stats.documentCount) * 100)}%`
                      : '0%',
                    background: kpi.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {isLoading ? (
          <>
            <SkeletonCard className="lg:col-span-2" lines={1} />
            <SkeletonCard lines={4} />
          </>
        ) : (
          <>
            <div className="lg:col-span-2 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 sm:p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-semibold text-[#dae2fd]">
                  Document Uploads Over Time
                </h3>
                <span className="text-xs sm:text-sm text-[#958ea0]">Last 6 months</span>
              </div>
              {!hasUploadData ? (
                <EmptyState
                  icon={<TrendingUp className="w-5 h-5" />}
                  title="No upload history yet"
                  description="Document upload trends will appear here once you upload files."
                />
              ) : (
                <div className="w-full h-[200px] sm:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.uploadsOverTime}>
                      <defs>
                        <linearGradient id="colorUploaded" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d0bcff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d0bcff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorEmbedded" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(73,68,84,0.3)" />
                      <XAxis dataKey="month" stroke="#958ea0" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#958ea0" tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Area
                        type="monotone"
                        dataKey="uploaded"
                        stroke="#d0bcff"
                        strokeWidth={2}
                        fill="url(#colorUploaded)"
                        name="Uploaded"
                      />
                      <Area
                        type="monotone"
                        dataKey="embedded"
                        stroke="#4cd7f6"
                        strokeWidth={2}
                        fill="url(#colorEmbedded)"
                        name="Embedded"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 sm:p-6 rounded-2xl">
              <h3 className="text-lg sm:text-2xl font-semibold text-[#dae2fd] mb-4 sm:mb-6">
                File Types
              </h3>
              {stats.fileTypeChart.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-5 h-5" />}
                  title="No documents"
                  description="Upload files to see type distribution."
                />
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {stats.fileTypeChart.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-[#cbc3d7]">{item.label}</span>
                        <span className="font-bold text-[#dae2fd]">{item.value}</span>
                      </div>
                      <div className="w-full bg-[#2d3449] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(item.value / maxFileType) * 100}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {isLoading ? (
          <>
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
          </>
        ) : (
          <>
            <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 sm:p-6 rounded-2xl">
              <h3 className="text-lg sm:text-2xl font-semibold text-[#dae2fd] mb-4 sm:mb-6">
                Document Status
              </h3>
              {stats.documentStatusChart.length === 0 ? (
                <EmptyState title="No status data" description="Upload documents to see processing status." />
              ) : (
                <div className="space-y-3">
                  {stats.documentStatusChart.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-[#cbc3d7]">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 bg-[#2d3449] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: stats.documentCount
                                ? `${(item.value / stats.documentCount) * 100}%`
                                : '0%',
                              background: item.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#dae2fd] w-6 text-right">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 sm:p-6 rounded-2xl">
              <h3 className="text-lg sm:text-2xl font-semibold text-[#dae2fd] mb-4 sm:mb-6">
                Embedding Status
              </h3>
              {stats.embeddingStatusChart.length === 0 ? (
                <EmptyState title="No embedding data" description="Documents will show embedding progress here." />
              ) : (
                <div className="space-y-3">
                  {stats.embeddingStatusChart.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-[#cbc3d7]">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 bg-[#2d3449] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: stats.documentCount
                                ? `${(item.value / stats.documentCount) * 100}%`
                                : '0%',
                              background: item.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#dae2fd] w-6 text-right">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <SkeletonCard lines={1} />
      ) : (
        <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 sm:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-2xl font-semibold text-[#dae2fd] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#d0bcff]" />
              Chat Activity by Day
            </h3>
            <span className="text-xs sm:text-sm text-[#958ea0]">All time · by weekday</span>
          </div>
          {!hasChatData ? (
            <EmptyState
              icon={<Activity className="w-5 h-5" />}
              title="No chat activity yet"
              description="Start a conversation with your AI agents to see activity patterns."
            />
          ) : (
            <div className="w-full h-[180px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chatActivityByDay} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(73,68,84,0.3)" />
                  <XAxis dataKey="day" stroke="#958ea0" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#958ea0" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="messages" fill="#d0bcff" radius={[4, 4, 0, 0]} name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!isLoading && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Revenue', note: 'Coming Soon' },
            { label: 'Active Users', note: 'Coming Soon' },
            { label: 'Conversion Rate', note: 'Coming Soon' },
            { label: 'Global Reach', note: 'Coming Soon' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[rgba(23,31,51,0.5)] border border-white/5 p-3 rounded-xl opacity-60"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#958ea0]">
                {item.label}
              </p>
              <p className="text-lg font-bold text-[#958ea0] mt-1">--</p>
              <p className="text-[10px] text-[#958ea0]">{item.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
