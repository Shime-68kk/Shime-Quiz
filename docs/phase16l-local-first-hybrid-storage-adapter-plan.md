# Phase 16L — Local-First Hybrid / StorageAdapter Plan

## Result

Planning only / ADR locked.

Phase 16L is docs / static-validator / CI only. Do not implement runtime
architecture. Do not create `src/storage/`. Do not create StorageAdapter,
LocalStorageAdapter, IndexedDBAdapter, SyncAdapter, or EventLog runtime.
Do not create sync, cloud, account, auth, or migration runtime.

This phase converts the Opus 4.7 MAX local-first hybrid research into an
in-repo Architecture Decision Record (ADR) that locks the safe sequencing for
the storage track from Phase 16L through Phase 20.

The single load-bearing rule of this ADR:

```
Storage migration must trail safety, not lead it.
Backup/rollback harness is the gate before any migration.
Do not implement IndexedDB or sync before the harness exists.
Manual backup/export/import remains a core trust feature.
```

---

## Executive Recommendation

Shime Quiz / ShimeChamhoc v2 is a local-first, Vietnamese-first study room.
The next strategic track is **local-first hybrid**: stronger local data
architecture (eventually a `StorageAdapter` boundary, optional IndexedDB
backend, optional sync, optional event log) **without** losing local
ownership, recoverability, privacy, or simplicity.

The Opus 4.7 MAX research confirms that the **current storage surface is not
yet safe enough to migrate**. Specifically:

- Backup currently relies on a probe write / doubled write risk before the
  real backup runs.
- There is no single import entry point: Library import and full restore
  differ.
- Two storage families coexist: shimeV2*V1 and legacy quiz*V1.
- Auto-remove on parse/schema mismatch is a silent data-loss surface.
- Restore is sequential and rollback is best-effort, not transactional.

Given these risk hotspots, the correct sequence is:

```
16L — Local-first hybrid / StorageAdapter ADR        (this phase)
16M — StorageAdapter boundary + test harness plan
17A — Backup/Rollback Harness BEFORE migration
17B — StorageAdapter scaffold behind localStorage/no-op driver
17C — IndexedDB dry-run harness
17D — Event Log research/prototype plan
17E+ — per-key live migration only after safety gates
18+  — optional sync architecture, no cloud-first default
19+  — FSRS public opt-in only after storage track is stable
20   — beta maturity / user testing / research feedback integration
```

Phase 16L is **not** a user-facing feature. The recommendation is to merge
the ADR, register the validator in CI, and proceed to Phase 16M next.

---

## Current Storage Architecture Map

Storage today is **localStorage-backed, schema-versioned**, owned by a small
set of modules in `src/state/`, `src/data/`, `src/quiz/`, and `src/utils/`.
Routes (`src/routes/Library.jsx`, `Settings.jsx`, `Dashboard.jsx`,
`StudyRoom.jsx`) read and write through those modules. There is no
`src/storage/` directory and no `StorageAdapter` runtime yet.

Logical layers today:

```
Routes / UI components
  └── src/routes/ , src/components/
       └── domain modules
            └── src/state/        — settings, schedule, FSRS metadata storage
            └── src/data/         — learning data adapter, import validator
            └── src/quiz/         — review scheduler adapter, FSRS wrapper, data backup
            └── src/edugen/       — EduGen draft connector (Draft Workshop only)
                 └── src/utils/storage.js                — localStorage helper
                      └── window.localStorage  (canonical)
```

Two storage families coexist on the same `window.localStorage`:

| Family | Status | Example keys (illustrative) |
|---|---|---|
| `shimeV2*V1` | Active canonical (Phase 14+ schema) | settings, schedule, FSRS metadata, library v2 |
| Legacy `quiz*V1` | Read-supporting compatibility shim | older quiz/library records |

Backup / export / import paths:

