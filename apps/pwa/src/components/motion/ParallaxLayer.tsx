import React, { type RefObject } from "react";
import { motion, type MotionStyle } from "framer-motion";
import { useScrollParallax } from "../../hooks/useScrollParallax";

interface ParallaxLayerProps {
  distance: number;
  speed?: number;
  target?: RefObject<HTMLElement | null>;
  className?: string | undefined;
  children?: React.ReactNode;
  style?: MotionStyle;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  distance,
  speed = 1,
  target,
  className,
  children,
  style,
}) => {
  const { y, containerRef } = useScrollParallax(
    target
      ? {
          distance: distance * speed,
          target,
        }
      : { distance: distance * speed },
  );

  return (
    <motion.div
      ref={target ? undefined : containerRef}
      className={className}
      style={{ ...style, y }}
    >
      {children}
    </motion.div>
  );
};
