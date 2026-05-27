# Phase 37-uiA — Dynamic Canvas Themes Scope Gate

## Status tokens

PHASE37UIA_DYNAMIC_CANVAS_THEMES_SCOPE_GATE_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_SCOPE_GATE

PHASE37UIA_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37UIA_DYNAMIC_CANVAS_THEMES_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION

PHASE37UIA_REVIEW_SCOPE: DYNAMIC_CANVAS_THEMES_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE37UIA_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT

PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 37-uiA is docs/research/release/planning/static-validator/CI-only. It defines a safe boundary for Dynamic Canvas Themes and does not implement runtime behavior, CSS changes, source changes, tests, E2E changes, route changes, event handler changes, localStorage writes, storage changes, backup/restore changes, import/parser changes, scheduler/FSRS changes, package changes, telemetry, network calls, sync/cloud/account/auth/backend, Study Room correctness changes, Streak Fire, Collapsible Header, or a broad UI redesign.

## Inputs from Phase 37B and system leader feedback

Phase 37B merged as the broader actual evidence review and seeded Phase 37C as a separate limited release readiness gap review path. UI leadership feedback classifies Dynamic Canvas Themes as higher risk than a micro-effect because it can cross theme state, CSS custom properties, localStorage, user preference persistence, and many UI surfaces. The required pattern is scope gate -> small runtime pilot -> evidence review.

## Why Dynamic Canvas Themes is higher risk than micro-effects

A micro-effect can usually be isolated to one interaction. A dynamic theme feature can affect global tokens, body/background color, focus rings, status colors, charts, cards, mobile navigation, Study Room feedback, screenshots, and persisted settings. Because the current app already persists a light/dark theme in localStorage, any new theme concept risks expanding an existing user preference surface unless it is deliberately non-persisted and one-surface only.

## Discovery method

Static discovery only was performed with repository searches for canvas, Canvas, theme, Theme, localStorage, prefers-color-scheme, data-theme, CSS variables, Dynamic Canvas, DynamicCanvas, canvas themes, theme tokens, user preference, and localStorage across src, docs, tests, and e2e. No runtime files were edited during discovery.

## Existing Dynamic Canvas / theme ownership findings

No existing Dynamic Canvas or DynamicCanvas runtime surface was found by static discovery. Existing theme ownership is split between `src/ui/theme.js`, `src/boot-guard.js`, and `src/design-system/tokens.css`. `src/ui/theme.js` stores the `theme` key in localStorage and sets `data-theme`; `src/boot-guard.js` contains fallback theme initialization and also writes the `theme` key; `src/design-system/tokens.css` owns CSS custom properties and a `[data-theme='dark']` token override. CSS variables are consumed broadly by UI rendering and component styles, including Study Room result/feedback colors and design-system components. User preference persistence already exists for the current light/dark theme, which is why Phase 37-uiA forbids new persistence.

## Affected surface map

| Surface | Current evidence | Dynamic Canvas Themes concern |
| --- | --- | --- |
| App shell and navigation | `data-theme`, tokens, Sidebar, BottomNav | Global tokens can change navigation contrast and active indicators. |
| Dashboard/Home | Card grids and shared tokens | Broad visual identity and screenshot expectations could shift. |
| Library and import/workshop | Import issue states and localStorage messaging | Status colors must remain legible and not imply storage behavior changes. |
| Study Room | Answer feedback, result status, focus paths | Correct/wrong colors and feedback contrast are correctness-adjacent and high risk. |
| Help tour/mobile tools | Theme toggle references `btnTheme` and `mTheme` | Existing theme controls must not become a new picker or preference system. |
| Design-system tokens | `src/design-system/tokens.css` custom properties | Token preview must not rewrite global theme architecture. |
| Storage and settings | localStorage-backed theme and settings patterns | New theme persistence/localStorage writes are not approved. |

## Risk table

