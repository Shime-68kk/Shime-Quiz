# Phase 15F — Study Room Copy / UX Alignment for Active Scheduling

Status: closed for Phase 15F. Active FSRS scheduling remains double-gated
and default OFF. This phase aligns the user-facing Study Room two-step
memory rating bridge wording so that it is accurate in both the default
inert state and the controlled internal-active state without exposing the
internal flag or implying public rollout.

## Scope

Phase 15F is a copy / UX alignment phase only. It does not change
scheduling logic. It does not change Dashboard. It does not change
backup or import runtime. It does not change settings storage. It
does not add new `ts-fsrs.next` call sites and adds no dependencies.
The active FSRS scheduling double gate
(`fsrsExperimentalEnabled` + `fsrsActiveSchedulingEnabled`) is preserved
verbatim from Phase 15B and continues to default OFF.

## Why

Phase 14N's bridge copy was authored when ratings were inert. It still
said `Your study schedule is not changed by this rating yet.` and
`Recorded {rating}. Your schedule is not affected.` That wording remains
safe while active scheduling is unavailable or default OFF, but it
becomes inaccurate when the internal-active double gate is intentionally
enabled (for example by the Phase 15E controlled internal activation
harness). Under the double gate, Hard/Good/Easy and Wrong/unanswered →
Again may affect the next due date through the approved active scheduler
path. Phase 15F makes the bridge wording conditional without changing
scheduling behaviour.

## What changed

- `src/components/study/FsrsProductionMemoryRatingBridge.jsx` accepts a
  new `isActiveSchedulingCopyEnabled` prop. When `false` (default) the
  bridge renders the prior Phase 14N inert copy verbatim. When `true`
  the bridge renders the active-capable copy variant that says ratings
  may adjust when you next see the card.
- `src/routes/StudyRoom.jsx` computes `isActiveSchedulingCopyEnabled`
  from current settings (`fsrsExperimentalEnabled` AND
  `fsrsActiveSchedulingEnabled`) only when the bridge is shown, and
  passes the resulting boolean to the bridge. The flag name is never
  rendered as user-facing text and is never used as a prop name visible
  to the user.

## Default OFF copy (Phase 14N preserved)

When active scheduling is unavailable or either gate is off, the bridge
continues to display:

- Header: `Your study schedule is not changed by this rating yet.`
- Auto-Again: `Needs another review. Your study schedule is not changed
  by this rating yet.`
- Rated: `Recorded {rating}. Your schedule is not affected.`

## Internal-active copy

When the double gate is internally enabled and the record is bridge
eligible, the bridge displays claim-safe non-guarantee wording:

- Header: `This rating may adjust when you next see this card.`
- Auto-Again: `Not recalled — recorded as Again. This may adjust when
  you next see this card.`
- Rated: `Recorded {rating}. This may adjust when you next see this
  card.`

The wording deliberately avoids absolute claims. It does not announce
broad AI scheduling availability, it does not announce that active
FSRS is now on for everyone, and it does not promise any particular
outcome. It does not display the internal active-flag identifier
anywhere in user-facing text.

## Continue without rating

`Continue without rating` remains a visible option in both copy modes.
The bridge clarifies that choosing it keeps the normal review update for
this answer (no synthetic Good rating is invented). In the inert mode it
adds that the study schedule remains unchanged.

## Hard / Good / Easy semantics

Hard, Good, and Easy remain effort-based descriptors. The
`RATING_DESCRIPTIONS` map still uses neutral wording (recalled with
serious effort, with normal effort, instant recall). The bridge never
claims that any specific rating guarantees a longer or shorter interval.

## What did NOT change

- No change to `src/quiz/reviewSchedulerAdapter.js`.
- No change to `src/state/reviewScheduleStorage.js`.
- No change to `src/state/settingsStorage.js`.
- No change to `src/quiz/fsrsWrapper.js`.
- No change to `src/quiz/dataBackup.js`.
- No change to `src/state/v2BackupRestore.js`.
- No change to `src/routes/Settings.jsx` or `src/routes/Dashboard.jsx`.
- No change to `package.json` or `package-lock.json`.
- No new `ts-fsrs.next()` call sites.
- No public rollout UI. `fsrsActiveSchedulingEnabled` is not exposed to
  users via Settings or any other public surface.
- No migration, backfill, import-time, app-boot, or session-start
  activation of the double gate.
- No hybrid local-first / IndexedDB / cloud-sync introduction.
- No Dashboard display expansion.
- No e2e changes.

## Claims policy

This phase makes no public rollout claim. Active FSRS scheduling
remains internal-only and default OFF. Copy in the internal-active
state always uses non-guarantee phrasing such as `may adjust`. Phase
15F is deliberately narrow and experimental and does not advertise
broad availability of active scheduling.

Forbidden user-facing substrings remain absent from the bridge and
Study Room. These include the broad AI-scheduling availability
announcement, the broad FSRS-for-everyone announcement, the
"guaranteed" outcome claim, and any rendering of the internal
active-flag identifier as user-facing text. The Phase 15F validator
enforces their absence on both `FsrsProductionMemoryRatingBridge.jsx`
and `StudyRoom.jsx`.

## Validator

`scripts/validate-phase15f-studyroom-copy-ux-alignment.js` enforces the
file scope, copy presence, forbidden claim absence, no new `.next()`
call sites, no Dashboard changes, no scheduler/storage/fsrsWrapper
changes, no backup/import runtime changes, no Settings UI exposure of
the internal flag, no hybrid sync, and no package-level changes. It is
registered in `.github/workflows/e2e-smoke.yml` after the Phase 15E
validator.

## Tests

`tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx` covers both copy
modes, the safety of default behaviour when the prop is omitted, the
absence of forbidden claims, the integrity of Continue without rating
semantics, and the static guarantee that scheduler, storage,
fsrsWrapper, Dashboard, settings storage, and package files were not
modified by this phase.

## Phase 15G recommendation

Phase 15G should follow as the release / claims guardrail re-audit
across docs, validators, tests, and CI to confirm that the active
scheduling rollout remains internal-default-OFF and that no Phase 15F
copy change has been promoted into a public guarantee.
