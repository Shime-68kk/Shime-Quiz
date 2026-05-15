# Phase 15H — FSRS Foundation Closure / Phase 16 Readiness Handoff

Status: closed for Phase 15H. This phase is docs/static-validator/CI only. No runtime files
changed. No src/, tests/, or e2e/ files changed. No package.json or package-lock.json changed.
No new dependencies added. No new runtime behavior added. No new UI added.
No new ts-fsrs.next() call sites added.

## Scope

Phase 15H is the final closure of the Phase 15 FSRS foundation track. It summarizes what
the full Phase 15 sequence completed, documents what remains intentionally deferred, defines
the safe starting point for Phase 16A, and locks coordination and safety guardrails to prevent
Phase 16 from accidentally implementing sync/cloud/storage migration too early.

Allowed changed files for Phase 15H:

- `.github/workflows/e2e-smoke.yml`
- `docs/phase15h-fsrs-foundation-closure-phase16-readiness.md`
- `scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js`
- Historical validators with exact Phase 15H allowlist entries only

---

## 1. Phase 15 Closure Summary

### Phase 15A — Active FSRS Scheduling Architecture Contract

Phase 15A locked the full architecture contract for active FSRS scheduling. Docs/static-validator/CI
only. No src/ or tests/ files changed. The ten Phase 14O gate decisions were resolved: active
scheduling scope, rollback plan, rating mapping, backward compatibility for existing fsrsReviewLogs,
zero-log dormant card handling, Dashboard due-count strategy, backup/restore compatibility, toggle-OFF
rollback behavior, unit/static validator requirements, and release/claim guardrails. The double-gate
condition (`fsrsExperimentalEnabled === true AND fsrsActiveSchedulingEnabled === true`) was locked as
the only approved activation path. Hybrid local-first was explicitly deferred to Phase 16A+. No new
ts-fsrs.next() call sites were added in Phase 15A.

### Phase 15B — Active FSRS Scheduling: Double-Gated, Default OFF

Phase 15B implemented production `ts-fsrs.next()` scheduling for FSRS-enrolled cards behind the strict
double gate. `fsrsActiveSchedulingEnabled` is internal-only, default OFF, and not user-visible. The
call site (`scheduleFsrsReview` in `src/quiz/fsrsWrapper.js`) is the only approved production
`ts-fsrs.next()` call site. SM-2 fallback fires when either gate is off, when `continueWithoutRating`
is set, when payload validation fails, or when `scheduleFsrsReview` throws. `fsrs-active` kind was
introduced and added to `FSRS_KIND_ALIASES`. SM-2 fields are kept synchronized in parallel on
`fsrs-active` write-back. Dashboard.jsx was unchanged. 355 tests pass.

### Phase 15C — Dashboard Mixed Scheduler Due-Count/Display

Phase 15C made Dashboard due-count display safe for mixed-scheduler environments. The
`computeMixedSchedulerDueSummary` function was added to `reviewSchedulerAdapter.js` to provide
per-family due-count split (SM-2 vs. FSRS). Dashboard total `dueCount` is kind-agnostic and
numerically correct. No overclaim was made that Dashboard fully supports every future scheduler.
376 tests pass.

### Phase 15D — Active FSRS Runtime Smoke / Rollback Audit

Phase 15D audited rollback, default-OFF, and fallback safety for the active scheduling runtime
established in Phase 15B–15C. `scheduleActiveFsrsOrFallback` was verified to fall back correctly
when gates are off. The internal `fsrsActiveSchedulingEnabled` flag default OFF was re-confirmed.
No src/ or tests/ files changed (docs/static-validator/CI only). 403 tests pass.

### Phase 15E — Controlled Internal/Test Activation Harness

Phase 15E added the controlled internal/test activation harness for developers enabling the double
gate in test environments. `fsrsActiveSchedulingEnabled` remains never user-visible. No public
rollout of active FSRS scheduling occurred. 444 tests pass.

### Phase 15F — Study Room Copy/UX Alignment

