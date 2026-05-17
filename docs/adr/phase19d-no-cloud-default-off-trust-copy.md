# Phase 19D — No-Cloud / Default-Off Trust Copy

## Purpose

Phase 19D is a docs/static-validator/CI-only no-cloud / default-off trust copy gate
for Shime Quiz / ShimeChamhoc v2. It does not implement sync. It does not implement
any runtime. It does not unlock any sync implementation work in subsequent phases.
Its only job is to define the Vietnamese-first trust copy boundaries and the allowed
and forbidden claim rules that all future phases and user-facing copy must follow.

Phase 19D is the third gate in the optional sync safety track:

- Phase 19B — selected the HYBRID_STAGED_APPROACH for optional sync.
- Phase 19C — defined the EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK conflict model.
- Phase 19D (this gate) — defines the no-cloud / default-off trust copy in docs only.

The trust copy documents produced by this phase are:

- `docs/trust/no-cloud-default-off.vi.md` (Vietnamese, primary)
- `docs/trust/no-cloud-default-off.md` (English, companion)

The Vietnamese trust copy is the source of truth. The English copy is the companion.

---

## Relationship to Phase 19B

Phase 19B established:

```text
FINAL_DECISION: HYBRID_STAGED_APPROACH
```

Phase 19B non-negotiable guardrails that Phase 19D inherits unchanged:

- localStorage remains the canonical production source of truth.
- No sync runtime exists.
- No account/auth/backend exists.
- No cloud sync exists.
- No production IndexedDBAdapter exists.
- No runtime migration exists.
- No dual-write exists.
- No localStorage deletion happens.
- Backup/export/restore behavior remains unchanged.
- Manual transfer comes before runtime sync.
- No sync runtime before conflict model and trust copy gates are merged.
- No sync runtime before backup-before-merge is a static-validator invariant.

Phase 19B directed Phase 19D to define the no-cloud / default-off trust copy in
docs only, with Vietnamese-first as the authoring principle.

---

## Relationship to Phase 19C

Phase 19C established:

```text
CONFLICT_MODEL_DECISION: EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK
```

Phase 19C contributions relevant to Phase 19D trust copy:

- Backup-before-merge elevated to a static-validator invariant.
- Per-family merge policies declared (docs-only; no runtime).
- FSRS/review schedule conflict policy recorded: no silent merge, device-authoritative
  default, per-record revision clock minimum, backup-before-merge mandatory.
- Families that must never auto-sync: backup/restore payloads, migration journals.
- Vietnamese-first copy for conflict UI deferred to Phase 19D or Phase 20C.

Phase 19D trust copy must reflect Phase 19C's conflict model guardrails. The
forbidden-claim list in Phase 19D must be consistent with Phase 19C's safety rules.

---

## Vietnamese-first decision

Phase 19D's authoring principle is Vietnamese-first:

- The Vietnamese trust copy (`docs/trust/no-cloud-default-off.vi.md`) was authored
  first and is the primary source of truth.
- The English trust copy (`docs/trust/no-cloud-default-off.md`) is a companion
  document and must remain consistent with the Vietnamese version.
- Any conflict or ambiguity between the two is resolved by the Vietnamese version.
- All future user-facing trust copy for Shime must follow the same Vietnamese-first
  principle, given that Shime's primary users are Vietnamese learners.

---

## Trust copy files

| File | Role | Status |
|---|---|---|
| `docs/trust/no-cloud-default-off.vi.md` | Vietnamese trust copy (primary, source of truth) | Created by Phase 19D |
| `docs/trust/no-cloud-default-off.md` | English trust copy (companion) | Created by Phase 19D |

Both files must be present and internally consistent before Phase 19D is considered
complete.

---

## Allowed claims

The following claims are honest and defensible. Future phases and user-facing copy
may use these:

- local-first by default
- no account required
- no login required
- no cloud sync today
- no Shime server today
- data stays on this device unless exported
- backup and restore are manual user-controlled actions
- manual transfer comes before sync
- optional sync remains unshipped
- conflict model is a design decision only (not yet implemented)
- backup-before-merge is a future invariant

---

## Forbidden claims

The following claims describe features that do not exist or make guarantees Shime
cannot provide. They are forbidden from appearing in any user-facing copy, README,
landing page, marketing, or in-product UI:

- sync exists
- cloud sync exists
- account/auth/backend exists
- Shime stores your data in the cloud
- encrypted end-to-end
- zero-knowledge
- sync just works
- no conflicts
- data-loss prevention is guaranteed
- FSRS sync is available
- review schedules sync automatically
- production sync is ready
- production IndexedDB storage exists
- backup/export is adapter-aware
- restore is adapter-aware

