# Implementation Phase Checklist

## Phase 0 - Bootstrap + Docs + Tooling
- [x] Minimal bootstrap executed to unblock Phase 1 package/test work
- [ ] Full PWA app scaffold
- [ ] Cloudflare Worker scaffold

## Phase 1 - Core Domain + Prompt Engine
- Status: Complete (unit tests passing, typecheck passing)
- [x] Shared domain types in `packages/core`
- [x] Zod schemas and validation wrappers
- [x] Practice session reducer/state transitions
- [x] Sync status transition reducer
- [x] Deterministic daily challenge prompt selection
- [x] Free-practice prompt randomizer
- [x] Share text builder
- [x] Curated prompt packs with stable IDs and versions
- [x] Unit tests for core and prompt packs
- [x] Phase 1 documentation updates

## Phase 2+ (Deferred)
- [ ] Dexie local persistence
- [ ] Media capture + timer integration
- [ ] PWA UI/screens
- [ ] Cloudflare Worker/D1/R2 sync/auth
- [ ] Hardening, QA, release prep
