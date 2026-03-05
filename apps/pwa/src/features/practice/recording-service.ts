import type { AuthState, MediaType, RecordingMeta } from "@improv/core";

import type { RouletteTopic } from "../topics";
import { MediaCaptureAdapter } from "./media-capture";
import { LibraryService } from "../library/library-service";
import type { PracticeSetupDraft } from "./types";

export type SessionHandle = {
  id: string;
  draft: PracticeSetupDraft;
  startedAt: string;
};

export type BuildRecordingMetaInput = {
  sessionId: string;
  startedAt: string;
  nowIso: string;
  elapsedMs: number;
  draft: PracticeSetupDraft;
  mimeType: string;
  fileSizeBytes: number;
};

function resolveTopic(draft: PracticeSetupDraft): RouletteTopic | null {
  if (draft.selectedTopic) {
    return draft.selectedTopic;
  }

  if (!draft.prompt) {
    return null;
  }

  return {
    id: draft.prompt.id,
    text: draft.prompt.text,
    category: "situations",
    tags: draft.prompt.tags
  };
}

export function buildRecordingMetaFromSession(input: BuildRecordingMetaInput): RecordingMeta {
  const topic = resolveTopic(input.draft);
  const promptPackId = topic ? "roulette-v1" : input.draft.promptPackId ?? "custom";
  const base: RecordingMeta = {
    id: input.sessionId,
    createdAt: input.startedAt,
    updatedAt: input.nowIso,
    localDate: new Date(input.nowIso).toLocaleDateString("en-CA"),
    practiceMode: "free_practice",
    mediaType: input.draft.mediaType as MediaType,
    promptPackId,
    promptPackVersion: 1,
    promptId: topic?.id ?? input.draft.prompt?.id ?? "custom",
    durationMs: input.elapsedMs,
    timerTargetMs: 60000,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    isFavorite: false,
    isDailyShare: false,
    localBlobKey: `blob_practice_${input.sessionId}`,
    syncStatus: "local_only"
  };

  if (input.draft.mediaType === "video" && input.draft.cameraFacing) {
    return {
      ...base,
      cameraFacing: input.draft.cameraFacing
    };
  }

  return base;
}

export class FrontendRecordingService {
  private captureAdapter: MediaCaptureAdapter;

  constructor(private libraryService: LibraryService) {
    this.captureAdapter = new MediaCaptureAdapter();
  }

  get rawAdapter() {
    return this.captureAdapter;
  }

  async beginSession(draft: PracticeSetupDraft): Promise<SessionHandle> {
    if (!draft.mediaType) {
      throw new Error("Media type is required to begin a session.");
    }

    await this.captureAdapter.start({
      mediaType: draft.mediaType,
      cameraFacing: draft.cameraFacing
    });

    return {
      id: crypto.randomUUID(),
      draft,
      startedAt: new Date().toISOString()
    };
  }

  async completeSession(handle: SessionHandle, elapsedMs: number, authState: AuthState) {
    const { blob, mimeType } = await this.captureAdapter.stop();
    const nowIso = new Date().toISOString();

    const meta = buildRecordingMetaFromSession({
      sessionId: handle.id,
      startedAt: handle.startedAt,
      nowIso,
      elapsedMs,
      draft: handle.draft,
      mimeType,
      fileSizeBytes: blob.size
    });

    return this.libraryService.saveRecordingLocally({
      meta,
      blob,
      authState,
      nowIso
    });
  }

  abortSession(): void {
    this.captureAdapter.cancel();
  }
}
