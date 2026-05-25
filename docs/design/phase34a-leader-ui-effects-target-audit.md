# Phase 34A — Leader UI Effects Target Audit

## Scope

This audit supports Phase 34A target selection for a future Leader UI effects implementation gate.
It is docs/design/static-validator/CI-only and does not implement visual effects.

Phase 34A scope for this Codex lane is limited to read-only inspection of candidate UI surfaces,
target audit documentation, validator creation, and CI registration.

No runtime behavior changes.
No source changes.
No unit test changes.
No e2e test changes.
No package changes.
No release notes edits.
No storage, backup, export, restore, sync, cloud, account, auth, backend, telemetry, or migration changes.
No Leader UI effects implementation.

Current boundary:

```text
PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_STATUS: COMPLETED_FINAL_GO_NO_GO
PHASE33F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_DECISION: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS
PHASE33F_GO_NO_GO_SCOPE: CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE33F_LIMITATION_STATUS: LIMITATIONS_ACCEPTED_FOR_CONTROLLED_LIMITED_BETA_ONLY
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
```

Highest approved readiness remains `LIMITED_BETA_CANDIDATE`.
BETA_READY is not approved.
Public production readiness is not approved.

## Read-only audit method

The audit inspected candidate files under `src/**` without modifying them. The review focused on
existing component boundaries, route ownership, CSS selectors, current transition usage, current
reduced-motion support, and surfaces that could accept small CSS-first UI effects in Phase 34B.

Read-only commands used during lane preparation included file listing and targeted file reads for:
- layout shell and navigation components
- dashboard leader surfaces
- study room leader surfaces
- shared cards, buttons, badges, progress bars, and global styles

This audit is not an implementation plan by itself. It identifies candidate surfaces and constraints
that the Phase 34A design spec and Phase 34B seed must bound before any runtime change is allowed.

## Candidate files inspected

| Candidate file | Read-only purpose | Notes |
|---|---|---|
| `src/layout/AppLayout.jsx` | Identify app shell and focus-mode boundaries | Contains normal shell and study focus shell. |
| `src/layout/Sidebar.jsx` | Identify desktop leader navigation surface | Active nav state and brand block are centralized here. |
| `src/layout/BottomNav.jsx` | Identify mobile leader navigation surface | Active mobile state is centralized here. |
| `src/routes/Dashboard.jsx` | Identify dashboard leader route surface | Uses `PageHeader`, `DashboardTodayCard`, repeated cards, and progress summaries. |
| `src/components/learning/DashboardTodayCard.jsx` | Identify primary leader card surface | Strong candidate for restrained entrance or state transition treatment. |
| `src/routes/StudyRoom.jsx` | Identify study leader and answer feedback surfaces | Contains focus shell, progress, answer feedback, stepper, and completion summary boundary. |
| `src/components/ProgressBar.jsx` | Identify shared progress fill surface | Already exposes width-based progress fill. |
| `src/components/Button.jsx` | Identify shared press/hover ownership | Existing CSS already applies small button transforms. |
| `src/components/Card.jsx` | Identify repeated card ownership | Card shell is shared across dashboard, library, settings, and study surfaces. |
| `src/styles/global.css` | Identify existing CSS transition and reduced-motion boundaries | Existing global reduced-motion block is present. |

## Candidate UI surfaces