- **`v2BackupRestore`** — versioned, multi-mode FULL / REDACTED /
  PROGRESS_ONLY backup; transactional restore with best-effort rollback;
  settings + FSRS metadata preservation.
- **Library import** (`src/routes/Library.jsx`) — paste / file upload path;
  does **not** go through the full-restore code path.
- **`dataBackup.js`** — backup composition / probe-write side effects.
- **`storageQuotaEstimate.js`** — `navigator.storage.estimate()` advisory
  signals + `LARGE_IMPORT_ITEM_THRESHOLD` advisory for large EduGen imports.
- **`BackupBeforeImportNotice.jsx`** (Phase 16K) — advisory copy in the
  Library import preview reminding users to back up before large imports.

Review schedule state lives in `src/state/reviewScheduleStorage.js` and is
read/written by `src/quiz/reviewSchedulerAdapter.js`. FSRS metadata is
double-gated, default OFF, and lives alongside schedule records (the
`fsrsPayload`, `fsrsReviewLogs`, `fsrsEnabledAt`, `schedulerKind`,
`schedulerVersion` fields). EduGen source metadata is preserved on imported
draft cards (Phase 16G/16H) and must continue to round-trip through backup.

Assumptions tied to localStorage today:

- Synchronous read/write semantics.
- Stringified JSON values.
- Quota of ~5 MB (browser-dependent) with no transactional API.
- No first-class index, query, or multi-key transaction.
- Single-tab consistency only.

---

## Storage Families

Two families on the same backend require deliberate handling during any
future migration:

```
Family A — shimeV2*V1
  Canonical. Active reads/writes.
  Schema-versioned envelopes.
  Covered by v2BackupRestore.

Family B — legacy quiz*V1
  Read-supporting only. Compatibility shim.
  Not the canonical write path.
  Must round-trip through backup unmodified.
```

Migration to any new backend (e.g. IndexedDB) must treat **Family B as
read-supporting through the same adapter boundary**. The migration must not
silently drop Family B records, and must not auto-rewrite them into Family A
shape without explicit user-facing decision.

---

## Current Risk Hotspots

These are the load-bearing findings from the Opus 4.7 MAX research. The ADR
documents them so future phases cannot start migration before they are
addressed.

1. **Probe write / quota risk before backup.** The current backup path
   performs a probe write to estimate writeability before composing the real
   backup. Under quota pressure this risks doubling the write footprint at
   exactly the moment storage is most fragile.

2. **No single import entry point.** Library import and full backup restore
   use different code paths and different validation, so a single
   "import is safe" guarantee cannot be made today.

3. **Two storage families coexist.** shimeV2*V1 (canonical) and legacy
   quiz*V1 (compatibility) live on the same `window.localStorage` surface.
   Any migration must handle both, or must explicitly decide to leave
   Family B in place.

4. **Auto-remove on parse / schema mismatch is silent data loss.** Existing
   code paths can remove entries whose JSON does not parse or whose schema
   does not match. There is no quarantine bucket and no user-visible
   recovery. This is a data-loss surface that migration would amplify.

5. **Restore is sequential; rollback is best-effort, not transactional.**
   `v2BackupRestore` writes records one at a time. If write N+1 fails, the
   earlier N writes are not atomically reverted; rollback is best-effort.
   localStorage offers no multi-key transaction primitive.

These hotspots imply: **do not migrate before a real backup/rollback harness
exists** (Phase 17A).

---

## Local-First Hybrid Principles

Carry-forward and re-affirmation of the principles from
`docs/phase16b-hybrid-local-first-optional-sync-direction.md` and
`docs/phase16d-shime-study-identity-product-principles.md`:

1. **Local-first ownership.** Local browser data is canonical. Remote sync,
   if ever added, is never canonical.
2. **Full offline functionality.** Every core flow works without network
   access and without any account.
3. **No account required.** No feature may require account creation.
4. **Backup / export / import is the primary portability primitive.** It is
   not a legacy fallback. It remains a core trust feature even if optional
   sync is later added.
