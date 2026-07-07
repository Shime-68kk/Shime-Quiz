# Beta UI Phase I18N-1: Visible Language Switch

Date: 2026-06-29 16:08:55 +0700

## What Changed

- Mounted a visible Vietnamese/English language switch near the top of Settings.
- Added a scoped in-memory language provider for the Settings switch.
- Added runtime tests for default Vietnamese, English preview rendering, visible switch wiring, fallback, and safety boundaries.

## Files Changed

- `src/routes/Settings.jsx`
- `src/uiI18n/ShimeLanguageProvider.jsx`
- `src/uiI18n/useShimeLanguage.js`
- `src/uiI18n/ShimeLanguageSwitch.jsx`
- `src/uiI18n/shimeLanguageSwitchPreview.jsx`
- `tests/unit/shimeLanguageRuntime.test.jsx`
- `docs/beta-ui-phase-i18n-1-visible-language-switch.md`

## Mount Location

- Settings route, immediately below the Settings page header.
- The provider scope is limited to Settings for this phase.

## Runtime Boundaries

- Vietnamese remains default.
- English is preview-only.
- No persistence was added.
- No browser language auto-detection was added.
- No StudyRoom, DeviceBridge runtime, Companion logic, Shime intelligence, firmware, package, or lockfile changes were made for this phase.
- Full page reload creates a new in-memory provider and resets to Vietnamese.
- Unknown locale input falls back to Vietnamese.

## Validation

- `npm run build`: PASS.
- `npm run test:unit`: PASS, 173 test files / 3141 tests.
- `npx vitest run tests/unit/shimeUiCopyProposal.test.js tests/unit/shimeLanguageRuntime.test.jsx`: PASS, 2 test files / 12 tests.
- Safety scan over changed runtime files for persistence, network, AI/cloud, bridge emit, and robot-send terms: PASS, no matches.

## Recommendation

SAFE_UI_I18N_1_VISIBLE_LANGUAGE_SWITCH
