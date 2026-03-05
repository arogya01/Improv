# Frontend-First Delivery Plan: Stripe-Inspired Improv PWA (Dexie-Backed, Backend-Ready)

## Summary

This plan delivers the full client experience first, with a Stripe-inspired visual language and premium motion quality, while keeping cloud/backend integration as a sequenced add-on.
Skill basis and order: `web-design-guidelines` (interface quality baseline) then `vercel-react-best-practices` (motion/performance constraints).

## Locked Decisions

- Scope: Frontend-first delivery, backend as later add-on.
- Motion stack: Framer Motion.
- Visual direction: Stripe-inspired product feel, not a clone.
- Core data layer: keep current Dexie repositories/services as source of truth.
- Sync posture for this phase: local statuses and queue behavior visible in UI, no real cloud upload yet.

## Scope and Success Criteria

## In scope

- Complete PWA screens and navigation flow.
- Recording flow with 60s timer and auto-stop.
- Local persistence and retrieval via existing Dexie + `LibraryService`.
- Library/detail/settings UX with sync-status visibility.
- High-quality transitions, staggered reveals, and interaction motion.
- Accessibility, reduced-motion behavior, and mobile-first polish.
- Backend-ready API interfaces and client abstraction layer (no live integration).

## Out of scope (this phase)

- Real auth/session, upload intent/finalize, and cloud sync execution.
- Worker/D1/R2 implementation changes.
- Public sharing links or LLM features.

## Success criteria

- A user can complete `Setup -> Record -> Save -> Replay -> Favorite/Delete` fully offline.
- UI exposes `local_only` and `pending_upload` states from Dexie data.
- Motion is smooth on modern mobile devices and degrades safely with reduced motion.
- All client tests pass and no regression in existing Dexie/service tests.

## Experience Blueprint (Screens and Flows)

## Routes

- `/` Home: daily challenge highlight + quick actions.
- `/practice/setup` Practice Setup: mode, prompt pack, prompt pick, media type, camera facing.
- `/practice/session` Recording Session: live timer, waveform/video preview, stop/save/cancel.
- `/library` Library: searchable list, filters (`favorites`, `date`, `sync status`), status chips.
- `/library/:id` Session Detail: playback, metadata, favorite toggle, delete, share-local.
- `/settings` Settings: local storage usage, sync queue diagnostics, app preferences.
- `/auth` placeholder route with “coming later” messaging and non-blocking UX.

## Primary flow

1. User enters setup, chooses prompt and media mode.
2. Session starts with animated countdown and recording state transitions.
3. Auto-stop at 60s or manual stop.
4. Save writes metadata+blob via `LibraryService.saveRecordingLocally`.
5. Post-save confirmation animates into library list.
6. Library and detail use Dexie-backed queries for playback and actions.
7. Delete/favorite actions apply instantly with optimistic UI and reconciliation from Dexie.

## Visual System (Stripe-Inspired, Product-First)

## Design tokens

- Typography: `Plus Jakarta Sans` (UI/body), `Space Grotesk` (headlines/hero numerics).
- Palette: deep ink neutrals + electric cyan/teal accents + warm highlight tone; avoid purple bias.
- Backgrounds: layered radial/linear gradients with subtle mesh effect and soft grain texture.
- Surfaces: elevated cards with soft borders, low-opacity blur, and clear hierarchy.
- Spacing/radius: 8px scale, radius family `10/14/20/28` for consistent curvature rhythm.
- Shadow model: low-spread, multi-layer ambient shadows for depth without heavy contrast.

## Component language

- Hero blocks with editorial headline scale and crisp supporting copy.
- Data cards with strong numeric hierarchy (timer, recording count, sync states).
- CTA buttons with directional micro-motion (icon drift + subtle sheen).
- Status chips for sync state using semantic color + icon + readable label.
- Skeleton states designed as gradient shimmer bands, not flat gray placeholders.

## Motion System (Framer Motion Specification)

