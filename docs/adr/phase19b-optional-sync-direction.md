# Phase 19B — Optional Sync Architecture Decision

## Purpose

Phase 19B is a docs/static-validator/CI-only optional sync architecture decision gate for Shime Quiz / ShimeChamhoc v2. It does not implement sync. It does not implement any runtime. It does not unlock any sync implementation work in subsequent phases. Its only job is to record the strategic direction for optional sync, lock in the non-negotiable guardrails inherited from Phase 17/18/19A, and define the Phase 19C and Phase 19D scopes that follow.

Phase 19B preserves Shime's product identity:

- Local-first by default.
- No account required.
- No cloud sync today.
- Calm, private study room.
- Vietnamese-first trust copy.

The gate is intentionally narrow. The deliverables are this ADR, a Phase 19B static validator, and a CI registration entry that runs the validator after Phase 19A.

## Research source

This ADR consumes the research document at:

`/home/quang/Documents/quiz_beta/phase19b-optional-sync-architecture-research.md`

The research final decision is:

```text
FINAL_DECISION: HYBRID_STAGED_APPROACH
```

The research evaluates five options (A — no sync now; B — manual cross-device transfer only; C — optional encrypted file-based sync; D — optional account/cloud sync later; E — hybrid staged approach) across user trust, privacy, data ownership, implementation complexity, support burden, offline-first behavior, data-loss and conflict risk, backup/restore interaction, FSRS metadata interaction, StorageAdapter readiness, migration readiness, Vietnamese-first UX/copy difficulty, solo/small-team maintenance fit, overclaim risk, honest-explanation difficulty, and required phase gates. The research independently recommends Option E. This ADR adopts the same selection on its merits.

This ADR also consumes the implementation task at:

`/home/quang/Documents/quiz_beta/phase19b-optional-sync-architecture-decision-master.md`

The implementation task is authoritative for scope, allowed files, forbidden files, validator requirements, and artifact requirements.

## Executive decision

```text
FINAL_DECISION: HYBRID_STAGED_APPROACH
```

Phase 19B is docs/static-validator/CI-only. Phase 19B selects the HYBRID_STAGED_APPROACH for optional sync. Phase 19B does not unlock sync implementation. Sync runtime is not implemented. Account/cloud sync is not implemented. No Shime-hosted backend exists. No account/auth/identity exists. No remote endpoint exists. No dual-write exists. No app-boot migration exists. No production storage backend switch exists. No production IndexedDBAdapter exists. No runtime migration exists. No localStorage deletion happens.

localStorage remains the canonical production source of truth.

Backup/export/restore behavior remains unchanged.

Manual transfer comes before runtime sync.

No sync runtime before manual transfer has shipped and survived a real beta cycle. No sync runtime before conflict model and trust copy gates are merged. No sync runtime before backup-before-merge is a static-validator invariant.

Phase 19C should decide the conflict and event model in docs only. Phase 19D should define the no-cloud / default-off trust copy in docs only.

## Current baseline and non-negotiable guardrails

The following invariants apply to Phase 19B and must not change as a result of this decision gate. They are restated verbatim so that the Phase 19B static validator and any future static validators can cite them.

Production storage and data movement:

- localStorage remains the canonical production source of truth.
- No production IndexedDBAdapter exists.
- No production storage registry switch exists.
- No runtime migration exists.
- No dual-write between backends exists.
- No app-boot migration exists.
- No user-facing migration UI exists.
- No real data movement between backends has occurred.
- localStorage deletion is forbidden in any storage transition path that may later land.

Sync, cloud, and account:

- No sync exists.
- No cloud exists.
- No Shime-hosted backend exists.
- No account, no auth, no identity exists.
- No remote endpoint exists.
- Backup/export/restore behavior is unchanged.

FSRS and scheduler:

- Active FSRS scheduling remains experimental, double-gated, and internal/test-controlled.
- FSRS is not broadly public/user-visible.
- Phase 19A only documented the FSRS public opt-in sequencing gate; the opt-in itself did not ship.
- FSRS metadata, review schedules, and review logs are sync-sensitive and inherit the same gating as the rest of the storage-safety track.