5. **Graceful degradation on storage failure.** Quota exceeded must surface
   the error and encourage manual backup. No silent discard.
6. **No silent data mutation.** No automatic merge, sync, or migration
   without explicit user awareness.
7. **No mandatory network or cloud dependency.**
8. **Migration trails safety.** Backup/rollback harness comes before any
   real migration. Dry-run harness comes before any live migration.
9. **Reversibility.** Any migration step must have a documented rollback
   path that has been exercised in tests.
10. **Vietnamese-first calm UX.** Storage error and recovery copy must be
    written in Vietnamese-first, calm-room tone, not alarmist.

These principles are permanent. They apply to all Phase 17+, Phase 18+,
Phase 19+, and Phase 20 work.

---

## StorageAdapter Boundary Proposal

The future `StorageAdapter` is a **boundary**, not a rewrite. It must be
retrofitted over current localStorage paths, not introduced as a sweeping
replacement.

What the adapter should abstract (planning only — no runtime in 16L):

```
StorageAdapter.read(key)           : Promise<unknown | null>
StorageAdapter.write(key, value)   : Promise<void>
StorageAdapter.remove(key)         : Promise<void>
StorageAdapter.listKeys(prefix?)   : Promise<string[]>
StorageAdapter.estimateUsage()     : Promise<{ usage, quota } | null>
StorageAdapter.snapshot()          : Promise<Record<string, unknown>>
StorageAdapter.restoreSnapshot(s)  : Promise<void>
```

Driver implementations envisioned (each is a future phase, not now):

- `LocalStorageAdapter` — wraps current `src/utils/storage.js`. No semantic
  change at first; gives us a seam to instrument.
- `NoOpAdapter` — in-memory; used by tests and dry-run harness.
- `IndexedDBAdapter` — future, only after dry-run harness + backup harness
  pass.

Modules that should eventually call through the adapter (still call directly
today; this is a future contract, not a present requirement):

- `src/state/settingsStorage.js`
- `src/state/reviewScheduleStorage.js`
- `src/state/v2BackupRestore.js`
- `src/data/learningDataAdapter.js`
- `src/quiz/dataBackup.js`
- `src/utils/storage.js`

Modules that must **not** know about the storage backend:

- Routes (`src/routes/*`)
- UI components (`src/components/*`)
- Scheduler (`src/quiz/reviewSchedulerAdapter.js`, `src/quiz/fsrsWrapper.js`)
- EduGen draft components

Error handling contract (future):

- Quota-exceeded errors must be a typed error, not a generic throw.
- Parse / schema mismatch must surface as a typed "quarantine" outcome,
  not auto-remove.
- All write paths must be retryable; rollback must be a first-class API.

Testing approach (future):

- The boundary must be unit-testable in isolation via a `NoOpAdapter`.
- A property-based round-trip test (`write → read → equals input`) must run
  for every adapter driver.
- Backup → restore → readback round-trip must be a CI test.

Versioning:

- Adapter API version (`adapterApiVersion: 1`) separate from schema version.
- Driver capability flags (`supportsListKeys`, `supportsSnapshot`, etc.).

No `src/storage/` files are created in Phase 16L. The boundary is described,
not built.

---

## Why IndexedDB Must Wait

IndexedDB is attractive because it offers larger quota, asynchronous writes,
and a real transaction API. It is **not safe to introduce yet**.

Reasons IndexedDB must wait:

1. The five risk hotspots above (probe write, no single import entry,
   two families, auto-remove, best-effort rollback) all amplify under a
   schema-translating migration.
2. There is no backup/rollback harness today (Phase 17A is the gate).
3. There is no dry-run harness today (Phase 17C is the gate).
4. Backup/export/import is the trust primitive; until a migration can
   demonstrate full round-trip via backup, it is not allowed to ship.
