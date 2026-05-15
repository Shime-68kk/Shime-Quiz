# Phase 16B — Hybrid Local-First Architecture / Optional Sync Direction

## 1. Phase statement

Phase 16B is docs/static-validator/CI only. It is an architecture decision
record (ADR) establishing the hybrid local-first architecture and optional
sync direction for Shime Quiz.

This phase:

- Does not implement sync.
- Does not implement IndexedDB.
- Does not implement event logs.
- Does not implement account, auth, or cloud backend.
- Does not modify runtime files (`src/`) or tests (`tests/`, `e2e/`).
- Does not create public sync claims.
- Introduces no runtime changes.
- Introduces no cloud/backend/account changes.

There are no public sync claims in this phase. No sync runtime exists.
No cloud/backend/account changes of any kind exist. No IndexedDB migration
has occurred.

Phase 16A was Vietnamese-first UX copy alignment — the original local-first
architecture ADR planned as Phase 16A was intentionally moved to Phase 16B
after Vietnamese-first UX copy was prioritized. Phase 16A is merged. Phase 16B
continues directly from Phase 16A.

---

## 2. Local-first principles

Shime Quiz is a local-first application. The following invariants must never
be broken by any future phase, sync, migration, or storage change:

1. **Full offline functionality** — every core flow works without network access
   and without any account. Core offline flows:
   - import (text paste, file upload)
   - study sessions
   - FSRS scheduling (`ts-fsrs.next()` is a local computation)
   - Dashboard (due counts, plan progress)
   - backup creation
   - backup restore
   - settings changes

2. **No account required** — no feature may require account creation. Optional
   sync, if ever added, must never be mandatory or account-gated.

3. **User owns local browser data** — primary storage is the user's browser
   profile. No server involvement in routine data reads or writes. The user
   can clear, export, or delete their data at any time without external
   dependency.

4. **Backup/export/import is the primary portability primitive** — manual
   backup/export/import is not a legacy fallback; it is the portability model.
   Future sync must not frame backup as deprecated or secondary.

5. **Graceful degradation on storage failure** — when localStorage write fails
   (e.g. quota exceeded), the app must surface the error and encourage manual
   backup. No silent data discard permitted.

6. **No silent data mutation** — no automatic merge, sync, or migration must
   occur without explicit user awareness and confirmation. Every data-affecting
   operation must be user-initiated or at minimum user-visible.

7. **No mandatory network or cloud dependency** — the application must remain
   fully functional when the network is unavailable or the user has no cloud
   account.

These seven invariants are permanent. They apply to all future runtime phases
(16C–16G and beyond).

---

## 3. Optional sync direction

Sync is a planned future direction, not implemented. No sync runtime exists.

If and when optional sync is added, the safest approved model is:

- **User-initiated** — sync is triggered only by explicit user action.
- **Opt-in** — sync must be explicitly enabled; it is never on by default.
- **Backup-first** — a successful backup/export must be created before any
  sync or merge operation that could overwrite local data.
- **Conflict-visible** — conflicts must be surfaced to the user; no silent
  auto-merge on ambiguous records.
- **Not automatic** — no startup sync, no session-end sync, no background sync
  without user knowledge.
- **Local data unchanged if sync disabled** — if the user has not enabled sync,
  local data must be identical to the current app state with no residual sync
  artifacts.
- **Corrupt or stale remote data rejected** — remote data must be validated
  with the same schema validators as `v2BackupRestore` before any merge. If
  validation fails, sync must abort and notify the user.
- **Sync paused after backup restore** — if a backup restore occurs while sync
  is enabled, sync must be auto-paused and the user must explicitly re-sync
  after verifying the restored state.

**Permanent non-goals (not deferred):**

- Server-side storage of quiz answers.
- Automatic sync on any trigger.
- Mandatory cloud account.
- Real-time collaborative editing.
- Syncing `fsrsActiveSchedulingEnabled` between devices.
- Syncing FSRS optimizer parameters.

These permanent non-goals must not be overridden by any future phase without
an explicit re-decision documented in a new ADR.

---

