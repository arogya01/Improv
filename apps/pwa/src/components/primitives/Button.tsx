import React from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", isLoading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`primitive-btn primitive-btn--${variant} ${isLoading ? "is-loading" : ""} ${className || ""}`}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="btn-content">{children}</span>
        {isLoading && <span className="btn-loader" />}
        <span className="btn-sheen" />
      </button>
    );
  },
);
Button.displayName = "Button";
