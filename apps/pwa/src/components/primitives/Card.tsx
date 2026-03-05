import React from "react";
import "./Card.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`primitive-card ${interactive ? "primitive-card--interactive" : ""} ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
