# Test Plan

## Phase 1 Scope
This document tracks tests for the shared domain and prompt engine foundation.

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

## Test Execution
- Primary command: `pnpm test`
- Fallback (targeted): `pnpm vitest run packages/core/src/__tests__ packages/prompt-packs/src/__tests__`

## Latest Phase 1 Execution Result
- Date: 2026-02-24 (local workspace session)
- `pnpm test`: passed (`6` test files, `25` tests)
- `pnpm typecheck`: passed

## Known Deferred Test Areas
- IndexedDB/Dexie integration (Phase 2)
- MediaRecorder/browser capability integration (Phase 3)
- UI flows and PWA runtime behavior (Phase 4+)
- Worker/D1/R2/auth integration (Phase 5+)
