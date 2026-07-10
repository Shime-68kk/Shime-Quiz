# BIG-UPDATE-12 i18n and Theme Deep Audit

## 1. Executive Verdict

**PASS to proceed.** The current UI has a real but isolated language preview, five persisted themes, and a stable React Router shell. The defects are in presentation architecture: locale state is scoped to Settings, theme values are not validated, semantic theme roles are incomplete, and major routes contain hard-coded application copy. The learning, scheduler, import, storage, Safe Capsule, and robot boundaries do not need to change.

Baseline gates before implementation:

- Production build: PASS, 287 modules.
- JS: 899.98 kB minified / 252.47 kB gzip.
- CSS: 146.19 kB minified / 24.60 kB gzip.
- Build time: 3.79 seconds (4.56 seconds wall time).
- Smoke E2E: PASS, 7 tests.
- Existing chunk warning: main JavaScript chunk exceeds 500 kB.
- Dependencies and `package-lock.json`: unchanged.

## 2. Language Runtime Map

- `ShimeLanguageProvider` currently owns in-memory state only.
- The provider is mounted inside `Settings`, so Sidebar, BottomNav, Home, Overview, Library, and StudyRoom cannot consume it.
- `shimeUiCopyProposal.js` contains a small bilingual proposal, not route-complete dictionaries.
- `ShimeLanguageSwitch` explicitly says preview-only and resets after reload.
- Default and unknown-locale fallback are Vietnamese.
- No browser-language detection, remote translation, network request, learning-data write, or scheduler write exists in the language runtime.

## 3. Hard-Coded Copy Inventory

The audit found 169 literal `aria-label`, `placeholder`, or `title` attributes and extensive route-level hard-coded copy. Approximate user-facing/mixed-copy line counts in the major route surfaces are:

| Surface | Matching lines | Main risk |
| --- | ---: | --- |
| Home | 55 | Vietnamese only |
| Overview | 71 | Vietnamese only, advanced metrics included |
| Library | 335 | Vietnamese only, AI/prompt wording, emoji |
| StudyRoom | 154 | Vietnamese-only study chrome and status feedback |
| Settings | 25 route lines | Nested panels contain extensive mixed Vietnamese/English copy |
| Shell | 8 | Vietnamese labels and accessibility names |

User-created subject names, topics, file names, imported prompts, imported answers, and historical content are correctly treated as data and must remain untranslated.

## 4. Partial Translation Findings

- Vietnamese Settings shows English labels including `Theme Customization` and many developer-panel headings.
- English preview translates only the language card and portions of the Companion panel.
- Navigation labels come from static Vietnamese route metadata.
- Home, Overview, Library, and StudyRoom do not consume locale context.
- Backup, import, Safe Capsule, and developer surfaces contain mixed paragraphs.
- Several accessibility labels remain English inside Vietnamese UI.
- Technical terms such as JSON, CSV, PDF, DOCX, PPTX, ZIP, SM2, FSRS, and API are legitimate exceptions when used precisely.

## 5. Theme Architecture Map

- `src/design-system/tokens.css` defines the default theme plus `dark`, `ocean`, `sunset`, and `lavender` selectors.
- `src/ui/theme.js` persists a raw `theme` string and applies it without validation.
- `main.jsx` calls `initTheme()` before React render, which reduces theme flash but also rewrites storage during initialization.
- Components mix legacy tokens, BIG-UPDATE-11 Shime tokens, theme-specific aliases, direct hex colors, and inline styles.
- The source tree contains 198 hex-color occurrences, 363 `rgb`/`rgba` occurrences, and 248 inline-style occurrences. Many are visual prototypes or data visualizations; route-critical controls and surfaces need semantic migration first.

## 6. Hard-Coded Color Inventory

High-impact hard-coded color locations:

- `ThemeSettingsPanel`: per-theme text, backgrounds, borders, scaling, and swatches inline.
- Library shelf/workshop CSS: fixed book colors, status fills, and emoji/icon presentation.
- Shell and BIG-UPDATE-11 Home layer: fixed lavender/mint values that do not fully adapt across themes.
- Robot presence: state colors are hard-coded in component configuration.
- Legacy phase CSS: multiple fixed navigation and card colors override theme intent.
- Developer panels: fixed warning/info colors and white surfaces can conflict with Forest Dark.