## 4. Storage architecture direction

The recommended future storage layering is:

```
Layer 1: StorageAdapter interface
          read(key), write(key, value), remove(key), estimateUsage()
          Implementations: LocalStorageAdapter, IndexedDBAdapter

Layer 2: Schema-versioned envelopes (existing, unchanged)

Layer 3: Business logic modules (existing, unchanged)

Layer 4: Optional SyncAdapter (future, above local storage)
          push(delta), pull(): Promise<SyncPayload>
          Sits ABOVE StorageAdapter; never bypasses schema validation
```

**What is canonical:**

- Current canonical storage is localStorage / local browser data. This does
  not change until a future verified migration with backup-first safeguards.
- Remote sync storage is **never** canonical. Local is always authoritative.
- After IndexedDB migration (future), IndexedDB becomes canonical only after
  migration verification and localStorage backup is confirmed preserved.

**What is derived (never synced):**

- Dashboard due counts — always recomputed via `computeMixedSchedulerDueSummary`.
- FSRS retrievability — always recomputed from `fsrsPayload.stability` and
  elapsed time. Must not be synced as an authoritative value.

**What is reconstructable:**

- SM-2 ease factors (from schedule records).
- FSRS retrievability (from stability + elapsed time).

**Key existing constraint:**

`mergeScheduleRecords()` uses itemId-based primary-overwrites-existing merge
semantics. All future adapter and sync implementations must respect this
semantic and must not silently upgrade it to a different merge strategy.

---

## 5. Event log direction

An append-only review event log is a planned future design. No production
event log exists in Phase 16B or any earlier phase.

The correct sequence is:

1. **Plan first** (future docs-only phase) — define event schema, compaction
   policy, and relationship to sync conflict resolution.
2. **Scaffold second** (future scaffold phase) — implement static structure,
   no production writes.
3. **Implement last** (future runtime phase, after sync adapter exists).

**No event log planning should begin runtime implementation until an approved
event log schema ADR is merged.**

The existing `fsrsReviewLogs` bounded at cap-20 (`FSRS_REVIEW_LOG_CAP = 20`
in `appendFsrsReviewLog`) is the design seed for a future event log. It
demonstrates the cap/compaction precedent and the per-item review history
pattern. Any global event log must apply a similar or stronger compaction
strategy.

A minimal future event schema (for planning reference only, not production):

```json
{
  "eventId": "uuid-v4",
  "eventKind": "review_result",
  "itemId": "string",
  "sessionId": "string",
  "rating": "Hard|Good|Easy|Again|null",
  "outcome": "correct|wrong|unanswered",
  "schedulerKind": "sm2-heuristic|fsrs-planned|fsrs-active",
  "reviewedAt": "ISO",
  "deviceId": "string (optional)"
}
```

This schema is **not implemented**. It is documented here as planning context
for the future event log phase. Compaction/snapshot policy is future work.

---

## 6. FSRS sync/storage boundary (FSRS boundary)

The FSRS boundary defines which fields any future sync, storage migration, or
backup/restore implementation must unconditionally preserve:

| Field | Why critical |
|---|---|
| `schedulerKind` | Routes scheduling in `getSchedulerKind()`; loss collapses routing |
| `schedulerVersion` | Audit trail for scheduler transitions |
| `dueAt` / due fields | Authoritative next review date |
| interval fields | Current interval state |
| `fsrsPayload.stability` | Core FSRS parameter; loss collapses schedule |
| `fsrsPayload.difficulty` | Core FSRS parameter; loss resets difficulty estimates |
| `fsrsPayload.state` | New/Learning/Review/Relearning; determines next scheduling |
| `fsrsPayload.reps` | Determines FSRS memory state trajectory |
| `fsrsPayload.lapses` | Determines FSRS memory state trajectory |
| `fsrsReviewLogs` | History for optimizer and bridge rating resolution |
| `fsrsEnabledAt` | Write-once optimizer cutoff timestamp; must use earlier value if conflict |

**`fsrsActiveSchedulingEnabled` must not be synced.** This flag is
internal/test-controlled and must be stripped from all sync payloads. Syncing
it would silently enable active scheduling on devices where it has not been
deliberately enabled internally.

