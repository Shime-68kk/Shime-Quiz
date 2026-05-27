# Phase 37-uiI — Hybrid Sliding Navigation Evidence Review and Premium Elastic Tap Compression Scope Gate
## Status tokens
PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_STATUS: COMPLETED_HYBRID_NAV_EVIDENCE_REVIEW_AND_ELASTIC_TAP_SCOPE_GATE
PHASE37UII_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_IMPLEMENTATION
PHASE37UII_REVIEW_SCOPE: HYBRID_NAV_EVIDENCE_REVIEW_AND_ELASTIC_TAP_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UII_SELECTED_CANDIDATE: PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT
PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Scope
Phase 37-uiI is docs/review/research/release/planning/static-validator/CI-only. It reviews Phase 37-uiH evidence and gates the next visual pilot without runtime behavior changes.
## Inputs from Phase 37-uiH and UI plan
Inputs are Phase 37-uiH evidence, release summary, unit coverage, validator guardrails, workflow registration, and the UI plan priority that keeps Elastic Button Compression as Priority 1 with a 34/35 score.
## UI leadership direction
The next UI step should improve visible product quality while staying calm, premium, Vietnamese-first, learner-owned, and non-casino-like. The sequence remains scope gate, small runtime pilot, evidence review.
## Review method
Review checked Phase 37-uiH claims against the allowed files, navigation boundaries, static validator, workflow gate, E2E expectations, and release-readiness separation. No runtime implementation is included in Phase 37-uiI.
## Phase 37-uiH evidence review table
| Evidence row | Review result |
| --- | --- |
| Sidebar scoped host class | Accepted: `phase37uih-hybrid-sliding-navigation-indicator-pilot--desktop` scopes the desktop host. |
| Sidebar active-pill vertical movement | Accepted: desktop movement is tied to `--phase37uih-active-index` and the existing item step. |
| BottomNav scoped host class | Accepted: `phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile` scopes the mobile host. |
| BottomNav active-pill horizontal movement | Accepted: mobile movement is tied to `--phase37uih-active-index` without route mutation. |
| active text/icon readability | Accepted with carry-forward browser review: active icon/text color remains specifically documented. |
| focus-visible | Accepted: existing Sidebar and BottomNav focus-visible rules remain in scope. |
| reduced-motion | Accepted: reduced-motion disables transform transitions for the pilot indicator. |
| mobile safe-area preservation | Accepted: Phase 36B safe-area variable remains preserved. |
| 375px no-overflow | Accepted with carry-forward device review: 375px sizing path is retained. |
| desktop navigation layout | Accepted: desktop Sidebar layout remains unchanged beyond active indicator visuals. |
| route definitions unchanged | Accepted: route definitions are outside the Phase 37-uiH changed files. |
| router config unchanged | Accepted: router config is outside the Phase 37-uiH changed files. |
| NavLink destinations unchanged | Accepted: `to={item.path}` remains the navigation destination source. |
| click handlers unchanged | Accepted: no new navigation click handlers were introduced. |
| active page rendering unchanged | Accepted: active rendering still follows existing React Router behavior. |
| package/dependency files unchanged | Accepted: package files were outside the Phase 37-uiH diff. |
| storage/import/parser/scheduler boundaries | Accepted: those areas remained outside the pilot. |
| E2E smoke | Accepted as required validation coverage for unchanged navigation behavior. |
| E2E onboarding | Accepted as required validation coverage for unchanged onboarding behavior. |
| Phase 37C separation | Accepted: limited release readiness gap review remains separate. |
| no readiness upgrade | Accepted: LIMITED_BETA_CANDIDATE remains the highest approved status. |
## Desktop Sidebar sliding indicator review
Desktop Sidebar evidence supports a passive active-pill visual improvement only. It does not change route order, destinations, handlers, or page rendering.
## Mobile BottomNav sliding indicator review
Mobile BottomNav evidence supports a scoped horizontal active-pill indicator while preserving bottom navigation safe-area behavior and the prior mobile touch pilot boundary.
## Route, NavLink, click-handler, and page rendering preservation review
Route definitions unchanged, router config unchanged, NavLink destinations unchanged, click handlers unchanged, and active page rendering unchanged are accepted as core Phase 37-uiH preservation claims.
## Active readability and contrast review
The active indicator uses a cream/moss treatment intended to improve active readability. Phase 37-uiJ must keep contrast review explicit for any pressed-state visual token.
## Focus-visible review
Focus-visible evidence is accepted because the active indicator is passive and existing focus-visible selectors remain documented.
## Reduced-motion review
Reduced-motion evidence is accepted. The next pilot must also avoid transform scale when reduced motion is requested.
## Mobile 375px and safe-area review
375px no-overflow and safe-area preservation are accepted with continued browser/device review required in later runtime pilots.
## Desktop layout review
Desktop navigation layout remains accepted because the pilot did not change navigation structure or destination behavior.
## E2E smoke and onboarding review
E2E smoke and E2E onboarding remain required validation for handoff. The evidence review does not replace runtime route testing.
## Phase 37C release-readiness separation review
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiI does not approve any release-readiness upgrade.
## Streak Fire / chain-effect plan note
Streak Fire Ignition remains a later chain/streak effect candidate. It is not implemented here and requires a separate later scope gate because it touches daily completion motivation/status.
## Premium Elastic Tap risk review
Premium Elastic Tap Compression Token Pilot is viable only if scoped to visual press feedback on bounded existing action components. Risks are handler mutation, disabled behavior drift, form submit changes, layout shift, text scaling, overactive motion, and accidental localStorage or dependency additions.
## Next visual candidate comparison table
| Candidate | Phase 37-uiI decision |
| --- | --- |
| Premium Elastic Tap Compression Token Pilot | Selected as the next scoped runtime pilot candidate. |
| Streak Fire Ignition Scope Gate | Deferred to a later separate scope gate. |
| Collapsible Avatar Header Scope Gate | Deferred because it touches broader layout/navigation hierarchy. |
| Navigation Visual Backlog Review | Not selected; Phase 37-uiH evidence is sufficient to move to a different tactile pilot. |
| Dashboard Progress Motion Pilot | Deferred behind the higher-priority tactile token pilot. |
| Study Room Visual Backlog Review | Deferred because recent Study Room work already completed evidence review. |
| Full Dynamic Canvas Themes | Not approved. |
| Full Theme Picker | Not approved. |
| Return To Phase 37C Gap Review First | Not selected; Phase 37C remains separate and not replaced. |
## Selected candidate
PHASE37UII_SELECTED_CANDIDATE: PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT
## Why Premium Elastic Tap Compression Token Pilot next
It is the highest-scoring UI plan candidate, can add premium tactile polish without changing layout, and can be bounded to existing action surfaces with no dependency or handler changes.
## Why this is a scope gate, not runtime implementation
Phase 37-uiI only prepares evidence review and implementation seed material. It does not edit runtime source, CSS source, tests, routes, buttons, forms, data logic, or package files.
## Phase 37-uiJ allowed files / expected areas
Phase 37-uiJ may proceed only as a small runtime pilot if it is scoped to existing action components and their styling/tests/evidence. Exact files must be set by the Phase 37-uiJ task before implementation.
## Phase 37-uiJ forbidden areas
Phase 37-uiJ must preserve action handlers, form submit handlers, button types, disabled states, route behavior, storage/import/parser/scheduler/data behavior, package files, and localStorage.
## Evidence requirements for Phase 37-uiJ
Evidence must show bounded targets, no disabled-control effect, no layout shift, no direct text scaling, preserved handlers, preserved form submission, preserved button types, preserved routes, reduced-motion fallback using opacity/shadow only, mobile and desktop review, E2E smoke, E2E onboarding, and rollback notes.
## Rollback / hold plan
Hold Phase 37-uiJ if the pilot requires package additions, handler changes, form changes, disabled behavior changes, localStorage, layout movement, or broad component rewrites.
## Chosen review decision
PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_IMPLEMENTATION
## Decision rationale
Phase 37-uiH evidence is sufficient for a pass to the next visual scope. Premium Elastic Tap has the best value-to-risk fit if constrained to tokenized visual feedback.
## What Phase 37-uiI supports
Phase 37-uiI supports completed hybrid navigation evidence review, the Premium Elastic Tap Compression Token Pilot scope gate, exact changed-file allowlist validation, no generated artifacts, no active historical validator chain, and validator support for pr-diff, post-merge-main, and validator-hotfix.
## What Phase 37-uiI does not approve
Phase 37-uiI does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiI, broad UI redesign, broad interaction rewrite, route behavior changes, event handler changes, button handler changes, form submission changes, disabled state behavior changes, package/dependency changes, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, Study Room scoring/correctness/scheduler/queue/data changes, sync/cloud/account/auth/backend, telemetry/network calls, full Dynamic Canvas Themes, full theme picker, persisted preferences, localStorage writes, Streak Fire implementation, Collapsible Header implementation, or replacement of Phase 37C.
## Next recommended phase
Next recommended phase: Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot.
