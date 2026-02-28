import { describe, expect, it } from "vitest";

import { createSyncState, transitionRecordingSyncStatus } from "../sync-machine.js";
import type { RecordingSyncStatus } from "../types.js";

describe("sync machine", () => {
  it("creates initial status from auth state", () => {
    expect(createSyncState({ authenticated: false })).toBe("local_only");
    expect(createSyncState({ authenticated: true })).toBe("pending_upload");
  });

  it("supports guest -> auth -> synced transitions", () => {
    let status: RecordingSyncStatus = "local_only";

    let result = transitionRecordingSyncStatus(status, { type: "AUTH_ENABLED_FOR_LOCAL_ITEM" });
    status = result.status;
    expect(status).toBe("pending_upload");
    expect(result.invalidTransition).toBeNull();

    result = transitionRecordingSyncStatus(status, { type: "UPLOAD_BEGIN" });
    status = result.status;
    expect(status).toBe("uploading");

    result = transitionRecordingSyncStatus(status, { type: "UPLOAD_SUCCESS_AWAIT_FINALIZE" });
    status = result.status;
    expect(status).toBe("awaiting_finalize");

    result = transitionRecordingSyncStatus(status, { type: "FINALIZE_SUCCESS" });
    status = result.status;
    expect(status).toBe("synced");
  });

  it("rejects invalid FINALIZE_SUCCESS transition", () => {
    const result = transitionRecordingSyncStatus("pending_upload", { type: "FINALIZE_SUCCESS" });

    expect(result.status).toBe("pending_upload");
    expect(result.invalidTransition?.eventType).toBe("FINALIZE_SUCCESS");
  });

  it("delete flow takes precedence over upload events", () => {
    const result = transitionRecordingSyncStatus("pending_delete", { type: "UPLOAD_BEGIN" });

    expect(result.status).toBe("pending_delete");
    expect(result.invalidTransition?.reason).toContain("Delete flow takes precedence");
  });

  it("marks delete completion after cloud delete succeeds", () => {
    const begin = transitionRecordingSyncStatus("pending_delete", { type: "DELETE_CLOUD_BEGIN" });
    const done = transitionRecordingSyncStatus(begin.status, { type: "DELETE_CLOUD_SUCCESS" });

    expect(done.status).toBe("pending_delete");
    expect(done.deleteCompleted).toBe(true);
  });
});