Phase scope discipline:

- Phase 17/18 storage adapter and migration work stays staged, gated, test-only, or docs/validator-scoped.
- Phase 18E's limited local backend pilot remains synthetic, internal, and behind rollback gates.
- Phase 19A remained docs/static-validator/CI only.
- Phase 19B (this decision gate) remains docs/static-validator/CI only.

Public-facing claims:

- No overclaims about AI, FSRS, security, or privacy.
- Honest copy is mandatory; "calm/private study room" must remain a defensible claim, not a marketing claim.
- "Local-first by default" and "no cloud/sync/account/auth by default" are advertised — therefore any change must not embarrass past copy.

Any Phase 19B implementation work that would violate any item above is out of scope by construction.

## Option comparison summary

The research compares five options. The summary below is condensed for this ADR; the full matrix lives in the research document.

- Option A — no sync for now is safe but incomplete. It matches the current public claim and adds zero trust debt. It does not satisfy real cross-device demand and would orphan the Phase 17/18/18E safety scaffolding.
- Option B — manual cross-device transfer is the right near-term answer. It strictly improves the status quo without taking on new trust debt. The user is the conflict resolver. No account, no cloud, no remote endpoint. Workable Vietnamese-first vocabulary is available.
- Option C — optional encrypted file-based sync is possible later but requires crypto, conflict, and trust gates. The encryption claim must be exact. The conflict model must be designed before any runtime work. Provider quirks (WebDAV, Google Drive, iCloud Drive, OneDrive, Dropbox) add a forever-tax that a solo/small team cannot absorb naively.
- Option D — optional account/cloud sync is far-future only. It is the highest-stakes option and the most at odds with Shime's current public claim. It requires identity, auth, a Shime-hosted backend, ops capacity, and a legal/privacy posture the project has not yet invested in.
- Option E — hybrid staged approach is selected. Each stage is gated independently and reversible. Near term is no sync runtime. Mid term is conflict-model and trust-copy docs. Long term is optional sync only after explicit future gates and real beta safety evidence.

## Selected approach: HYBRID_STAGED_APPROACH

Phase 19B adopts Option E.

The HYBRID_STAGED_APPROACH is selected because:

- It preserves Shime's existing public claim (local-first by default, no cloud/sync/account/auth by default).
- It does not throw away the Phase 17/18/18E storage-safety scaffolding that explicitly preserved an optional future sync path (StorageAdapter ADR, local-first hybrid ADR, migration journal/manifest designs, synthetic local backend pilot, FSRS public opt-in sequencing).
- It does not commit Shime to any sync runtime. Each future stage is its own explicit, reversible gate, the same pattern Phase 14O / 14P / 15A / 16L / 17I / 18E / 19A have already validated.
- It keeps the near-term answer (manual transfer hardening) cleanly separable from the long-term answer (optional sync) so that one can ship without forcing the other.
- It fits the solo/small-team maintenance cadence: each stage produces a concrete docs/static-validator/CI deliverable, and no stage commits to runtime until its own gate clears.

The HYBRID_STAGED_APPROACH is not a compromise. It is a recognition that Shime has been operating in this mode for the entire Phase 14 → Phase 19A arc and that optional sync deserves the same treatment.

## Near-term direction: manual transfer first

The near-term answer (Phase 19B, Phase 19C, Phase 19D, Phase 20A–20D) is no sync runtime.

Strengthen what already exists:

- Backup and restore behavior remains unchanged in Phase 19B. The v2 backup format hardened in Phase 14G/14M and audited in Phase 18B remains the canonical local rollback floor.
- Manual cross-device transfer (Option B) is the natural next layer above the current baseline. It strictly improves the status quo without taking on new trust debt.
- No new transfer UX ships in Phase 19B. Phase 20A–20D will design and (only if their gates clear) eventually ship the manual transfer experience.

The Vietnamese-first vocabulary that supports the near-term direction is already idiomatic:

