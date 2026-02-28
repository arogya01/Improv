# PWA Improv App MVP Implementation Plan (Cloudflare-Only Core: Workers + D1 + R2, Zero-Cost Guardrails)

## Summary
Implement a mobile-first PWA for improv practice with:
- curated prompts + daily challenge
- strict 60-second timer
- audio/video recording (user chooses per session)
- local-first storage in browser (`Dexie + IndexedDB`)
- cloud backup/sync in MVP using `Cloudflare Workers + D1 + R2`
- custom auth with `email magic link` (dev/test auth fallback until sender domain is ready)
- strict cloud quota enforcement to stay at `$0`

This plan also includes saving planning artifacts and a decision/rationale log as documentation.  
It does **not** save private chain-of-thought; it saves explicit decisions, tradeoffs, risks, and revisit triggers.

## Locked Decisions
- Platform: `PWA-only MVP`
- Local storage: `Dexie + IndexedDB` (metadata + blobs)
- Cloud media storage: `Cloudflare R2`
- Cloud metadata/auth backend: `Cloudflare Workers + D1`
- Auth style: `Custom email magic link`
- Email provider: `Resend`
- Current sender-domain state: `No domain yet`, so MVP starts with `dev/test auth fallback` and production email auth is gated
- Cloud sync model: `Local-first + background sync`
- Cloud scope: `All recordings (audio + video) within quotas`
- Privacy: `R2 objects private only`
- Upload path: `Direct browser upload via signed URL`, signer implemented in `Cloudflare Worker`
- Upload policy: auto-upload on Wi-Fi + cellular
- Share path: local file + text (cloud is backup/sync, not public link)
- Delete policy: delete local and cloud copy for synced recordings
- Quota posture: `Balanced strict` (hard limits enforced)
- LLM coach: out of MVP

## Zero-Cost Guardrails (Balanced Strict Profile)
Enforce these in MVP to reduce risk of leaving free tiers:
- App-wide cloud media hard cap: `8 GB`
- App-wide warning threshold: `6 GB`
- Per-user cloud media hard cap: `500 MB`
- Per-user warning threshold: `350 MB`
- Max uploadable audio file size: `15 MB`
- Max uploadable video file size: `50 MB`
- Upload queue concurrency: `1`
- Auth magic-link rate limit: `3 requests / hour / email` and `10 requests / hour / IP`
- If quota exceeded:
  - local save still succeeds
  - upload is skipped
  - user sees clear “Saved locally, cloud backup limit reached” message

## Product Goal and MVP Success Criteria

## Goal
A mobile user can open the PWA, choose a prompt, record a 60-second audio/video take, replay it later, and have it backed up to cloud storage automatically (when authenticated and online).

## MVP Success Criteria
- Recording saves locally immediately and works offline
- Cloud backup sync runs automatically in background when online and signed in
- Audio/video both supported on compatible devices
- Unsupported video degrades to audio-only flow
- Sync errors and quota caps never block local practice
- Sharing works from local media file path and degrades gracefully when file share support is missing

## In Scope (MVP)
- PWA installability
- Daily challenge + free practice
- Audio recording
- Video recording with per-session camera choice
- 60s strict timer + auto-stop
- Local library (playback, favorite, delete)
- Cloud sync to R2 + D1 (opt-in after sign-in)
- Custom email magic-link auth architecture (dev/test fallback before sender domain)
- WhatsApp-friendly local file sharing
- Offline-first core loop
- Docs/ADR/decision trail saved in repo

## Out of Scope (MVP)
- Public share links
- LLM coaching/transcripts
- Native app
- SQLite/OPFS local store
- Cloudflare-only “full production auth email” before domain setup is completed
- Automatic storage cleanup/deletion policies beyond user actions

