import React from "react";
import type { ReactNode } from "react";
import styles from "./BentoGrid.module.css";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({
  children,
  className = "",
}: BentoGridProps): JSX.Element {
  return <div className={`${styles.grid} ${className}`}>{children}</div>;
}

interface BentoItemProps {
  children: ReactNode;
  colSpan?: 1 | 2; /* 1/3 or 2/3 width */
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
}: BentoItemProps): JSX.Element {
  const spanClass = colSpan === 2 ? styles.span2 : styles.span1;

  return (
    <motion.div
      className={`${styles.item} ${spanClass} ${className}`}
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
