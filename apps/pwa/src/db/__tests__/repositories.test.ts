import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { createImprovDatabase, deleteImprovDatabase } from "../database";
import { DexieBlobRepository } from "../repositories/blobs-repo";
import { DexieRecordingRepository } from "../repositories/recordings-repo";
import { DexieSyncQueueRepository } from "../repositories/sync-queue-repo";
import { buildRecordingMeta } from "../../test-utils/recording-fixtures";

function dbName(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

describe("Dexie repositories", () => {
  let name: string;

  beforeEach(() => {
    name = dbName("repo-db");
  });

  afterEach(async () => {
    await deleteImprovDatabase(name);
  });

  test("supports recording CRUD, favorite toggle, and filtered listing", async () => {
    const db = createImprovDatabase(name);
    const recordings = new DexieRecordingRepository(db);

    const first = buildRecordingMeta(
      {
        id: "r1",
        localBlobKey: "blob:r1",
        updatedAt: "2026-02-28T10:00:00.000Z",
        localDate: "2026-02-28"
      },
      "r1"
    );
    const second = buildRecordingMeta(
      {
        id: "r2",
        localBlobKey: "blob:r2",
        updatedAt: "2026-02-28T11:00:00.000Z",
        localDate: "2026-02-27",
        isFavorite: true
      },
      "r2"
    );

    await recordings.put(first);
    await recordings.put(second);

    const loaded = await recordings.getById("r1");
    expect(loaded?.id).toBe("r1");

    const all = await recordings.list();
    expect(all.map((recording) => recording.id)).toEqual(["r2", "r1"]);

    const favoritesOnly = await recordings.list({ isFavorite: true });
    expect(favoritesOnly.map((recording) => recording.id)).toEqual(["r2"]);

    const onDate = await recordings.list({ localDate: "2026-02-28" });
    expect(onDate.map((recording) => recording.id)).toEqual(["r1"]);

    const updated = await recordings.updateFavorite("r1", true, "2026-02-28T12:00:00.000Z");
    expect(updated).toBe(true);

    const favoritesAfterUpdate = await recordings.list({ isFavorite: true });
    expect(favoritesAfterUpdate.map((recording) => recording.id)).toEqual(["r1", "r2"]);

    await recordings.deleteById("r1");
    expect(await recordings.getById("r1")).toBeUndefined();

    db.close();
  });

  test("stores and deletes blobs by key while enforcing recording linkage", async () => {
    const db = createImprovDatabase(name);
    const recordings = new DexieRecordingRepository(db);
    const blobs = new DexieBlobRepository(db);

    const recording = buildRecordingMeta({ id: "blob-rec", localBlobKey: "blob:blob-rec" }, "blob-rec");
    await recordings.put(recording);

    const blob = new Blob(["hello"], { type: "audio/webm" });
    await blobs.put({
      key: "blob:blob-rec",
      recordingId: "blob-rec",
      blob,
      mimeType: "audio/webm",
      sizeBytes: blob.size,
      createdAt: "2026-02-28T10:00:00.000Z",
      updatedAt: "2026-02-28T10:00:00.000Z"
    });

    const stored = await blobs.getByKey("blob:blob-rec");
    expect(stored?.sizeBytes).toBe(blob.size);

    await expect(
      blobs.put({
        key: "blob:mismatch",
        recordingId: "blob-rec",
        blob,
        mimeType: "audio/webm",
        sizeBytes: blob.size,
        createdAt: "2026-02-28T10:00:00.000Z",
        updatedAt: "2026-02-28T10:00:00.000Z"
      })
    ).rejects.toThrow("Blob key");

    await blobs.deleteByKey("blob:blob-rec");
    expect(await blobs.getByKey("blob:blob-rec")).toBeUndefined();

    db.close();
  });

  test("returns due sync queue items ordered by nextAttemptAt then createdAt", async () => {
    const db = createImprovDatabase(name);
    const syncQueue = new DexieSyncQueueRepository(db);

    await syncQueue.enqueue({
      id: "q2",
      kind: "upload",
      recordingId: "r2",
      attempts: 1,
      nextAttemptAt: "2026-02-28T11:00:00.000Z",
      createdAt: "2026-02-28T11:00:00.000Z"
    });
    await syncQueue.enqueue({
      id: "q1",
      kind: "upload",
      recordingId: "r1",
      attempts: 0,
      nextAttemptAt: "2026-02-28T10:00:00.000Z",
      createdAt: "2026-02-28T10:00:01.000Z"
    });
    await syncQueue.enqueue({
      id: "q0",
      kind: "upload",
      recordingId: "r0",
      attempts: 2,
      nextAttemptAt: "2026-02-28T10:00:00.000Z",
      createdAt: "2026-02-28T10:00:00.000Z"
    });

    const due = await syncQueue.listDue("2026-02-28T11:00:00.000Z", 10);
    expect(due.map((item) => item.id)).toEqual(["q0", "q1", "q2"]);

    db.close();
  });

  test("migrates schema from v1 to v2 and preserves existing data", async () => {
    const migrationDbName = dbName("migration-db");
    const legacy = new Dexie(migrationDbName);

    legacy.version(1).stores({
      recordings: "&id, updatedAt, localDate, isFavorite",
      blobs: "&key, updatedAt, recordingId"
    });

    await legacy.open();
    await legacy.table("recordings").put(
      buildRecordingMeta(
        {
          id: "legacy-recording",
          localBlobKey: "blob:legacy-recording"
        },
        "legacy-recording"
      )
    );
    legacy.close();

    const db = createImprovDatabase(migrationDbName);
    await db.open();

    const migratedRecording = await db.recordings.get("legacy-recording");
    expect(migratedRecording?.id).toBe("legacy-recording");

    await db.syncQueue.put({
      id: "q-migrated",
      kind: "upload",
      recordingId: "legacy-recording",
      attempts: 0,
      nextAttemptAt: "2026-02-28T10:00:00.000Z",
      createdAt: "2026-02-28T10:00:00.000Z"
    });
    expect(await db.syncQueue.count()).toBe(1);

    db.close();
    await deleteImprovDatabase(migrationDbName);
  });
});
