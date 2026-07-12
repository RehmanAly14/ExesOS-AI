import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  accent?: 'violet' | 'cyan' | 'emerald' | 'amber';
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
}

const accentStyles = {
  violet: 'border-t-violet-500/30',
  cyan: 'border-t-cyan-400/30',
  emerald: 'border-t-emerald-400/30',
  amber: 'border-t-amber-400/30',
};

export default function StatCard({
  label,
  value,
  sublabel,
  icon,
  accent = 'violet',
  isLoading,
  className,
  children,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6 rounded-xl animate-pulse',
          className
        )}
      >
        <div className="h-3 w-24 bg-[#2d3449] rounded mb-3" />
        <div className="h-8 w-16 bg-[#2d3449] rounded mb-2" />
        <div className="h-3 w-32 bg-[#2d3449] rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6 rounded-xl border-t-2',
        accentStyles[accent],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-2">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-[#dae2fd] truncate">{value}</h3>
          {sublabel && (
            <p className="text-[10px] text-[#958ea0] mt-2 truncate">{sublabel}</p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-[#2d3449] text-violet-300 shrink-0">{icon}</div>
        )}
      </div>
      {children}
    </div>
  );
}
