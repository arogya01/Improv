import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecordingMeta } from "@improv/core";
import { motion, AnimatePresence } from "framer-motion";

import { Skeleton } from "../components/primitives";
import { libraryService } from "../lib/client-services";
import {
  formatCreatedAt,
  formatDuration,
  getRecordingTitle,
  getSyncStatusMeta,
} from "./library-ui";
import { PlaybackParticleOrb } from "../components/ui/PlaybackParticleOrb";

export const SessionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const recordingId = params.id;

  const [recording, setRecording] = useState<RecordingMeta | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!recordingId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const nextRecording = await libraryService.getRecording(recordingId);
        const nextBlob = await libraryService.getRecordingBlob(recordingId);

        if (active) {
          setRecording(nextRecording ?? null);
          setBlob(nextBlob ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load recording:", err);
        if (active) setIsLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [recordingId]);

  const mediaUrl = useMemo(() => {
    if (!blob || blob.size === 0) return null;
    return URL.createObjectURL(blob);
  }, [blob]);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[500px] mx-auto min-h-[calc(100vh-76px)] p-8 pt-20 flex flex-col gap-8">
        <Skeleton style={{ height: "320px", borderRadius: "40px" }} />
        <Skeleton style={{ height: "160px", borderRadius: "32px" }} />
      </div>
    );
  }

  if (!recording || !recordingId) {
    return (
      <div className="w-full max-w-[500px] mx-auto min-h-[calc(100vh-76px)] p-8 flex flex-col items-center justify-center text-center gap-6">
          <span className="iconify" data-icon="solar:shield-warning-linear" style={{ fontSize: "2rem" }}></span>
        <h2 className="text-2xl font-headline font-medium">Reflection not found</h2>
        <button 
          onClick={() => navigate("/app/archive")}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium"
        >
          Return to Archive
        </button>
      </div>
    );
  }

  const status = getSyncStatusMeta(recording.syncStatus);

  const toggleFavorite = async () => {
    const next = !recording.isFavorite;
    await libraryService.setFavorite(recording.id, next, new Date().toISOString());
    setRecording((current) =>
      current ? { ...current, isFavorite: next, updatedAt: new Date().toISOString() } : current
    );
  };

  const deleteRecording = async () => {
    const confirmed = window.confirm("Permanently discard this reflection?");
    if (!confirmed) return;
    await libraryService.deleteLocalRecording(recording.id);
    navigate("/app/archive", { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-transparent">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="w-full max-w-[500px] mx-auto p-8 pb-32 flex flex-col gap-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/app/archive")}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/50 border border-white/80 shadow-sm text-gray-500 hover:bg-white hover:text-gray-900 transition-all"
          >
            <span className="iconify" data-icon="solar:arrow-left-linear" style={{ fontSize: "1.25rem" }}></span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.variant === "success" ? "bg-teal-500" : "bg-amber-500"} opacity-50`} />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-gray-400">
              {status.label}
            </span>
          </div>
        </div>

        {/* Main Stage: The Orb */}
        <div className="flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
             <div className="flex items-center justify-center gap-2 opacity-40">
                <span className="text-[0.65rem] uppercase tracking-[0.25em] font-semibold text-teal-800">
                  {formatCreatedAt(recording.createdAt)}
                </span>
              </div>
              <h1 className="text-[2rem] font-headline font-medium tracking-tight text-gray-900 leading-[1.2] max-w-[15ch]">
                {getRecordingTitle(recording)}
              </h1>
          </div>

          <div className="relative py-4">
            {mediaUrl ? (
              <PlaybackParticleOrb 
                src={mediaUrl} 
                durationMs={recording.durationMs} 
                onPlayStateChange={setIsPlaying}
              />
            ) : (
              <div className="w-72 h-72 rounded-full bg-gray-50 flex flex-col items-center justify-center text-center p-8 gap-4">
                 <span className="iconify" data-icon="solar:music-note-broken" style={{ fontSize: "2rem", color: "#d1d5db" }}></span>
                 <p className="text-sm text-gray-400 font-ui">Media blob not found in local storage.</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Details */}
        <motion.div 
          className="space-y-6"
          animate={{ opacity: isPlaying ? 0.3 : 1, y: isPlaying ? 10 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 rounded-[28px] bg-white/40 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="text-[0.6rem] uppercase tracking-widest text-gray-400 font-bold mb-1">Duration</div>
                <div className="text-lg font-headline font-medium text-gray-900">{formatDuration(recording.durationMs)}</div>
             </div>
             <div className="p-5 rounded-[28px] bg-white/40 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="text-[0.6rem] uppercase tracking-widest text-gray-400 font-bold mb-1">Format</div>
                <div className="text-lg font-headline font-medium text-gray-900 uppercase">{recording.mimeType.split('/')[1] || "Audio"}</div>
             </div>
          </div>

          <div className="p-6 rounded-[32px] bg-white/40 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
                   <span className="iconify" data-icon="solar:folder-path-connect-linear" style={{ fontSize: "1.25rem" }}></span>
                </div>
                <div>
                   <div className="text-[0.6rem] uppercase tracking-widest text-gray-400 font-bold">Local Storage</div>
                   <div className="text-sm font-medium text-gray-700">{Math.round(recording.fileSizeBytes / 1024)} KB</div>
                </div>
             </div>
             <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
                    recording.isFavorite ? "bg-rose-50 text-rose-500 shadow-sm" : "bg-white/60 text-gray-400 hover:text-rose-500"
                  }`}
                >
                  <span className="iconify" data-icon={recording.isFavorite ? "solar:heart-bold" : "solar:heart-linear"} style={{ fontSize: "1.25rem" }}></span>
                </button>
                <button
                  onClick={deleteRecording}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/60 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <span className="iconify" data-icon="solar:trash-bin-trash-linear" style={{ fontSize: "1.25rem" }}></span>
                </button>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