## Motion tokens

- Durations: `140ms` (micro), `220ms` (standard), `340ms` (page), `520ms` (hero intro).
- Easing set: `cubic-bezier(0.22,1,0.36,1)` for entrance, `cubic-bezier(0.4,0,0.2,1)` for exits.
- Stagger: `40ms` children for list/section reveals.
- Spring preset: `stiffness 280`, `damping 30`, `mass 0.8` for tactile controls.

## Transition rules

- Page transitions: shared layout fade+slide (`y: 12 -> 0`) with preserving header continuity.
- Recording-state transitions: explicit variants for `idle/recording/stopping/saving/saved/error`.
- List updates: `layout` animations for insert/delete/reorder in library.
- Modal/sheet motions: bottom-sheet spring for mobile actions and filters.
- Gesture feedback: press scale `0.98`, hover/active tonal shift, drag resistance for sheets.

## Reduced motion

- Honor `prefers-reduced-motion` by disabling transform-heavy transitions.
- Keep opacity-only transitions (`120ms`) for functional continuity.
- Disable auto-stagger and parallax layers when reduced motion is on.

## Frontend Architecture and File Plan

## App structure additions

- `apps/pwa/src/app/router.tsx` for route graph and transitions.
- `apps/pwa/src/app/layouts/AppShell.tsx` for persistent chrome/navigation.
- `apps/pwa/src/design/tokens.css` for design variables.
- `apps/pwa/src/design/motion.ts` for canonical motion presets.
- `apps/pwa/src/components/primitives/*` for buttons, chips, cards, sheets, fields.
- `apps/pwa/src/components/composites/*` for section headers, media cards, prompt blocks.
- `apps/pwa/src/features/practice/*` for setup/session hooks, views, and media adapter.
- `apps/pwa/src/features/library/*` for list/detail hooks and view models.
- `apps/pwa/src/features/settings/*` for diagnostics/preferences UI.
- `apps/pwa/src/lib/time.ts`, `apps/pwa/src/lib/format.ts`, `apps/pwa/src/lib/device.ts`.

## State/data boundaries

- Keep domain validation and sync status logic in `@improv/core`.
- Keep persistence and queue operations in existing `LibraryService`/`SyncQueueService`.
- Add UI stores (Zustand) only for ephemeral UI state: active filters, sheets, toasts, transition context.
- Use query/cache abstraction for read models and list invalidation (`@tanstack/react-query`).
- Keep media capture isolated behind adapter interface to avoid UI coupling with browser APIs.

## Important Public APIs / Interfaces / Types (Decision-Complete)

## New frontend interfaces

- `MediaCaptureAdapter` in `apps/pwa/src/features/practice/media-capture.ts`:
  - `getSupport(): Promise<{ audio: boolean; video: boolean; fileShare: boolean }>`
  - `requestPermissions(mediaType: "audio" | "video"): Promise<"granted" | "denied" | "blocked">`
  - `start(input: { mediaType: "audio" | "video"; cameraFacing?: "user" | "environment"; maxDurationMs: 60000 }): Promise<void>`
  - `stop(): Promise<{ blob: Blob; mimeType: string; durationMs: number; width?: number; height?: number }>`
  - `cancel(): Promise<void>`

## New frontend service facade

- `FrontendRecordingService` in `apps/pwa/src/features/practice/recording-service.ts`:
  - `beginSession(draft: PracticeSetupDraft): Promise<RecordingSessionHandle>`
  - `completeSession(handle: RecordingSessionHandle): Promise<RecordingMeta>`
  - `abortSession(handle: RecordingSessionHandle): Promise<void>`

## New UI types

- `PracticeSetupDraft` in `apps/pwa/src/features/practice/types.ts`.
- `RecordingSessionVm` in `apps/pwa/src/features/practice/types.ts`.
- `LibraryItemVm` in `apps/pwa/src/features/library/types.ts`.
- `MotionPreset` in `apps/pwa/src/design/motion.ts`.

