# Phase 35B — Library Bookshelf Evidence

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

Phase 35B implements only the Library Bookshelf tab segmentation. No import parsers, database pipelines, prompt builders, drop-zone lifecycle, backup/restore behavior, stored data, scheduler/FSRS behavior, route behavior, storage behavior, packages, or dependencies were changed.

## Runtime files changed

- `src/routes/Library.jsx` — tab state, tab switcher UI, panel split
- `src/styles/global.css` — Phase 35B tab styles appended
- `tests/unit/libraryBookshelfTabs.test.jsx` — static source analysis tests (new file)

## Library component discovery

- **Exact Library route/view/component file:** `src/routes/Library.jsx`
- **Subject/catalog cards:** `librarySubjectGrid` div mapping over `subjectCards`, rendered inside the shelf tab panel.
- **Import/configuration/admin panels:** inline in `Library.jsx` — JSON/CSV export/reset action card, demo quickstart card, import method guide card, manual AI prompt card, text/Markdown draft textarea card, text file import card, EduGen document import card, data source card, `V2BackupRestorePanel`, schema card, and `ImportPreview`. All moved to the workshop tab panel.
- **Raw input/textarea state:** `textDraft`, `aiPromptSource`, `aiPromptOptions`, `aiPromptResult`, `aiPromptStatus`, `aiOutputReview`, `preview`, `importStatus` — all remain as `useState` in the `Library` component (not in child components). State is hoisted above both panels.
- **Import panels:** mostly inline. Child components: `V2BackupRestorePanel`, `BackupBeforeImportNotice` (inside `ImportPreview`), `ImportPreview`, `AiOutputReviewPanel`, `QualityReviewPanel`.

## Implementation summary

Added a local `libraryTab` state (`useState('shelf')`) in the `Library` component. A `role="tablist"` div with two `role="tab"` buttons appears between the hidden file inputs and the tab panels. The shelf panel (`id="library-panel-shelf"`) and workshop panel (`id="library-panel-workshop"`) both stay mounted at all times. The inactive panel is hidden with `hidden={libraryTab !== '...'}`, which sets the HTML `hidden` attribute and is reinforced by `.libraryTabPanel[hidden] { display: none; }` in global.css.

The three file-picker functions (`openFilePicker`, `openTextFilePicker`, `openDocumentFilePicker`) call `setLibraryTab('workshop')` before opening the file picker so that import previews are visible when triggered from the workshop tab.

The `importStatus` Toast is placed outside both panels (at the bottom of the page stack) so smart-practice failures and import status messages are always visible regardless of which tab is active.

## Default shelf tab verification

- The `useState('shelf')` default is in source.
- The shelf panel `hidden={libraryTab !== 'shelf'}` expression is false on mount, so the shelf panel is visible and the workshop panel is hidden.
- The `librarySubjectGrid` and `EmptyState` are inside the shelf panel.
- The learner-facing onboarding card (`libraryEmptyOnboardingCard`) is inside the shelf panel.
- JSON/CSV import, export, reset, demo, text/Markdown, EduGen, backup/restore, schema, and import preview controls are not visible in the default shelf tab.

**Integration browser check:** Playwright Chromium confirmed Library opens to "Kệ sách của tôi" by default.

## Import workshop tab verification

- All import/config cards (`libraryWorkshopActionsCard`, `demoSampleQuickstartCard`, `importMethodGuideCard`, `manualAiPromptCard`, `textImportCard`, `textFileImportCard`, `documentImportCard`, `dataSourceCard`, `V2BackupRestorePanel`, schema card, `ImportPreview`) are inside the workshop panel.
- The workshop panel has `hidden={libraryTab !== 'workshop'}` so it is hidden on mount.

**Integration browser check:** Playwright Chromium confirmed "Xưởng nạp tài liệu" shows existing import/config panels, including demo sample, JSON/CSV import, and export.

## Raw input state preservation verification

**Strategy:** Both tab panels remain mounted. The `textDraft`, `aiPromptSource`, `aiOutputReview`, `preview`, and related state are hoisted in the `Library` component above both panels. Switching tabs changes only `libraryTab` local state, which hides/shows panels without unmounting. The hidden panel and its textarea/input values are preserved in React component state.

**Static evidence:** `const [textDraft, setTextDraft] = useState('')` and `const [aiPromptSource, setAiPromptSource] = useState('')` are confirmed in `Library.jsx` source above the tab panels.

