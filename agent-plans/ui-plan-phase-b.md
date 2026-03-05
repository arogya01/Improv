# Phase B: Practice Setup & Session Orchestration

Deliver the core user flow for preparing and capturing a recording session. This includes managing media permissions, capturing audio/video, interacting with the existing domain state machines, and storing the completed session locally via the [LibraryService](file:///Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/library/library-service.ts#55-179).

## Proposed Changes

### Domain & Types

#### [NEW] `apps/pwa/src/features/practice/types.ts`
Define frontend-specific types that bridge UI state and core domain types:
- `PracticeSetupDraft`: form state for practice mode, media type, prompt selection.
- `RecordingSessionVm`: view-model shape representing the active session (timer, status).

### Services and Adapters

#### [NEW] `apps/pwa/src/features/practice/media-capture.ts`
Implement `MediaCaptureAdapter`:
- `getSupport()`: Checks `navigator.mediaDevices`.
- `requestPermissions()`: Calls `getUserMedia` to prompt the user.
- `start(input)`: Initializes streams and `MediaRecorder`.
- `stop()`: Stops tracks and returns the recorded [Blob](file:///Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/db/schema.ts#28-37).
- `cancel()`: Immediately halts without returning data.

#### [NEW] `apps/pwa/src/features/practice/recording-service.ts`
Implement `FrontendRecordingService` as a facade:
- Coordinates between `MediaCaptureAdapter`, `@improv/core` states, and `LibraryService.saveRecordingLocally`.
- `beginSession(draft)`, `completeSession(handle)`, `abortSession(handle)`.

### Hooks and Stores

#### [NEW] `apps/pwa/src/features/practice/usePracticeSetup.ts`
Custom hook or minimal Zustand store to track the user's choices before recording starts. Integrates with `@improv/prompt-packs` to power dropdowns.

#### [NEW] `apps/pwa/src/features/practice/useRecordingSession.ts`
- Runs the [practice-machine.ts](file:///Users/arogyabichpuria/Documents/side-quests/Improv/packages/core/src/practice-machine.ts) logic via React state/reducers.
- Tracks 60s countdown using `requestAnimationFrame` or `setInterval` for high fidelity.
- Exposes clean `status` and actions for the UI components to bind to.

### UI Components & Views

#### [MODIFY] `apps/pwa/src/pages/PracticeSetupPage.tsx`
- Build the setup form UX inside a Stripe-inspired card layout.
- Prompt pack and random prompt selector.
- Media type toggle (Audio / Video). Camera facing toggle (if Video).
- "Start Session" CTA with directional micro-motion.
- Animated staggered reveals using Framer Motion.

#### [MODIFY] `apps/pwa/src/pages/PracticeSessionPage.tsx`
- A focused, distraction-free active recording screen.
- Real-time countdown timer (`Space Grotesk` styled).
- Video preview `<video>` tag or audio waveform visualizer placeholder.
- Stop / Cancel buttons. Animated transitions for saving, saved, and error states (`idle/recording/stopping/saving/saved/error`).
- Submits to `FrontendRecordingService`. Navigates back to home or library on completion.

#### [NEW] `apps/pwa/src/features/practice/index.ts`
Barrel export file for the practice features.

## Verification Plan

### Automated Tests
1. **Typecheck**: Build and typecheck passes.
2. **Setup Reducer**: Verify prompt and pack selections in unit tests.
3. **Session State Transitions**: Ensure the timer hits 0 and initiates the stop sequence.

### Manual Verification
4. User can enter the Practice flow from the Home shell.
5. User selects Audio or Video, completes a 60-second or early-stopped session.
6. The browser prompts for permissions.
7. The UI transitions beautifully via Framer Motion between status states.
8. The recorded file attempts to save via [LibraryService](file:///Users/arogyabichpuria/Documents/side-quests/Improv/apps/pwa/src/features/library/library-service.ts#55-179).
