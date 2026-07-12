import {type ReactNode, forwardRef,type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  fullWidth?: boolean
  leftIcon?: ReactNode
  error?: string
  success?: boolean
  className?: string
  defaultValue?: string
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ 
    label, 
    placeholder = 'Select an option',
    value, 
    onChange, 
    options,
    fullWidth, 
    leftIcon,
    error,
    success,
    className,
    defaultValue,
    disabled,
    ...props
  }, ref) => {
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 appearance-none',
              'focus:border-violet-400/30 focus:bg-white/10 focus:ring-1 focus:ring-violet-400/30',
              fullWidth && 'w-full',
              leftIcon && 'pl-10',
              error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/30',
              success && 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/30',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="bg-[#171f33] text-slate-400">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className="bg-[#171f33] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-rose-400">{error}</p>
        )}
        {success && !error && (
          <p className="text-xs text-emerald-400">✓ Valid</p>
        )}
      </div>
    )
  }
)

SelectInput.displayName = 'SelectInput'
export default SelectInput