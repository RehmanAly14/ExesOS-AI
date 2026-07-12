import { type ReactNode, forwardRef,type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  fullWidth?: boolean
  rightIcon?: ReactNode
  leftIcon?: ReactNode
  error?: string
  success?: boolean
  className?: string
  defaultValue?: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    type = 'text', 
    fullWidth, 
    rightIcon,
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300',
              'focus:border-violet-400/30 focus:bg-white/10 focus:ring-1 focus:ring-violet-400/30',
              fullWidth && 'w-full',
              leftIcon && 'pl-10',
              rightIcon && 'pr-12',
              error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/30',
              success && 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/30',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
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

TextInput.displayName = 'TextInput'
export default TextInput