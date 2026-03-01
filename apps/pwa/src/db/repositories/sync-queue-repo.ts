import type { SyncQueueItem } from "@improv/core";

import type { ImprovDatabase } from "../database";
import type { SyncQueueRepository, UpdateSyncQueueAttemptInput } from "../schema";

export class DexieSyncQueueRepository implements SyncQueueRepository {
  constructor(private readonly database: ImprovDatabase) {}

  async enqueue(item: SyncQueueItem): Promise<void> {
    await this.database.syncQueue.put(item);
  }

  async getById(id: string): Promise<SyncQueueItem | undefined> {
    return this.database.syncQueue.get(id);
  }

  async listDue(nowIso: string, limit: number): Promise<SyncQueueItem[]> {
    const cappedLimit = Math.max(limit, 0);
    const dueItems = await this.database.syncQueue
      .where("nextAttemptAt")
      .belowOrEqual(nowIso)
      .toArray();

    return dueItems
      .sort((left, right) => {
        const attemptTimeCompare = left.nextAttemptAt.localeCompare(right.nextAttemptAt);
        if (attemptTimeCompare !== 0) {
          return attemptTimeCompare;
        }
        return left.createdAt.localeCompare(right.createdAt);
      })
      .slice(0, cappedLimit);
  }

  async listByRecordingId(recordingId: string): Promise<SyncQueueItem[]> {
    return this.database.syncQueue.where("recordingId").equals(recordingId).toArray();
  }

  async updateAttempt(input: UpdateSyncQueueAttemptInput): Promise<boolean> {
    const existing = await this.database.syncQueue.get(input.id);
    if (!existing) {
      return false;
    }

    const updated: SyncQueueItem =
      typeof input.lastError === "string"
        ? {
            ...existing,
            attempts: input.attempts,
            nextAttemptAt: input.nextAttemptAt,
            lastError: input.lastError
          }
        : {
            ...existing,
            attempts: input.attempts,
            nextAttemptAt: input.nextAttemptAt
          };

    await this.database.syncQueue.put(updated);
    return true;
  }

  async removeById(id: string): Promise<void> {
    await this.database.syncQueue.delete(id);
  }

  async removeByRecordingId(recordingId: string): Promise<void> {
    await this.database.syncQueue.where("recordingId").equals(recordingId).delete();
  }
}