5. FSRS metadata (`fsrsPayload`, `fsrsReviewLogs`, `fsrsEnabledAt`) must
   round-trip. Combining IndexedDB migration with public FSRS rollout is
   explicitly forbidden — they must not ship together.
6. Browser policy can block IndexedDB (private mode, storage partitioning).
   The adapter boundary must detect availability and fall back, never force
   migration.

IndexedDB migration order, once safety gates exist:

```
1. Phase 17A — Backup/Rollback Harness lands. Round-trip is provable.
2. Phase 17B — StorageAdapter scaffold lands, behind LocalStorageAdapter
               (or NoOp). No behavior change to users.
3. Phase 17C — IndexedDBAdapter dry-run harness. Read+write to IndexedDB
               in a shadow channel; compare against canonical localStorage;
               no live cutover.
4. Phase 17E+ — Per-key live migration. Settings first (smallest, safest).
                Schedule and FSRS metadata last (most precious). Each
                migrated key has its own rollback marker and verification.
```

No phase shall skip ahead.

---

## Backup and Rollback Harness Requirements

Phase 17A is the **mandatory gate** before any migration begins. It must
deliver:

1. **Mandatory pre-migration backup.** No migration code path may run
   without a fresh successful export within the current session. Enforced
   by UI gate, not just docs.
2. **Migration dry-run.** Read-only simulation of the migration on the
   user's real data, producing a report of read/parse/translate outcomes
   without writing anywhere.
3. **Read-after-write verification.** Every migrated key is read back and
   deep-equality-compared against the source value. Mismatch aborts the
   migration.
4. **Rollback path.** A documented, tested rollback that restores the prior
   state from the pre-migration snapshot. Best-effort is not acceptable;
   the test suite must exercise it.
5. **Migration status marker.** A versioned marker key
   (`shimeV2.migrationStatus`) recording in-progress / complete / aborted
   states so a partial run can be detected and resumed or rolled back.
6. **Version compatibility check.** Before migration, schema version must
   match; on mismatch, abort with clear user-facing copy.
7. **User-visible recovery copy.** Calm-room Vietnamese-first copy
   explaining: "Sao lưu trước. Nếu lỗi, dữ liệu cục bộ giữ nguyên."
8. **Automated tests.** Round-trip, abort, resume, rollback, quota-exceeded,
   and schema-mismatch tests run in CI.
9. **Manual smoke tests.** A documented manual run-pack matching the
   existing `docs/manual-evidence-*` style.

Until all nine are satisfied, **no IndexedDB code may run on real user data.**

---

## Event Log Direction

An append-only local event log is a planned future design. No production
event log exists today.

Planning seed exists in `fsrsReviewLogs` with `FSRS_REVIEW_LOG_CAP = 20`,
which demonstrates the cap/compaction precedent.

Phase 17D will research-only the event log direction. Considerations:

- **Benefits.** Reconstructable state; better conflict resolution if sync is
  ever added; better observability of review behavior.
- **Risks.** Unbounded growth; replay complexity; privacy implications;
  storage cost.
- **Privacy.** Event records must never contain answer text plaintext beyond
  what is already in cards. Never log free-text in a way that escapes
  existing redaction.
- **Compaction.** A global event log requires a stronger compaction policy
  than the cap-20 per-item precedent.

Event log runtime must **not** be implemented before StorageAdapter and
before backup/rollback harness. It is later, not earlier.

---

## Optional Sync Boundary

Sync is a planned future direction, not implemented. There is no sync
runtime. There is no cloud / account / auth runtime.

If sync is ever added, the safe constraints are:

- **User-initiated and opt-in.** Never on by default; never account-gated.
- **Local is canonical.** Remote sync storage is never canonical.
- **Backup-first.** A successful backup must exist before any sync that
  could overwrite local data.
