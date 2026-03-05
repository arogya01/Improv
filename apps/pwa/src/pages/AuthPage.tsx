import React from "react";

import { Button, Card, Chip } from "../components/primitives";
import styles from "./AuthPage.module.css";

export const AuthPage: React.FC = () => {
  return (
    <div className={styles.page}>
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
    </div>
  );
};