**`fsrs-active` records on devices with gates OFF:** accept the record as-is
(`schedulerKind` preserved, not downgraded), but future scheduling on that
device falls back to SM-2 via the existing `scheduleCurrentReviewPreservingFsrs()`
path. No special sync handling is needed for this case.

**Active FSRS public rollout is not implied by sync planning.** Active FSRS
remains double-gated, default OFF, and internal/test-controlled. Sync planning
for FSRS fields does not change this status.

---

## 7. Conflict resolution strategy outline

The recommended future conflict resolution strategy is **per-card merge with
event-log tiebreaker, backup-first mandatory.**

**Core merge rules:**

- Compare `lastReviewedAt` and `reps`/`lapses`, not wall-clock time alone.
- Higher `reps + lapses` wins for `fsrsPayload` — the device with more
  review history is more authoritative.
- Merge and deduplicate `fsrsReviewLogs` by `(itemId + reviewedAt)`, re-cap
  at 20.
- Always preserve `fsrsPayload` over incomplete remote data (never overwrite
  a device with FSRS payload from a remote that lacks it).
- For `fsrsEnabledAt`: keep the **earlier** value (write-once protection;
  earlier date preserves the optimizer cutoff).
- For `dueAt`/`intervalDays`: use most-recent `lastReviewedAt` as tiebreaker.

**Schema validation before applying remote data:**

- Remote data must pass the same schema validators as `v2BackupRestore`.
- Missing or wrong `schemaVersion` must block merge.
- `fsrsPayload` absent in remote but present locally (with higher reps) must
  block auto-merge and surface conflict to user.
- Library data hash mismatch must block auto-merge.

**Sync pause on backup restore:**

- If backup restore occurs while sync is enabled, sync must be auto-paused.
- Treat sync state as "diverged" after restore.
- Require explicit user action and re-sync confirmation before re-enabling.
- Never let post-restore auto-sync silently overwrite the restored state.

**Severity taxonomy:**

| Scenario | Severity | Action |
|---|---|---|
| Same itemId, different `dueAt`, same `reps` | Low | Use most-recent `lastReviewedAt` |
| Same itemId, different `reps` (different sessions) | Medium | Higher `reps` wins; merge logs |
| `fsrsPayload` vs no `fsrsPayload` | Medium | Preserve `fsrsPayload` always |
| Library imported differently on each device | High | Block merge; user must choose |
| Backup restore + sync enabled simultaneously | Critical | Pause sync; require user confirmation |
| `fsrsEnabledAt` conflict | Low | Keep earlier value (write-once) |
| `fsrsActiveSchedulingEnabled` conflict | N/A | Never sync this flag |

**Harmless conflicts** (derivable/user preference, safe to last-write-wins):
`recommendationFeedback`, `studyGoal`, `studyPlanProgress`.

---

## 8. Backup/export/import centrality

Backup/export/import is the **primary portability model**, not a legacy
fallback. This principle is permanent and must not be weakened by any future
sync implementation.

- **Backup is data ownership assurance.** Future sync is real-time convenience.
  These are different tools for different needs. Backup controls must remain
  prominent and accessible even when sync is enabled.
- **Backup must be required before migrations.** Any future IndexedDB migration
  phase must require a successful backup export before the migration proceeds.
  The UI must enforce this.
- **Backup round-trip validation is required before storage changes.** The
  following must be validated before any storage architecture change is
  implemented:
  - `fsrsPayload` round-trips correctly through `v2BackupRestore`.
  - `fsrsEnabledAt` is preserved through backup restore (already protected by
    `importSettings()` write-once guard).
  - `fsrsReviewLogs` are capped at 20 and round-trip with all fields intact.
- **Phase 16C or later must include FSRS backup round-trip validation
  planning** as part of the storage/import safety audit.

The `v2BackupRestore.js` framework is mature: versioned schema, three modes
(FULL/REDACTED/PROGRESS_ONLY), transactional restore with rollback, and
settings/FSRS metadata preservation. It is the reference implementation for
all future data preservation work.