Phase 15F aligned Study Room memory-rating bridge copy for inactive (default-OFF) and
internal-active-capable contexts. `isActiveSchedulingCopyEnabled` is a code-level prop only and is
never rendered as user-facing text. The copy is claim-safe for both inactive and internal-active
states. No new ts-fsrs.next() call sites were added. 444 tests pass.

### Phase 15G — Release / Claim Guardrail Re-Audit

Phase 15G re-audited all public-facing docs, release notes, README copy, validator strings, and
user-facing claims after the active FSRS foundation established through Phases 15A–15F. All
forbidden positive claims were confirmed absent. Preferred wording (experimental, double-gated,
default OFF, internal/test activation, no public rollout) was confirmed present where required.
Hybrid local-first and cloud sync were confirmed not implemented and not claimed. 490 tests pass.

---

## 2. Current FSRS State

- Active FSRS foundation exists behind strict double gates.
- Active scheduling is experimental and internal/test activation only.
- `fsrsActiveSchedulingEnabled` is default OFF and not user-visible.
- `fsrsExperimentalEnabled` is the user-visible toggle (controls enrollment path only).
- Normal users are not broadly opted into active FSRS scheduling.
- Existing SM-2 cards are not migrated or backfilled; no migration path exists.
- Continue without rating uses SM-2 fallback; `fsrsPayload` is preserved.
- Rollback/fallback/default-OFF safety is covered by tests and validators.
- Dashboard due-count display uses `computeMixedSchedulerDueSummary` for supported scheduler families.
- Dashboard does not claim full support for every future scheduler family.
- Study Room copy is claim-safe for default-OFF and internal-active-capable contexts.
- No public rollout of active FSRS scheduling has occurred or is claimed.
- `ts-fsrs` is pinned at 5.3.3 (exact).
- `ts-fsrs.next()` is called only at the single approved production call site in `src/quiz/fsrsWrapper.js`.

---

## 3. Deferred Items

The following items are explicitly deferred and not implemented or claimed:

- Public active FSRS rollout (broad user-facing rollout).
- User-facing active scheduling toggle (exposing `fsrsActiveSchedulingEnabled` in Settings UI).
- Migration or backfill of existing SM-2 cards to FSRS.
- Broader UX polish beyond claim-safe copy established in Phase 15F.
- Hybrid local-first architecture and optional sync direction (Phase 16+).
- IndexedDB migration (Phase 16B+).
- Append-only review event log implementation (Phase 16C+).
- Optional sync prototype or research harness (Phase 16D+).
- Opt-in sync UX plan (Phase 16E+).
- Cloud account or cloud sync.
- E2EE sync.
- Server or backend.
- External AI API integration or BYOK.
- Built-in AI scheduling.
- AI scheduling claim of any kind.
- Production/security certification.
- OCR.
- Multi-device sync.

---

## 4. Phase 16A Readiness

Recommended next major phase:

```
Phase 16A — Hybrid Local-First Architecture / Optional Sync Direction
```

Phase 16A is locked as:

- docs/static-validator/CI only.
- No runtime implementation.
- No sync prototype.
- No IndexedDB migration.
- No data model migration.
- No account/auth/cloud.
- No public sync claims.
- No implementation of any deferred item listed in Section 3.

Phase 16A should produce: an architecture decision record for the hybrid local-first direction,
a static validator that enforces the Phase 16A scope constraint, and CI registration of the
Phase 16A validator.

Phase 16A must not mix hybrid local-first planning with active FSRS scheduling runtime work.
Any Phase 16A changes to runtime files require explicit re-approval.

---

## 5. Suggested Phase 16 Sequence

```
16A: Hybrid Local-First Architecture / Optional Sync Direction
     — docs/static-validator/CI only
     — architecture decision record
     — no runtime implementation

16B: Local Storage Model / IndexedDB Migration Plan
     — docs/tests/validator, no migration
     — schema design and migration plan only
     — no data model change in this phase

16C: Append-Only Review Event Log Plan / Scaffold
     — likely tests/validator first
     — no production event log write paths until plan is validated

16D: Optional Sync Prototype Research / Harness
     — not public
     — internal/test only
     — no user-visible sync UI

16E: Opt-In Sync UX Plan
     — no broad claim until implementation is verified
     — claim guardrail required before any public sync claim
```