## Documentation Deliverables (Saved in Repo)
Create and maintain these docs during implementation:
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/plans/2026-02-24-pwa-improv-mvp-plan.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/plans/2026-02-24-pwa-improv-mvp-plan-cloud-revision.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/plans/2026-02-24-pwa-improv-mvp-cloudflare-r2-d1-revision.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/architecture/pwa-cloudflare-architecture.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/architecture/recording-sync-share-flow.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/architecture/auth-magic-link-flow.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/adr/0001-pwa-only-mvp.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/adr/0002-dexie-indexeddb-local-storage.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/adr/0003-cloudflare-r2-d1-cloud-sync.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/adr/0004-custom-email-magic-link-auth.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/adr/0005-zero-cost-quota-guardrails.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/decision-trail.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/testing/test-plan.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/testing/manual-qa-checklist.md`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/implementation/phase-checklist.md`

## Documentation Rules (for “train of thoughts” request)
Use a decision-trail format instead of private chain-of-thought:
- `Decision`
- `Options considered`
- `Chosen option`
- `Why`
- `Risks`
- `Revisit trigger`

Record the key pivots:
- web/native -> PWA-first
- audio-only -> audio + video
- no-cloud-MVP -> cloud sync in MVP
- Supabase storage -> Cloudflare R2
- Supabase auth+DB -> Cloudflare D1 + custom auth
- SQLite local store considered -> Dexie chosen for MVP

## Implementation Stack (Locked)
- Frontend PWA: `React + TypeScript + Vite`
- PWA plugin: `vite-plugin-pwa`
- Local DB: `Dexie`
- UI state: `Zustand`
- Data fetching/retries (API state): `@tanstack/react-query`
- Validation: `Zod`
- Cloud backend API: `Cloudflare Workers`
- Cloud metadata DB: `Cloudflare D1`
- Cloud media: `Cloudflare R2`
- Worker framework: `Hono` (decision default)
- D1 query layer: `Drizzle ORM` (decision default)
- Email provider: `Resend`
- Tests: `Vitest`, `React Testing Library`, `Playwright`

## Project Structure (Decision-Complete)
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/app`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/components`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/practice`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/library`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/sync`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/auth`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/share`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/lib`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/db`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/workers` (frontend helpers/workers if needed)
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/api-worker` (Cloudflare Worker project)
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/api-worker/src`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/apps/api-worker/migrations`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/packages/core`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/packages/core/src`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/packages/prompt-packs`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/packages/prompt-packs/src`
- `/Users/arogyabichpuria/Documents/side-quests/Improv/docs/...`

## Cloudflare-Only MVP Architecture

## Frontend (PWA)
- Records media locally first
- Stores metadata + blobs in IndexedDB
- Maintains sync queue
- Calls Worker API for auth, upload intents, finalize, list, delete
- Uploads bytes directly to R2 using signed URLs from Worker

## Worker API
- Handles auth/session cookies and magic-link token flows
- Issues signed R2 upload/download URLs
- Persists metadata in D1
- Enforces quotas, ownership, and rate limits
- Orchestrates finalize/delete semantics

## D1 (metadata/auth)
Tables for users, sessions, magic-link tokens, recordings, sync bookkeeping.

## R2 (private media)
Stores audio/video objects only.
Object key format:
- `recordings/{userId}/{recordingId}.{ext}`

## Dev/Test Auth Fallback (No Domain Yet)
Because a sender domain is not ready yet:
- `DEV/PREVIEW` mode supports magic-link simulation
- Worker generates the same token/session flow but returns the link/code directly in API response (or logs it) only in non-production
- `PROD` email magic-link send is disabled until sender domain + Resend verified
- Architecture remains production-compatible; only delivery mechanism is gated

## Important Public APIs / Interfaces / Types

## Shared Domain Types (`/packages/core/src/types.ts`)
Must include:
```ts
type PracticeMode = "daily_challenge" | "free_practice";
type MediaType = "audio" | "video";
type CameraFacing = "user" | "environment";

type RecordingSyncStatus =
  | "local_only"
  | "pending_upload"
  | "uploading"
  | "awaiting_finalize"
  | "synced"
  | "upload_failed"
  | "pending_delete"
  | "deleting_cloud"
  | "delete_failed";

type AuthState =
  | { status: "guest" }
  | { status: "pending_email_verification" }
  | { status: "authenticated"; userId: string; email: string };

