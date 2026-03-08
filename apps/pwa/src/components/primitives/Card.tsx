import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[color-mix(in_srgb,var(--surface-raised)_96%,transparent)] rounded-2xl p-5 shadow-ethereal border border-[var(--line-soft)] relative overflow-hidden transition-all duration-300 ease-out",
          interactive &&
            "cursor-pointer hover:-translate-y-0.5 hover:shadow-ethereal-md hover:border-[var(--line-strong)]",
          interactive && "active:translate-y-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