---

## 6. File Ownership / Parallel Coding Guidance

### Codex-owned runtime files

| File | Owner |
|---|---|
| `src/state/reviewScheduleStorage.js` | Codex |
| `src/quiz/reviewSchedulerAdapter.js` | Codex |
| `src/routes/StudyRoom.jsx` | Codex |
| `src/routes/Dashboard.jsx` | Codex |
| `src/state/settingsStorage.js` | Codex |
| `src/quiz/dataBackup.js` | Codex |
| `src/state/v2BackupRestore.js` | Codex |
| `src/quiz/fsrsWrapper.js` | Codex |
| `src/components/study/FsrsProductionMemoryRatingBridge.jsx` | Codex |

### Claude-owned docs/validator files

| File type | Owner |
|---|---|
| `docs/phase*.md` | Claude (Sonnet) |
| `scripts/validate-phase*.js` | Claude (Sonnet) |
| `.github/workflows/e2e-smoke.yml` | Claude (Sonnet) |

### Coordination protocol

- Do not let two coding agents touch the same runtime files in parallel.
- For Phase 16, keep storage/sync architecture docs separate from FSRS runtime code.
- No Phase 16A overlap with Study Room or scheduler runtime unless explicitly planned and approved.
- At each phase kickoff, confirm no file in the ownership table is currently in-flight in the
  other lane before opening a PR.
- Codex must not touch docs/validators owned by Claude without coordination.
- Claude must not modify Codex-owned runtime files without coordination.

---

## 7. Claim Guardrails

The following claims are forbidden and must not appear in docs, README, release notes,
or user-facing copy:

- Active FSRS scheduling is live for everyone.
- FSRS is broadly available as a user-facing feature.
- Active scheduling is guaranteed to produce better learning outcomes.
- AI scheduling is enabled or built-in.
- External AI or API integration exists.
- API key or BYOK support exists.
- OCR exists.
- Cloud sync exists.
- Hybrid local-first sync is implemented.
- E2EE sync is implemented or available.
- Multi-device sync is available.
- Backend or server exists.
- Active FSRS rollout is complete.
- Dashboard fully supports every future scheduler.
- Production or security certification exists.

The following wording is preferred and safe:

```
experimental memory scheduling
internal/test activation
double-gated
default OFF
not user-visible
rollback/fallback-safe
no public rollout
no active-FSRS rollout claim
no sync claim
no cloud claim
no E2EE claim
no AI scheduling claim
no security certification claim
no guarantee of better learning outcomes
```

---

## Phase 15 Closure Evidence

- Phase 15A: docs/static-validator/CI only; no src/tests/e2e changes; architecture contract locked.
- Phase 15B: double-gated active scheduling shipped; `fsrsActiveSchedulingEnabled` default OFF;
  `ts-fsrs.next()` only at approved call site; 355 tests pass.
- Phase 15C: Dashboard `computeMixedSchedulerDueSummary` added; 376 tests pass.
- Phase 15D: rollback/fallback/default-OFF audited; docs/static-validator/CI only; 403 tests pass.
- Phase 15E: controlled internal/test activation harness; 444 tests pass.
- Phase 15F: Study Room copy/UX claim-safe; 444 tests pass.
- Phase 15G: release/claim guardrail re-audit complete; 490 tests pass.
- Phase 15H: foundation closure and Phase 16 readiness handoff; docs/static-validator/CI only.

---

## Manual/Browser Smoke

Manual/browser smoke not run because Phase 15H is docs/static-validator/CI-only and no
runtime/UI files changed.

---

## Recommended Next Phase

Phase 16A: Hybrid Local-First Architecture / Optional Sync Direction —
docs/static-validator/CI only, architecture decision record only, no runtime implementation.