| Surface | Likely owner component/file | Proposed effect type | Risk rating | Reduced-motion required | Screenshots/manual evidence required | Phase 34B scope |
|---|---|---|---|---|---|---|
| Page/route entrance calm fade or slide | `src/layout/AppLayout.jsx`, `src/styles/global.css` | Short CSS-first page content opacity/translate entrance on route content mount | medium | Yes | Yes, desktop and mobile route screenshots before/after navigation | In scope only if implemented as non-blocking shell style with no route logic changes |
| Dashboard leader card emphasis | `src/components/learning/DashboardTodayCard.jsx`, `src/styles/global.css` | Subtle entrance or state emphasis for the Today Card container | low | Yes | Yes, dashboard screenshots at desktop and mobile widths | In scope for Phase 34B if CSS-only and no data/recommendation logic changes |
| Card hover/press micro-interaction | `src/components/Card.jsx`, `src/styles/global.css` | Hover elevation or translate for clickable cards only, avoiding static informational cards | medium | Yes | Yes, hover/manual observation and keyboard focus observation | Deferred unless design narrows eligible card classes to avoid repeated-card noise |
| Quiz answer feedback transition | `src/routes/StudyRoom.jsx`, `src/components/study/StudyItemRenderer.jsx`, `src/styles/global.css` | Short feedback reveal transition for answer status or study feedback region | medium | Yes | Yes, answer check, reset, flashcard reveal, and keyboard-only observations | In scope only if no scoring, scheduling, answer validation, or persistence logic changes |
| Progress/completion celebration restraint | `src/components/ProgressBar.jsx`, `src/components/study/StudyResultSummary.jsx`, `src/styles/global.css` | Progress fill transition and restrained completion accent without confetti or blocking animation | medium | Yes | Yes, in-session progress and completion summary screenshots | In scope only if CSS-first and no study history or review schedule logic changes |
| Settings/help panel transition | `src/routes/Settings.jsx`, `src/ui/helpTour.js`, `src/styles/global.css` | Small disclosure/panel transition for existing settings or help surfaces | medium | Yes | Yes, settings/help screenshots and reduced-motion observation | Deferred unless Phase 34B explicitly includes settings/help files |
| Skeleton/loading calm placeholder | `src/components/EmptyState.jsx`, `src/styles/global.css` | Static or very low-motion placeholder treatment for empty/loading-like states | low | Yes | Yes, empty library/study/dashboard state screenshots | Deferred unless design confirms exact placeholder states and copy boundary |
| Focus/keyboard-visible state polish | `src/styles/global.css`, `src/components/Button.jsx`, navigation components | Existing focus outline refinement without motion dependency | low | Yes, no animated focus required | Yes, keyboard tab screenshots/manual notes | In scope if limited to visible focus styles and no navigation behavior changes |
| Reduced-motion fallback | `src/styles/global.css` | Global and effect-specific fallback that disables or shortens motion under `prefers-reduced-motion: reduce` | low | Yes | Yes, reduced-motion browser observation for every implemented effect | In scope as a required support boundary for every Phase 34B effect |
| Mobile bottom navigation active-state polish | `src/layout/BottomNav.jsx`, `src/styles/global.css` | Subtle active indicator transition or tap feedback | low | Yes | Yes, mobile viewport screenshots and tap observation | In scope if CSS-only and no nav route list changes |
| Desktop sidebar active-state polish | `src/layout/Sidebar.jsx`, `src/styles/global.css` | Subtle active rail/brand/nav hover refinement | low | Yes | Yes, desktop navigation screenshots and keyboard observation | In scope if CSS-only and no nav route list changes |

## Recommended implementation ownership

Recommended Phase 34B ownership should stay CSS-first and small:

| Ownership area | Candidate files | Recommendation |
|---|---|---|
| Shared style boundary | `src/styles/global.css` | Primary owner for effects. Prefer class-scoped transitions and existing `prefers-reduced-motion` guard. |
| Layout/nav boundary | `src/layout/AppLayout.jsx`, `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx` | Only modify if a small class hook is required. Do not change route definitions or navigation behavior. |
| Dashboard leader boundary | `src/components/learning/DashboardTodayCard.jsx` | Only modify if a specific class hook is needed. Do not alter recommendation/data selection logic. |
| Study leader boundary | `src/routes/StudyRoom.jsx`, `src/components/study/StudyItemRenderer.jsx`, `src/components/study/StudyResultSummary.jsx` | Treat as higher risk. Do not alter scoring, scheduling, draft persistence, or completion logic. |
| Shared primitives | `src/components/Button.jsx`, `src/components/Card.jsx`, `src/components/ProgressBar.jsx` | Prefer style-only changes using existing class names. Avoid broad effects that apply to all cards unless explicitly approved. |

## Files explicitly out of scope

The following remain out of scope for Phase 34A and should remain out of scope for Phase 34B unless
a later dedicated gate changes the boundary:

- `src/storage/**`
- `src/state/v2BackupRestore.js`
- `src/state/adapterAwareBackupRestoreTestScaffold.js`
- `src/state/generatedTestRestoreRehearsalPrototype.js`
- `src/state/restoreRehearsalPlanner.js`
- `src/quiz/dataBackup.js`
- `src/storage/storageAdapterRegistry.js`
- `src/storage/StorageAdapter.js`
- `src/storage/LocalStorageAdapter.js`
- `src/storage/indexedDbDryRunHarness.js`
- `src/analytics/**`
- `src/services/**`
- `src/data/**` import/export parsing and persistence modules
- `src/routes/routeConfig.js`
- `src/routes/Library.jsx`
- `src/routes/Settings.jsx` unless the final Phase 34A design explicitly includes settings/help effects
- `tests/**`
- `e2e/**`
- package files
- release notes files

