import {type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'default' | 'info'
  size?: 'sm' | 'md'
  className?: string
  icon?: ReactNode
  animated?: boolean
}

const variants = {
  primary: 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30',
  success: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30',
  error: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30',
  info: 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30',
  default: 'bg-white/10 text-slate-300 ring-1 ring-white/10',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  icon,
  animated = false,
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
      variants[variant],
      sizes[size],
      animated && 'animate-pulse',
      className
    )}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}