- **Conflict-visible.** No silent auto-merge on ambiguous records.
- **Validated via the same schema validators** as `v2BackupRestore`.
- **Paused after backup restore** until explicit user re-sync.
- **No provider chosen here.** No Supabase, Firebase, Cloudflare, S3, etc.
  named as the decided provider. Provider selection is a future ADR with
  user decision.

Permanent non-goals (carry-forward from Phase 16B):

- Server-side storage of quiz answers as canonical.
- Automatic sync on any trigger.
- Mandatory cloud account.
- Real-time collaborative editing.
- Syncing `fsrsActiveSchedulingEnabled` between devices.
- Syncing FSRS optimizer parameters.

Sync user-facing copy must not claim cloud sync, E2EE, or multi-device
sync exists until and unless it has shipped behind a user-controlled opt-in
with the constraints above.

---

## FSRS Interaction

FSRS today is **experimental, double-gated, default OFF**, with controlled
internal activation harness (Phase 15E). There is no public active FSRS
rollout.

Phase 16L locks the rule: **FSRS public rollout must not be combined with
storage migration.**

Implications:

- Storage migration phases (17A–17E+) must preserve all FSRS fields
  unchanged: `schedulerKind`, `schedulerVersion`, due / interval fields,
  `fsrsPayload.stability`, `fsrsPayload.difficulty`, `fsrsPayload.state`,
  `fsrsPayload.reps`, `fsrsPayload.lapses`, `fsrsReviewLogs`,
  `fsrsEnabledAt`.
- `fsrsActiveSchedulingEnabled` must remain device-internal and must not
  be migrated as if it were user-facing settings (no auto-enable on
  migration).
- Public FSRS opt-in (Phase 19+) must come **after** the storage track is
  stable. It must not ride along with a migration commit.
- Backup must round-trip FSRS metadata before migration is allowed. This
  is covered by Phase 17A.

---

## EduGen / Source Metadata Interaction

EduGen is **Draft Workshop**, not built-in AI / OCR / cloud generator.
Source metadata (where a draft card came from, e.g. user paste, PDF source)
is preserved on imported items (Phase 16F/16G/16H).

Storage migration must:

- Preserve EduGen `sourceMetadata` round-trip through backup unchanged.
- Treat EduGen-imported items the same as any other library item from a
  storage perspective. No special storage class.
- Never claim built-in AI / OCR / cloud generation as a result of any
  storage migration.
- Honour `LARGE_IMPORT_ITEM_THRESHOLD` advisory (Phase 16K) during any
  bulk import that runs before / after migration.

EduGen remains a Draft Workshop layer above storage. The adapter boundary
does not change EduGen's semantics.

---

## Roadmap Through Phase 20

