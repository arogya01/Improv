import type { SyncQueueItem } from "@improv/core";

import { DexieSyncQueueRepository } from "../../db/repositories/sync-queue-repo";
import type { ImprovDatabase } from "../../db/database";
import type { SyncQueueRepository } from "../../db/schema";

export type MarkQueueAttemptInput = {
  id: string;
  attempts: number;
  nextAttemptAt: string;
  lastError?: string;
};

export class SyncQueueService {
  private readonly syncQueue: SyncQueueRepository;

  constructor(database: ImprovDatabase, syncQueue?: SyncQueueRepository) {
    this.syncQueue = syncQueue ?? new DexieSyncQueueRepository(database);
  }

  async listDueItems(nowIso: string, limit = 25): Promise<SyncQueueItem[]> {
    return this.syncQueue.listDue(nowIso, limit);
  }

  async markAttempt(input: MarkQueueAttemptInput): Promise<boolean> {
    return this.syncQueue.updateAttempt(input);
  }

  async clearForRecording(recordingId: string): Promise<void> {
    await this.syncQueue.removeByRecordingId(recordingId);
  }
}