type RecordingMeta = {
  id: string;
  createdAt: string;
  updatedAt: string;
  localDate: string;
  practiceMode: PracticeMode;
  mediaType: MediaType;
  promptPackId: string;
  promptPackVersion: number;
  promptId: string;
  durationMs: number;
  timerTargetMs: 60000;
  mimeType: string;
  fileSizeBytes: number;
  isFavorite: boolean;
  isDailyShare: boolean;
  cameraFacing?: CameraFacing;
  videoWidth?: number;
  videoHeight?: number;
  localBlobKey: string;
  syncStatus: RecordingSyncStatus;
  ownerUserId?: string;
  cloudObjectKey?: string;
  cloudUploadedAt?: string;
  syncErrorCode?: string;
  syncErrorMessage?: string;
};

type DailyChallenge = {
  localDate: string;
  promptPackId: string;
  promptId: string;
  seedVersion: number;
};

type SyncQueueItem =
  | {
      id: string;
      kind: "upload";
      recordingId: string;
      attempts: number;
      nextAttemptAt: string;
      createdAt: string;
      lastError?: string;
    }
  | {
      id: string;
      kind: "finalize_upload";
      recordingId: string;
      attempts: number;
      nextAttemptAt: string;
      createdAt: string;
      uploadReceiptId: string;
      lastError?: string;
    }
  | {
      id: string;
      kind: "delete_cloud";
      recordingId: string;
      attempts: number;
      nextAttemptAt: string;
      createdAt: string;
      cloudObjectKey: string;
      lastError?: string;
    };
```

## Shared Interfaces (`/packages/core/src/interfaces.ts`)
Must include:
```ts
interface MediaCaptureAdapter {
  getSupport(): Promise<{ audio: boolean; video: boolean; fileShare: boolean }>;
  requestPermissions(mediaType: "audio" | "video"): Promise<"granted" | "denied" | "blocked">;
  start(input: {
    mediaType: "audio" | "video";
    cameraFacing?: "user" | "environment";
    maxDurationMs: 60000;
    qualityPreset: "reliability_first";
  }): Promise<void>;
  stop(): Promise<{
    blob: Blob;
    mimeType: string;
    durationMs: number;
    width?: number;
    height?: number;
  }>;
  cancel(): Promise<void>;
}

interface LocalRecordingRepository {
  save(meta: RecordingMeta, blob: Blob): Promise<void>;
  list(params?: { favoritesOnly?: boolean; limit?: number }): Promise<RecordingMeta[]>;
  getMeta(id: string): Promise<RecordingMeta | null>;
  getBlob(id: string): Promise<Blob | null>;
  updateMeta(id: string, patch: Partial<RecordingMeta>): Promise<void>;
  deleteLocal(id: string): Promise<void>;
  estimateStorage(): Promise<{ usedBytes?: number; quotaBytes?: number }>;
}

interface WorkerApiClient {
  requestMagicLink(email: string): Promise<{ authMode: "email" | "dev_simulated"; message: string }>;
  verifyMagicLink(params: { token: string }): Promise<{ userId: string; email: string }>;
  getSession(): Promise<AuthState>;
  createUploadIntent(input: {
    recordingId: string;
    mimeType: string;
    fileSizeBytes: number;
    mediaType: MediaType;
    durationMs: number;
    promptPackId: string;
    promptPackVersion: number;
    promptId: string;
    practiceMode: PracticeMode;
    localDate: string;
    cameraFacing?: CameraFacing;
    videoWidth?: number;
    videoHeight?: number;
  }): Promise<{
    uploadUrl: string;
    uploadMethod: "PUT";
    uploadHeaders: Record<string, string>;
    cloudObjectKey: string;
    uploadReceiptId: string;
    expiresAt: string;
  }>;
  finalizeUpload(input: {
    recordingId: string;
    uploadReceiptId: string;
    cloudObjectKey: string;
  }): Promise<{ uploadedAt: string }>;
  listCloudRecordings(): Promise<Array<CloudRecordingRow>>;
  getDownloadIntent(recordingId: string): Promise<{
    downloadUrl: string;
    expiresAt: string;
  }>;
  deleteRecording(recordingId: string): Promise<void>;
}

