# BIG-UPDATE-12 Language Coverage Report

## Verdict

**PASS.** One app-level locale runtime now controls Vietnamese and English application chrome. Vietnamese remains the deterministic default; English is a persisted UI preference rather than a preview.

## Canonical Runtime

- Provider: `src/uiI18n/ShimeLanguageProvider.jsx`
- Runtime and fallback: `src/uiI18n/localeRuntime.js`
- Dedicated persistence: `src/uiI18n/localeStorage.js`
- Vietnamese dictionary: `src/uiI18n/translations/vi.js`
- English dictionary: `src/uiI18n/translations/en.js`
- Storage key: `shime.ui.locale.v1`
- Translation key count: 926 Vietnamese / 926 English
- Key parity: exact
- Missing-key behavior: Vietnamese lookup first, then the stable key string
- Invalid locale behavior: fallback to `vi`

## Route Coverage

| Surface | Vietnamese | English | Notes |
| --- | --- | --- | --- |
| Persistent shell | PASS | PASS | Navigation, current state, skip link, brand subtitle |
| Home | PASS | PASS | Hero, benefits, flow, privacy, technical disclosure, CTAs |
| Overview | PASS | PASS | Header, tabs, learner summary, daily card, journey, goal, disclosures |
| Library | PASS | PASS | Shelf, subject detail, add-material workflow, preview, status feedback |
| StudyRoom | PASS | PASS | Header, modes, answer controls, feedback, subject spaces, result summary |
| Settings | PASS | PASS | Appearance, theme, language, experimental boundary, disclosure groups |

Developer protocol identifiers, imported content, subject names, topic names, file names, quiz prompts, answers, explanations, and historical stored content are not translated.

## Persistence and Isolation

- Language changes apply immediately through React context.
- Reload preserves a valid locale.
- Corrupt and unknown values fall back to Vietnamese.
- Locale writes touch only `shime.ui.locale.v1`.
- Locale changes do not write the theme key, learning library, study history, review schedule, scheduler settings, backup payloads, or Safe Capsule data.
- Browser-language detection and remote translation are not used.

## Mixed-Language Guard

Normal route surfaces use stable translation keys. Allowed technical terms include JSON, CSV, PDF, DOCX, PPTX, ZIP, API, SM2, FSRS, and protocol field names where technically required. User-generated and imported content remains exactly as stored.

## Validation

- Dictionary parity: PASS, 926 keys each.
- Unknown locale fallback: PASS.
- Dedicated storage boundary: PASS.
- Five major routes rendered in Vietnamese: PASS.
- Five major routes rendered in English: PASS.
- 50 language/theme/route combinations: PASS with no blank page, horizontal overflow, or console error.
