import { cn } from '../../utils/cn';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export default function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 p-6 rounded-2xl animate-pulse',
        className
      )}
    >
      <div className="h-5 w-40 bg-[#2d3449] rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-14 bg-[#2d3449]/60 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
      <p className="text-sm text-rose-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold uppercase tracking-wider text-rose-300 hover:text-rose-200 transition-colors shrink-0"
        >
          Try again
        </button>
      )}
    </div>
  );
}

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing?: boolean;
}

export function RefreshButton({ onClick, isRefreshing }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isRefreshing}
      className="flex items-center gap-2 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] px-4 py-2 rounded-xl text-sm text-[#cbc3d7] hover:text-[#dae2fd] hover:border-violet-400/20 transition-all disabled:opacity-50"
    >
      <svg
        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {isRefreshing ? 'Refreshing…' : 'Refresh'}
    </button>
  );
}