Theme swatches may retain explicit representative colors. Meaningful UI state, text, surfaces, navigation, borders, focus, warning, beta, and developer status should use semantic roles.

## 7. Theme Contrast Risks

- Forest Dark inherits bright green from legacy navigation variables, causing active product state to look like a success state.
- Some BIG-UPDATE-11 surfaces remain warm-white/lavender because they reference fixed Shime values instead of per-theme roles.
- Muted text and small helper text are not governed by one contrast-tested role.
- Beta/preparation badges sometimes use green or product-primary colors rather than warning/beta roles.
- Inline theme-card preview text is manually switched only for dark, leaving a fragile contrast path.
- Focus rings, disabled controls, inputs, and bottom navigation need a five-theme matrix.

## 8. Library Workshop Findings

- The current tab label `Xưởng nạp tài liệu` feels industrial.
- `Trợ lý Prompt`, `Tạo prompt AI`, emoji method icons, and equal-weight controls make the surface resemble an AI tool.
- Main local flows (sample, paste, text file, JSON/CSV) compete visually with optional EduGen and manual external-tool guidance.
- Critical local/privacy copy is mixed with lengthy implementation explanations.
- Import callbacks are locally defined and can remain byte-for-byte behaviorally equivalent while presentation and labels change.
- The shelf is visually distinct and should be preserved; workshop hierarchy and iconography need the main work.

## 9. Route Motion Findings

- Home has scoped entry motion and reduced-motion handling.
- There is no shared top-level route content transition.
- Sidebar and BottomNav are stable because they live in `AppLayout` outside the route outlet.
- A keyed main-content stage can animate immediate mount using opacity and a small vertical transform without timers or exit delays.
- StudyRoom question changes must remain outside this route-stage key.

## 10. Settings Findings

- Language and theme are first, but language is preview-only and theme copy is mixed.
- Experimental FSRS appears beside normal preferences without a strong section hierarchy.
- Device Bridge, Companion, Safe Capsule labs, scheduler evidence, backup-related tooling, and EduGen workshop all render as one very long page.
- Advanced and developer content should be collapsed by default without changing child components, callbacks, or feature gates.
- Safe Capsule and bridge panels must retain their existing data boundaries and must not imply a live robot connection.

## 11. Logic Boundaries

Locked and excluded from implementation:

- `src/scheduler/*`, SM2, FSRS adapters, registry, readiness gates, and scheduler defaults.
- StudyRoom answer handling, selection, session persistence, callback ordering, and question transitions.
- Import parsers, validators, export, backup payloads, and learning-data storage.
- Safe Capsule schema, allowlist, checksum, robot bridge, device transport, sensing, and network behavior.
- Route destinations and business payload shapes.

Allowed state is limited to versioned UI locale/theme preferences and presentational disclosure state.

## 12. Safe Implementation Plan

1. Promote one locale provider above the router outlet and persist locale in a dedicated versioned UI-preference key.
2. Replace the preview copy map with key-parity Vietnamese/English dictionaries and parameter interpolation.
3. Translate shared shell and major-route application chrome while preserving user-generated and imported content.
4. Define a validated five-theme registry and complete semantic roles in every theme.
5. Migrate route-critical UI to semantic tokens and calculate contrast for critical pairs.
6. Reframe Library as `Thêm học liệu` / `Add study materials`, replace emoji method icons with inline SVG, and move optional detail behind disclosures.
7. Add an immediate, keyed main-content route entrance; never delay navigation or animate the fixed shell.
8. Reorganize Settings into Appearance, Experimental, and collapsed Advanced/Developer groups without changing child logic.
9. Add parity, persistence, isolation, contrast, Library, motion, Settings, and validator tests.
10. Run full regression gates and a representative 2-language × 5-theme × 5-route browser matrix.

## 13. PASS / NOT PASS to Proceed

**PASS.** The implementation can remain presentation-only, preference-isolated, dependency-free, and compatible with all existing learning and privacy contracts.
