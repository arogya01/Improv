# Test Plan

## Scope
This document tracks tests for:
- Phase 1 shared domain + prompt engine (`packages/core`, `packages/prompt-packs`)
- Phase 2 local persistence (`apps/pwa` Dexie repositories + services)

## Implemented Test Coverage (Phase 1)

### `packages/core`
- Practice state machine transitions and invalid transition markers
- Sync status transitions (valid, invalid, delete-precedence behavior)
- Deterministic daily challenge prompt selection
- Free-practice seeded random selection and exclusion behavior
- Share text formatting stability
- Recording metadata schema validation (audio and video variants)

### `packages/prompt-packs`
- Bundled pack schema validation via `validatePromptPack`
- Pack ID uniqueness
- Prompt ID uniqueness within each pack
- Minimum prompt count per pack

## Implemented Test Coverage (Phase 2)

### `apps/pwa/src/db`
- Recording metadata CRUD, favorite toggles, and filtered listing
- Blob persistence and referential consistency checks (`recordingId` + `localBlobKey`)
- Sync queue due-item ordering (`nextAttemptAt`, then `createdAt`)
- Dexie schema migration smoke test (v1 open, then upgrade to v2)

### `apps/pwa/src/features`
- `saveRecordingLocally` guest path (`local_only`, no queue item)
- `saveRecordingLocally` authenticated path (`pending_upload`, upload queue item created)
- `listLibraryItems` filtering with favorites
- `deleteLocalRecording` cleanup of metadata + blob + queue items
- Validation failure behavior for invalid recording metadata
- Sync queue attempt marking and clear-by-recording behavior

## Test Execution
- Primary command: `pnpm test`
- Fallback (targeted): `pnpm vitest run packages/core/src/__tests__ packages/prompt-packs/src/__tests__ apps/pwa/src`

## Latest Phase 1 Execution Result
- Date: 2026-02-24 (local workspace session)
- `pnpm test`: passed (`6` test files, `25` tests)
- `pnpm typecheck`: passed

## Latest Phase 2 Execution Result
- Date: 2026-02-28 (local workspace session)
- `pnpm test`: passed (`9` test files, `35` tests; includes `apps/pwa` Dexie/service tests)
- `pnpm typecheck`: passed (includes `@improv/pwa` and `@improv/api-worker`)

## Known Deferred Test Areas
- MediaRecorder/browser capability integration (Phase 3)
- UI flows and PWA runtime behavior (Phase 4+)
- Worker/D1/R2/auth integration (Phase 5+)
