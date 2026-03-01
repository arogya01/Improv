import Dexie, { type Table } from "dexie";

import type { RecordingMeta, SyncQueueItem } from "@improv/core";

import type { LocalBlobRecord } from "./schema";

export const IMPROV_DB_NAME = "improv-pwa";
export const IMPROV_DB_VERSION = 2;

export class ImprovDatabase extends Dexie {
  recordings!: Table<RecordingMeta, string>;
  blobs!: Table<LocalBlobRecord, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor(name = IMPROV_DB_NAME) {
    super(name);

    this.version(1).stores({
      recordings: "&id, updatedAt, localDate, isFavorite",
      blobs: "&key, updatedAt, recordingId"
    });

    this.version(2).stores({
      recordings: "&id, updatedAt, localDate, isFavorite, syncStatus",
      blobs: "&key, updatedAt, recordingId",
      syncQueue: "&id, nextAttemptAt, kind, recordingId"
    });
  }
}

export function createImprovDatabase(name = IMPROV_DB_NAME): ImprovDatabase {
  return new ImprovDatabase(name);
}

export async function deleteImprovDatabase(name = IMPROV_DB_NAME): Promise<void> {
  await Dexie.delete(name);
}
