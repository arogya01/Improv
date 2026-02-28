# ADR 0004: Audio/Video Mode is Chosen Per Session

## Status
Accepted (Phase 1 domain model implemented)

## Context
The product supports both audio and video recording for 60-second improv drills. We needed to decide whether media mode should be global, fixed by challenge type, or chosen for each take.

## Decision
Users choose `audio` or `video` for each recording session.

## Consequences
### Positive
- Flexible practice flow
- Works for both daily challenge and free-practice modes
- Clear domain representation (`mediaType` on recording metadata and session state)

### Negative
- Adds UI state and validation complexity
- Requires capability/fallback handling for unsupported video in later phases

## Implementation Notes
- Phase 1 includes shared domain types and state machine events to support per-session media mode.
- Camera selection is represented but actual capture behavior is deferred to Phase 3.
