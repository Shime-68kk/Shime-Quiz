# Phase 16G — EduGen Draft Review Import Flow

## Scope and intent

Phase 16G adds a bounded **EduGen Draft Review Import Flow** to Shime Quiz.
This is Scope B from the handoff pack: a **manual draft paste / review flow**.
The user pastes JSON output from the optional EduGen Draft Workshop
(**Xưởng bản nháp EduGen**) service, Shime locally parses and validates it,
and the user must explicitly confirm before anything is treated as a
saveable item.

User-facing copy keeps Vietnamese-first framing: the panel header reads
**Xưởng bản nháp EduGen**, the status badges read **Bản nháp cần xem lại**,
and the primary action button reads **Xem lại trước khi lưu** before any
draft can be confirmed.

Pipeline:

```
EduGen service output  →  user pastes JSON  →  Shime parses + validates
                       →  preview rendered  →  user explicit confirmation
                       →  caller-controlled save
```

No part of this flow performs document upload, AI generation, OCR, cloud
sync, or automatic FSRS scheduling. EduGen remains an **optional companion**
that the user runs themselves; it is **not bundled** with Shime.

## Implemented scope

**Scope B — manual EduGen draft paste/review flow.**

The handoff pack permitted direct service extraction (Scope A) only when the
endpoint name and behavior were unambiguously safe. The Phase 16F connector
exposes a health check only; it does not have a documented extraction
endpoint inside Shime that could be safely invoked here. To avoid
overclaiming and to honor the Phase 16C large-import risk audit, Phase 16G
chose Scope B. This keeps every byte under explicit user control: the user
pastes only what they intend to paste, and Shime never reaches out across
the network in this phase.

## What's new

- `src/edugen/edugenDraftParser.js` — pure parser/normalizer for EduGen
  draft JSON. No network, no storage, no FSRS, no AI call.
- `src/components/edugen/EduGenDraftReviewPanel.jsx` — Vietnamese-first
  review panel mounted on `/settings`. Pastes → preview → explicit confirm.
- `src/routes/Settings.jsx` — mounts the new review panel after the
  existing Phase 16F `EduGenDraftWorkshopPanel`.
- `tests/unit/edugenDraftReviewImportFlow.test.jsx` — unit tests.
- `scripts/validate-phase16g-edugen-draft-review-import-flow.js` — static
  validator.
- `.github/workflows/e2e-smoke.yml` — registers the new validator after
  the Phase 16F validator.

## Draft input formats supported

Two shapes after `JSON.parse`:

1. Envelope object — preferred:

```json
{
  "items": [
    { "question": "Câu hỏi", "answer": "Đáp án", "source": "tên-tài-liệu" }
  ]
}
```

2. Bare array fallback:

```json
[
  { "question": "Question text", "answer": "Answer text" }
]
```

The `source` field is optional. Any other shape is rejected with a
Vietnamese-first error message and never enters the preview.

## Validation / preview / save flow

Each pasted draft is:

1. Trimmed and JSON-parsed locally — no network call.
2. Shape-checked against the two supported envelopes above.
3. Capped at `MAX_DRAFT_ITEMS = 50` items per paste (large import guard
   aligned with Phase 16C concerns).
4. Per-item validated:
   - non-empty `question`
   - non-empty `answer`
   - each field `<= MAX_FIELD_LENGTH = 1000` characters
   - invalid item shapes are listed in `invalid[]` so the user can fix them
5. Source name normalized — control characters and oversize strings are
   dropped to keep the preview render safe.
6. Rendered as a preview (first five valid items + an invalid-item summary)
   with an aria-live status badge.
7. Saved only if the user clicks **Xác nhận lưu bản nháp**. The panel
   emits `onConfirmImport({ items, summary })`; persistence is the caller's
   responsibility. Phase 16G does **not** write to the library, the
   scheduler, or any storage on its own.

This means **preview before save** is structural: the confirm button is
disabled until a valid preview exists.

## Source attribution behavior

Each valid item produced by the parser carries a documented
`sourceMetadata` block:

```js
{
  sourceType: 'edugen-draft',
  sourceName: <safe short string or ''>,
  importedAt: <ISO timestamp>,
  processor: 'edugen',
  reviewRequired: true
}
```

