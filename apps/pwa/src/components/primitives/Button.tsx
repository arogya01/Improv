import React from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-teal-50/80 to-indigo-50/80 text-teal-900 border border-teal-200/50 shadow-ethereal hover:not-disabled:from-teal-50 hover:not-disabled:to-indigo-50 hover:not-disabled:border-teal-300/60 hover:not-disabled:shadow-ethereal-md hover:not-disabled:-translate-y-px",
  secondary:
    "bg-white/35 backdrop-blur-glass text-ink-800 border border-white/60 shadow-ethereal hover:not-disabled:bg-white/55 hover:not-disabled:shadow-ethereal-md hover:not-disabled:-translate-y-px",
  ghost:
    "bg-transparent text-ink-600 border border-transparent hover:not-disabled:bg-black/[0.03] hover:not-disabled:text-ink-900",
  icon: "w-11 !p-0 rounded-full bg-white/35 backdrop-blur-glass text-ink-600 border border-white/60 hover:not-disabled:bg-white/60 hover:not-disabled:text-ink-900 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-ethereal",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", isLoading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 px-5 min-h-[2.75rem] font-ui font-medium text-[0.95rem] rounded-full border cursor-pointer overflow-hidden transition-all duration-300 ease-out will-change-transform no-underline tracking-wide",
          "active:translate-y-px",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          variantClasses[variant],
          isLoading && "cursor-not-allowed opacity-50 shadow-none",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="relative z-[1] flex items-center gap-[inherit] transition-transform duration-200">
          {children}
        </span>
        {isLoading && <span className="btn-loader" />}
      </button>
    );
  },
);
Button.displayName = "Button";
