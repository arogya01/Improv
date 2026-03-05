import { useState, useCallback, useRef, useEffect } from "react";
import {
    createPracticeSessionState,
    reducePracticeSession,
    type PracticeSessionState,
    type AuthState,
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
    onSaved,
}: UseRecordingSessionProps) {
    const [state, setState] = useState<PracticeSessionState>(() => {
        const initData: any = { timerTargetMs: 60000 };
        if (draft.prompt) initData.prompt = draft.prompt;
        if (draft.promptPackId) initData.promptPackId = draft.promptPackId;
        if (draft.mediaType) initData.mediaType = draft.mediaType;
        if (draft.cameraFacing) initData.cameraFacing = draft.cameraFacing;

        return createPracticeSessionState(initData);
    });

    const sessionHandleRef = useRef<SessionHandle | null>(null);
    const rAFRef = useRef<number | null>(null);
    const lastTickTimeRef = useRef<number | null>(null);
    const remainingMsRef = useRef<number>(60000);

    const dispatch = useCallback((event: Parameters<typeof reducePracticeSession>[1]) => {
        setState((s) => {
            const nextState = reducePracticeSession(s, event);
            remainingMsRef.current = nextState.remainingMs;
            return nextState;
        });
    }, []);

    const vm: RecordingSessionVm = {
        status: state.status,
        remainingMs: state.remainingMs,
        elapsedMs: state.elapsedMs,
        lastErrorMessage: state.lastErrorMessage,
    };

    const startRecording = useCallback(async () => {
        try {
            const handle = await recordingService.beginSession(draft);
            sessionHandleRef.current = handle;
            lastTickTimeRef.current = performance.now();
            dispatch({ type: "START" });
        } catch (err: any) {
            console.error("Failed to start session:", err);
        }
    }, [draft, recordingService, dispatch]);

    const stopRecording = useCallback(async () => {
        dispatch({ type: "STOPPED" });
    }, [dispatch]);

    const cancelRecording = useCallback(() => {
        if (sessionHandleRef.current) {
            recordingService.abortSession(sessionHandleRef.current);
        }
        dispatch({ type: "RESET" });
    }, [recordingService, dispatch]);

    useEffect(() => {
        let active = true;

        if (state.status === "stopping") {
            const save = async () => {
                if (!sessionHandleRef.current) return;
                try {
                    await recordingService.completeSession(
                        sessionHandleRef.current,
                        state.elapsedMs,
                        authState
                    );
                    if (active) {
                        dispatch({ type: "SAVE_OK" });
                        onSaved?.();
                    }
                } catch (err: any) {
                    if (active) {
                        dispatch({ type: "SAVE_ERR", message: err.message });
                    }
                }
            };
            save();
        }

        return () => {
            active = false;
        };
    }, [state.status, state.elapsedMs, recordingService, authState, dispatch, onSaved]);

    useEffect(() => {
        if (state.status !== "recording") {
            if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
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
            if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        };
    }, [state.status, dispatch]);

    return {
        vm,
        startRecording,
        stopRecording,
        cancelRecording,
        getAdapter: () => recordingService.rawAdapter,
    };
}
