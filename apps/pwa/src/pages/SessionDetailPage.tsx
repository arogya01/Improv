import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecordingMeta } from "@improv/core";
import { motion } from "framer-motion";

import { Button, Card, Chip, Skeleton } from "../components/primitives";
import { libraryService } from "../lib/client-services";
import { formatCreatedAt, formatDuration, getSyncStatusMeta } from "./library-ui";
import styles from "./SessionDetailPage.module.css";

export const SessionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const recordingId = params.id;

  const [recording, setRecording] = useState<RecordingMeta | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!recordingId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const nextRecording = await libraryService.getRecording(recordingId);
      const nextBlob = await libraryService.getRecordingBlob(recordingId);

      if (active) {
        setRecording(nextRecording ?? null);
        setBlob(nextBlob ?? null);
        setIsLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [recordingId]);

  const mediaUrl = useMemo(() => {
    if (!blob) {
      return null;
    }

    return URL.createObjectURL(blob);
  }, [blob]);

  useEffect(() => {
    return () => {
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton style={{ height: "240px" }} />
        <Skeleton style={{ height: "120px" }} />
      </div>
    );
  }

  if (!recording || !recordingId) {
    return (
      <div className={styles.page}>
        <Card>
          <h2>Recording not found</h2>
          <Button onClick={() => navigate("/library")}>Back to Library</Button>
        </Card>
      </div>
    );
  }

  const status = getSyncStatusMeta(recording.syncStatus);

  const toggleFavorite = async () => {
    const next = !recording.isFavorite;
    await libraryService.setFavorite(recording.id, next, new Date().toISOString());
    setRecording((current) =>
      current
        ? {
            ...current,
            isFavorite: next,
            updatedAt: new Date().toISOString()
          }
        : current
    );
  };

  const deleteRecording = async () => {
    const confirmed = window.confirm("Delete this recording from local storage?");
    if (!confirmed) {
      return;
    }

    await libraryService.deleteLocalRecording(recording.id);
    navigate("/library", { replace: true });
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.headerRow}>
        <Button variant="ghost" onClick={() => navigate("/library")}>Back</Button>
        <Chip variant={status.variant}>{status.label}</Chip>
      </div>

      <Card className={styles.playerCard}>
        {mediaUrl ? (
          recording.mediaType === "video" ? (
            <video className={styles.media} controls src={mediaUrl} />
          ) : (
            <audio className={styles.media} controls src={mediaUrl} />
          )
        ) : (
          <p className={styles.missing}>Media bytes unavailable for this recording.</p>
        )}
      </Card>

      <Card className={styles.metaCard}>
        <h3>Session Summary</h3>
        <dl>
          <div>
            <dt>Topic</dt>
            <dd>{recording.promptId}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatCreatedAt(recording.createdAt)}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{formatDuration(recording.durationMs)}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{recording.mimeType}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{Math.max(1, Math.round(recording.fileSizeBytes / 1024))} KB</dd>
          </div>
        </dl>
      </Card>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={toggleFavorite}>
          {recording.isFavorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button variant="ghost" onClick={deleteRecording}>Delete</Button>
      </div>
    </motion.div>
  );
};
