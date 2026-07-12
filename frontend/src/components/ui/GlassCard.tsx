import {type ReactNode, forwardRef,type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

// ✅ This is the fix - extends HTMLAttributes
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  // All event props (onMouseEnter, onMouseLeave, etc.) are now inherited
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      hover = true,
      interactive = false,
      onClick,
      onMouseEnter,    // ← Now TypeScript knows these exist
      onMouseLeave,    // ← Because they're in HTMLAttributes
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          `
          rounded-3xl
          border border-white/8
          bg-[rgba(23,31,51,0.72)]
          backdrop-blur-xl
          shadow-[0_10px_40px_rgba(0,0,0,0.25)]
          p-6
          transition-all
          duration-300
          ${hover ? "hover:border-violet-400/20 hover:shadow-[0_15px_50px_rgba(0,0,0,0.35)]" : ""}
          ${interactive ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""}
          `,
          className
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}    // ← Now works
        onMouseLeave={onMouseLeave}    // ← Now works
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;