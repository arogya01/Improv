import React from "react";
import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { MotionTokens } from "../../design/motion";

interface RevealSectionProps {
  /** Vertical offset to animate from (default: tokens.parallax.revealY = 24) */
  revealY?: number;
  /** Stagger delay between children (default: tokens.parallax.revealStagger = 0.06) */
  stagger?: number;
  /** IntersectionObserver `amount` threshold (default 0.2) */
  threshold?: number;
  /** Only animate once (default true) */
  once?: boolean;
  className?: string | undefined;
  children: React.ReactNode;
  as?: "section" | "div" | "article" | "header";
}

export const RevealSection: React.FC<RevealSectionProps> = ({
  revealY = MotionTokens.parallax.revealY,
  stagger = MotionTokens.parallax.revealStagger,
  threshold = 0.2,
  once = true,
  className,
  children,
  as = "div",
}) => {
  const shouldReduce = useReducedMotion();

  const containerVariants: Variants = shouldReduce
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            duration: MotionTokens.durations.standard,
          },
        },
      };

  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={containerVariants}
    >
      {children}
    </Tag>
  );
};

/* Companion wrapper for individual children inside a RevealSection */

interface RevealItemProps {
  className?: string | undefined;
  children: React.ReactNode;
  revealY?: number;
}

export const RevealItem: React.FC<RevealItemProps> = ({
  className,
  children,
  revealY = MotionTokens.parallax.revealY,
}) => {
  const shouldReduce = useReducedMotion();

  const itemVariants: Variants = shouldReduce
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: revealY },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MotionTokens.durations.page,
            ease: MotionTokens.easings.entrance,
          },
        },
      };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
};
