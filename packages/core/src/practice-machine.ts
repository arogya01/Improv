import { InvalidTransitionError } from "./errors.js";
import type {
  PracticeInvalidTransition,
  PracticeSessionEvent,
  PracticeSessionInit,
  PracticeSessionState
} from "./types.js";

const DEFAULT_TIMER_TARGET_MS = 60000;

function computeSelectableStatus(state: PracticeSessionState): "idle" | "ready" {
  return state.prompt && state.mediaType ? "ready" : "idle";
}

function clearTransient(state: PracticeSessionState): PracticeSessionState {
  return {
    ...state,
    lastInvalidTransition: null,
    lastErrorMessage: null
  };
}

function markInvalidTransition(
  state: PracticeSessionState,
  event: PracticeSessionEvent,
  reason: string
): PracticeSessionState {
  const error = new InvalidTransitionError(
    `Invalid practice transition from ${state.status} via ${event.type}: ${reason}`
  );
  const marker: PracticeInvalidTransition = {
    eventType: event.type,
    reason: error.message,
    previousStatus: state.status
  };

  return {
    ...state,
    lastInvalidTransition: marker
  };
}

function applySelectableUpdate(state: PracticeSessionState): PracticeSessionState {
  if (state.status === "recording" || state.status === "stopping" || state.status === "saving") {
    return state;
  }

  return {
    ...state,
    status: computeSelectableStatus(state)
  };
}

export function createPracticeSessionState(input: PracticeSessionInit = {}): PracticeSessionState {
  const timerTargetMs = input.timerTargetMs ?? DEFAULT_TIMER_TARGET_MS;
  const initial: PracticeSessionState = {
    status: "idle",
    prompt: input.prompt ?? null,
    promptPackId: input.promptPackId ?? null,
    mediaType: input.mediaType ?? null,
    cameraFacing: input.cameraFacing ?? null,
    timerTargetMs,
    remainingMs: timerTargetMs,
    elapsedMs: 0,
    lastTickDeltaMs: null,
    lastInvalidTransition: null,
    lastErrorMessage: null
  };

  return applySelectableUpdate(initial);
}

export function reducePracticeSession(
  state: PracticeSessionState,
  event: PracticeSessionEvent
): PracticeSessionState {
  switch (event.type) {
    case "SELECT_PROMPT": {
      if (state.status === "recording" || state.status === "stopping" || state.status === "saving") {
        return markInvalidTransition(state, event, "Cannot change prompt while a recording is active.");
      }

      return applySelectableUpdate(
        clearTransient({
          ...state,
          prompt: event.prompt,
          promptPackId: event.promptPackId ?? state.promptPackId
        })
      );
    }

    case "SELECT_MEDIA_TYPE": {
      if (state.status === "recording" || state.status === "stopping" || state.status === "saving") {
        return markInvalidTransition(state, event, "Cannot change media type while a recording is active.");
      }

      return applySelectableUpdate(
        clearTransient({
          ...state,
          mediaType: event.mediaType,
          cameraFacing: event.mediaType === "video" ? state.cameraFacing : null
        })
      );
    }

    case "SELECT_CAMERA": {
      if (state.status === "recording" || state.status === "stopping" || state.status === "saving") {
        return markInvalidTransition(state, event, "Cannot change camera while a recording is active.");
      }
      if (state.mediaType !== "video") {
        return markInvalidTransition(state, event, "Camera can only be selected in video mode.");
      }

      return clearTransient({
        ...state,
        cameraFacing: event.cameraFacing
      });
    }

    case "START": {
      if (state.status !== "ready" || !state.prompt || !state.mediaType) {
        return markInvalidTransition(state, event, "Prompt and media type must be selected before starting.");
      }

      return clearTransient({
        ...state,
        status: "recording",
        remainingMs: state.timerTargetMs,
        elapsedMs: 0,
        lastTickDeltaMs: null
      });
    }

    case "TICK": {
      if (state.status !== "recording") {
        return markInvalidTransition(state, event, "Tick events are only valid while recording.");
      }

      const deltaMs = Math.max(0, Math.floor(event.deltaMs));
      const elapsedMs = Math.min(state.timerTargetMs, state.elapsedMs + deltaMs);
      const remainingMs = Math.max(0, state.timerTargetMs - elapsedMs);

      return clearTransient({
        ...state,
        elapsedMs,
        remainingMs,
        lastTickDeltaMs: deltaMs
      });
    }

    case "TIME_UP": {
      if (state.status !== "recording") {
        return markInvalidTransition(state, event, "TIME_UP is only valid while recording.");
      }

      return clearTransient({
        ...state,
        status: "stopping",
        elapsedMs: state.timerTargetMs,
        remainingMs: 0
      });
    }

    case "STOPPED": {
      if (state.status !== "stopping") {
        return markInvalidTransition(state, event, "STOPPED is only valid after stopping.");
      }

      return clearTransient({
        ...state,
        status: "saving"
      });
    }

    case "SAVE_OK": {
      if (state.status !== "saving") {
        return markInvalidTransition(state, event, "SAVE_OK is only valid while saving.");
      }

      return clearTransient({
        ...state,
        status: "saved"
      });
    }

    case "SAVE_ERR": {
      if (state.status !== "saving") {
        return markInvalidTransition(state, event, "SAVE_ERR is only valid while saving.");
      }

      return {
        ...state,
        status: "error",
        lastErrorMessage: event.message ?? "Failed to save recording.",
        lastInvalidTransition: null
      };
    }

    case "RESET": {
      const resetInit: PracticeSessionInit = {
        timerTargetMs: state.timerTargetMs
      };

      if (state.mediaType) {
        resetInit.mediaType = state.mediaType;
      }
      if (state.cameraFacing) {
        resetInit.cameraFacing = state.cameraFacing;
      }

      return createPracticeSessionState(resetInit);
    }

    default: {
      return state;
    }
  }
}
