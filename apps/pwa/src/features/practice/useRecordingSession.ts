import { useState, useCallback, useRef, useEffect } from "react";
import {
  createPracticeSessionState,
  reducePracticeSession,
  type PracticeSessionInit,
  type PracticeSessionState,
  type AuthState
} from "@improv/core";

import type { FrontendRecordingService, SessionHandle } from "./recording-service";
import type { PracticeSetupDraft, RecordingSessionVm } from "./types";

export interface UseRecordingSessionProps {
  draft: PracticeSetupDraft;
  recordingService: FrontendRecordingService;
  authState: AuthState;
  onSaved?: () => void;
}

export function useRecordingSession({
  draft,
  recordingService,
  authState,
  onSaved
}: UseRecordingSessionProps) {
  const [state, setState] = useState<PracticeSessionState>(() => {
    const init: PracticeSessionInit = {
      timerTargetMs: 60000
    };

    if (draft.prompt) {
      init.prompt = draft.prompt;
    }
    if (draft.promptPackId) {
      init.promptPackId = draft.promptPackId;
    }
    if (draft.mediaType) {
      init.mediaType = draft.mediaType;
    }
    if (draft.cameraFacing) {
      init.cameraFacing = draft.cameraFacing;
    }

    return createPracticeSessionState(init);
  });

  const sessionHandleRef = useRef<SessionHandle | null>(null);
  const rAFRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>(60000);

  const dispatch = useCallback((event: Parameters<typeof reducePracticeSession>[1]) => {
    setState((current) => {
      const next = reducePracticeSession(current, event);
      remainingMsRef.current = next.remainingMs;
      return next;
    });
  }, []);

  const vm: RecordingSessionVm = {
    status: state.status,
    remainingMs: state.remainingMs,
    elapsedMs: state.elapsedMs,
    lastErrorMessage: state.lastErrorMessage
  };

  const startRecording = useCallback(async () => {
    try {
      const handle = await recordingService.beginSession(draft);
      sessionHandleRef.current = handle;
      lastTickTimeRef.current = performance.now();
      dispatch({ type: "START" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start session.";
      setState((current) => ({
        ...current,
        status: "error",
        lastErrorMessage: message,
        lastInvalidTransition: null
      }));
    }
  }, [dispatch, draft, recordingService]);

  const stopRecording = useCallback(() => {
    if (state.status === "recording") {
      dispatch({ type: "TIME_UP" });
    }
  }, [dispatch, state.status]);

  const cancelRecording = useCallback(() => {
    recordingService.abortSession();
    dispatch({ type: "RESET" });
  }, [dispatch, recordingService]);

  useEffect(() => {
    if (state.status === "stopping") {
      dispatch({ type: "STOPPED" });
    }
  }, [dispatch, state.status]);

  useEffect(() => {
    let active = true;

    if (state.status === "saving") {
      const save = async () => {
        if (!sessionHandleRef.current) {
          dispatch({ type: "SAVE_ERR", message: "Missing recording session handle." });
          return;
        }

        try {
          await recordingService.completeSession(sessionHandleRef.current, state.elapsedMs, authState);
          if (active) {
            dispatch({ type: "SAVE_OK" });
            onSaved?.();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to save recording.";
          if (active) {
            dispatch({ type: "SAVE_ERR", message });
          }
        }
      };

      save();
    }

    return () => {
      active = false;
    };
  }, [authState, dispatch, onSaved, recordingService, state.elapsedMs, state.status]);

  useEffect(() => {
    if (state.status !== "recording") {
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
      }
      return;
    }

    const tick = (now: number) => {
      if (!lastTickTimeRef.current) {
        lastTickTimeRef.current = now;
      }

      const deltaMs = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      if (deltaMs < 1000) {
        dispatch({ type: "TICK", deltaMs });
      }

      if (remainingMsRef.current > 0) {
        rAFRef.current = requestAnimationFrame(tick);
      } else {
        dispatch({ type: "TIME_UP" });
      }
    };

    lastTickTimeRef.current = performance.now();
    rAFRef.current = requestAnimationFrame(tick);

    return () => {
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [dispatch, state.status]);

  return {
    vm,
    startRecording,
    stopRecording,
    cancelRecording,
    getAdapter: () => recordingService.rawAdapter
  };
}
