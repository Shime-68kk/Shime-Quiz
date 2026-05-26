# Phase 35B — Library Bookshelf Summary

## Status tokens

```
PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_STATUS: COMPLETED_LIBRARY_BOOKSHELF_TAB_SYSTEM
PHASE35B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_DECISION: READY_FOR_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
PHASE35B_RUNTIME_SCOPE: LIBRARY_UI_TAB_SEGMENTATION_ONLY_NO_DATA_OR_IMPORT_LOGIC_CHANGES
PHASE35B_LIBRARY_DEFAULT_TAB: KE_SACH_CUA_TOI_DEFAULT_LEARNER_FACING_SHELF
PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 35B is Library UI tab segmentation only. No data, import logic, storage, backup/restore, scheduler, FSRS, route, or dependency changes.

## What changed

- **`src/routes/Library.jsx`** — a `libraryTab` local state (`useState('shelf')`) was added to the existing Library component. A small accessible tab switcher (`role="tablist"` with two `role="tab"` buttons) was inserted between the always-present hidden file inputs and the content area. The existing Library content was reorganized into two panels:
  - **Shelf panel** (`id="library-panel-shelf"`, default visible): learner-facing subject/catalog grid, empty state onboarding card, and empty state component.
  - **Workshop panel** (`id="library-panel-workshop"`, hidden by default): all existing import/configuration/admin tooling — JSON/CSV import, export/reset, demo quickstart, import method guide, manual AI prompt, text/Markdown draft textarea, text file import, EduGen document import, data source summary, backup/restore panel, schema guidance, and import preview.
  - Both panels stay mounted at all times to preserve raw input state. The inactive panel is hidden via the HTML `hidden` attribute plus `display: none` CSS.
  - The visible JSON/CSV, export, and reset controls are behind `Xưởng nạp tài liệu`; the default shelf tab keeps only learner-facing study actions.
  - The `importStatus` Toast is placed outside both panels so it is always visible.

- **`src/styles/global.css`** — Phase 35B tab styles appended: `.libraryTabList`, `.libraryTab`, `.libraryTab--active`, `.libraryTabPanel[hidden]`, responsive narrow-viewport rules, and a `prefers-reduced-motion` rule.

- **`tests/unit/libraryBookshelfTabs.test.jsx`** — new static source analysis tests (30 tests) covering tab state, tab switcher markup, panel structure, shelf/workshop content, raw input state preservation, file-picker auto-switch, importStatus placement, and forbidden-file guard.

- **`docs/testing/phase35b-library-bookshelf-evidence.md`** — evidence doc.
- **`docs/release/phase35b-library-bookshelf-summary.md`** — this file.
- **`docs/planning/phase35c-library-bookshelf-evidence-review-seed.md`** — Phase 35C seed.

## What did not change

- All import parsers (`csvImportParser.js`, `importValidator.js`, `textQuizParser.js`, `textQuizParser.js`).
- All AI prompt/output logic (`aiPromptBuilder.js`, `aiOutputReview.js`).
- All storage, backup, restore, sync, auth, backend, telemetry, analytics files.
- All FSRS and scheduler files.
- All file processor service client.
- All library export/import logic.
- Dashboard, Navigation, Study Room, Settings runtime files.
- `package.json`, `package-lock.json`.
- All prior phase docs and validators.
- Route behavior, page identity, URL structure.
- Any stored data or localStorage keys.

## Guardrails

- No new dependencies added.
- No new localStorage, sessionStorage, URL params, router state, or global store keys.
- No route changes.
- No import parser changes.
- No database/query pipeline changes.
- No prompt builder changes.
- No drop-zone lifecycle changes.
- No backup/restore behavior changes.
- No scheduler/FSRS changes.
- Both tab panels remain mounted — raw textarea/input state is never lost on tab switch.
- Hidden panels use the HTML `hidden` attribute; their controls are not keyboard-focusable.

## Validation summary

| Check | Status |
|---|---|
| `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false` | PASS |
| `node scripts/validate-phase35b-library-bookshelf.js` | PASS |
| `npm run build` | PASS |
| `npm run test:unit` | PASS — 52 files, 2635 tests |
| `npx vitest run tests/unit/libraryBookshelfTabs.test.jsx` | PASS — 1 file, 32 tests |
| Playwright Chromium Library tab smoke | PASS |

## Reviewer/tester expectation

Reviewer should verify:
1. Only `src/routes/Library.jsx`, `src/styles/global.css`, `tests/unit/libraryBookshelfTabs.test.jsx`, and the three docs files are changed.
2. Build and unit tests pass.
3. Manual browser checks confirm: default shelf tab, import panels behind workshop tab, raw input state preserved on tab switch, keyboard focus visible, hidden panel controls not reachable by Tab, reduced-motion safe, mobile readable.

Tester must manually confirm raw input state preservation (type text, switch tabs, switch back, confirm text survives).

## Next recommended phase

Phase 35C — Library Bookshelf Evidence Review
