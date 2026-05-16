# Phase 16H — EduGen Draft Quality Review UX / Source-Aware Library Polish

## Scope and intent

Phase 16H closes the loop opened by Phase 16F → 16G. Phase 16G shipped a
bounded **EduGen Draft Review Import Flow** that could preview and confirm
pasted EduGen draft JSON, but the confirmation was structural only:
`onConfirmImport` had no real persistence wired into it.

Phase 16H wires that confirmation into the existing v2 library import
path so the user's explicit **Xác nhận lưu bản nháp** action genuinely
saves reviewed cards into the library, with **source attribution**, a
**Bản nháp cần xem lại** badge, **duplicate-skip** safety, a
**backup-before-import nudge**, and additive `sourceMetadata` that
round-trips through backup/export/import.

Phase 16H keeps the Phase 16D / 16F / 16G identity contract intact:
**local-first**, **review required**, EduGen is an **optional companion**
and **not bundled** with Shime, **no built-in AI**, **no OCR**,
**no cloud sync**, **no automatic import-to-study**,
**no automatic FSRS activation**.

## Implemented scope

**Scope A — bounded library import/save path.**

1. New helper `src/edugen/edugenDraftImport.js` converts reviewed draft
   items into v2 library items inside a dedicated **Bản nháp EduGen →
   Bản nháp cần xem lại** subject/topic, with source attribution and
   duplicate detection.
2. `src/routes/Settings.jsx` wires the panel's `onConfirmImport` callback
   into `setLearningData()` through the new helper, so explicit
   confirmation now genuinely saves to the library.
3. `src/components/edugen/EduGenDraftReviewPanel.jsx` shows a
   backup-before-import nudge, a duplicate-skip safeguard line, and
   surfaces the actual added/duplicate counts that came back from
   persistence.
4. `src/data/learningDataAdapter.js` preserves an optional, additive
   `sourceMetadata` block on items, so attribution round-trips through
   normalize → backup → restore unchanged.
5. `src/data/importValidator.js` declares the optional `sourceMetadata`
   shape explicitly in the import schema (additive, passthrough-safe).
6. `src/routes/Library.jsx` renders a **Bản nháp cần xem lại** and a
   **Nguồn: EduGen** chip on any subject that contains source-aware
   draft items.

No scheduler/FSRS file was touched. No new dependency was added. No
network call site, no document upload UI, no `ai-process` call site,
and no new `ts-fsrs.next()` call site was introduced.

## Draft review → library import behavior

The user flow is now:

```
paste EduGen draft  →  Xem lại trước khi lưu  →  preview rendered
                    →  Xác nhận lưu bản nháp  →  source-aware library items
```

On explicit confirmation:

- The panel hands its `{ items, summary }` payload to Settings.jsx via
  `onConfirmImport`.
- Settings.jsx calls `prepareEdugenDraftLibraryImport()` to convert each
  reviewed draft into a v2 flashcard library item.
- The helper guarantees the **Bản nháp EduGen** subject (`edugen-drafts`)
  and **Bản nháp cần xem lại** topic (`edugen-drafts-review`) exist in
  the merged raw-data object, creating them additively if they were not
  there. Existing subjects/topics are untouched.
- Settings.jsx then calls `setLearningData(merged, {...})`, which is the
  same import path the existing JSON/CSV/text/document flows use. There
  is no second persistence path.
- The panel renders a success line that names the actual added count and
  any duplicates that were skipped.

If `setLearningData` cannot write to localStorage (quota, permission,
etc.), the panel reports that explicitly: the in-memory library still
holds the merged data for the current session, but the user is told
that local persistence failed.

## Explicit save behavior

- No draft enters the library before the user clicks **Xác nhận lưu bản
  nháp**.
- The confirm button is disabled until a valid preview exists.
- Confirmation is structural: only the items that already passed the
  Phase 16G parser/preview are ever passed to the helper.
- Confirmation is **not** automatic study activation. Imported items
  appear as flashcards inside the dedicated review subject/topic.
  Nothing schedules them. Nothing rates them. Nothing enrolls them
  into FSRS.

## sourceMetadata behavior

Every Phase 16H-imported item carries an additive `sourceMetadata`
block:

```js
{
  sourceType: 'edugen-draft',
  sourceName: <safe short string or ''>,
  importedAt: <ISO timestamp>,
  processor: 'edugen',
  reviewRequired: true
}
```

Rules:

- `sourceMetadata` is **optional** and **additive**. Existing items
  without it continue to load, validate, normalize, back up, and
  restore unchanged.
- `normalizeLearningData()` preserves only safely shaped
  `sourceMetadata`. Malformed metadata is dropped silently so that
  legacy/imported items can never break the schema.
- `validateLearningDataImport()` declares an optional
  `sourceMetadata` block on the V2 item schema. Items without the
  field still pass validation.
- `sourceMetadata` is **not** used to branch scheduling logic. The
  FSRS scheduler does not read it.

## Duplicate and overwrite safeguards

- `prepareEdugenDraftLibraryImport()` builds a key from the normalized
  `question | answer` pair of every existing library item. New drafts
  whose pair matches an existing item are pushed into
  `duplicateItems[]` and **not** added — the existing item's id is
  preserved untouched so any study history attached to it remains
  intact.
