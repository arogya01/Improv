import { describe, expect, test } from "vitest";

import { buildRecordingMetaFromSession } from "../recording-service";
import type { PracticeSetupDraft } from "../types";

function buildDraft(overrides: Partial<PracticeSetupDraft> = {}): PracticeSetupDraft {
  return {
    promptPackId: "roulette-v1",
    prompt: null,
    selectedTopic: null,
    mediaType: "video",
    cameraFacing: "user",
    ...overrides
  };
}

describe("recording-service metadata mapping", () => {
  test("maps selected topic into compatibility prompt fields", () => {
    const draft = buildDraft({
      selectedTopic: {
        id: "topic-001",
        text: "Wrangled Earphones",
        category: "objects",
        tags: ["objects", "improv", "roulette"]
      }
    });

    const meta = buildRecordingMetaFromSession({
      sessionId: "session-1",
      startedAt: "2026-03-03T12:00:00.000Z",
      nowIso: "2026-03-03T12:01:05.000Z",
      elapsedMs: 58000,
      draft,
      mimeType: "video/webm",
      fileSizeBytes: 2048
    });

    expect(meta.promptPackId).toBe("roulette-v1");
    expect(meta.promptPackVersion).toBe(1);
    expect(meta.promptId).toBe("topic-001");
    expect(meta.mediaType).toBe("video");
    expect(meta.cameraFacing).toBe("user");
  });

  test("falls back to custom prompt id when no selected topic exists", () => {
    const draft = buildDraft({
      mediaType: "audio",
      cameraFacing: null,
      promptPackId: null,
      prompt: {
        id: "legacy-prompt",
        text: "Legacy prompt",
        tags: ["legacy"]
      }
    });

    const meta = buildRecordingMetaFromSession({
      sessionId: "session-2",
      startedAt: "2026-03-03T12:00:00.000Z",
      nowIso: "2026-03-03T12:00:59.000Z",
      elapsedMs: 59000,
      draft,
      mimeType: "audio/webm",
      fileSizeBytes: 1024
    });

    expect(meta.promptId).toBe("legacy-prompt");
    expect(meta.promptPackId).toBe("roulette-v1");
    expect(meta.mediaType).toBe("audio");
    expect(meta.cameraFacing).toBeUndefined();
  });
});