## Existing APIs reused unchanged

- `LibraryService.saveRecordingLocally`, `deleteLocalRecording`, `listLibraryItems`, `setFavorite`.
- `SyncQueueService.listDueItems`, `markAttempt`, `clearForRecording`.
- `@improv/core` sync/practice state machine functions and `RecordingMeta` contract.

## Delivery Phases (Implementation Order)

1. Phase A: Foundation and design system.

- Add routing, app shell, token system, and primitive components.
- Add Framer Motion baseline and reduced-motion utility hooks.
- Replace placeholder screen with structured shell navigation.

2. Phase B: Practice Setup and session orchestration.

- Build setup UX for mode/media/prompt selection.
- Implement `MediaCaptureAdapter` and recording session hook.
- Wire 60s timer and state machine-driven transitions.
- Add save/cancel/error states with animated continuity.

3. Phase C: Library and detail surfaces.

- Build Dexie-backed library list with filters and status chips.
- Build session detail playback and actions (favorite/delete/share-local).
- Add list/detail transitions, optimistic actions, and fallback error banners.

4. Phase D: Settings and diagnostics.

- Add local storage estimate, queue summary, and sync-status explanation.
- Add placeholders for cloud/auth toggle messaging to preserve roadmap clarity.
- Expose debug panel in development mode only.

5. Phase E: Motion polish and performance hardening.

- Tune animation timings across routes/components.
- Apply lazy loading for heavy views and media preview modules.
- Ensure 60fps targets on key interactions and improve bundle split points.

6. Phase F: Backend add-on readiness.

- Add `WorkerApiClient` interface and mock implementation behind feature flag.
- Define sync runner trigger points without executing cloud calls.
- Keep UI contract stable so backend integration can be attached later with minimal UI churn.

## Testing Plan and Scenarios

## Unit tests

- Practice setup reducer and session state transitions.
- Media adapter capability/permission/error branches.
- View-model mappers for library/status labels.
- Motion config snapshots for variant/token integrity.
- Existing Dexie repository/service tests remain passing.

## Component tests

- Route-level render and transition mount/unmount behavior.
- Setup form validation and disabled/enabled CTA logic.
- Session timer countdown and auto-stop behavior.
- Library filtering, favorite toggle, and delete confirmation flows.
- Reduced-motion mode rendering behavior.

## E2E scenarios (Playwright)

1. Offline first-run: setup to save to library succeeds.
2. Audio session: record, auto-stop, save, playback works.
3. Video session: capability available path and fallback-to-audio path.
4. Library actions: favorite, filter, delete and list reconciliation.
5. App reload persistence: saved recordings survive reload.
6. Reduced-motion setting: no transform-heavy transitions while flow remains usable.
7. Queue visibility: authenticated mock path shows `pending_upload` badges correctly.

## Quality gates

- `pnpm test`, `pnpm typecheck`, `pnpm --filter @improv/pwa build` must pass.
- Lighthouse mobile performance/accessibility threshold targets for key routes.
- Design QA pass against [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## Acceptance Criteria (Release to “Frontend Ready”)

- All planned routes exist and are navigable.
- Recording flow is complete and reliable on supported browsers.
- Dexie save/list/delete/favorite workflows are fully wired to UI.
- Visual system and motion language are coherent and consistent across screens.
- Reduced-motion and accessibility requirements are satisfied.
- Backend integration can be layered in without frontend architecture changes.

## Explicit Assumptions and Defaults

- Browser baseline: latest Safari/Chrome mobile versions for MVP support.
- Typography delivered via webfont loading strategy with local fallbacks.
- Stripe inspiration targets interaction polish and hierarchy, not visual copying.
- Cloud sync remains disabled by default in this phase (`VITE_ENABLE_CLOUD_SYNC=false`).
- No breaking changes to `@improv/core` domain contracts are required for this frontend phase.
