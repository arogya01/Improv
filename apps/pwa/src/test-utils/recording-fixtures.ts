import type { RecordingMeta } from "@improv/core";

export function buildRecordingMeta(
  overrides: Partial<RecordingMeta> = {},
  id = "recording-1"
): RecordingMeta {
  const mediaType = overrides.mediaType ?? "audio";
  const localBlobKey = overrides.localBlobKey ?? `blob:${id}`;
  const mimeType = overrides.mimeType ?? (mediaType === "video" ? "video/webm" : "audio/webm");
  const defaultFileSizeBytes = overrides.fileSizeBytes ?? 12;

  const optionalFields: Partial<RecordingMeta> = {};
  if (overrides.cameraFacing) {
    optionalFields.cameraFacing = overrides.cameraFacing;
  }
  if (typeof overrides.videoWidth === "number") {
    optionalFields.videoWidth = overrides.videoWidth;
  }
  if (typeof overrides.videoHeight === "number") {
    optionalFields.videoHeight = overrides.videoHeight;
  }
  if (overrides.ownerUserId) {
    optionalFields.ownerUserId = overrides.ownerUserId;
  }
  if (overrides.cloudObjectKey) {
    optionalFields.cloudObjectKey = overrides.cloudObjectKey;
  }
  if (overrides.cloudUploadedAt) {
    optionalFields.cloudUploadedAt = overrides.cloudUploadedAt;
  }
  if (overrides.syncErrorCode) {
    optionalFields.syncErrorCode = overrides.syncErrorCode;
  }
  if (overrides.syncErrorMessage) {
    optionalFields.syncErrorMessage = overrides.syncErrorMessage;
  }

  return {
    id,
    createdAt: overrides.createdAt ?? "2026-02-28T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-02-28T00:00:00.000Z",
    localDate: overrides.localDate ?? "2026-02-28",
    practiceMode: overrides.practiceMode ?? "free_practice",
    mediaType,
    promptPackId: overrides.promptPackId ?? "objects",
    promptPackVersion: overrides.promptPackVersion ?? 1,
    promptId: overrides.promptId ?? "object-1",
    durationMs: overrides.durationMs ?? 60000,
    timerTargetMs: 60000,
    mimeType,
    fileSizeBytes: defaultFileSizeBytes,
    isFavorite: overrides.isFavorite ?? false,
    isDailyShare: overrides.isDailyShare ?? false,
    localBlobKey,
    syncStatus: overrides.syncStatus ?? "local_only",
    ...optionalFields
  };
}
