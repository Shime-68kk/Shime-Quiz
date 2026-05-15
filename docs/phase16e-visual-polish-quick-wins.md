# Phase 16E — Visual Polish Quick Wins

## 1. Phase statement

Phase 16E is visual polish quick wins only.

This phase:

- Implements a small, safe, visible polish pass on five UI files.
- Is not a new feature expansion phase.
- no scheduling changes — scheduling logic, FSRS behavior, and review schedule storage are untouched.
- no storage changes — localStorage schema, storage keys, and backup/import files are untouched.
- no dependencies — package.json and package-lock.json are untouched. No new libraries added.
- no EduGen runtime — EduGen connector is not bundled or implemented in this phase.
- Does not implement sync, cloud, account, or auth.
- Does not implement full i18n.
- Does not expose internal FSRS flags (`fsrsActiveSchedulingEnabled`, `schedulerKind`, `fsrsPayload`).
- Does not make broad AI/FSRS/sync/EduGen claims.
- Does not activate active FSRS for general users.

Phase 16D defined Shime's identity. Phase 16E makes that identity felt — not just documented.

---

## 2. Identity anchor

Phase 16E follows Phase 16D identity:

- **Calm by default** — no streak anxiety, no loud colors, no flashy effects.
- **Beautiful but quiet** — small polish that improves perceived quality without distraction.
- **Motion is breath, not bounce** — transitions are subtle and intentional. All new transitions include `prefers-reduced-motion` fallbacks.
- **Mistakes are signals** — feedback copy does not shame users. Wrong answers are information, not failure.
- **Vietnamese-first** — Vietnamese labels remain primary; English is secondary or hidden.
- **Draft before trust** — no auto-publish, no AI claims, no EduGen bundling.
- **Local-first trust** — UI reflects privacy and local ownership, not cloud dependency.

---

## 3. Changed UI files

### `src/routes/Home.jsx`
- Added a quiet identity tagline below the hero heading: "Phòng học yên tĩnh — dữ liệu của bạn, ở đây, an toàn."
- Tagline uses `.publicLandingIdentityLine` class (new Phase 16E style).

### `src/routes/Dashboard.jsx`
- Updated PageHeader subtitle to reference "Lộ trình hôm nay" concept.
- Updated first-run empty state heading from "Chưa có dữ liệu học tập" to "Bắt đầu học từ đây" for a more welcoming tone.
- Updated empty state first paragraph to remove imperative framing.

### `src/routes/StudyRoom.jsx`
- Updated the study room Card eyebrow from "Chế độ tập trung" to "Phòng học tập trung" for calmer framing.
- Kept all scheduling logic, bridge gating, and state management unchanged.

### `src/components/study/FsrsProductionMemoryRatingBridge.jsx`
- Changed bridge section header from "Mức độ nhớ thử nghiệm" to "Mức độ nhớ" — quieter, calmer.
- The aria-label still references "Đánh giá mức độ nhớ" for accessibility.
- All rating labels (`Nhớ khó`, `Nhớ được`, `Nhớ dễ`, `Chưa nhớ`) unchanged.
- Claim-safe copy and `'Continue without rating'` option unchanged.

### `src/components/settings/FsrsExperimentalSettingsPanel.jsx`
- Added a visual note label before the experimental badge for clearer framing.
- No behavioral or storage changes.

---

## 4. CSS changes

### `src/styles/global.css`
Added Phase 16E styles:
- `.publicLandingIdentityLine` — quiet identity tagline for Home hero.
- `.memoryBridge` and sub-elements — visual styling for the memory rating bridge block.
- `.settingsPanel`, `.settingsPanel__*` sub-elements — visual styling for the FSRS settings panel.
- `.settingsToggle`, `.settingsToggle__thumb` — toggle switch styling.
- `.modalOverlay`, `.modalBox` — modal dialog styling.
- All new transitions include `@media (prefers-reduced-motion: reduce)` fallbacks.

---

## 5. Scope control

### What did NOT change

- `src/quiz/reviewSchedulerAdapter.js` — untouched.
- `src/quiz/fsrsWrapper.js` — untouched.
- `src/state/reviewScheduleStorage.js` — untouched.
- `src/state/settingsStorage.js` — untouched.
- `src/quiz/dataBackup.js` — untouched.
- `src/state/v2BackupRestore.js` — untouched.
- `package.json` — untouched.
- `package-lock.json` — untouched.
- `e2e/` — untouched.
- No new localStorage keys.
- No `indexedDB`, `StorageAdapter`, `SyncAdapter`, or EduGen connector runtime.
- No new dependencies added.
- No new routes added.
- No persistent settings added.
- No storage schema changes.
- No scheduling logic changes.
- No FSRS behavior changes.

---

## 6. Accessibility / reduced-motion

- All new CSS transitions use `transition:` with `ease` easing and short durations (120–200ms).
- The global `@media (prefers-reduced-motion: reduce)` block in global.css already sets `transition-duration: 0.01ms !important` for all elements, which applies to the new styles as well.
- No animation libraries added.
- No animations without reduced-motion fallbacks.

---

## 7. Claim guardrails

The following claims do not appear in this phase and must not appear in future phases without
implementation evidence:

- `AI scheduled this for you` — false; do not use this phrase.
- `OCR capability` — not implemented; no OCR functionality has been added.
- `EduGen is included` — false; EduGen connector is not bundled.
- `Cloud sync ready` — false; no cloud sync has been deployed.
- `Smart scheduling` — misleading; use "Adaptive Review" instead.
- No broad active-FSRS rollout — active FSRS remains experimental, default OFF, internal/test-controlled. No general-user activation has occurred.
- `Mastery guaranteed` — false; do not use this phrase.

---

## 8. Validation

- `scripts/validate-phase16e-visual-polish-quick-wins.js` — static file/scope/doc/UI checks.
- `tests/unit/visualPolishQuickWins.test.jsx` — unit/static tests.
- `.github/workflows/e2e-smoke.yml` — Phase 16E validator added after Phase 16D.
- Full static validator chain: `FINAL_STATUS=0`.

---

## 9. Suggested next phase

Phase 16F — EduGen Connector Plan / Draft Workshop Architecture