- "Xuất dữ liệu" (export data)
- "Nhập dữ liệu" (import data)
- "Sao lưu" (backup)
- "Khôi phục" (restore)
- "Chuyển dữ liệu sang thiết bị khác" (transfer data to another device)
- "Khôi phục sẽ ghi đè dữ liệu hiện tại" (restore will overwrite current data)
- "Tệp này không chứa: …" (this file does not contain: …)

No new trust language is required in the near term. The near-term direction does not require an account, does not require a cloud, does not require a remote endpoint, and does not require new copy beyond honest extensions of the existing backup/restore idiom.

## Mid-term direction: conflict model and trust copy gates

The mid-term answer is two docs/static-validator/CI-only phases:

- Phase 19C — Optional Sync Conflict Model Design. Defines the conflict model in docs only. Adopts a two-layer model: event log + per-record revision clock + tombstones + device ID as the canonical change-tracking layer, with per-family merge policy layered on top. Elevates backup-before-merge to a static-validator invariant. Codifies the FSRS sync sequencing rule (FSRS sync must follow Phase 19A public opt-in; FSRS sync must use a per-record revision clock; FSRS sync must use backup-before-merge).
- Phase 19D — No-Cloud / Default-Off Trust Copy. Defines the Vietnamese-first trust copy in docs only. The Vietnamese copy precedes the English companion per the Vietnamese-first principle. Adds a static-validator rule that forbids user-facing overclaim strings and requires vi/en pairing for trust-critical strings.

Phase 19C and Phase 19D are not unlocked by this ADR's existence. They are unlocked by their own task briefs, their own validators, and their own CI registrations, in the same idiom as Phase 19A and Phase 19B.

## Long-term optional sync conditions

The long-term answer is optional sync, only if and when its own gates clear, and only after real beta evidence exists from manual transfer in production. Optional sync may take the shape of Option C (file-based, user-controlled target) first, and only much later Option D (account/cloud) if at all.

Before any sync runtime — C or D — can be considered for implementation, all of the following must hold. Any one missing is a no-go.

1. Manual transfer (Option B) has shipped via Phase 20A–20D and survived one full real-beta cycle without silent data loss, surprise overwrites, or a large support backlog.
2. The Phase 19C conflict model ADR is merged and its static-validator rules are live.
3. The Phase 19D trust copy is merged in Vietnamese and English.
4. Backup-before-merge is a static-validator invariant, not a code convention.
5. The StorageAdapter has a real (not test-only) adapter for the chosen sync target, with the existing no-op driver still available as a rollback path. The Phase 17B scaffold and the Phase 18A test-only IndexedDBAdapter prototype remain test-only until that promotion happens.
6. The Phase 17D/17E/17F event-log / per-key manifest / journal designs are promoted from test-only prototypes to runtime contracts.
7. FSRS public opt-in has shipped per the Phase 19A sequencing gate. FSRS sync follows; it never precedes.
8. A documented and rehearsed rollback story exists: disable sync, restore from last-good local backup, reconcile the sync target.
9. The "claims we will and will not make" appendix has been honored across README, landing, marketing, and in-product copy in both Vietnamese and English.
10. Solo/small-team support capacity is confirmed sufficient to handle "my sync didn't work" tickets without degrading the existing study experience for non-syncing users.

For Option D specifically, additional criteria (none currently close to being met):

11. Multi-quarter funded capacity to operate a backend.
12. Legal/privacy posture documented and reviewed.
13. A demonstrated track record of Option B and/or Option C in production for at least one full beta cycle.

## Data-family sync risk classification

Each Shime data family is classified for future sync purposes. This classification is for design reference only; nothing in Phase 19B implements any of it.

