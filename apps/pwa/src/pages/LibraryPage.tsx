import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { RecordingMeta } from "@improv/core";

import { Button, Card, Chip, Skeleton } from "../components/primitives";
import { libraryService } from "../lib/client-services";
import {
  formatCreatedAt,
  formatDuration,
  getRecordingTitle,
  getSyncStatusMeta,
} from "./library-ui";

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
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );

    await libraryService.setFavorite(
      recording.id,
      next,
      new Date().toISOString(),
    );
    if (favoritesOnly && !next) {
      load();
    }
  };

  const deleteRecording = async (recordingId: string) => {
    const confirmed = window.confirm(
      "Delete this recording from local storage?",
    );
    if (!confirmed) {
      return;
    }

    await libraryService.deleteLocalRecording(recordingId);
    setRecordings((current) =>
      current.filter((item) => item.id !== recordingId),
    );
  };

  return (
    <div className="min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-6">
      <motion.div
        className="w-full max-w-[1100px] mx-auto flex justify-between items-start gap-4 max-[700px]:flex-col max-[700px]:items-stretch"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <h2 className="m-0 font-headline text-[clamp(2.6rem,5vw,4.4rem)] font-medium tracking-tighter leading-none text-ink-900">
            Archive
          </h2>
          <p className="mt-3 mb-0 text-ink-700 font-body text-base leading-relaxed max-w-[48ch]">
            Curate your reflections.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setFavoritesOnly((value) => !value)}
        >
          {favoritesOnly ? "Show All" : "Favorites"}
        </Button>
      </motion.div>

      {isLoading && (
        <div className="w-full max-w-[1100px] mx-auto grid gap-4">
          <Skeleton style={{ height: "96px" }} />
          <Skeleton style={{ height: "96px" }} />
          <Skeleton style={{ height: "96px" }} />
        </div>
      )}

      {!isLoading && recordings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="w-full max-w-[1100px] mx-auto flex flex-col items-start text-left gap-4 p-[clamp(2rem,6vw,4rem)]">
            <h3 className="m-0 font-headline text-[clamp(2rem,5vw,3rem)] font-medium tracking-tighter">
              Empty Archive
            </h3>
            <p className="m-0 text-ink-700 font-body max-w-[42ch] leading-relaxed">
              Begin a session to capture your first reflection.
            </p>
            <Button onClick={() => navigate("/practice/setup")}>Start</Button>
          </Card>
        </motion.div>
      )}

      <motion.div layout className="w-full max-w-[1100px] mx-auto grid gap-4">
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
                className="grid gap-3"
                onClick={() => navigate(`/library/${recording.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/library/${recording.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-[1.45rem] font-medium font-headline tracking-tight text-ink-900">
                    {getRecordingTitle(recording)}
                  </h3>
                  <Chip variant={status.variant}>{status.label}</Chip>
                </div>

                <p className="m-0 text-ink-700 text-[0.88rem] font-ui uppercase tracking-wide">
                  {formatCreatedAt(recording.createdAt)} •{" "}
                  {formatDuration(recording.durationMs)} • {recording.mediaType}
                </p>

                <div className="flex gap-3 flex-wrap">
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
