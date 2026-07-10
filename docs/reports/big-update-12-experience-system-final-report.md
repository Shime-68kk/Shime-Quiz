# BIG-UPDATE-12 Experience System Final Report

## 1. Executive Verdict

**PASS — SAFE_TO_COMMIT_BIG_UPDATE_12.** The app now has one persisted bilingual runtime, a validated five-theme semantic system, calmer Library workflow, immediate top-level route motion, and clearer Settings hierarchy. Learning and privacy logic remain locked.

## 2. Baseline

- Branch: `main`
- Baseline commit: `87b9e47e Audit architecture foundation before premium UI`
- BIG-UPDATE-10/10.1/11 work was already present and preserved.
- Baseline build: 287 modules; JS 899.98 kB / 252.47 kB gzip; CSS 146.19 kB / 24.60 kB gzip.
- Baseline smoke E2E: PASS, 7 tests.

## 3. Deep Audit Summary

Audit verdict: PASS to proceed. Locale state was Settings-only and preview-only; theme persistence accepted invalid values; Library overemphasized prompt tooling; Settings rendered one long mixed-priority page; no shared route-content motion existed. Presentation boundaries were clean enough to fix without learning logic changes.

## 4. Language Runtime

One provider now wraps all routes. The runtime uses stable keys, interpolation, deterministic Vietnamese fallback, and `document.lang`. No browser-language detection or remote translation is used.

## 5. Vietnamese Coverage

PASS across shell, Home, Overview, Library, StudyRoom, and Settings. Vietnamese remains the default.

## 6. English Coverage

PASS across shell, Home, Overview, Library, StudyRoom, and Settings. Expanded EduGen and developer diagnostics were checked in idle and generated-result states with zero Vietnamese interface lines in English mode. Imported and user-created content remains unchanged by design.

## 7. Language Persistence

PASS. `shime.ui.locale.v1` is isolated from theme, learning, scheduler, backup, and Safe Capsule state. Invalid values fall back to Vietnamese.

## 8. Theme Architecture

Five themes remain available. Every theme has complete page, text, brand, companion, border, interactive, status, progress, and chart roles. Invalid values fall back safely.

## 9. Forest Dark Fixes

Active navigation uses product lavender semantics rather than unrelated green. Dark cards, helper text, beta labels, focus rings, borders, and status surfaces now use dark semantic roles.

## 10. Contrast and Readability

Calculated critical text pairs pass 4.5:1 across all themes. Body ratios are 14.57–16.17:1, muted ratios 4.83–7.69:1, and brand text ratios 5.92–8.85:1.

## 11. Library Workshop Changes

`Thêm học liệu` / `Add study materials` replaces workshop language. Sample, paste, and file are primary; the manual external-tool template is secondary. Emoji method icons were replaced by inline SVG. Backup and schema content use progressive disclosure. Import callbacks are preserved.

## 12. Route Motion

Only keyed route content enters with opacity and 4px vertical movement over 180ms. Navigation is immediate. Sidebar, BottomNav, layout dimensions, and StudyRoom question changes are not route-animated.

## 13. Settings Reorganization

Appearance comes first, experimental FSRS remains clearly gated, and advanced/developer tools are collapsed by default. EduGen, Device Bridge, companion simulations, Safe Capsule labs, and scheduler evidence use the canonical locale runtime when expanded. No experimental option is auto-enabled.

## 14. Shared UI Changes

Buttons, cards, badges, active navigation, focus rings, warnings, controls, Library tabs, theme choices, and disclosures use shared semantic roles.

## 15. Learning Logic Safety

PASS. Scoring, answer handling, session state, selection, mastery, progress, import parsing, import validation, export, backup payloads, and persistence contracts were not changed.

## 16. Scheduler Safety

PASS. SM2 remains the stable default. FSRS remains beta opt-in. `fsrsCanBeDefault` remains `false`. No due-date or card migration behavior changed.

## 17. Safe Capsule Safety

PASS. Schema, allowlist, checksum, export, bridge, transport, and robot-facing payloads were not changed. Safe Capsule only; no raw question or answer content is sent to a robot.

## 18. Data Preservation

PASS. UI language and theme use dedicated versioned keys. Learning data, history, review schedule, settings flags, and backup data are not migrated or reset.

## 19. Mobile Review

Target widths: 360, 390, 428, 768, 1024, and 1440. No horizontal overflow; touch targets and fixed BottomNav remain stable. Long English and Vietnamese labels wrap.

## 20. Accessibility Review

PASS. `document.lang`, skip link, focus-visible rings, tab semantics, disclosure `aria-expanded`, decorative SVG handling, text status equivalents, and reduced-motion behavior are present.

## 21. Performance Comparison

Final build: 293 modules; JS 990.79 kB / 274.70 kB gzip; CSS 165.24 kB / 27.74 kB gzip; build time 1.55s in the final local run. Relative to baseline, JS grew 90.81 kB / 22.23 kB gzip and CSS grew 19.05 kB / 3.14 kB gzip. Growth is attributable to 926-key bilingual dictionaries and semantic theme/UI rules. No dependency, font, icon package, video, raster hero, or code-splitting change was added. The existing >500 kB chunk warning remains. No LCP, INP, or CLS value is claimed.

## 22. Files Modified

Primary additions are under `src/uiI18n`, `src/uiTheme`, `src/components/library`, Settings disclosures, tests, validator, and BIG-UPDATE-12 reports. Existing Home, Overview, Library, StudyRoom, Settings, shell, tokens, and global CSS were extended. Locked scheduler, Safe Capsule, storage, parser, import/export, and robot files were not modified.

## 23. Automated Validation

- BIG-UPDATE-12 targeted tests: PASS, 13/13.
- Dictionary parity: PASS, 926/926.
- Contrast calculations: PASS.
- Production build: PASS.
- Full unit: PASS, 284 files / 3,517 tests.
- Smoke E2E: PASS, 7/7.
- Scheduler lab: PASS, 4/4; targeted scheduler safety: PASS, 16/16.
- Safe Capsule safety: PASS, 40/40.
- Import safety: PASS, 134/134.
- Mobile regression: PASS, 9/9.
- BIG-UPDATE-10 validator: PASS; architecture validator: PASS; BIG-UPDATE-12 validator: PASS, 102 checks.

## 24. Manual Validation

PASS for the 50-combination desktop matrix, representative screenshots, language/theme reload behavior, invalid preference fallback, keyboard focus, reduced motion, mobile widths, route-shell stability, and fixed BottomNav geometry before/after navigation. Expanded English Settings was exercised through EduGen preview, bridge enablement, companion simulation, Safe Capsule actions, mock end-to-end verification, and scheduler comparison with zero Vietnamese interface lines. Browser plugin was unavailable; repository Playwright Chromium was used after standalone Playwright CLI failed because `/opt/google/chrome/chrome` was absent.

## 25. Known Limitations

- The existing main JavaScript chunk remains above 500 kB.
- Technical protocol identifiers and payload field names intentionally remain stable across locales.
- Exact field performance metrics were not available; no synthetic LCP/INP/CLS claim is made.

## 26. Codex Recommendations

1. Split large developer-only Settings panels into lazy route-level chunks in a future dependency-neutral performance phase.
2. Continue replacing legacy inline visualization styles with semantic CSS as those surfaces are touched.
3. Keep translation parity validation mandatory for new application chrome.

## 27. Final PASS / NOT PASS Decision

**PASS — SAFE_TO_COMMIT_BIG_UPDATE_12.** No commit or push was performed.
