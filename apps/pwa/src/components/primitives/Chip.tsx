import React from "react";
import "./Chip.css";

export type ChipVariant = "default" | "success" | "warning" | "error" | "info";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChipVariant;
  icon?: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`primitive-chip primitive-chip--${variant} ${className || ""}`}
        {...props}
      >
        {icon && <span className="chip-icon">{icon}</span>}
        <span className="chip-label">{children}</span>
      </div>
    );
  },
);
Chip.displayName = "Chip";
