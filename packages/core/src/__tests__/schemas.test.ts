import { describe, expect, it } from "vitest";

import { DomainValidationError } from "../errors.js";
import { validateRecordingMeta } from "../schemas.js";
import type { RecordingMeta } from "../types.js";

function createBaseMeta(overrides: Partial<RecordingMeta> = {}): RecordingMeta {
  return {
    id: "rec_01",
    createdAt: "2026-02-24T10:00:00.000Z",
    updatedAt: "2026-02-24T10:01:00.000Z",
    localDate: "2026-02-24",
    practiceMode: "free_practice",
    mediaType: "audio",
    promptPackId: "objects",
    promptPackVersion: 1,
    promptId: "objects_01",
    durationMs: 60000,
    timerTargetMs: 60000,
    mimeType: "audio/webm",
    fileSizeBytes: 12345,
    isFavorite: false,
    isDailyShare: false,
    localBlobKey: "blob_rec_01",
    syncStatus: "local_only",
    ...overrides
  };
}

describe("schemas", () => {
  it("validates a recording metadata object", () => {
    const parsed = validateRecordingMeta(createBaseMeta());

    expect(parsed.id).toBe("rec_01");
    expect(parsed.mediaType).toBe("audio");
  });

  it("rejects invalid localDate", () => {
    expect(() =>
      validateRecordingMeta(
        createBaseMeta({
          localDate: "2026-02-30"
        })
      )
    ).toThrow(DomainValidationError);
  });

  it("accepts video-specific metadata for video recordings", () => {
    const parsed = validateRecordingMeta(
      createBaseMeta({
        mediaType: "video",
        mimeType: "video/webm",
        cameraFacing: "user",
        videoWidth: 720,
        videoHeight: 1280
      })
    );

    expect(parsed.mediaType).toBe("video");
    expect(parsed.cameraFacing).toBe("user");
    expect(parsed.videoWidth).toBe(720);
  });

  it("accepts audio metadata with video fields omitted", () => {
    const parsed = validateRecordingMeta(createBaseMeta());

    expect(parsed.mediaType).toBe("audio");
    expect(parsed.cameraFacing).toBeUndefined();
    expect(parsed.videoWidth).toBeUndefined();
    expect(parsed.videoHeight).toBeUndefined();
  });
});
