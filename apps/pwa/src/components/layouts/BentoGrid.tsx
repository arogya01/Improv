import React from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "../../lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({
  children,
  className = "",
}: BentoGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: ReactNode;
  colSpan?: 1 | 2;
  className?: string;
  delay?: number;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92, rotateX: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
      delay: custom * 0.1,
    },
  }),
};

export function BentoItem({
  children,
  colSpan = 1,
  className = "",
  delay = 0,
}: BentoItemProps): React.ReactElement {
  return (
    <motion.div
      className={cn(
        "bg-[var(--bg-primary)] rounded-3xl shadow-ethereal border border-[var(--glass-border)] overflow-hidden relative [transform-style:preserve-3d] [perspective:1000px]",
        colSpan === 2 ? "col-span-1 md:col-span-2" : "col-span-1",
        className,
      )}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01, boxShadow: "var(--shadow-md)" }}
      transition={{ type: "spring", damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