```
Phase 16L — Local-first hybrid / StorageAdapter ADR
  Purpose: lock the safe sequencing; document risk hotspots
  Model: Claude Sonnet 4.6 HIGH (this phase)
  Type: docs/static-validator/CI only
  Allowed: docs/*, scripts/validate-*, .github/workflows/e2e-smoke.yml,
           README.md, docs/public-release-notes.md,
           docs/deployment-readiness.md (if needed)
  Forbidden: src/, e2e/, tests/, package.json, package-lock.json
  Validation: validator + full chain FINAL_STATUS=0
  Exit: ADR merged, validator green
  Next dependency: 16M

Phase 16M — StorageAdapter Boundary ADR / Test Harness Plan
  Purpose: detailed adapter API contract and test harness plan
  Model: Sonnet HIGH (with optional Opus review)
  Type: docs/static-validator/CI only
  Allowed: docs/phase16m-*, scripts/validate-phase16m-*, workflow
  Forbidden: src/, runtime adapter code
  Exit: contract reviewed; test plan agreed
  Next dependency: 17A

Phase 17A — Backup/Rollback Harness BEFORE Migration
  Purpose: implement and prove backup/rollback harness on current
           localStorage; no migration yet
  Model: Codex/Sonnet HIGH, with Opus risk review
  Type: runtime (src/) + tests; no schema migration; no IndexedDB
  Allowed: src/state/v2BackupRestore.js, src/quiz/dataBackup.js,
           backup-related UI, tests
  Forbidden: src/storage/, IndexedDB, sync, account/auth
  Exit: round-trip / abort / resume / rollback tests pass; manual
        smoke run-pack documented
  Next dependency: 17B

Phase 17B — StorageAdapter Scaffold (behind localStorage/no-op driver)
  Purpose: introduce src/storage/StorageAdapter.js with
           LocalStorageAdapter as the only driver; no behavior change
  Model: Codex/Sonnet HIGH
  Type: runtime, additive only
  Allowed: src/storage/, narrow tests, narrow updates to call sites
           that are safe to retrofit
  Forbidden: IndexedDB driver, sync driver, EventLog driver
  Exit: feature parity with current storage; all current tests green
  Next dependency: 17C

Phase 17C — IndexedDB Dry-Run Harness
  Purpose: IndexedDBAdapter behind a shadow read/write path; no live
           cutover; comparison report only
  Model: Codex/Sonnet HIGH, Opus risk review
  Type: runtime, dry-run only
  Allowed: src/storage/IndexedDBAdapter.js (dry-run only), tests
  Forbidden: live cutover, schema change, sync
  Exit: dry-run report stable; backup round-trip identical
  Next dependency: 17D or 17E

Phase 17D — Event Log Research / Prototype Plan
  Purpose: docs-only event log direction; no runtime
  Model: Sonnet/Opus research
  Type: docs/static-validator/CI only
  Allowed: docs/phase17d-*, validator
  Forbidden: src/, runtime event log
  Exit: schema + compaction policy agreed
  Next dependency: 17E

Phase 17E+ — Per-key Live Migration
  Purpose: migrate one key at a time, smallest/safest first
  Model: Codex with Opus risk review per key
  Type: runtime, gated, reversible
  Allowed: src/storage/, narrow runtime
  Forbidden: combining with FSRS public rollout
  Exit: migrated key passes round-trip + rollback tests
  Next dependency: subsequent key, or 18+

Phase 18+ — Optional Sync Architecture (no cloud-first default)
  Purpose: ADR for optional opt-in sync; provider decision separate
  Model: Opus research; Sonnet ADR
  Type: docs first; runtime only behind opt-in gate after later phase
  Exit: ADR locked; non-goals re-affirmed

Phase 19+ — FSRS Public Opt-In (only after storage stable)
  Purpose: public FSRS opt-in flag flip
  Model: Codex + Opus review
  Type: runtime, gated, after 17A–17E+ are stable
  Forbidden: shipping FSRS rollout in the same commit as migration

Phase 20 — Beta Maturity / User Testing / Research Feedback
  Purpose: collect feedback; tighten copy; finalise public claims
  Type: docs + UI polish + manual evidence run
```

This roadmap is the single source of truth for the storage track.

---

## Phase 17A Gate Criteria

Phase 17A must satisfy all of the following before any later phase may
modify storage backend or schema:

1. Mandatory pre-migration backup is enforced in the UI flow.
2. Migration dry-run produces a deterministic report.
3. Read-after-write verification covers every migrated key.
4. Rollback is exercised by automated tests.
5. Migration status marker exists and is honoured by recovery code.
6. Schema version compatibility is checked before any write.
7. Recovery copy is calm-room Vietnamese-first.
8. Automated tests cover: round-trip, abort, resume, rollback,
   quota-exceeded, schema-mismatch.
9. Manual evidence run-pack is documented (alongside existing
   `docs/manual-evidence-*` packs).
10. No `src/storage/` runtime is introduced in 17A unless it is the
    backup/rollback harness itself.

If any of the ten fails, 17B is blocked.

---

## What Not To Do Yet

The following are **forbidden** in Phase 16L and in any phase that has not
satisfied its upstream gates:

