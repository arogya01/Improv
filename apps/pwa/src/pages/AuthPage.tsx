import React from "react";
import { motion } from "framer-motion";

import { Button, Card, Chip } from "../components/primitives";
import styles from "./AuthPage.module.css";

export const AuthPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className={styles.card}>
        <Chip variant="info">Deferred</Chip>
        <h2>Authentication arrives in the backend phase</h2>
        <p>
          This client build is intentionally local-first. Sign-in, cloud backup, and sync APIs will plug in after
          the frontend UX is finalized.
        </p>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Go Back
        </Button>
        </Card>
      </motion.div>
    </div>
  );
};
