import type { RecordingMeta, RecordingSyncStatus } from "@improv/core";
import type { ChipVariant } from "../components/primitives";

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function getSyncStatusMeta(status: RecordingSyncStatus): {
  label: string;
  variant: ChipVariant;
} {
  switch (status) {
    case "synced":
      return { label: "Backed up", variant: "success" };
    case "pending_upload":
      return { label: "Queued", variant: "warning" };
    case "uploading":
    case "awaiting_finalize":
      return { label: "Syncing", variant: "info" };
    case "upload_failed":
    case "delete_failed":
      return { label: "Needs retry", variant: "error" };
    case "pending_delete":
    case "deleting_cloud":
      return { label: "Deleting", variant: "warning" };
    case "local_only":
    default:
      return { label: "Saved locally", variant: "default" };
  }
}

export function getRecordingTitle(recording: RecordingMeta): string {
  const prefix = recording.mediaType === "video" ? "Video" : "Audio";
  const promptTitle = recording.promptId
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return `${prefix}: ${promptTitle}`;
}
