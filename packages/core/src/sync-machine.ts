import type {
  CreateSyncStateInput,
  RecordingSyncStatus,
  SyncTransitionEvent,
  SyncTransitionResult
} from "./types.js";

const DELETE_FLOW_STATUSES: readonly RecordingSyncStatus[] = [
  "pending_delete",
  "deleting_cloud",
  "delete_failed"
];

const UPLOAD_FLOW_EVENT_TYPES = new Set<SyncTransitionEvent["type"]>([
  "UPLOAD_BEGIN",
  "UPLOAD_SUCCESS_AWAIT_FINALIZE",
  "FINALIZE_SUCCESS",
  "UPLOAD_FAIL",
  "AUTH_ENABLED_FOR_LOCAL_ITEM"
]);

function invalid(
  status: RecordingSyncStatus,
  event: SyncTransitionEvent,
  reason: string
): SyncTransitionResult {
  return {
    status,
    invalidTransition: {
      eventType: event.type,
      reason,
      previousStatus: status
    },
    deleteCompleted: false
  };
}

function ok(status: RecordingSyncStatus, deleteCompleted = false): SyncTransitionResult {
  return {
    status,
    invalidTransition: null,
    deleteCompleted
  };
}

function isDeleteFlow(status: RecordingSyncStatus): boolean {
  return DELETE_FLOW_STATUSES.includes(status);
}

export function createSyncState(input: CreateSyncStateInput): RecordingSyncStatus {
  return input.authenticated ? "pending_upload" : "local_only";
}

export function transitionRecordingSyncStatus(
  status: RecordingSyncStatus,
  event: SyncTransitionEvent
): SyncTransitionResult {
  if (isDeleteFlow(status) && UPLOAD_FLOW_EVENT_TYPES.has(event.type)) {
    return invalid(status, event, "Delete flow takes precedence over upload transitions.");
  }

  switch (event.type) {
    case "LOCAL_SAVE_AS_GUEST":
      return ok("local_only");
    case "LOCAL_SAVE_WHILE_AUTHED":
      return ok("pending_upload");
    case "AUTH_ENABLED_FOR_LOCAL_ITEM":
      if (status !== "local_only") {
        return invalid(status, event, "AUTH_ENABLED_FOR_LOCAL_ITEM only applies to local_only.");
      }
      return ok("pending_upload");
    case "UPLOAD_BEGIN":
      if (!["pending_upload", "upload_failed"].includes(status)) {
        return invalid(status, event, "UPLOAD_BEGIN requires pending_upload or upload_failed.");
      }
      return ok("uploading");
    case "UPLOAD_SUCCESS_AWAIT_FINALIZE":
      if (status !== "uploading") {
        return invalid(status, event, "UPLOAD_SUCCESS_AWAIT_FINALIZE requires uploading.");
      }
      return ok("awaiting_finalize");
    case "FINALIZE_SUCCESS":
      if (status !== "awaiting_finalize") {
        return invalid(status, event, "FINALIZE_SUCCESS requires awaiting_finalize.");
      }
      return ok("synced");
    case "UPLOAD_FAIL":
      if (!["uploading", "awaiting_finalize"].includes(status)) {
        return invalid(status, event, "UPLOAD_FAIL requires uploading or awaiting_finalize.");
      }
      return ok("upload_failed");
    case "DELETE_REQUESTED":
      return ok("pending_delete");
    case "DELETE_CLOUD_BEGIN":
      if (!["pending_delete", "delete_failed"].includes(status)) {
        return invalid(status, event, "DELETE_CLOUD_BEGIN requires pending_delete or delete_failed.");
      }
      return ok("deleting_cloud");
    case "DELETE_CLOUD_SUCCESS":
      if (status !== "deleting_cloud") {
        return invalid(status, event, "DELETE_CLOUD_SUCCESS requires deleting_cloud.");
      }
      return ok("pending_delete", true);
    case "DELETE_CLOUD_FAIL":
      if (status !== "deleting_cloud") {
        return invalid(status, event, "DELETE_CLOUD_FAIL requires deleting_cloud.");
      }
      return ok("delete_failed");
    default:
      return invalid(status, event, "Unknown sync transition event.");
  }
}
