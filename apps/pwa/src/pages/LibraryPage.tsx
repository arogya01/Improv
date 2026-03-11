import React, { useCallback, useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-[calc(100vh-76px)] p-[clamp(1.5rem,4vw,3rem)] px-6 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-12 bg-transparent">
      <motion.div
        className="w-full max-w-7xl mx-auto flex justify-between items-end gap-6 border-b border-gray-200/40 pb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500/40" />
            <span className="text-[0.7rem] uppercase tracking-[0.2em] font-semibold text-teal-800/50">
              Personal Vault
            </span>
          </div>
          <h2 className="m-0 font-headline text-[clamp(2.5rem,6vw,4.5rem)] font-medium tracking-tight leading-[0.9] text-gray-900">
            Archive
          </h2>
          <p className="m-0 text-gray-500 font-ui text-lg leading-relaxed max-w-[40ch]">
            Your collection of moments and reflections.
          </p>
        </div>
        <button
          onClick={() => setFavoritesOnly((value) => !value)}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
            favoritesOnly 
              ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm" 
              : "bg-white/40 border-gray-200/60 text-gray-600 hover:bg-white/60"
          }`}
        >
          {favoritesOnly ? "Showing Favorites" : "Show Favorites"}
        </button>
      </motion.div>

      {isLoading && (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: "180px", borderRadius: "32px" }} />
          ))}
        </div>
      )}

      {!isLoading && recordings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-7xl mx-auto"
        >
          <div className="flex flex-col items-center text-center gap-6 p-[clamp(4rem,10vw,8rem)] rounded-[40px] bg-white/30 border border-white/60 shadow-[0_32px_80px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
              <span className="iconify" data-icon="solar:folder-open-linear" style={{ fontSize: "2rem" }}></span>
            <div className="space-y-2">
              <h3 className="m-0 font-headline text-[2.5rem] font-medium tracking-tight text-gray-900">
                Silence Speaks
              </h3>
              <p className="m-0 text-gray-500 font-ui max-w-[32ch] leading-relaxed text-lg">
                Your archive is currently empty. Capture your first reflection to begin.
              </p>
            </div>
            <button
              onClick={() => navigate("/app")}
              className="mt-4 rounded-full bg-gray-900 text-gray-50 px-10 py-4 font-medium transition-transform hover:scale-105 active:scale-95"
            >
              Start Session
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {recordings.map((recording) => {
          const status = getSyncStatusMeta(recording.syncStatus);

          return (
            <motion.div
              variants={itemVariants}
              key={recording.id}
              className="group"
            >
              <div
                onClick={() => navigate(`/app/archive/${recording.id}`)}
                className="h-full flex flex-col gap-6 rounded-[32px] bg-white/45 border border-white/80 p-7 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.04)] hover:bg-white/60 hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden group"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/app/archive/${recording.id}`);
                  }
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/[0.03] to-indigo-500/[0.03] rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <h3 className="m-0 text-[1.65rem] leading-[1.2] font-medium font-headline tracking-tight text-gray-900 line-clamp-2">
                    {getRecordingTitle(recording)}
                  </h3>
                  <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${
                    status.variant === "success" ? "bg-teal-500/40" : "bg-amber-500/40"
                  }`} />
                </div>

                <div className="flex flex-col gap-3 mt-auto relative z-10">
                  <div className="flex items-center gap-3 text-gray-400 font-ui text-[0.75rem] uppercase tracking-wider font-semibold">
                    <span>{formatCreatedAt(recording.createdAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="text-gray-600">{formatDuration(recording.durationMs)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(recording);
                        }}
                        className={`p-2.5 rounded-full transition-all duration-300 ${
                          recording.isFavorite 
                            ? "bg-rose-50 text-rose-500" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        <span 
                          className="iconify"
                          data-icon={recording.isFavorite ? "solar:heart-bold" : "solar:heart-linear"} 
                          style={{ fontSize: "1.2rem" }} 
                        ></span>
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteRecording(recording.id);
                        }}
                        className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
                      >
                        <span className="iconify" data-icon="solar:trash-bin-trash-linear" style={{ fontSize: "1.2rem" }}></span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span 
                        className="iconify"
                        data-icon={recording.mediaType === "video" ? "solar:videocamera-linear" : "solar:microphone-3-linear"} 
                        style={{ fontSize: "1.1rem" }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
