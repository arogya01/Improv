# Decision Trail

## 2026-02-24 / 2026-02-25 - PWA improv MVP Phase 1 foundation

### Decision
Execute a minimal bootstrap (workspace + TypeScript + Vitest) before Phase 1 domain logic.

### Options considered
- Wait and do full app scaffolding first
- Minimal bootstrap for package-only Phase 1
- Implement raw files without test tooling

### Chosen option
Minimal bootstrap for package-only Phase 1.

### Why
The repository only contained `PLAN.md` and `skills-lock.json`, and Phase 1 requires testable TypeScript packages (`packages/core`, `packages/prompt-packs`).

### Risks
- Some Phase 0 tooling choices might need adjustment later when the PWA and Worker apps are added.

### Revisit trigger
- When Phase 0/Phase 4 app scaffolding is introduced and workspace tooling needs alignment.

### Phase 1 pure APIs implemented in `packages/core`
- `selectDailyChallengePrompt(input)`
- `selectFreePracticePrompt(input)`
- `createPracticeSessionState(input?)`
- `reducePracticeSession(state, event)`
- `createSyncState(input)`
- `transitionRecordingSyncStatus(state, event)`
- `buildShareText(input)`
- `validateRecordingMeta(input)`
- `validatePromptPack(input)`

---

### Decision
Use `Dexie + IndexedDB` for local storage in the MVP (documented now, implemented later).

### Options considered
- Dexie + IndexedDB
- SQLite WASM + OPFS
- TanStack DB + Dexie

### Chosen option
Dexie + IndexedDB.

### Why
Fastest reliable local-first path for a media-heavy PWA MVP; lower complexity than SQLite WASM/OPFS while preserving offline behavior.

### Risks
- Less SQL ergonomics for local querying.

### Revisit trigger
- If local query complexity or storage migration requirements grow after MVP validation.

---

### Decision
Model audio/video as a per-session mode choice, represented in the shared domain types.

### Options considered
- Audio-only MVP
- Global mode preference
- Per-session audio/video selection

### Chosen option
Per-session audio/video selection.

### Why
Matches product requirements while keeping practice flow flexible for daily challenge and free practice.

### Risks
- Adds state machine and validation complexity earlier.

### Revisit trigger
- If user testing shows setup friction before recording.

---

### Decision
Use deterministic daily challenge selection based on `YYYY-MM-DD + packId + seedVersion`.

### Options considered
- Backend-generated daily prompt
- Static rotation list
- Client-side deterministic hash + seeded PRNG

### Chosen option
Client-side deterministic hash (`cyrb53`) + seeded PRNG (`mulberry32`).

### Why
Offline-friendly, tiny implementation, no backend dependency for the daily challenge.

### Risks
- Seed algorithm changes can alter future prompt assignments.

### Revisit trigger
- If a global synchronized challenge across locales/timezones is required.

---

### Phase 1 deferred work (not implemented here)
- Media capture and timer integration (Phase 3)
- PWA UI/screens (Phase 4)
- Cloudflare Worker/D1/R2 APIs and auth (Phase 5+)

---

## 2026-02-28 - Phase 0 scaffold completion + Phase 2 Dexie implementation

### Decision
Complete missing app scaffolds before Dexie implementation.

### Options considered
- Start Dexie in isolation without app scaffolds
- Complete only PWA scaffold and defer Worker scaffold
- Complete both PWA and Worker scaffolds first

### Chosen option
Complete both PWA and Worker scaffolds first.

### Why
Keeps workspace shape aligned with the implementation plan and removes structural churn before persistence work.

### Risks
- Additional dependencies and scripts increase baseline maintenance.

### Revisit trigger
- If monorepo scripts become slow or difficult to maintain, split root scripts into package-only and app-only pipelines.

---

### Decision
Use Dexie repositories with a normalized split: `recordings` metadata table, `blobs` table, and `syncQueue` table.

### Options considered
- Single table with embedded blob payloads
- Separate metadata/blob/queue tables with repository interfaces
- Browser file-system APIs in Phase 2

### Chosen option
Separate `recordings`, `blobs`, and `syncQueue` tables with typed repositories.

### Why
Matches Phase 2 acceptance criteria, keeps blob operations explicit, and supports queue-specific indexing and retries.

### Risks
- Multi-table operations require transactional discipline.
- Future schema evolution must preserve queue and blob consistency.

### Revisit trigger
- If queue throughput, query complexity, or migration burden grows, evaluate an IndexedDB abstraction change or stronger schema migration tooling.

---

### Decision
For local save flows, derive sync status with `createSyncState` and `transitionRecordingSyncStatus` before persistence.

### Options considered
- Write sync status directly from UI/auth flags
- Centralize status derivation via existing core sync machine

### Chosen option
Use the core sync machine functions for status derivation.

### Why
Prevents drift between app persistence behavior and shared domain transition rules.

### Risks
- Service layer depends on strict validity of transition wiring.

### Revisit trigger
- If Worker finalize/delete flow introduces additional local statuses in Phase 5+, revisit queue item modeling and transition mapping in services.