interface SyncEngine {
  enqueueUpload(recordingId: string): Promise<void>;
  runOnce(): Promise<void>;
  runUntilIdle(): Promise<void>;
}
```

## Worker API Endpoints (MVP Contract)
Implement these endpoints in `apps/api-worker`:
- `POST /api/auth/request-magic-link`
- `GET /api/auth/verify`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/recordings/upload-intent`
- `POST /api/recordings/upload-finalize`
- `GET /api/recordings`
- `GET /api/recordings/:id/download-intent`
- `DELETE /api/recordings/:id`
- `GET /api/limits` (returns current quota usage/limits)
- `POST /api/sync/pull` (optional MVP; if not implemented, use `GET /api/recordings` only)

## D1 Schema (Decision-Complete)

## `users`
- `id` TEXT PK (UUID)
- `email` TEXT UNIQUE NOT NULL
- `email_verified_at` TEXT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

## `sessions`
- `id` TEXT PK
- `user_id` TEXT NOT NULL
- `session_token_hash` TEXT NOT NULL UNIQUE
- `expires_at` TEXT NOT NULL
- `created_at` TEXT NOT NULL
- `last_seen_at` TEXT NOT NULL

## `magic_link_tokens`
- `id` TEXT PK
- `user_id` TEXT NULL
- `email` TEXT NOT NULL
- `token_hash` TEXT NOT NULL UNIQUE
- `expires_at` TEXT NOT NULL
- `used_at` TEXT NULL
- `created_at` TEXT NOT NULL
- `request_ip_hash` TEXT NULL
- `user_agent_hash` TEXT NULL

## `recordings`
- `id` TEXT PK (client-generated UUID)
- `user_id` TEXT NOT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL
- `local_date` TEXT NOT NULL
- `practice_mode` TEXT NOT NULL
- `media_type` TEXT NOT NULL
- `prompt_pack_id` TEXT NOT NULL
- `prompt_pack_version` INTEGER NOT NULL
- `prompt_id` TEXT NOT NULL
- `duration_ms` INTEGER NOT NULL
- `timer_target_ms` INTEGER NOT NULL
- `mime_type` TEXT NOT NULL
- `file_size_bytes` INTEGER NOT NULL
- `is_favorite` INTEGER NOT NULL DEFAULT 0
- `is_daily_share` INTEGER NOT NULL DEFAULT 0
- `camera_facing` TEXT NULL
- `video_width` INTEGER NULL
- `video_height` INTEGER NULL
- `cloud_object_key` TEXT NOT NULL UNIQUE
- `cloud_uploaded_at` TEXT NOT NULL
- `deleted_at` TEXT NULL

## `upload_receipts`
- `id` TEXT PK
- `user_id` TEXT NOT NULL
- `recording_id` TEXT NOT NULL
- `cloud_object_key` TEXT NOT NULL
- `expires_at` TEXT NOT NULL
- `created_at` TEXT NOT NULL
- `finalized_at` TEXT NULL

## `quota_usage` (optional summary cache)
- `user_id` TEXT PK
- `bytes_used` INTEGER NOT NULL
- `updated_at` TEXT NOT NULL

## Indexes
- `recordings(user_id, created_at DESC)`
- `recordings(user_id, local_date DESC)`
- `recordings(user_id, is_favorite)`
- `recordings(user_id, deleted_at)`

## Auth and Session Flow (Custom Magic Link)

## Request link
1. User enters email
2. Worker validates/rate-limits request
3. Worker creates/updates user record
4. Worker creates one-time token (store hash only)
5. Worker generates verify URL with raw token
6. If `dev/test mode`, Worker returns simulated link/code in response
7. If `prod mode` with domain configured, Worker sends email via Resend
8. UI shows “Check your email” or “Dev link generated”

## Verify link
1. User opens link
2. Worker validates token, expiry, not-used state
3. Worker marks token used
4. Worker creates session
5. Worker sets secure HTTP-only cookie
6. Worker redirects to PWA auth callback route
7. PWA fetches `GET /api/auth/session` and updates local auth state
8. Sync engine backfills guest local recordings to cloud