This shape is consistent with the documented reference from Phase 16F
(`EDUGEN_DRAFT_SOURCE_METADATA_SHAPE`). It is built for **future** library
attribution. Phase 16G does **not** force this metadata into the existing
library schema. Persistence is left to a later phase so the library
schema and backup/export round-trip can be updated together without
introducing a stealth migration here.

## Large import safeguards

- Hard cap of 50 items per paste (`MAX_DRAFT_ITEMS`). Bigger drafts must
  be split before review.
- Hard cap of 1000 characters per field (`MAX_FIELD_LENGTH`). Oversized
  fields surface as invalid items, not as a panel crash.
- Source names containing ASCII control characters are dropped so the
  preview can never render hidden terminal escapes.
- The panel renders at most five preview items inline; the rest are
  summarized so a 50-item paste cannot dominate the viewport.

These match the Phase 16C storage / large-import / EduGen risk audit
posture: prefer manual, bounded, review-required flows over silent bulk
ingestion.

## Storage safety limitations

Phase 16G is intentionally **non-persistent on its own**:

- The panel does not write to `localStorage`, IndexedDB, or any adapter.
- The panel does not modify the library, the scheduler, or backups.
- The panel does not register cards into FSRS — `no automatic FSRS
  activation` continues to hold from Phase 14/15.
- Confirming the preview only fires an `onConfirmImport` callback. The
  current Settings.jsx integration uses the default no-op behavior; a
  future phase can wire this to the library import path with full backup
  round-trip coverage.

## Backup / export / import relationship

The library backup/export/import core runtime (`src/quiz/dataBackup.js`,
`src/state/v2BackupRestore.js`) was **not touched** by Phase 16G. The
panel produces drafts whose `sourceMetadata` is **not** yet persisted, so
backups continue to round-trip identically to Phase 16F. When a future
phase wires draft confirmation into the library, it must also extend the
backup payload — Phase 16G deliberately defers that to keep this phase
bounded.

## Claim safety

Across the new doc, parser, panel, and Settings route, Phase 16G holds
the line from earlier phases:

- **no built-in AI** — Shime does not call AI on the user's behalf.
- **no OCR** — Shime does not perform OCR. EduGen is an optional
  companion, not a Shime feature.
- **no cloud sync** — there is no backend, no account, no auth.
- **local-first** — data stays in the user's browser unless they export
  a backup themselves.
- **optional companion / not bundled** — EduGen is a separate service.
  The Draft Workshop framing reflects that.
- **review required** — drafts are drafts until the user confirms.
- **no automatic import-to-study** — confirmation is structural, not
  automatic.
- **no automatic FSRS activation** — the scheduler does not learn about
  drafts unless and until the user enrolls them through a future flow.

The validator rejects the positive claim forms of these guarantees in
any new Phase 16G surface so they cannot drift later.

## Changed files

```
.github/workflows/e2e-smoke.yml
docs/phase16g-edugen-draft-review-import-flow.md                       (new)
scripts/validate-phase16g-edugen-draft-review-import-flow.js           (new)
src/edugen/edugenDraftParser.js                                        (new)
src/components/edugen/EduGenDraftReviewPanel.jsx                       (new)
src/routes/Settings.jsx
tests/unit/edugenDraftReviewImportFlow.test.jsx                        (new)
```

Phase 16G does **not** modify `package.json`, `package-lock.json`,
`src/quiz/reviewSchedulerAdapter.js`, `src/quiz/fsrsWrapper.js`, or
`src/state/reviewScheduleStorage.js`. No dependencies were added.

## How to verify locally

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
npm run build
npm run test:unit
node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js
node scripts/validate-phase16g-edugen-draft-review-import-flow.js
```

Then run the full validator chain (`scripts/validate-*.js`) to confirm
`FINAL_STATUS=0`.

## Future next phase

Suggested follow-up:

**Phase 16H — EduGen Draft Quality Review UX / Source-Aware Library
Polish.** Wires `onConfirmImport` into a real library import path,
upgrades the library schema to carry `sourceMetadata` (with backup/export
round-trip), and adds a "Bản nháp cần xem lại" filter to the library
without changing FSRS scheduling defaults.
