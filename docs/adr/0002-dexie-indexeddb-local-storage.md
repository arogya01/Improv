# ADR 0002: Dexie + IndexedDB for Local PWA Storage (MVP)

## Status
Accepted (Phase 1 documentation only; implementation deferred to Phase 2)

## Context
The improv app must support offline-first recording and playback of audio/video in a PWA. The team evaluated browser-local persistence options for metadata and media blobs.

## Decision
Use `Dexie + IndexedDB` for MVP local persistence.

## Consequences
### Positive
- Proven browser storage path for PWAs
- Good fit for metadata + blob persistence
- Lower implementation complexity than SQLite WASM/OPFS for MVP

### Negative
- Less expressive querying than SQL-based local stores
- Potential future migration cost if query complexity grows

## Notes
- This ADR is documented in Phase 1 but implemented in Phase 2.
- SQLite WASM/OPFS remains a future option if local querying or file storage requirements become more complex.