These forbidden claims may appear only inside explicitly labelled
"forbidden claims" or "claims Shime must not make" sections of trust documentation.
They must not appear elsewhere in any user-visible context.

---

## User-facing copy boundaries

Phase 19D defines the following copy boundaries. These boundaries apply to all
future phases, user-facing documentation, README, and in-product UI:

1. **Backup vs sync boundary**: "Backup" must never be described as, implied to be,
   or confused with "sync." Backup is user-initiated. Sync is device-initiated.
   These are two distinct paths and must remain visually and semantically separate.

2. **Restore warning**: Any restore action must carry a warning that it may overwrite
   current data. "Restore may overwrite current data" is a required copy element.

3. **Manual transfer boundary**: Cross-device data movement today is manual transfer,
   not sync. Copy must not imply that Shime handles multi-device scenarios
   automatically.

4. **Conflict honesty boundary**: Copy must not promise "no conflicts." If conflicts
   are possible (they are, in any sync or transfer scenario), the copy must be silent
   on that claim or explicitly acknowledge the risk.

5. **FSRS copy boundary**: FSRS scheduling is not publicly opt-in today. No copy
   may imply that FSRS data syncs, merges, or moves between devices automatically.

6. **Vietnamese-first pairing**: For any trust-critical user-facing string, both a
   Vietnamese version and an English version must be maintained. Vietnamese is the
   primary version; English is the companion.

---

## Validator and CI guardrails

The Phase 19D static validator (`scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`)
must check:

