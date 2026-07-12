import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#2d3449] flex items-center justify-center text-[#958ea0] mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-[#dae2fd] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[#958ea0] max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
