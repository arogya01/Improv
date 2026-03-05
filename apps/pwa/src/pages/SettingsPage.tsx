import React, { useCallback, useEffect, useState } from "react";

import { Button, Card, Chip } from "../components/primitives";
import { improvDatabase, syncQueueService } from "../lib/client-services";
import styles from "./SettingsPage.module.css";

type StorageSnapshot = {
  quotaBytes: number | undefined;
  usedBytes: number | undefined;
};

type QueueSnapshot = {
  total: number;
  dueNow: number;
  upload: number;
  finalizeUpload: number;
  deleteCloud: number;
};

function formatMegabytes(bytes?: number): string {
  if (bytes === undefined) {
    return "Unavailable";
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SettingsPage: React.FC = () => {
  const [storage, setStorage] = useState<StorageSnapshot>({
    quotaBytes: undefined,
    usedBytes: undefined
  });
  const [queue, setQueue] = useState<QueueSnapshot>({
    total: 0,
    dueNow: 0,
    upload: 0,
    finalizeUpload: 0,
    deleteCloud: 0
  });
  const [loading, setLoading] = useState(true);

  const refreshDiagnostics = useCallback(async () => {
    setLoading(true);

    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      setStorage({ quotaBytes: estimate.quota, usedBytes: estimate.usage });
    }

    const allItems = await improvDatabase.syncQueue.toArray();
    const dueNow = await syncQueueService.listDueItems(new Date().toISOString(), 1000);

    setQueue({
      total: allItems.length,
      dueNow: dueNow.length,
      upload: allItems.filter((item) => item.kind === "upload").length,
      finalizeUpload: allItems.filter((item) => item.kind === "finalize_upload").length,
      deleteCloud: allItems.filter((item) => item.kind === "delete_cloud").length
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Settings</h2>
          <p className={styles.subtitle}>Local diagnostics and sync readiness for the client-side app.</p>
        </div>
        <Button variant="secondary" onClick={refreshDiagnostics} isLoading={loading}>
          Refresh
        </Button>
      </div>

      <Card className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Storage</h3>
          <Chip variant="default">Local</Chip>
        </div>

        <div className={styles.kv}>
          <span>Used</span>
          <strong>{formatMegabytes(storage.usedBytes)}</strong>
        </div>
        <div className={styles.kv}>
          <span>Quota</span>
          <strong>{formatMegabytes(storage.quotaBytes)}</strong>
        </div>
      </Card>

      <Card className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Sync Queue</h3>
          <Chip variant={queue.total > 0 ? "warning" : "success"}>
            {queue.total > 0 ? "Pending" : "Idle"}
          </Chip>
        </div>

        <div className={styles.kv}>
          <span>Total items</span>
          <strong>{queue.total}</strong>
        </div>
        <div className={styles.kv}>
          <span>Due now</span>
          <strong>{queue.dueNow}</strong>
        </div>
        <div className={styles.kv}>
          <span>Upload</span>
          <strong>{queue.upload}</strong>
        </div>
        <div className={styles.kv}>
          <span>Finalize upload</span>
          <strong>{queue.finalizeUpload}</strong>
        </div>
        <div className={styles.kv}>
          <span>Delete cloud</span>
          <strong>{queue.deleteCloud}</strong>
        </div>
      </Card>

      <Card className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Cloud Backup</h3>
          <Chip variant="info">Coming Soon</Chip>
        </div>

        <p>
          Cloud auth and background upload will be layered in next. Local-first recording and playback already
          work without any backend dependency.
        </p>
      </Card>
    </div>
  );
};