---

## 9. Claim guardrails

### Safe claims after Phase 16B

```
Hybrid local-first ADR exists.
Optional sync direction is planned, not implemented.
No sync runtime exists.
No IndexedDB migration has occurred.
Backup/export/import remains the primary portability model.
Active FSRS remains experimental, double-gated, default OFF,
  internal/test-controlled.
```

### Forbidden claims (permanently forbidden, carry-forward from Phase 15H)

The following categories of claims are permanently forbidden. Do not assert
any of the following in public-facing surfaces or release notes:

- That sync has been deployed, shipped, or made available to users.
- That cloud sync functionality exists or has been built.
- That a hybrid local-first sync layer has been built or activated.
- That end-to-end encryption (E2EE) has been built, certified, or enabled.
- That multi-device synchronisation is available for users.
- That a backend, server, or cloud infrastructure exists for user data.
- That account or auth infrastructure exists for users.
- That IndexedDB migration work is complete or has occurred.
- That the event log is production-ready or has been deployed.
- That the storage architecture has changed from the current localStorage model.
- That active FSRS scheduling is live for all or most users.
- That AI scheduling has been activated or rolled out.
- That any external AI, LLM, or API connection exists.
- That any production, security, or accessibility certification applies.

### Provider naming policy

Do not name specific sync providers (S3, Cloudflare R2, Supabase, Firebase,
etc.) in public docs until a provider is explicitly selected through a user
decision in a future ADR.

### E2EE mention policy

End-to-end encryption may be mentioned only as "future research, not
implemented." No E2EE provider may be named. No security certification may
be claimed.

---

## 10. Proposed Phase 16 sequence

The Phase 16 sequence was updated after Vietnamese-first UX copy was
prioritized as Phase 16A:

```
16A: Vietnamese-First UX Copy / Button Terminology Alignment
     merged | Sonnet | HIGH | low-medium risk
     → Reduced friction for Vietnamese users; no i18n framework;
       no language switcher; deferred.

16B: Hybrid Local-First Architecture / Optional Sync Direction
     docs/static-validator/CI only | Sonnet | HIGH | very low risk
     → This phase. ADR + static validator + CI registration.

16C: Storage / Large Import Safety / EduGen Bulk Import Risk Audit
     docs/tests/validator, no migration | Sonnet + Opus research | HIGH | low-medium risk
     → Storage audit, FSRS backup round-trip validation planning,
       large-import risk documentation.

16D: Shime Study Identity / Product Principles
     docs/static-validator/CI only | Sonnet + Opus research | HIGH | low risk
     → Product identity ADR, study philosophy documentation.

16E: Visual Polish Quick Wins
     runtime UI polish, no learning logic changes | Codex or Sonnet | HIGH | medium risk
     → UI refinements, accessibility improvements, visual consistency.

16F: EduGen Connector Plan / Draft Workshop Architecture
     docs/static-validator/CI only | Opus + Sonnet | HIGH | low risk
     → EduGen integration design, draft workshop architecture.

16G: EduGen Connector Runtime
     optional connector, draft-only, no AI/OCR overclaim | Codex/Sonnet | HIGH or MAX | high risk
     → EduGen connector implementation if scope and claims are safe.
```

**Strategic order must be preserved:**
Vietnamese UX → Local-first ADR → Storage/bulk-import safety →
Shime identity → Visual polish → EduGen plan → EduGen runtime.

Runtime phases (16E, 16G) must not begin until their upstream docs phases
are merged and CI-validated.

---

## 11. Model / agent strategy

| Agent | Responsibilities |
|---|---|
| **Opus 4.7** | Architecture Decision Records; conflict/migration risk analysis; final review before any HIGH-risk runtime phase merges (storage adapter, IndexedDB migration, sync adapter) |
| **Sonnet (claude-sonnet-4-6)** | All `docs/phase*.md` ADRs; all `scripts/validate-phase*.js` validators; CI registration (`e2e-smoke.yml`); moderate copy/UX phases |
| **Codex** | All `src/` runtime changes; all `tests/` additions; refactors touching multiple source files |
| **Reviewer (ultrareview)** | Before any HIGH-risk runtime merge; after Phase 16B ADR to validate architectural soundness |
| **Tester** | Manual smoke after each runtime phase; backup/restore regression with FSRS-active data; cross-device restore simulation for sync validation |