- library / quiz data — not safe to sync early. Per-record revision clock required when sync ever lands. Conflict UI required. Backup-first guard required. Manual transfer is the near-term path.
- study history — append-only by nature. Not safe to sync early. Conflict UI rarely required. Backup-first guard required. Manual transfer is the near-term path.
- review schedules — sync-sensitive. Device-authoritative default or per-record revision clock required. No silent merge. Backup-first guard required. Manual transfer is the near-term path.
- FSRS metadata / review logs — highest-stakes sync target. Per-record revision clock required. Backup-first guard required. Device-authoritative default. No silent merge. Must additionally follow the Phase 19A FSRS public opt-in sequencing gate before any sync runtime is even considered.
- settings — relatively safe. Per-key last-write-wins with backup-before-merge is workable. Conflict UI rarely required.
- recommendation feedback — append-only and commutative. Relatively safe. No conflict UI required. Backup-first guard still required.
- EduGen draft / source metadata — per-record revision clock required. Conflict UI required. Backup-first guard required.
- backup / restore payloads — never auto-sync. They are themselves the rollback floor and must remain user-initiated.
- migration manifests / journals — never auto-sync. They are device-local provenance and must remain device-local.

Key takeaways for the design space:

- Every family requires backup-before-merge before any merge can be applied.
- FSRS-family data is the highest-risk sync target and is additionally gated by Phase 19A.
- Backups and migration journals must never auto-sync — they are the floor that sync correctness relies on.

## Backup/export/restore implications

Sync must not collapse the backup/restore trust boundary. Three rules follow and are recorded here for future static validators to enforce:

1. Backup is not sync. Even if/when sync exists, backup remains a user-initiated, user-verifiable snapshot. Backup files must never be silently overwritten by sync activity. The v2 backup format hardened in Phase 14G/14M and audited in Phase 18B remains the canonical local rollback floor.
2. Restore is destructive and must remain so. Restore replaces current state. Sync may surface conflicts; restore does not. The two paths must remain visually and semantically separate in any UX.
3. Backup-before-merge is invariant. Before any sync merge can mutate local state, the pre-merge local state must be captured into a restorable artifact. This is the single most important safety rule for any future sync work.

Phase 19B does not change backup/export/restore behavior. Phase 19B does not modify backup/export/restore runtime files. Phase 19C will elevate backup-before-merge to a static-validator invariant.

## FSRS and scheduler metadata implications

FSRS metadata is the most sync-sensitive data family in Shime. The implications recorded here for Phase 19C and later:

- FSRS public opt-in is upstream. Phase 19A defined the sequencing gate for FSRS becoming user-visible. Sync of FSRS metadata cannot precede public opt-in being honest and stable.
- Silent merge is unacceptable. A merged-wrong FSRS state can move a card from "due in 6 days" to "due tomorrow" or vice versa, both of which silently degrade learning.
- Device-authoritative is the default. If multi-device FSRS ever ships, the safe default is "the device that last reviewed this card is authoritative for it," with explicit user-choosable override.
- Per-record revision clock minimum. A coarser model (per-key clock) is not sufficient for FSRS-family data.
- Backup-before-merge mandatory.
- Internal/test-only first. Any FSRS sync runtime work, when it ever happens, must first land internal/test-only behind double gates, the same pattern Phase 14J/14K/14L/14M/14N established for FSRS scheduling itself.

Phase 19B does not change FSRS behavior. Phase 19B does not modify FSRS runtime files. Phase 19B explicitly marks FSRS-family data as "no sync runtime until FSRS public opt-in has cleared its own gate and a per-record conflict model has been adopted in docs."

## Vietnamese-first UX and trust copy implications

Shime's primary users are Vietnamese learners. The trust copy must hold in Vietnamese first, then in English. Each option imposes different copy demands:

- Option A — no sync. No new copy. Existing Vietnamese copy is sufficient.
- Option B — manual transfer. Limited new copy. Existing idiom is workable ("xuất dữ liệu," "nhập dữ liệu," "sao lưu," "khôi phục," "chuyển dữ liệu sang thiết bị khác").
- Option C — file-based encrypted sync. Hard. Honest copy must avoid implying that Shime sees nothing when in fact some metadata leaks via the storage provider. Honest copy must say "Shime không lưu dữ liệu của bạn. Nhà cung cấp lưu trữ bạn chọn có thể thấy tên tệp và thời gian cập nhật." and "Nếu bạn quên mật khẩu, Shime không thể khôi phục dữ liệu này."
- Option D — account/cloud sync. Hardest. Any "tài khoản Shime" copy implies trust commitments the project has explicitly avoided.

