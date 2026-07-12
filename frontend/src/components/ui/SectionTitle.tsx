import {type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
  icon?: ReactNode
  action?: ReactNode
  variant?: 'default' | 'large' | 'small'
}

const variants = {
  large: {
    title: 'text-xl md:text-2xl font-semibold',
    subtitle: 'text-sm',
    spacing: 'mb-6',
  },
  default: {
    title: 'text-sm font-semibold',
    subtitle: 'text-xs',
    spacing: 'mb-4',
  },
  small: {
    title: 'text-xs font-semibold uppercase tracking-wider',
    subtitle: 'text-[10px]',
    spacing: 'mb-3',
  },
}

export default function SectionTitle({ 
  title, 
  subtitle, 
  className,
  icon,
  action,
  variant = 'default',
}: SectionTitleProps) {
  const styles = variants[variant]

  return (
    <div className={cn('flex items-center justify-between', styles.spacing, className)}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex-shrink-0 text-violet-300">
              {icon}
            </span>
          )}
          <h3 className={cn(
            'text-white tracking-tight',
            styles.title
          )}>
            {title}
          </h3>
        </div>
        {subtitle && (
          <p className={cn(
            'text-slate-400 mt-0.5',
            styles.subtitle
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  )
}