## Security requirements
- Hash stored magic-link tokens and session tokens
- Short token expiry (e.g. 15 min)
- One-time use enforcement
- Rate-limit by email + IP
- CSRF protection for state-changing endpoints (cookie-based session)
- Secure cookie flags in production

## Recording, Sync, and Share Flow (Decision-Complete)

## Local-first save
1. Record audio/video locally
2. Save metadata + blob to Dexie
3. Mark status:
   - `local_only` if not authenticated
   - `pending_upload` if authenticated

## Upload intent + direct R2 upload
1. Sync engine checks auth, online state, quota, file size
2. Worker `upload-intent` validates ownership/limits and returns signed `PUT` URL + receipt
3. PWA uploads blob directly to R2
4. On success, PWA enqueues `finalize_upload`

## Finalize upload
1. PWA calls `upload-finalize` with receipt + recording ID
2. Worker verifies receipt, confirms not expired/used, writes/updates `recordings` row, updates quota usage
3. Local meta updated to `synced`

## Delete synced recording
1. User deletes from app
2. Local blob/meta removed (or meta marked pending delete if cloud call unavailable)
3. If synced/authenticated, queue `delete_cloud`
4. Worker deletes/soft-deletes D1 row and R2 object
5. Sync queue completes

## Share flow
- Uses local file, never waits for cloud
- File share + text via Web Share API if supported
- Fallback to text share/copy + download file

## UI/UX Additions for Cloud + Zero-Cost Limits

## Library / Session Detail
Show status badges:
- `Saved locally`
- `Syncing`
- `Backed up`
- `Upload failed`
- `Cloud limit reached`

## Settings
Include:
- Sign in / sign out
- Backup status
- Storage usage:
  - local estimate
  - cloud usage vs quota
- Sync now
- Dev/test auth mode indicator (until sender domain configured)

## Upload rejection UX
If quota/file size cap blocks upload:
- Recording remains available locally
- Provide reason (`file too large`, `user cloud quota reached`, `app cloud quota reached`)
- Suggest action (`delete old cloud backups`, `keep local only`, `retry later`)

## Media Capture Constraints (Reliability-First)
Use conservative constraints and bitrate hints:
- Audio:
  - mono where possible
  - low/medium bitrate target
- Video:
  - capped frame rate (`<= 24fps`)
  - reliability-first bitrate target
  - per-session camera choice
- Always enforce upload caps after recording, regardless of requested constraints
- Video too large for cloud upload:
  - keep local file
  - mark `upload_failed` with explicit quota/size reason
  - allow local playback/share

## Implementation Phases (Execution Order)

## Phase 0: Bootstrap + Docs + Tooling
- Scaffold monorepo/workspaces
- Create PWA app and Cloudflare Worker app
- Install core deps
- Create docs folders and seed plan/ADR/decision-trail docs
- Add env templates for Cloudflare + Resend
- Add scripts for test/build/dev

## Phase 1: Core Domain + Prompt Engine
- Implement shared types, state machines, daily challenge logic
- Add curated prompt packs and randomizer
- Unit tests for determinism and state transitions

## Phase 2: Local Persistence (Dexie)
- Dexie schema for metadata/blob/sync queue/app state
- Repository layer
- Storage estimate + warnings
- Integration tests for save/list/delete and reload persistence

## Phase 3: Media Capture + Timer
- Capability detection
- MediaRecorder adapter for audio/video
- Camera selection flow
- 60s strict timer + auto-stop
- Permission/fallback handling
- Unit/integration tests for recording state flow

## Phase 4: PWA UI (Offline Core)
- Build Home, Practice Setup, Recording Session, Library, Session Detail, Settings
- Favorites/delete/playback/share local flow
- Mobile-first UX polish
- Offline QA for core loop

