import type { RecordingMeta, RecordingSyncStatus, SyncQueueItem } from "@improv/core";

export type LocalBlobRecord = {
  key: string;
  recordingId: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

export type RecordingListFilters = {
  limit?: number;
  localDate?: string;
  isFavorite?: boolean;
  syncStatus?: RecordingSyncStatus;
};

export interface RecordingRepository {
  put(recording: RecordingMeta): Promise<void>;
  getById(recordingId: string): Promise<RecordingMeta | undefined>;
  list(filters?: RecordingListFilters): Promise<RecordingMeta[]>;
  deleteById(recordingId: string): Promise<void>;
  updateFavorite(recordingId: string, isFavorite: boolean, updatedAt: string): Promise<boolean>;
}

export type PutBlobInput = {
  key: string;
  recordingId: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

export interface BlobRepository {
  put(input: PutBlobInput): Promise<void>;
  getByKey(key: string): Promise<LocalBlobRecord | undefined>;
  deleteByKey(key: string): Promise<void>;
  deleteByRecordingId(recordingId: string): Promise<void>;
}

export type UpdateSyncQueueAttemptInput = {
  id: string;
  attempts: number;
  nextAttemptAt: string;
  lastError?: string;
};

export interface SyncQueueRepository {
  enqueue(item: SyncQueueItem): Promise<void>;
  getById(id: string): Promise<SyncQueueItem | undefined>;
  listDue(nowIso: string, limit: number): Promise<SyncQueueItem[]>;
  listByRecordingId(recordingId: string): Promise<SyncQueueItem[]>;
  updateAttempt(input: UpdateSyncQueueAttemptInput): Promise<boolean>;
  removeById(id: string): Promise<void>;
  removeByRecordingId(recordingId: string): Promise<void>;
}