## Risk notes

- Route entrance effects can create perceived latency if they delay content visibility. Phase 34B must not block interaction while an effect runs.
- Broad card hover effects can create noisy motion across dense dashboard and library views. Phase 34B should scope any card effect to explicit leader surfaces or interactive cards.
- Study Room effects are more sensitive than dashboard/nav effects because they sit near answer feedback, scoring perception, draft persistence, and schedule updates. Any Phase 34B work there must be visual-only.
- Progress/completion effects must remain restrained. No confetti, audio, vibration, forced delay, blocking overlay, or celebratory claim that implies improved learning outcomes.
- Reduced-motion support is required for every motion effect. The existing global reduced-motion block is a useful boundary, but Phase 34B must verify each new effect is covered.
- No effect may write storage, trigger network calls, add telemetry, or change backup/export/restore behavior.
- Phase 34A does not implement Leader UI effects and does not approve Phase 34B automatically.

## Evidence recommendations

Phase 34B should collect manual evidence for each implemented surface:

| Evidence item | Required observation |
|---|---|
| Desktop screenshots | Dashboard, sidebar, study room, and any implemented leader effect at a desktop viewport. |
| Mobile screenshots | Bottom nav, dashboard, and study room at a mobile viewport. |
| Reduced-motion observation | Browser or CSS emulation showing effects disabled or reduced under `prefers-reduced-motion: reduce`. |
| Keyboard observation | Visible focus state remains clear and no keyboard trap is introduced. |
| Interaction observation | Study Room answer check, reset, next/previous, completion, and restart remain immediate. |
| Regression checks | `npm run build`, `npm run test:unit`, and the active Phase 34B validator if one exists. |
| Rollback check | Confirm removal is limited to effect class/style/module changes and does not require data cleanup. |

## Phase 34B candidate file ownership

Recommended candidate ownership for Phase 34B, subject to the final Phase 34A design gate decision:

| Phase 34B candidate | Candidate files | Scope status |
|---|---|---|
| CSS-first shared effect layer | `src/styles/global.css` | In scope if reduced-motion and rollback boundaries are defined. |
| Navigation active/press polish | `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx`, `src/styles/global.css` | In scope if CSS-only or class-hook-only. |
| Dashboard Today Card leader emphasis | `src/components/learning/DashboardTodayCard.jsx`, `src/styles/global.css` | In scope if no data logic changes. |
| Study Room feedback transition | `src/routes/StudyRoom.jsx`, `src/components/study/StudyItemRenderer.jsx`, `src/styles/global.css` | Conditional; requires explicit no-scoring/no-persistence/no-scheduling constraint. |
| Progress fill/completion restraint | `src/components/ProgressBar.jsx`, `src/components/study/StudyResultSummary.jsx`, `src/styles/global.css` | Conditional; visual-only and reduced-motion required. |
| Settings/help transition | `src/routes/Settings.jsx`, `src/ui/helpTour.js`, `src/styles/global.css` | Deferred unless specifically authorized. |
| Skeleton/loading placeholder | `src/components/EmptyState.jsx`, `src/styles/global.css` | Deferred unless exact states are specified. |

Phase 34B is a separate implementation gate and is not automatically approved.
Phase 34A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 34A confirms GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS remains controlled-limited-beta-only.
Phase 34A does not approve BETA_READY.
Phase 34A does not approve public production readiness.
Phase 34A does not approve guaranteed data-loss prevention.
Phase 34A does not approve restore execution.
Phase 34A does not approve production restore rehearsal.
Phase 34A does not approve real learner data restore rehearsal.
Phase 34A does not approve runtime backup/export/restore behavior changes.
Phase 34A does not approve backup file format changes.
Phase 34A does not approve restore overwrite behavior changes.
Phase 34A does not approve storage migration.
Phase 34A does not approve sync/cloud/account/auth/backend.
Phase 34A does not approve telemetry/analytics.
Phase 34A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 34A does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 34A does not approve limited settings visibility to ordinary users.
Phase 34A does not implement Leader UI effects.
