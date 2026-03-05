import type { AuthState, PracticeMode, MediaType } from "@improv/core";
import { MediaCaptureAdapter } from "./media-capture";
import { LibraryService } from "../library/library-service";
import type { PracticeSetupDraft } from "./types";

export type SessionHandle = {
    id: string;
    draft: PracticeSetupDraft;
    startedAt: string;
};

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
            cameraFacing: draft.cameraFacing,
        });

        return {
            id: crypto.randomUUID(),
            draft,
            startedAt: new Date().toISOString(),
        };
    }

    async completeSession(
        handle: SessionHandle,
        elapsedMs: number,
        authState: AuthState
    ) {
        const { blob, mimeType } = await this.captureAdapter.stop();
        const nowIso = new Date().toISOString();

        const localBlobKey = `blob_practice_${handle.id}`;
        const practiceMode: PracticeMode = "free_practice";

        const meta = {
            id: handle.id,
            createdAt: handle.startedAt,
            updatedAt: nowIso,
            localDate: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD
            practiceMode,
            mediaType: handle.draft.mediaType as MediaType,
            promptPackId: handle.draft.promptPackId || "custom",
            promptPackVersion: 1,
            promptId: handle.draft.prompt?.id || "custom",
            durationMs: elapsedMs,
            timerTargetMs: 60000 as const,
            mimeType,
            fileSizeBytes: blob.size,
            isFavorite: false,
            isDailyShare: false,
            cameraFacing: handle.draft.cameraFacing || undefined,
            localBlobKey,
            syncStatus: "local_only" as const, // will be overwritten by service
        };

        return this.libraryService.saveRecordingLocally({
            meta: meta as any,
            blob,
            authState,
            nowIso,
        });
    }

    abortSession(handle: SessionHandle) {
        this.captureAdapter.cancel();
    }
}
