import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecordingMeta } from "@improv/core";
import { motion } from "framer-motion";

import { Button, Card, Chip, Skeleton } from "../components/primitives";
import { libraryService } from "../lib/client-services";
import {
  formatCreatedAt,
  formatDuration,
  getSyncStatusMeta,
} from "./library-ui";

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
      <div className="w-full max-w-[980px] mx-auto min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-4">
        <Skeleton style={{ height: "240px" }} />
        <Skeleton style={{ height: "120px" }} />
      </div>
    );
  }

  if (!recording || !recordingId) {
    return (
      <div className="w-full max-w-[980px] mx-auto min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-4">
        <Card>
          <h2>Reflection not found</h2>
          <Button onClick={() => navigate("/library")}>Back</Button>
        </Card>
      </div>
    );
  }

  const status = getSyncStatusMeta(recording.syncStatus);

  const toggleFavorite = async () => {
    const next = !recording.isFavorite;
    await libraryService.setFavorite(
      recording.id,
      next,
      new Date().toISOString(),
    );
    setRecording((current) =>
      current
        ? {
            ...current,
            isFavorite: next,
            updatedAt: new Date().toISOString(),
          }
        : current,
    );
  };

  const deleteRecording = async () => {
    const confirmed = window.confirm("Discard this reflection?");
    if (!confirmed) {
      return;
    }

    await libraryService.deleteLocalRecording(recording.id);
    navigate("/library", { replace: true });
  };

  return (
    <motion.div
      className="w-full max-w-[980px] mx-auto min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate("/app/archive")}>
          Back
        </Button>
        <Chip variant={status.variant}>{status.label}</Chip>
      </div>

      <Card className="p-3">
        {mediaUrl ? (
          recording.mediaType === "video" ? (
            <video
              className="w-full rounded-2xl bg-[color-mix(in_srgb,var(--surface-muted)_96%,transparent)]"
              controls
              src={mediaUrl}
            />
          ) : (
            <audio
              className="w-full rounded-2xl bg-[color-mix(in_srgb,var(--surface-muted)_96%,transparent)]"
              controls
              src={mediaUrl}
            />
          )
        ) : (
          <p className="m-0 text-ink-700">Media unavailable.</p>
        )}
      </Card>

      <Card className="grid gap-3">
        <h3 className="m-0 font-headline text-[1.8rem] tracking-tight pb-3 border-b border-[var(--line-soft)]">
          Details
        </h3>
        <dl className="m-0 grid gap-2">
          <div className="flex justify-between gap-3 pb-3 border-b border-[var(--line-soft)]">
            <dt className="text-ink-700 font-mono uppercase text-[0.78rem] tracking-wide">
              Topic
            </dt>
            <dd className="m-0 text-right font-semibold font-ui">
              {recording.promptId}
            </dd>
          </div>
          <div className="flex justify-between gap-3 pb-3 border-b border-[var(--line-soft)]">
            <dt className="text-ink-700 font-mono uppercase text-[0.78rem] tracking-wide">
              Created
            </dt>
            <dd className="m-0 text-right font-semibold font-ui">
              {formatCreatedAt(recording.createdAt)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 pb-3 border-b border-[var(--line-soft)]">
            <dt className="text-ink-700 font-mono uppercase text-[0.78rem] tracking-wide">
              Duration
            </dt>
            <dd className="m-0 text-right font-semibold font-ui">
              {formatDuration(recording.durationMs)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 pb-3 border-b border-[var(--line-soft)]">
            <dt className="text-ink-700 font-mono uppercase text-[0.78rem] tracking-wide">
              Format
            </dt>
            <dd className="m-0 text-right font-semibold font-ui">
              {recording.mimeType}
            </dd>
          </div>
          <div className="flex justify-between gap-3 pb-3 border-b border-[var(--line-soft)]">
            <dt className="text-ink-700 font-mono uppercase text-[0.78rem] tracking-wide">
              Size
            </dt>
            <dd className="m-0 text-right font-semibold font-ui">
              {Math.max(1, Math.round(recording.fileSizeBytes / 1024))} KB
            </dd>
          </div>
        </dl>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button variant="secondary" onClick={toggleFavorite}>
          {recording.isFavorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button variant="ghost" onClick={deleteRecording}>
          Delete
        </Button>
      </div>
    </motion.div>
  );
};
