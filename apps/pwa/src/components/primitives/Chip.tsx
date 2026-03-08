import React from "react";
import { cn } from "../../lib/utils";

export type ChipVariant = "default" | "success" | "warning" | "error" | "info";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChipVariant;
  icon?: React.ReactNode;
}

const variantClasses: Record<ChipVariant, string> = {
  default:
    "bg-[color-mix(in_srgb,var(--surface-raised)_90%,transparent)] text-ink-700 border-[var(--line-soft)]",
  success:
    "bg-[color-mix(in_srgb,var(--status-synced)_12%,transparent)] text-[var(--status-synced)] border-[color-mix(in_srgb,var(--status-synced)_18%,transparent)]",
  warning:
    "bg-[color-mix(in_srgb,var(--status-pending)_12%,transparent)] text-[var(--status-pending)] border-[color-mix(in_srgb,var(--status-pending)_18%,transparent)]",
  error:
    "bg-[color-mix(in_srgb,var(--status-error)_12%,transparent)] text-[var(--status-error)] border-[color-mix(in_srgb,var(--status-error)_18%,transparent)]",
  info: "bg-[color-mix(in_srgb,var(--status-uploading)_12%,transparent)] text-[var(--status-uploading)] border-[color-mix(in_srgb,var(--status-uploading)_18%,transparent)]",
};

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 py-[0.28rem] px-[0.6rem] font-ui text-[0.68rem] font-bold rounded-full leading-tight whitespace-nowrap tracking-widest uppercase border",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5">
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>
    );
  },
);
Chip.displayName = "Chip";
