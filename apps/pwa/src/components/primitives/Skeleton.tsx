import React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  borderRadius,
  style,
  ...props
}) => {
  return (
    <div
      className={cn(
        "skeleton-gradient animate-shimmer rounded-xl min-h-[1.5em] will-change-[background-position] motion-reduce:animate-none motion-reduce:bg-[color-mix(in_srgb,var(--surface-muted)_96%,transparent)]",
        className,
      )}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      {...props}
    />
  );
};