Phase 19D copy gate (defined for the future):

- Both `vi` and `en` drafts of the "no cloud / default off" trust statement.
- Both `vi` and `en` drafts of the "what we never do" list (no account, no cloud, no auth, no sharing).
- Both `vi` and `en` drafts of the "what transfer is and is not" statement.
- Both `vi` and `en` drafts of the "what restore overwrites" warning.
- Both `vi` and `en` drafts of the "what does not transfer" enumerated list.

All copy must be reviewed for overclaim before any sync UX (even file-based) can land.

## Security and privacy claim boundaries

Honest claim discipline matters more than any specific feature. The claim/disallowed-claim appendix below applies across all phases and is recorded here so that Phase 19D copy work and any future README/landing/marketing copy can cite it.

Allowed claims:

- local-first by default
- no account required
- no cloud sync today
- data stays on this device unless exported
- optional sync architecture direction has been decided
- sync remains unshipped

Forbidden positive claims:

- sync exists
- cloud sync exists
- account/auth/backend exists
- encrypted end-to-end
- zero-knowledge
- sync just works
- no conflicts
- production sync is ready
- data-loss prevention is guaranteed

Phase 19B does not change any user-facing copy. Phase 19D will codify the trust copy and its disallowed-claim list as a static-validator rule.

## Phase 19C scope

Phase 19C is `Phase 19C — Optional Sync Conflict Model Design`. Phase 19C is docs/static-validator/CI-only.

Scope:

- docs/static-validator/CI-only
- no runtime
- no UI
- no tests unless validator self-tests are already standard
- conflict model ADR in docs only
- event log + per-record revision clock + tombstones + device ID as the canonical change-tracking layer
- per-family merge policy layered on top
- backup-before-merge invariant elevated to a static-validator rule
- FSRS sync sequencing rule (FSRS sync must follow Phase 19A public opt-in; FSRS sync must use a per-record revision clock; FSRS sync must use backup-before-merge)

Phase 19C does not unlock sync implementation. Phase 19C does not change runtime. Phase 19C does not change public copy. Phase 19C does not change storage backends. Phase 19C does not change FSRS behavior. Phase 19C does not change backup/export/restore behavior.

## Phase 19D scope

Phase 19D is `Phase 19D — No-Cloud / Default-Off Trust Copy`. Phase 19D is docs/static-validator/CI-only.

Scope:

- docs/static-validator/CI-only
- Vietnamese-first trust copy
- English companion trust copy
- no runtime
- no UI implementation
- claim boundary validator
- no-cloud / default-off user-trust rules

Phase 19D does not unlock sync implementation. Phase 19D does not change runtime. Phase 19D does not change storage backends. Phase 19D does not change FSRS behavior. Phase 19D does not change backup/export/restore behavior.

## Phase 20A–20D alignment

The Phase 20A–20D previews are recorded here for continuity. They are not commitments. Each is still docs/static-validator/CI-only in shape unless its own brief explicitly says otherwise.

- Phase 20A — Local-first hybrid runtime stabilization audit. Audit the Phase 16L local-first hybrid ADR against shipped production state. Confirm the Phase 17B StorageAdapter scaffold and the Phase 18A IndexedDBAdapter prototype remain test-only. Confirm the Phase 18E synthetic pilot remains internal. Docs/static-validator/CI-only.
- Phase 20B — Manual transfer archive design. Choose the canonical transfer archive shape that extends the v2 backup format (not replaces it). Define what is and is not included. Define the "what does not transfer" list. Docs/static-validator/CI-only — no UX yet.
- Phase 20C — Manual transfer UX design (still no runtime). Design the export-to-transfer / import-from-transfer / verify-before-restore UX in docs only. Include Vietnamese-first copy drafts. Docs/static-validator/CI-only.
- Phase 20D — Manual transfer runtime gate. First phase that could plausibly ship runtime, but only if Phase 20A, Phase 20B, and Phase 20C cleared, and only as Option B (manual cross-device transfer only). Still no sync. Still no cloud. Still no account.

