import {type ButtonHTMLAttributes,type ReactNode, forwardRef } from "react";
import { cn } from "../../utils/cn";

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      children,
      className,
      loading = false,
      leftIcon,
      rightIcon,
      size = "md",
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-xs rounded-lg",
      md: "px-6 py-3 text-sm rounded-xl",
      lg: "px-8 py-4 text-base rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        {...props}
        className={cn(
          `
          inline-flex
          items-center
          justify-center
          gap-2
          font-semibold
          text-slate-900

          bg-gradient-to-r
          from-violet-300
          via-violet-400
          to-cyan-400

          transition-all
          duration-300

          hover:scale-[1.02]
          hover:shadow-[0_0_30px_rgba(208,188,255,0.35)]

          active:scale-[0.98]

          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:scale-100
          disabled:hover:shadow-none

          ${fullWidth ? "w-full" : ""}
          ${sizeClasses[size]}
          `,
          className
        )}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {leftIcon && !loading && <span>{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;