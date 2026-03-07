import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { RecordingMeta } from "@improv/core";

import { Button, Card, Chip, Skeleton } from "../components/primitives";
import { libraryService } from "../lib/client-services";
import { formatCreatedAt, formatDuration, getRecordingTitle, getSyncStatusMeta } from "./library-ui";
import styles from "./LibraryPage.module.css";

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<RecordingMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const items = await libraryService.listLibraryItems({ favoritesOnly });
    setRecordings(items);
    setIsLoading(false);
  }, [favoritesOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = async (recording: RecordingMeta) => {
    const next = !recording.isFavorite;
    setRecordings((current) =>
      current.map((item) =>
        item.id === recording.id
          ? {
              ...item,
              isFavorite: next,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );

    await libraryService.setFavorite(recording.id, next, new Date().toISOString());
    if (favoritesOnly && !next) {
      load();
    }
  };

  const deleteRecording = async (recordingId: string) => {
    const confirmed = window.confirm("Delete this recording from local storage?");
    if (!confirmed) {
      return;
    }

    await libraryService.deleteLocalRecording(recordingId);
    setRecordings((current) => current.filter((item) => item.id !== recordingId));
  };

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.headerRow}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h2 className={styles.title}>Library</h2>
          <p className={styles.subtitle}>Review sessions, favorite the best takes, and keep iterating.</p>
        </div>
        <Button variant="secondary" onClick={() => setFavoritesOnly((value) => !value)}>
          {favoritesOnly ? "Show All" : "Favorites"}
        </Button>
      </motion.div>

      {isLoading && (
        <div className={styles.loadingList}>
          <Skeleton style={{ height: "96px" }} />
          <Skeleton style={{ height: "96px" }} />
          <Skeleton style={{ height: "96px" }} />
        </div>
      )}

      {!isLoading && recordings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className={styles.emptyState}>
          <h3>No recordings yet</h3>
          <p>Spin a topic and create your first session to populate this library.</p>
          <Button onClick={() => navigate("/practice/setup")}>Start Recording</Button>
          </Card>
        </motion.div>
      )}

      <motion.div layout className={styles.list}>
        {recordings.map((recording, index) => {
          const status = getSyncStatusMeta(recording.syncStatus);

          return (
            <motion.div
              layout
              key={recording.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
            >
              <Card
                interactive
                className={styles.itemCard}
                onClick={() => navigate(`/library/${recording.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/library/${recording.id}`);
                  }
                }}
              >
                <div className={styles.itemTop}>
                  <h3>{getRecordingTitle(recording)}</h3>
                  <Chip variant={status.variant}>{status.label}</Chip>
                </div>

                <p className={styles.itemMeta}>
                  {formatCreatedAt(recording.createdAt)} • {formatDuration(recording.durationMs)} • {recording.mediaType}
                </p>

                <div className={styles.itemActions}>
                  <Button
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(recording);
                    }}
                  >
                    {recording.isFavorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteRecording(recording.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
