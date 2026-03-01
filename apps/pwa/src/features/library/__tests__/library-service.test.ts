import "fake-indexeddb/auto";

import { DomainValidationError } from "@improv/core";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { createImprovDatabase, deleteImprovDatabase } from "../../../db/database";
import { DexieBlobRepository } from "../../../db/repositories/blobs-repo";
import { DexieRecordingRepository } from "../../../db/repositories/recordings-repo";
import { DexieSyncQueueRepository } from "../../../db/repositories/sync-queue-repo";
import { LibraryService } from "../library-service";
import { buildRecordingMeta } from "../../../test-utils/recording-fixtures";

function dbName(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

describe("LibraryService", () => {
  let name: string;

  beforeEach(() => {
    name = dbName("library-db");
  });

  afterEach(async () => {
    await deleteImprovDatabase(name);
  });

  test("saves guest recordings as local_only without queueing uploads", async () => {
    const db = createImprovDatabase(name);
    const service = new LibraryService(db);
    const recordings = new DexieRecordingRepository(db);
    const blobs = new DexieBlobRepository(db);
    const queue = new DexieSyncQueueRepository(db);

    const blob = new Blob(["guest audio"], { type: "audio/webm" });
    const result = await service.saveRecordingLocally({
      meta: buildRecordingMeta(
        {
          id: "guest-recording",
          localBlobKey: "blob:guest-recording",
          mimeType: "audio/webm",
          fileSizeBytes: blob.size
        },
        "guest-recording"
      ),
      blob,
      authState: { status: "guest" },
      nowIso: "2026-02-28T12:00:00.000Z"
    });

    expect(result.syncStatus).toBe("local_only");
    expect((await recordings.getById("guest-recording"))?.syncStatus).toBe("local_only");
    expect((await blobs.getByKey("blob:guest-recording"))?.sizeBytes).toBe(blob.size);
    expect(await queue.listDue("2026-02-28T12:00:00.000Z", 10)).toHaveLength(0);

    db.close();
  });

  test("saves authenticated recordings as pending_upload and enqueues upload", async () => {
    const db = createImprovDatabase(name);
    const service = new LibraryService(db);
    const queue = new DexieSyncQueueRepository(db);

    const blob = new Blob(["video-bytes"], { type: "video/webm" });
    const result = await service.saveRecordingLocally({
      meta: buildRecordingMeta(
        {
          id: "authed-recording",
          localBlobKey: "blob:authed-recording",
          mediaType: "video",
          mimeType: "video/webm",
          fileSizeBytes: blob.size,
          cameraFacing: "user",
          videoWidth: 1280,
          videoHeight: 720
        },
        "authed-recording"
      ),
      blob,
      authState: {
        status: "authenticated",
        userId: "user-123",
        email: "user@example.com"
      },
      nowIso: "2026-02-28T12:30:00.000Z"
    });

    expect(result.syncStatus).toBe("pending_upload");
    expect(result.ownerUserId).toBe("user-123");

    const due = await queue.listDue("2026-02-28T12:30:00.000Z", 10);
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({
      kind: "upload",
      recordingId: "authed-recording"
    });

    db.close();
  });

  test("favorite updates are reflected in library filters", async () => {
    const db = createImprovDatabase(name);
    const service = new LibraryService(db);

    const firstBlob = new Blob(["one"], { type: "audio/webm" });
    const secondBlob = new Blob(["two"], { type: "audio/webm" });

    await service.saveRecordingLocally({
      meta: buildRecordingMeta(
        {
          id: "fav-1",
          localBlobKey: "blob:fav-1",
          fileSizeBytes: firstBlob.size,
          mimeType: "audio/webm",
          updatedAt: "2026-02-28T10:00:00.000Z"
        },
        "fav-1"
      ),
      blob: firstBlob,
      authState: { status: "guest" }
    });

    await service.saveRecordingLocally({
      meta: buildRecordingMeta(
        {
          id: "fav-2",
          localBlobKey: "blob:fav-2",
          fileSizeBytes: secondBlob.size,
          mimeType: "audio/webm",
          updatedAt: "2026-02-28T11:00:00.000Z"
        },
        "fav-2"
      ),
      blob: secondBlob,
      authState: { status: "guest" }
    });

    await service.setFavorite("fav-1", true, "2026-02-28T12:00:00.000Z");

    const favorites = await service.listLibraryItems({ favoritesOnly: true });
    expect(favorites.map((recording) => recording.id)).toEqual(["fav-1"]);

    db.close();
  });

  test("deleteLocalRecording removes metadata, blob, and queue entries", async () => {
    const db = createImprovDatabase(name);
    const service = new LibraryService(db);
    const recordings = new DexieRecordingRepository(db);
    const blobs = new DexieBlobRepository(db);
    const queue = new DexieSyncQueueRepository(db);

    const blob = new Blob(["delete me"], { type: "audio/webm" });
    await service.saveRecordingLocally({
      meta: buildRecordingMeta(
        {
          id: "delete-rec",
          localBlobKey: "blob:delete-rec",
          fileSizeBytes: blob.size,
          mimeType: "audio/webm"
        },
        "delete-rec"
      ),
      blob,
      authState: {
        status: "authenticated",
        userId: "user-delete",
        email: "delete@example.com"
      }
    });

    await service.deleteLocalRecording("delete-rec");

    expect(await recordings.getById("delete-rec")).toBeUndefined();
    expect(await blobs.getByKey("blob:delete-rec")).toBeUndefined();
    expect(await queue.listByRecordingId("delete-rec")).toHaveLength(0);

    db.close();
  });

  test("rejects invalid metadata before persisting", async () => {
    const db = createImprovDatabase(name);
    const service = new LibraryService(db);
    const recordings = new DexieRecordingRepository(db);

    const blob = new Blob(["invalid"], { type: "audio/webm" });
    const invalid = {
      ...buildRecordingMeta(
        {
          id: "invalid-meta",
          localBlobKey: "blob:invalid-meta",
          fileSizeBytes: blob.size,
          mimeType: "audio/webm"
        },
        "invalid-meta"
      ),
      timerTargetMs: 30000
    };

    await expect(
      service.saveRecordingLocally({
        meta: invalid as never,
        blob,
        authState: { status: "guest" }
      })
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(await recordings.getById("invalid-meta")).toBeUndefined();
    db.close();
  });
});
