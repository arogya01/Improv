import React from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "./MacWindowFrame.module.css";

interface MacWindowFrameProps {
  children: ReactNode;
}

export function MacWindowFrame({ children }: MacWindowFrameProps): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.window}
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className={styles.titlebar}>
          <div className={styles.trafficLights}>
            <div className={`${styles.dot} ${styles.red}`} />
            <div className={`${styles.dot} ${styles.yellow}`} />
            <div className={`${styles.dot} ${styles.green}`} />
          </div>
          <div className={styles.title}>Improv</div>
        </div>
        <div className={styles.content}>{children}</div>
      </motion.div>
    </div>
  );
}