| Risk area | Why it matters | Scope-gate finding | Mitigation | Phase 37-uiB impact |
| --- | --- | --- | --- | --- |
| Theme state | Theme state can become global app state. | Current `data-theme` state already exists. | Do not add new global state in Phase 37-uiA. | Use no persistent state; prefer one scoped preview only. |
| CSS variables | Token changes affect many surfaces. | Tokens are centralized in `src/design-system/tokens.css`. | Treat token edits as high-blast-radius runtime work. | Pilot may touch only scoped preview tokens if separately approved. |
| localStorage | Writes can alter user preferences and backup assumptions. | Current theme writes use the `theme` key. | Phase 37-uiA forbids localStorage writes. | Phase 37-uiB must not add localStorage writes. |
| user preference persistence | Preferences imply durable behavior and migration concerns. | Existing light/dark preference is persisted. | Do not introduce a new preference. | No persisted theme preferences. |
| global surface blast radius | Theme changes can affect every route. | Tokens are consumed broadly. | Avoid global theme picker/system. | One surface only if discovery supports it. |
| accessibility contrast | Theme tokens can break text, focus, and status contrast. | Existing tokens include text, muted, status, focus, and border colors. | Require contrast evidence before any pilot pass. | Capture contrast and focus-visible evidence. |
| reduced-motion | Dynamic canvas may imply motion. | Reduced-motion expectations exist in prior UI evidence tracks. | No motion by default in scope gate. | Runtime pilot must respect reduced-motion. |
| mobile 375px layout | Theme preview controls can crowd compact layouts. | Prior mobile tracks focused on 375px. | Require 375px evidence. | Pilot must provide 375px screenshot/manual evidence. |
| screenshots/manual evidence | Visual theme changes need proof, not assumption. | Phase 37B carried evidence limitations forward. | Require before/after evidence for any pilot. | Evidence review follows Phase 37-uiB. |
| storage/backup/restore boundary | Preference persistence can affect local-first guarantees. | Storage docs treat localStorage as canonical for app data. | No storage/backup/restore behavior changes. | Pilot must not touch backup/restore paths. |
| sync/account/backend boundary | Account-synced themes imply backend identity. | No sync/account/backend approval exists. | Keep all sync/account/backend forbidden. | No account-linked preferences. |

## Candidate option comparison

| Candidate | User value | Risk | Expected implementation size | Decision |
| --- | --- | --- | --- | --- |
| Dynamic Canvas Theme Token Preview Pilot | Lets the team test one visible themed token preview without committing to a full system. | Medium if one-surface and non-persisted. | Small runtime pilot after this gate. | Selected for Phase 37-uiB. |
| Static Theme Token Audit Only | Improves understanding without runtime risk. | Low. | Docs/static only. | Acceptable fallback if no safe target exists. |
| One-Surface Non-Persisted Canvas Accent Pilot | Tests visual direction on one surface. | Medium; may still imply global style direction. | Small. | Acceptable only if scoped below token preview risk. |
| Full Theme Picker | User-facing customization. | High: state, UI, persistence pressure. | Large. | Not approved. |
| Persisted User Theme Preference | Durable customization. | High: localStorage, migration, user expectations. | Medium to large. | Not approved. |
| Global Theme System | Broad product identity shift. | High. | Large. | Not approved. |
| Account-Synced Theme Preference | Cross-device personalization. | Very high: account/backend/sync. | Large. | Not approved. |
| Hold For More Research | Avoids implementation risk. | Low. | Docs/research only. | Fallback if no one-surface target is safe. |
| Return To Phase 37C Gap Review First | Prioritizes release readiness. | Low for UI track; delays theme work. | Review only. | Phase 37C remains separate and can proceed independently. |

## Selected candidate

Selected candidate: PHASE37UIA_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT.

Chosen decision: PHASE37UIA_DYNAMIC_CANVAS_THEMES_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION.

## Why Dynamic Canvas Theme Token Preview Pilot first

Dynamic Canvas Theme Token Preview Pilot is the smallest useful next step because it can test a visible token preview without approving a full theme picker, persisted preferences, localStorage writes, account-synced preferences, global theme system, or broad UI redesign. If Phase 37-uiB cannot identify one safe surface, it must hold or switch to research-only.

## Why this is a scope gate, not runtime implementation

Phase 37-uiA does not modify runtime source, CSS, tests, E2E specs, routes, event handlers, storage, localStorage, backup/restore, import/parser, scheduler/FSRS, package files, telemetry, sync/account/backend, or generated artifacts. Its output is documentation, a planning seed, a static validator, and CI registration only.

