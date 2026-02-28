export type PracticeMode = "daily_challenge" | "free_practice";

export type MediaType = "audio" | "video";

export type CameraFacing = "user" | "environment";

export type RecordingSyncStatus =
  | "local_only"
  | "pending_upload"
  | "uploading"
  | "awaiting_finalize"
  | "synced"
  | "upload_failed"
  | "pending_delete"
  | "deleting_cloud"
  | "delete_failed";

export type AuthState =
  | { status: "guest" }
  | { status: "pending_email_verification" }
  | { status: "authenticated"; userId: string; email: string };

export type PromptItem = {
  id: string;
  text: string;
  tags: string[];
};

export type PromptPack = {
  id: string;
  name: string;
  version: number;
  items: PromptItem[];
};

export type DailyChallenge = {
  localDate: string;
  promptPackId: string;
  promptId: string;
  seedVersion: number;
};

export type RecordingMeta = {
  id: string;
  createdAt: string;
  updatedAt: string;
  localDate: string;
  practiceMode: PracticeMode;
  mediaType: MediaType;
  promptPackId: string;
  promptPackVersion: number;
  promptId: string;
  durationMs: number;
  timerTargetMs: 60000;
  mimeType: string;
  fileSizeBytes: number;
  isFavorite: boolean;
  isDailyShare: boolean;
  cameraFacing?: CameraFacing;
  videoWidth?: number;
  videoHeight?: number;
  localBlobKey: string;
  syncStatus: RecordingSyncStatus;
  ownerUserId?: string;
  cloudObjectKey?: string;
  cloudUploadedAt?: string;
  syncErrorCode?: string;
  syncErrorMessage?: string;
};

export type SyncQueueItem =
  | {
      id: string;
      kind: "upload";
      recordingId: string;
      attempts: number;
      nextAttemptAt: string;
      createdAt: string;
      lastError?: string;
    }
  | {
      id: string;
      kind: "finalize_upload";
      recordingId: string;
      attempts: number;
      nextAttemptAt: string;
      createdAt: string;
      uploadReceiptId: string;
      lastError?: string;
    }
  | {
      id: string;
      kind: "delete_cloud";
      recordingId: string;
      attempts: number;
      nextAttemptAt: string;
      createdAt: string;
      cloudObjectKey: string;
      lastError?: string;
    };

export type PracticeSessionStatus =
  | "idle"
  | "ready"
  | "recording"
  | "stopping"
  | "saving"
  | "saved"
  | "error";

export type PracticeInvalidTransition = {
  eventType: string;
  reason: string;
  previousStatus: PracticeSessionStatus;
};

export type PracticeSessionState = {
  status: PracticeSessionStatus;
  prompt: PromptItem | null;
  promptPackId: string | null;
  mediaType: MediaType | null;
  cameraFacing: CameraFacing | null;
  timerTargetMs: number;
  remainingMs: number;
  elapsedMs: number;
  lastTickDeltaMs: number | null;
  lastInvalidTransition: PracticeInvalidTransition | null;
  lastErrorMessage: string | null;
};

export type PracticeSessionEvent =
  | { type: "SELECT_PROMPT"; prompt: PromptItem; promptPackId?: string }
  | { type: "SELECT_MEDIA_TYPE"; mediaType: MediaType }
  | { type: "SELECT_CAMERA"; cameraFacing: CameraFacing }
  | { type: "START" }
  | { type: "TICK"; deltaMs: number }
  | { type: "TIME_UP" }
  | { type: "STOPPED" }
  | { type: "SAVE_OK" }
  | { type: "SAVE_ERR"; message?: string }
  | { type: "RESET" };

export type PracticeSessionInit = {
  timerTargetMs?: number;
  prompt?: PromptItem;
  promptPackId?: string;
  mediaType?: MediaType;
  cameraFacing?: CameraFacing;
};

export type SyncTransitionEvent =
  | { type: "LOCAL_SAVE_AS_GUEST" }
  | { type: "LOCAL_SAVE_WHILE_AUTHED" }
  | { type: "AUTH_ENABLED_FOR_LOCAL_ITEM" }
  | { type: "UPLOAD_BEGIN" }
  | { type: "UPLOAD_SUCCESS_AWAIT_FINALIZE" }
  | { type: "FINALIZE_SUCCESS" }
  | { type: "UPLOAD_FAIL" }
  | { type: "DELETE_REQUESTED" }
  | { type: "DELETE_CLOUD_BEGIN" }
  | { type: "DELETE_CLOUD_SUCCESS" }
  | { type: "DELETE_CLOUD_FAIL" };

export type SyncInvalidTransition = {
  eventType: SyncTransitionEvent["type"];
  reason: string;
  previousStatus: RecordingSyncStatus;
};

export type SyncTransitionResult = {
  status: RecordingSyncStatus;
  invalidTransition: SyncInvalidTransition | null;
  deleteCompleted: boolean;
};

export type CreateSyncStateInput = {
  authenticated: boolean;
};