- Required Vietnamese trust doc exists at `docs/trust/no-cloud-default-off.vi.md`
- Required English trust doc exists at `docs/trust/no-cloud-default-off.md`
- Required ADR exists at `docs/adr/phase19d-no-cloud-default-off-trust-copy.md`
- Required Phase 19D validator exists at
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`
- CI registers Phase 19D validator after Phase 19C validator in
  `.github/workflows/e2e-smoke.yml`
- Workflow does not use `continue-on-error: true`
- `package.json` unchanged
- `package-lock.json` unchanged
- No `src/` changes
- No `tests/` changes
- No `e2e/` changes
- No FSRS runtime file changes
- No storage/migration runtime file changes
- No backup/export/restore runtime changes
- No dependency additions
- Forbidden runtime files absent (EventLog.js, SyncAdapter.js, conflictResolver.js,
  operationLog.js, tombstones.js, deviceIdentity.js, syncStorage.js,
  adapterBackupBridge.js, syncEngine.js)
- Vietnamese doc required headings exist
- English doc required headings exist
- ADR required headings exist
- Vietnamese required terms exist
- English required terms exist
- Allowed claim terms exist in trust docs
- Forbidden positive claims absent outside explicitly labelled forbidden-claim sections
- Historical validator forward-compat entries are exact Phase 19D paths only
  (no broad allowlists)
- No generated artifacts in tracked/changed files

---

## What Phase 19D explicitly does not implement

Phase 19D does not implement any of the following:

- Phase 19D does not implement sync runtime.
- Phase 19D does not implement account/auth/identity.
- Phase 19D does not implement a Shime-hosted backend.
- Phase 19D does not implement a remote endpoint.
- Phase 19D does not implement cloud sync.
- Phase 19D does not implement file-based sync.
- Phase 19D does not implement dual-write between backends.
- Phase 19D does not implement an app-boot migration.
- Phase 19D does not implement a production storage backend switch.
- Phase 19D does not implement a production IndexedDBAdapter.
- Phase 19D does not implement a runtime migration.
- Phase 19D does not delete localStorage entries.
- Phase 19D does not change backup/export/restore behavior.
- Phase 19D does not change FSRS behavior.
- Phase 19D does not change the active FSRS double-gate.
- Phase 19D does not ship public FSRS opt-in.
- Phase 19D does not change user-facing production UI copy.
- Phase 19D does not add tests of production behavior.
- Phase 19D does not add dependencies.
- Phase 19D does not add UI.
- Phase 19D does not add a settings sync toggle.
- Phase 19D does not implement conflict resolver runtime.
- Phase 19D does not implement event log runtime.
- Phase 19D does not implement tombstone runtime.
- Phase 19D does not implement device identity runtime.
- Phase 19D does not unlock sync implementation in any subsequent phase by its
  own existence; each subsequent phase must clear its own gate.

---

## Go/no-go criteria for Phase 20A

Phase 20A (`Phase 20A — Local-first hybrid runtime stabilization audit`) may
proceed when all of the following hold:

Go criteria:

- Phase 19D is merged and CI is green.
- The Vietnamese trust copy (`docs/trust/no-cloud-default-off.vi.md`) exists and
  includes all required headings and terms.
- The English trust copy (`docs/trust/no-cloud-default-off.md`) exists and includes
  all required headings and terms.
- This ADR (`docs/adr/phase19d-no-cloud-default-off-trust-copy.md`) exists and
  includes all required headings.
- Forbidden sync/cloud/account/auth claims remain blocked.
- No runtime changes happened in Phase 19D.
- Phase 20A scope is confirmed as docs/static-validator/CI-only (audit only).

No-go criteria:

- Any request to implement sync runtime.
- Any request to ship account/cloud/auth/backend.
- Any request to expose sync UI.
- Any request to claim encrypted end-to-end or zero-knowledge.
- Any request to silently merge FSRS/review schedule data.
- Any request to make backup payloads sync targets.
- Any request to jump directly from Phase 20A into sync runtime.

Phase 20A must not jump directly into sync runtime. Phase 20A is a stabilization
audit — it confirms that Phase 17B StorageAdapter scaffold and Phase 18A
IndexedDBAdapter prototype remain test-only, and that Phase 18E synthetic pilot
remains internal.

---

## Future sequencing

The full future sequencing from Phase 19D onward is recorded here for continuity.
None of these are commitments. Each is its own gate.

- **Phase 20A** — Local-first hybrid runtime stabilization audit. Confirm Phase 17B
  StorageAdapter scaffold and Phase 18A IndexedDBAdapter prototype remain test-only.
  Confirm Phase 18E synthetic pilot remains internal. Docs/static-validator/CI-only.
- **Phase 20B** — Manual transfer archive design. Choose the canonical transfer
  archive shape extending the v2 backup format. Docs/static-validator/CI-only.
- **Phase 20C** — Manual transfer UX design. Vietnamese-first copy drafts. Include
  conflict UI copy drafts. Docs/static-validator/CI-only.
- **Phase 20D** — Manual transfer runtime gate. First phase that could plausibly ship
  manual cross-device transfer runtime, but only if Phases 20A–20C cleared.
  Still no sync. Still no cloud. Still no account.

Before any sync runtime (Option C or D) is considered:

1. Manual transfer has shipped and survived one full real-beta cycle.
2. Phase 19C conflict model ADR is merged and static-validator rules are live.
3. Phase 19D trust copy (this document) is merged in Vietnamese and English.
4. Backup-before-merge is a static-validator invariant.
5. The StorageAdapter has a real (not test-only) adapter for the chosen sync target.
6. Phase 17D/17E/17F event-log/manifest/journal designs are promoted from test-only
   prototypes to runtime contracts.
7. FSRS public opt-in has shipped per the Phase 19A sequencing gate.
8. A documented and rehearsed rollback story exists.
9. The allowed/forbidden claims appendix has been honored across all copy surfaces
   in both Vietnamese and English.
10. Solo/small-team support capacity is confirmed sufficient.

---

## Acceptance criteria

Phase 19D is complete when all of the following hold:

- This ADR (`docs/adr/phase19d-no-cloud-default-off-trust-copy.md`) is present and
  includes all required headings and decision terms.
- Vietnamese trust copy (`docs/trust/no-cloud-default-off.vi.md`) is present and
  includes all required headings and required Vietnamese terms.
- English trust copy (`docs/trust/no-cloud-default-off.md`) is present and includes
  all required headings and required English terms.
- The Phase 19D static validator (`scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`)
  is present, registered in `.github/workflows/e2e-smoke.yml` after the Phase 19C
  validator, and passes.
- The full validator chain passes with `FINAL_STATUS=0`.
- No `src/` files changed.
- No `tests/` files changed.
- No `e2e/` files changed.
- `package.json` unchanged.
- `package-lock.json` unchanged.
- No FSRS runtime files changed.
- No storage/migration runtime files changed.
- No backup/export/restore runtime files changed.
- No dependencies added.
- No UI added.
- No sync runtime added.
- No account/auth/backend added.
- No remote endpoint added.
- Backup/export/restore behavior unchanged.
- FSRS behavior unchanged.
- localStorage remains the canonical production source of truth.
- No forbidden positive claims appear outside explicitly labelled forbidden-claim
  sections in this ADR or the trust copy files.
- Historical validator forward-compat entries are restricted to exact Phase 19D paths
  only (no broad allowlists).
