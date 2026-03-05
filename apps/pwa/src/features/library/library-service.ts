import {
  createSyncState,
  transitionRecordingSyncStatus,
  validateRecordingMeta,
  type AuthState,
  type RecordingMeta,
  type RecordingSyncStatus
} from "@improv/core";

import { type ImprovDatabase } from "../../db/database";
import { DexieBlobRepository } from "../../db/repositories/blobs-repo";
import { DexieRecordingRepository } from "../../db/repositories/recordings-repo";
import { DexieSyncQueueRepository } from "../../db/repositories/sync-queue-repo";
import type {
  BlobRepository,
  RecordingListFilters,
  RecordingRepository,
  SyncQueueRepository
} from "../../db/schema";

export type SaveRecordingLocallyInput = {
  meta: RecordingMeta;
  blob: Blob;
  authState: AuthState;
  nowIso?: string;
};

export type ListLibraryItemsInput = {
  limit?: number;
  localDate?: string;
  favoritesOnly?: boolean;
  syncStatus?: RecordingSyncStatus;
};

type LibraryServiceOptions = {
  recordings?: RecordingRepository;
  blobs?: BlobRepository;
  syncQueue?: SyncQueueRepository;
};

function isAuthenticated(authState: AuthState): boolean {
  return authState.status === "authenticated";
}

function getLocalSaveEvent(authState: AuthState): { type: "LOCAL_SAVE_AS_GUEST" | "LOCAL_SAVE_WHILE_AUTHED" } {
  return isAuthenticated(authState)
    ? { type: "LOCAL_SAVE_WHILE_AUTHED" }
    : { type: "LOCAL_SAVE_AS_GUEST" };
}

function buildUploadQueueId(recordingId: string): string {
  return `upload:${recordingId}`;
}

export class LibraryService {
  private readonly recordings: RecordingRepository;
  private readonly blobs: BlobRepository;
  private readonly syncQueue: SyncQueueRepository;

  constructor(
    private readonly database: ImprovDatabase,
    options: LibraryServiceOptions = {}
  ) {
    this.recordings = options.recordings ?? new DexieRecordingRepository(database);
    this.blobs = options.blobs ?? new DexieBlobRepository(database);
    this.syncQueue = options.syncQueue ?? new DexieSyncQueueRepository(database);
  }

  async saveRecordingLocally(input: SaveRecordingLocallyInput): Promise<RecordingMeta> {
    const validatedMeta = validateRecordingMeta(input.meta);
    const nowIso = input.nowIso ?? new Date().toISOString();

    const initialStatus = createSyncState({ authenticated: isAuthenticated(input.authState) });
    const transition = transitionRecordingSyncStatus(initialStatus, getLocalSaveEvent(input.authState));

    if (transition.invalidTransition) {
      throw new Error(`Sync state transition failed: ${transition.invalidTransition.reason}`);
    }

    const syncStatus = transition.status;
    const recordingToPersistBase: RecordingMeta = {
      ...validatedMeta,
      syncStatus,
      updatedAt: nowIso
    };

    const recordingToPersist: RecordingMeta =
      input.authState.status === "authenticated"
        ? {
            ...recordingToPersistBase,
            ownerUserId: input.authState.userId
          }
        : recordingToPersistBase;

    if (recordingToPersist.fileSizeBytes !== input.blob.size) {
      throw new Error("Recording metadata fileSizeBytes does not match the blob size.");
    }

    if (input.blob.type && recordingToPersist.mimeType !== input.blob.type) {
      throw new Error("Recording metadata mimeType does not match blob.type.");
    }

    await this.database.transaction(
      "rw",
      this.database.recordings,
      this.database.blobs,
      this.database.syncQueue,
      async () => {
        await this.recordings.put(recordingToPersist);
        await this.blobs.put({
          key: recordingToPersist.localBlobKey,
          recordingId: recordingToPersist.id,
          blob: input.blob,
          mimeType: recordingToPersist.mimeType,
          sizeBytes: recordingToPersist.fileSizeBytes,
          createdAt: recordingToPersist.createdAt,
          updatedAt: nowIso
        });

        if (syncStatus === "pending_upload") {
          await this.syncQueue.enqueue({
            id: buildUploadQueueId(recordingToPersist.id),
            kind: "upload",
            recordingId: recordingToPersist.id,
            attempts: 0,
            nextAttemptAt: nowIso,
            createdAt: nowIso
          });
        }
      }
    );

    return recordingToPersist;
  }

  async deleteLocalRecording(recordingId: string): Promise<void> {
    await this.database.transaction(
      "rw",
      this.database.recordings,
      this.database.blobs,
      this.database.syncQueue,
      async () => {
        const existing = await this.recordings.getById(recordingId);
        if (!existing) {
          return;
        }

        await this.syncQueue.removeByRecordingId(recordingId);
        await this.blobs.deleteByKey(existing.localBlobKey);
        await this.blobs.deleteByRecordingId(recordingId);
        await this.recordings.deleteById(recordingId);
      }
    );
  }

  async listLibraryItems(input: ListLibraryItemsInput = {}): Promise<RecordingMeta[]> {
    const filters: RecordingListFilters = {};

    if (typeof input.limit === "number") {
      filters.limit = input.limit;
    }
    if (input.localDate) {
      filters.localDate = input.localDate;
    }
    if (input.favoritesOnly) {
      filters.isFavorite = true;
    }
    if (input.syncStatus) {
      filters.syncStatus = input.syncStatus;
    }

    return this.recordings.list(filters);
  }

  async getRecording(recordingId: string): Promise<RecordingMeta | undefined> {
    return this.recordings.getById(recordingId);
  }

  async getRecordingBlob(recordingId: string): Promise<Blob | undefined> {
    const recording = await this.recordings.getById(recordingId);
    if (!recording) {
      return undefined;
    }

    const blobRecord = await this.blobs.getByKey(recording.localBlobKey);
    return blobRecord?.blob;
  }

  async setFavorite(recordingId: string, isFavorite: boolean, updatedAt: string): Promise<boolean> {
    return this.recordings.updateFavorite(recordingId, isFavorite, updatedAt);
  }
}