Phases 21 and later: only after Phase 20D has been in real users' hands long enough to demonstrate data-safety confidence (no silent data loss, no surprise overwrites, no support backlog) would Phase 21 consider opening the Option C runtime gate. Option D is out of scope through at least Phase 22.

## Go/no-go criteria before any sync implementation

Before any sync runtime — Option C or Option D — can be considered for implementation, all of the following must hold. Any one missing is a no-go.

1. Manual transfer (Option B) has shipped via Phase 20A–20D and survived one full real-beta cycle without silent data loss, surprise overwrites, or a large support backlog.
2. The Phase 19C conflict model ADR is merged and its static-validator rules are live.
3. The Phase 19D trust copy is merged in Vietnamese and English.
4. Backup-before-merge is a static-validator invariant, not a code convention.
5. The StorageAdapter has a real (not test-only) adapter for the chosen sync target, with the existing no-op driver still available as a rollback path.
6. The Phase 17D/17E/17F event-log / manifest / journal designs are promoted from test-only prototype to runtime contracts.
7. FSRS public opt-in has shipped per the Phase 19A sequencing gate. FSRS sync follows; it never precedes.
8. A documented and rehearsed rollback story exists.
9. The "claims we will and will not make" appendix has been honored across README, landing, marketing, and in-product copy in both Vietnamese and English.
10. Solo/small-team support capacity is confirmed sufficient.

For Option D specifically, additional criteria (none currently close to being met):

11. Multi-quarter funded capacity to operate a backend.
12. Legal/privacy posture documented and reviewed.
13. A demonstrated track record of Option B and/or Option C in production for at least one full beta cycle.

No sync runtime before manual transfer has shipped and survived a real beta cycle. No sync runtime before conflict model and trust copy gates are merged. No sync runtime before backup-before-merge is a static-validator invariant.

## What Phase 19B explicitly does not implement

Phase 19B does not implement any of the following. The list is restated so that the Phase 19B static validator and future static validators can cite it.

- Phase 19B does not implement sync runtime.
- Phase 19B does not implement account/auth/identity.
- Phase 19B does not implement a Shime-hosted backend.
- Phase 19B does not implement a remote endpoint.
- Phase 19B does not implement cloud sync.
- Phase 19B does not implement file-based sync.
- Phase 19B does not implement dual-write between backends.
- Phase 19B does not implement an app-boot migration.
- Phase 19B does not implement a production storage backend switch.
- Phase 19B does not implement a production IndexedDBAdapter.
- Phase 19B does not implement a runtime migration.
- Phase 19B does not delete localStorage entries.
- Phase 19B does not change backup/export/restore behavior.
- Phase 19B does not change FSRS behavior.
- Phase 19B does not change the active FSRS double-gate.
- Phase 19B does not ship public FSRS opt-in.
- Phase 19B does not change user-facing copy.
- Phase 19B does not add tests of production behavior.
- Phase 19B does not add dependencies.
- Phase 19B does not add UI.
- Phase 19B does not unlock sync implementation in any subsequent phase by its own existence; each subsequent phase must clear its own gate.

## Acceptance criteria

Phase 19B is complete when all of the following hold:

- This ADR (`docs/adr/phase19b-optional-sync-direction.md`) is present and includes the required headings and decision terms.
- The Phase 19B static validator (`scripts/validate-phase19b-optional-sync-architecture-decision.js`) is present, registered in `.github/workflows/e2e-smoke.yml` after the Phase 19A validator, and passes.
- The full validator chain passes with `FINAL_STATUS=0`.
- No `src/` files changed.
- No `tests/` files changed beyond the pre-Phase-19B baseline already merged from Phase 18C/18D/18E.
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
- No forbidden positive claims appear in this ADR.
- Historical validator forward-compat entries are restricted to exact Phase 19B paths only (no broad allowlists).
