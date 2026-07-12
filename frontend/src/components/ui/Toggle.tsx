import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: {
    container: 'w-8 h-5',
    dot: 'h-3.5 w-3.5',
    dotOffset: 'translate-x-3.5',
  },
  md: {
    container: 'w-11 h-6',
    dot: 'h-5 w-5',
    dotOffset: 'translate-x-5',
  },
  lg: {
    container: 'w-14 h-8',
    dot: 'h-6 w-6',
    dotOffset: 'translate-x-6',
  },
}

export default function Toggle({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}: ToggleProps) {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleToggle = () => {
    if (disabled) return
    const newState = !isChecked
    setIsChecked(newState)
    onChange?.(newState)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  const sizeStyles = sizes[size] || sizes.md

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        role="switch"
        aria-checked={isChecked}
        aria-label={label || 'Toggle'}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out',
          sizeStyles.container,
          isChecked
            ? 'bg-gradient-to-r from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25'
            : 'bg-white/10 hover:bg-white/20',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'hover:shadow-lg hover:shadow-violet-500/10'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
            sizeStyles.dot,
            isChecked && sizeStyles.dotOffset,
            !isChecked && 'translate-x-0.5'
          )}
        />
      </div>
      {label && (
        <span 
          className={cn(
            'text-sm font-medium',
            disabled ? 'text-slate-500' : 'text-slate-300'
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}