**No parallel agents may touch the same runtime files.** Two Codex sessions
must never run simultaneously on the same `src/` file. File ownership must
be re-confirmed at each phase kickoff.

---

## 12. File ownership guidance

**Sonnet (Claude) owns — docs/validator lane:**

```
docs/phase*.md                     — ADRs, closure docs
scripts/validate-phase*.js         — Static validators
.github/workflows/e2e-smoke.yml    — CI registration
```

**Codex owns — runtime lane (future phases):**

```
src/state/reviewScheduleStorage.js
src/state/settingsStorage.js
src/quiz/reviewSchedulerAdapter.js
src/quiz/fsrsWrapper.js
src/state/v2BackupRestore.js
src/quiz/dataBackup.js
src/routes/Dashboard.jsx
src/routes/StudyRoom.jsx
src/utils/storage.js

NEW (future): src/storage/StorageAdapter.js
NEW (future): src/storage/LocalStorageAdapter.js
NEW (future): src/storage/IndexedDBAdapter.js
```

**Coordination rules:**

- Codex must not begin runtime work until the relevant ADR/docs phase is
  merged and CI passes.
- Storage runtime and EduGen runtime phases must not overlap unless file
  ownership is strictly separated.
- Re-confirm file ownership at each phase kickoff before work begins.

---

## 13. Risk register

| Risk | Severity | Cause | Mitigation |
|---|---|---|---|
| Data loss during IndexedDB migration | CRITICAL | Failed migration, partial write | Backup-first mandatory; keep localStorage until verified; rollback harness |
| FSRS `fsrsPayload` corruption during sync merge | CRITICAL | Remote overwrites newer local payload | Validate `reps+lapses` before merge; never overwrite higher-reps record |
| Duplicate review sessions from sync | HIGH | Same session synced twice | `sessionId` deduplication in merge; event log `sessionId` field required |
| Stale remote overwrite | HIGH | Remote data is older but synced after local | Compare `lastReviewedAt` + `reps`; never use wall-clock alone |
| `fsrsActiveSchedulingEnabled` synced to other devices | HIGH | Settings object includes internal flag | Strip this field from all sync payloads; enforced in sync adapter spec |
| localStorage quota exceeded during large EduGen import | HIGH | Large import + overhead exceeds quota | Pre-import storage estimate; backup-first; chunked import with resume |
| Privacy/sync/E2EE overclaim | HIGH | Marketing language implies guarantees | Claim guardrails in Phase 16B; validator enforcing forbidden phrases |
| Backup restore conflict when sync is active | HIGH | Sync re-applies old remote after restore | Auto-pause sync on restore; require explicit re-sync confirmation |
| Scheduler kind demotion during sync | MEDIUM | Merge wrongly applies SM-2 fallback | Use `getPreservedFsrsFields()` pattern in all merge paths |
| IndexedDB unavailable or blocked | MEDIUM | Browser policy blocks IndexedDB | Detect availability; fallback to localStorage; never force migration |
| Event log growing too large | MEDIUM | Unbounded global event log | FSRS_REVIEW_LOG_CAP=20 precedent; global log needs compaction plan |
| Parallel agent file conflicts | MEDIUM | Two agents edit same runtime file | File-ownership table; phase kickoff re-confirmation |
| Provider lock-in | MEDIUM | Choosing sync backend early | Define SyncAdapter interface first; mock only; no real provider until decided |
| Vietnamese-first hardcoded copy delaying future i18n | LOW | Direct Vietnamese strings without locale infrastructure | Documented as intentional in Phase 16A; natural seed for future `vi` locale |
| `fsrsEnabledAt` cleared by backup restore | LOW | Restore overwrites settings | Already mitigated by `importSettings()` write-once guard |