## Phase 37-uiB allowed files / expected areas

Phase 37-uiB may be a small runtime pilot only if discovery supports it. Expected areas should be one UI surface and one scoped CSS/token preview, plus focused evidence docs and validator updates if separately scoped. The pilot should prefer a non-persisted preview pattern with no new settings surface and no localStorage writes.

## Phase 37-uiB forbidden areas

Phase 37-uiB must not implement a full theme picker, persisted theme preferences, localStorage writes, account-synced preferences, sync/cloud/account/auth/backend, telemetry/network calls, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, package/dependency changes, route behavior changes, broad UI redesign, Study Room correctness/scoring/scheduler/queue/data changes, Streak Fire, or Collapsible Header.

## Accessibility, contrast, and reduced-motion requirements

Any runtime pilot must include contrast evidence for text, muted text, focus ring, border, selected/active state, and success/warning/danger/info status colors used by the selected surface. It must include keyboard focus-visible evidence, reduced-motion evidence, desktop evidence, and mobile 375px evidence. If the preview uses animated or canvas-like treatment, reduced-motion must disable or simplify it.

## Persistence and localStorage restrictions

Phase 37-uiA does not approve persisted theme preferences. Phase 37-uiA does not approve localStorage writes. Phase 37-uiA does not approve account-synced preferences. Phase 37-uiB must not write a new key, modify the existing `theme` key, clear the `theme` key, migrate theme data, or add any preference sync path.

## Evidence requirements for any runtime pilot

Phase 37-uiB evidence must include the selected surface, desktop screenshot/manual evidence, 375px screenshot/manual evidence, contrast checks, focus-visible checks, reduced-motion checks, no-localStorage-write review, no storage/backup/restore impact review, rollback notes, and confirmation that Phase 37C remains separate.

## Rollback / hold plan

If a safe one-surface non-persisted target cannot be identified, Phase 37-uiB must HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT or PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY. If a pilot causes contrast, layout, focus, reduced-motion, or storage uncertainty, remove the scoped preview and return to the existing token behavior.

## Chosen scope decision

PHASE37UIA_DYNAMIC_CANVAS_THEMES_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION

## Decision rationale

The gate selects a narrow token preview pilot because the repository has existing theme persistence and global tokens but no distinct Dynamic Canvas surface. A full theme feature would couple global style architecture to user preference and storage behavior without enough evidence. The selected candidate keeps the next step small and reviewable.

## What Phase 37-uiA supports

Phase 37-uiA supports a separate Phase 37-uiB small runtime pilot only if discovery supports one safe surface. It supports static validation, CI registration, explicit post-merge-main safety, and continued separation from Phase 37C.

## What Phase 37-uiA does not approve

Phase 37-uiA confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 37-uiA does not approve BETA_READY. Phase 37-uiA does not approve public production readiness. Phase 37-uiA does not approve broad validation or stress-tested readiness. Phase 37-uiA does not approve guaranteed data-loss prevention. Phase 37-uiA does not approve Dynamic Canvas Themes full implementation. Phase 37-uiA does not approve a full theme picker. Phase 37-uiA does not approve persisted theme preferences. Phase 37-uiA does not approve localStorage writes. Phase 37-uiA does not approve account-synced preferences. Phase 37-uiA does not approve sync/cloud/account/auth/backend. Phase 37-uiA does not approve telemetry/network calls. Phase 37-uiA does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 37-uiA does not approve storage/backup/restore behavior changes. Phase 37-uiA does not approve import/parser behavior changes. Phase 37-uiA does not approve scheduler/FSRS behavior changes. Phase 37-uiA does not approve route behavior changes. Phase 37-uiA does not approve event handler changes. Phase 37-uiA does not approve package/dependency changes. Phase 37-uiA does not approve Study Room correctness/scoring/scheduler/queue/data changes. Phase 37-uiA does not approve Streak Fire. Phase 37-uiA does not approve Collapsible Header. Phase 37-uiA does not approve broad UI redesign. Phase 37-uiA does not approve automatic next runtime implementation.

## Next recommended phase

Next recommended phase: Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot.