## Phase 5: Cloudflare Worker API + D1 Schema
- Worker API endpoints
- D1 migrations and Drizzle schema
- Session cookies
- Custom magic-link token flow
- Dev/test auth fallback mode (no sender domain)
- Rate limiting and token hashing
- Worker tests for auth and quota enforcement

## Phase 6: R2 Signed Upload + Background Sync
- R2 private bucket integration
- Signed `PUT`/`GET` URL generation in Worker
- Upload intent/finalize flow
- Sync engine with retries/backoff and queue recovery
- Guest-to-auth backfill upload
- Cloud delete synchronization
- Cloud usage endpoint and quota enforcement

## Phase 7: Hardening + QA + Docs Finalization
- Edge case handling (quota failures, interruptions, stale receipts)
- E2E tests (mobile-focused)
- Manual QA on iPhone/Android browser + installed PWA
- Finalize docs, ADRs, decision trail, and known limitations

## Test Cases and Scenarios

## Unit Tests (`packages/core`)
1. Daily challenge determinism for same local date and pack
2. Different local dates yield valid prompt IDs
3. Timer state machine auto-stops at 60s
4. Audio/video mode transition rules
5. Sync status transition validity
6. Delete-wins and last-write-wins metadata conflict logic
7. Quota decision helpers and file-size cap checks

## Integration Tests (PWA Local)
1. Save/list/get/delete audio metadata + blob in Dexie
2. Save/list/get/delete video metadata + blob in Dexie
3. Persistence after reload
4. Storage estimate warnings
5. Sync queue persistence and retry state survival across reload

## Integration Tests (Worker + D1 + R2)
1. Request magic link creates token and rate-limit behavior
2. Verify magic link creates session cookie
3. Dev/test auth fallback returns simulated delivery only in non-prod mode
4. Upload intent returns signed URL only for authenticated user
5. Upload finalize writes metadata and updates quota
6. Upload intent rejects oversized files and quota overflow
7. Delete endpoint removes/marks cloud recording and updates quota
8. Download intent only returns signed URL for owner

## E2E Tests (Playwright + mocks/staging)
1. Daily challenge audio offline save, later cloud sync after login
2. Daily challenge video online save + cloud backup
3. Free-practice video fallback to audio on unsupported setup
4. Sign-in via dev/test magic-link flow (until sender domain exists)
5. Guest recordings backfill after sign-in
6. Quota-exceeded upload keeps local file and shows clear status
7. Share synced/unsynced recording via file-share or fallback path
8. Delete synced recording and confirm local+cloud delete path

## Manual QA Scenarios
1. iPhone Safari (browser)
2. iPhone installed PWA
3. Android Chrome (browser)
4. Android installed PWA
5. Camera denied / microphone denied / both denied
6. Low storage condition
7. Offline mode / reconnect sync recovery
8. Auth dev mode (simulated magic link) and later real email mode after domain setup

## Risks and Mitigations
- Custom auth complexity:
  - Mitigation: dev/test auth mode first, production email gated until domain ready
- Video size variability across browsers:
  - Mitigation: upload caps + local-only fallback + conservative bitrate constraints
- R2 signed URL finalize mismatch:
  - Mitigation: two-step intent/finalize with upload receipts
- Free-tier exhaustion:
  - Mitigation: strict hard caps + app-wide quota enforcement + usage UI
- Mobile background interruptions:
  - Mitigation: local-first save + persistent retry queue
- File share inconsistency:
  - Mitigation: fallback text share/copy + download

## Explicit Assumptions and Defaults
- Implementation remains PWA-only for MVP
- Local persistence remains Dexie/IndexedDB (not SQLite)
- Cloud stack is Cloudflare Workers + D1 + R2 for MVP
- Email magic-link auth is custom-built, but production email send is gated until sender domain exists
- Resend is the email provider once domain is configured
- Local save always succeeds before any cloud upload attempt
- Cloud upload is non-blocking and retry-based
- All recordings are eligible for cloud backup, subject to hard quotas
- Local and cloud copies are both retained after sync
- Sharing uses local file + text, not cloud links
- LLM coach is deferred
- “Train of thoughts” is represented via ADRs + `decision-trail.md`, not hidden internal reasoning