**Integration browser check:** Playwright Chromium typed text in the "Nội dung bài học" textarea in the workshop tab, switched to the shelf tab, switched back, and confirmed the typed text was preserved.

## Accessibility verification

- Tab buttons: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-labelledby` on panels.
- Focus-visible styling: `.libraryTab:focus-visible { outline: 2px solid var(--color-focus, #2563eb); outline-offset: 2px; }` added in CSS.
- Hidden panels: `hidden` HTML attribute + `display: none` CSS. Hidden elements and their descendants are not keyboard-focusable per HTML spec.
- Hidden file inputs: `tabIndex={-1}` added — they are triggered only via `ref.current.click()` and must not be reached by Tab.

**Integration browser check:** Playwright Chromium confirmed keyboard focus on `library-tab-shelf` had a visible solid outline and that Tab did not reach controls inside a hidden panel.

## Reduced motion verification

A `@media (prefers-reduced-motion: reduce)` block sets `transition: none` on `.libraryTab`. Tab switching is immediate (no animation on the panels themselves). The visual transition on tab buttons (color/border change ~120ms) is suppressed under reduced-motion preference.

**Integration browser check:** Playwright Chromium emulated `prefers-reduced-motion: reduce` and confirmed tabs still switched immediately.

## Mobile/responsive verification

- The `.libraryTabList` uses `flex-wrap: wrap` so tabs wrap at narrow viewport.
- At `max-width: 560px`: `flex: 1` on `.libraryTab` makes each tab full-width, ensuring minimum 44px touch target.

**Integration browser check:** Playwright Chromium at 375px viewport confirmed both tabs remained 44px high and the document had no horizontal overflow.

## Regression checks

- No changes to import parsers (`csvImportParser.js`, `importValidator.js`, `textQuizParser.js`).
- No changes to AI prompt builder (`aiPromptBuilder.js`, `aiOutputReview.js`).
- No changes to storage (`learningDataStore.js`, `reviewScheduleStorage.js`, `studyHistoryStorage.js`).
- No changes to library export (`libraryExport.js`).
- No changes to file processor client (`fileProcessorClient.js`).
- No changes to FSRS/scheduler files.
- No changes to `package.json` or `package-lock.json`.
- No changes to Dashboard, Navigation, Study Room, or Settings runtime files.

## Manual browser evidence

Playwright Chromium integration smoke was run against `http://127.0.0.1:4173/library`.

1. Library opens to "Kệ sách của tôi" by default: PASS (`aria-selected="true"`).
2. Subject/catalog cards are visible in the shelf tab: PASS (`librarySubjectGrid` visible).
3. Import/configuration panels are not visible in the shelf tab: PASS (`Nạp JSON/CSV`, `Dùng quiz mẫu`, and `Xuất thư viện` not visible).
4. "Xưởng nạp tài liệu" shows existing import/configuration panels: PASS (`Dùng quiz mẫu`, `Nạp JSON/CSV`, and `Xuất thư viện` visible).
5. Raw typed text survives repeated tab switching: PASS (`#text-quiz-draft-input` preserved `State survives` after switching shelf/workshop).
6. Existing import/config controls still appear and remain usable: PASS (visible workshop controls confirmed).
7. Existing subject/catalog actions still appear and remain usable: PASS (shelf smart-practice action visible; subject grid visible).
8. Keyboard focus is visible on tab buttons: PASS (`library-tab-shelf` had solid 2px outline).
9. Inactive hidden tab controls are not reachable by keyboard: PASS (next focus did not have a hidden ancestor).
10. Reduced-motion preference does not require animation: PASS (`prefers-reduced-motion: reduce` still switched tabs immediately).
11. Desktop and 375px mobile viewport remain readable and tappable: PASS (both mobile tabs were 44px tall; horizontal overflow was false).

## Validation summary

- `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`: PASS.
- `node scripts/validate-phase35b-library-bookshelf.js`: PASS.
- `npm run build`: PASS, with pre-existing chunk-size warning only.
- `npm run test:unit`: PASS — 52 files, 2635 tests.
- `npx vitest run tests/unit/libraryBookshelfTabs.test.jsx`: PASS — 1 file, 32 tests.

## Known limitations

- Runtime and Validator/CI lane patches were integrated; the Phase 35B validator and CI registration are present.
- Local Playwright Chromium evidence was collected in integration. A separate human tester may still repeat checks before merge if desired.
- No approval for: BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, sync/cloud/account/auth/backend behavior, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, or Dynamic Canvas Themes implementation.

## Next recommended phase

Phase 35C — Library Bookshelf Evidence Review