- Do not implement IndexedDB.
- Do not implement StorageAdapter runtime.
- Do not implement LocalStorageAdapter runtime.
- Do not implement SyncAdapter runtime.
- Do not implement EventLog runtime.
- Do not implement migration runtime.
- Do not implement backup/rollback runtime in 16L (it lands in 17A).
- Do not implement cloud sync.
- Do not implement account / auth / backend.
- Do not integrate a sync provider.
- Do not ship public active FSRS rollout.
- Do not expand EduGen into built-in AI or OCR.
- Do not perform storage schema migration.
- Do not perform backup format migration.
- Do not add forbidden dependencies (`idb`, `dexie`, `localforage`,
  `pouchdb`, `rxdb`, `firebase`, `supabase`).
- Do not create `src/storage/` files in Phase 16L.
- Do not modify `src/`, `e2e/`, `tests/`, `package.json`, or
  `package-lock.json` in Phase 16L.

---

## Claim Guardrails

### Safe claims after Phase 16L

```
A local-first hybrid / StorageAdapter ADR exists.
The storage track is sequenced safely behind a backup/rollback harness.
Backup/export/import remains the primary portability primitive.
FSRS public rollout is sequenced after the storage track stabilises.
EduGen is a Draft Workshop, not built-in AI / OCR / cloud.
```

### Permanently forbidden claims

The following claim categories are **permanently forbidden**. They must not
appear in public docs, README, release notes, or marketing surfaces as a
result of Phase 16L:

- claims that IndexedDB has shipped or that migration to IndexedDB has
  finished;
- claims that sync has shipped or that cloud sync has been delivered to
  users;
- claims that a backend, server, or cloud exists for user data;
- claims that account / auth infrastructure exists;
- claims that end-to-end encryption (E2EE) has shipped or been certified;
- claims that the StorageAdapter has shipped as runtime;
- claims that data-loss prevention is guaranteed, or that the product
  offers a safety guarantee (it does not — safety is a best-effort
  engineering practice, never a guarantee);
- claims that the public active FSRS rollout has happened or that FSRS is
  live for all users;
- claims that EduGen is a bundled built-in AI feature;
- claims that built-in OCR is part of the product;
- claims of production or security certification for the storage layer.

### Provider naming policy

No specific sync provider may be named as decided. Provider comparison may
exist in research notes; provider selection is a separate user-decision ADR.

### E2EE mention policy

E2EE may be mentioned only as "future research, not implemented." No E2EE
provider may be named. No security certification may be claimed.

---

## Validation Evidence

This ADR is paired with `scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js`,
which statically enforces:

- The ADR document exists at
  `docs/phase16l-local-first-hybrid-storage-adapter-plan.md`.
- `.github/workflows/e2e-smoke.yml` registers the Phase 16L validator
  after the Phase 16K validator.
- `package.json` and `package-lock.json` are unchanged.
- No files under `src/` are changed.
- No files under `e2e/` are changed.
- No `src/storage/` path exists in changed files.
- No forbidden dependencies (`idb`, `dexie`, `localforage`, `pouchdb`,
  `rxdb`, `firebase`, `supabase`) are added.
- The ADR includes the required roadmap ordering: 17A backup/rollback
  harness before 17B adapter scaffold, 17B before 17C IndexedDB dry-run,
  sync only after adapter/migration safety gates.
- The ADR includes no-runtime / no-implementation language.
- The ADR includes claim guardrails.
- The ADR includes the key Opus findings (probe write / quota risk,
  no single import entry point, shimeV2 + legacy quiz families,
  auto-remove data-loss risk, best-effort rollback risk).
- The ADR contains no positive claims for cloud sync, E2EE,
  IndexedDB done, StorageAdapter runtime done, public active FSRS
  rollout, built-in AI / OCR, or any "data safety is guaranteed"
  language.

The validator must fail closed if any of these guards is violated.
