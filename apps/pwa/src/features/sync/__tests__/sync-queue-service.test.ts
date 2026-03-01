import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { createImprovDatabase, deleteImprovDatabase } from "../../../db/database";
import { DexieSyncQueueRepository } from "../../../db/repositories/sync-queue-repo";
import { SyncQueueService } from "../sync-queue-service";

function dbName(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

describe("SyncQueueService", () => {
  let name: string;

  beforeEach(() => {
    name = dbName("sync-service-db");
  });

  afterEach(async () => {
    await deleteImprovDatabase(name);
  });

  test("updates queue attempts and clears by recording id", async () => {
    const db = createImprovDatabase(name);
    const queue = new DexieSyncQueueRepository(db);
    const service = new SyncQueueService(db, queue);

    await queue.enqueue({
      id: "upload:r1",
      kind: "upload",
      recordingId: "r1",
      attempts: 0,
      nextAttemptAt: "2026-02-28T10:00:00.000Z",
      createdAt: "2026-02-28T10:00:00.000Z"
    });

    const updated = await service.markAttempt({
      id: "upload:r1",
      attempts: 1,
      nextAttemptAt: "2026-02-28T10:30:00.000Z",
      lastError: "network_timeout"
    });

    expect(updated).toBe(true);
    const due = await service.listDueItems("2026-02-28T10:30:00.000Z", 10);
    expect(due[0]?.attempts).toBe(1);
    expect(due[0]?.lastError).toBe("network_timeout");

    await service.clearForRecording("r1");
    expect(await queue.listByRecordingId("r1")).toHaveLength(0);

    db.close();
  });
});
