import type {
  CameraFacing,
  MediaType,
  PromptItem,
  PracticeSessionStatus
} from "@improv/core";

import type { RouletteTopic } from "../topics";

export type PracticeSetupDraft = {
  promptPackId: string | null;
  prompt: PromptItem | null;
  selectedTopic: RouletteTopic | null;
  mediaType: MediaType | null;
  cameraFacing: CameraFacing | null;
};

export type RecordingSessionVm = {
  status: PracticeSessionStatus;
  remainingMs: number;
  elapsedMs: number;
  lastErrorMessage: string | null;
};