- Intra-batch duplicates are also skipped, so re-pasting the same draft
  twice in one session cannot double-insert.
- New items receive deterministic fresh ids (`edugen-draft-<ts>-<NN>`).
  The helper never reassigns an existing item id.
- If **all** proposed items are duplicates, the helper returns
  `error: 'all_duplicates'` and the panel reports that nothing was
  saved.

## Large import safeguards

- The Phase 16G hard caps (`MAX_DRAFT_ITEMS = 50`, `MAX_FIELD_LENGTH =
  1000`) still gate every draft before it reaches the helper.
- The panel shows a **Tạo bản sao lưu trước khi nhập nhiều thẻ** nudge
  in the guardrail list so users are reminded to export a v2 backup
  before a large import.
- No IndexedDB migration was added. No bulk-import escalation was
  added. Imports use the existing `setLearningData` path, which keeps
  the library inside localStorage as today.

## Backup / export / import round-trip behavior

The library backup/export/import core (`src/quiz/dataBackup.js`,
`src/state/v2BackupRestore.js`) was **not** modified. Because
`makeLibrarySection` runs `validateLearningDataImport` and stores
`validation.normalizedData`, and because the additive `sourceMetadata`
field now survives normalization, the new attribution round-trips
through full v2 backup → restore without any further code change:

- `createV2BackupPayload` includes `sourceMetadata` on each item
  because normalization preserves it.
- `restoreV2BackupPayload` re-runs validation on the section and feeds
  it back through `setLearningData`, which again preserves the field.
- Redacted-library backups strip `correctAnswer`, `answer`, `back`,
  `acceptableAnswers`, `explanation`, `isCorrect`, `correct`,
  `solution` — `sourceMetadata` is not in that set and is preserved.

The existing FSRS metadata round-trip — `schedulerKind`,
`schedulerVersion`, `due`, `dueAt`, `interval`, `fsrsPayload`,
`fsrsReviewLogs`, `fsrsEnabledAt` — is **not** touched by Phase 16H.

## FSRS / scheduler boundary

- `src/quiz/reviewSchedulerAdapter.js` — unchanged.
- `src/quiz/fsrsWrapper.js` — unchanged. Still has exactly the two
  `.next()` call sites from the Phase 15B baseline.
- `src/state/reviewScheduleStorage.js` — unchanged.
- New items are never auto-enrolled into FSRS. They are flashcards
  with `reviewRequired: true` source metadata, and nothing about that
  flag drives the scheduler.

## Library / source-aware polish

`src/routes/Library.jsx` adds a small additive: each subject card that
contains items with valid EduGen source metadata renders two extra
chips next to the existing item-type chips:

- `Bản nháp cần xem lại: <count>`
- `Nguồn: EduGen`

No new route was added. No filter UI was added. No analytics surface
was added. The chips read directly off `sourceMetadata`, so existing
items without it remain visually unchanged.

## Copy requirements

Vietnamese-first surface phrases used in this phase:

- `Bản nháp cần xem lại`
- `Nguồn: EduGen`
- `Xác nhận lưu vào thư viện`
- `Tạo bản sao lưu trước khi nhập nhiều thẻ`
- `Không có thẻ nào được lưu cho đến khi bạn xác nhận`
- `Kết quả có thể sai hoặc thiếu ý`

Forbidden positive-claim phrases are **not** present in the new doc,
helper, panel, settings route, or library polish. See the Phase 16H
validator for the enforced list.

## Limitations

- The dedicated **Bản nháp EduGen** subject/topic is auto-created with
  fixed ids on first use. If a user already has a subject with the
  exact id `edugen-drafts`, items will merge into it. This is by
  design so that re-pasting a batch behaves predictably across
  sessions.
- The new `sourceMetadata` block is purely informational and is not
  yet exposed in a filter UI. A future phase can layer filters on top
  without further schema changes because the field is already
  documented and round-trips through backup.

## Changed files

```
.github/workflows/e2e-smoke.yml
docs/phase16h-edugen-draft-quality-review-source-aware-library.md       (new)
scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js (new)
src/components/edugen/EduGenDraftReviewPanel.jsx
src/data/importValidator.js
src/data/learningDataAdapter.js
src/edugen/edugenDraftImport.js                                          (new)
src/routes/Library.jsx
src/routes/Settings.jsx
tests/unit/edugenDraftQualityReviewSourceLibrary.test.jsx                (new)
```

Phase 16H does **not** modify `package.json`, `package-lock.json`,
`src/quiz/reviewSchedulerAdapter.js`, `src/quiz/fsrsWrapper.js`, or
`src/state/reviewScheduleStorage.js`. No dependencies were added.

## How to verify locally

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
npm run build
npm run test:unit
node scripts/validate-phase16g-edugen-draft-review-import-flow.js
node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js
```

Then run the full validator chain (`scripts/validate-*.js`) to confirm
`FINAL_STATUS=0`.

## Future next phase

Suggested follow-up:

**Phase 16I — Public README / Landing / Screenshots Polish + Demo
Quickstart Refresh.** Document the new EduGen source-aware library
surface for public messaging, with refreshed screenshots and a
quickstart that exercises the draft review → library import path
end-to-end. No runtime change is expected in 16I.
