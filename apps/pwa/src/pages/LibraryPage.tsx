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
    <div className="min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-8">
      <motion.div
        className="w-full max-w-7xl mx-auto flex justify-between items-start gap-4 max-[700px]:flex-col max-[700px]:items-stretch border-b border-gray-200/60 pb-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <h2 className="m-0 font-headline text-[clamp(2.6rem,5vw,4.4rem)] font-medium tracking-tight leading-none text-gray-900">
            Archive
          </h2>
          <p className="mt-4 mb-0 text-gray-600 font-ui text-lg leading-relaxed max-w-[48ch]">
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
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton style={{ height: "160px", borderRadius: "24px" }} />
          <Skeleton style={{ height: "160px", borderRadius: "24px" }} />
          <Skeleton style={{ height: "160px", borderRadius: "24px" }} />
        </div>
      )}

      {!isLoading && recordings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="w-full max-w-7xl mx-auto flex flex-col items-start text-left gap-4 p-[clamp(3rem,6vw,5rem)] rounded-[32px] bg-white/40 border border-white/60 shadow-sm backdrop-blur-xl">
            <h3 className="m-0 font-headline text-[clamp(2.5rem,5vw,3.5rem)] font-medium tracking-tight text-gray-900">
              Empty Archive
            </h3>
            <p className="m-0 text-gray-600 font-ui max-w-[42ch] leading-relaxed text-lg">
              Begin a session to capture your first reflection.
            </p>
            <Button
              onClick={() => navigate("/practice/setup")}
              className="mt-4 rounded-full bg-gray-900 text-gray-50 px-8 py-3"
            >
              Start
            </Button>
          </Card>
        </motion.div>
      )}

      <motion.div
        layout
        className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recordings.map((recording, index) => {
          const status = getSyncStatusMeta(recording.syncStatus);

          return (
            <motion.div
              layout
              key={recording.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Card
                interactive
                className="grid gap-5 rounded-[24px] bg-white/50 border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                onClick={() => navigate(`/library/${recording.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/library/${recording.id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="m-0 text-[1.6rem] leading-tight font-medium font-headline tracking-tight text-gray-900 line-clamp-2">
                    {getRecordingTitle(recording)}
                  </h3>
                  <Chip variant={status.variant} className="shrink-0">
                    {status.label}
                  </Chip>
                </div>

                <p className="m-0 text-gray-500 text-[0.8rem] font-ui uppercase tracking-widest font-semibold flex items-center gap-2">
                  <span>{formatCreatedAt(recording.createdAt)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{formatDuration(recording.durationMs)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{recording.mediaType}</span>
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
