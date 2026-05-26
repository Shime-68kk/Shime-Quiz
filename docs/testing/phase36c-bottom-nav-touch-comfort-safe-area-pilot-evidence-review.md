# Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review

## Status tokens
PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW

PHASE36C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE36D_MOBILE_TOUCH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW

PHASE36C_REVIEW_SCOPE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_SCOPE_STATUS: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_REVIEWED_AND_CARRIED_FORWARD

PHASE36D_MOBILE_TOUCH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope
Phase 36C reviews the merged Phase 36B Bottom Navigation Touch Comfort and Safe-Area Pilot evidence only.

No runtime source, CSS, route/navigation, test source, package, data, storage, scheduler, import, sync, backend, auth, telemetry, or Study Room answer logic behavior is changed by this phase.

## Inputs from Phase 36B
Phase 36B changed `src/layout/BottomNav.jsx`, `src/styles/global.css`, `tests/unit/bottomNavTouchComfortSafeAreaPilot.test.jsx`, Phase 36B evidence/release/planning docs, the Phase 36B validator, and `.github/workflows/e2e-smoke.yml`.

Phase 36B recorded 375px Playwright Chromium evidence, touch target measurements, safe-area fallback evidence, focus-visible evidence, reduced-motion evidence, desktop/sidebar non-impact evidence, and smoke/onboarding E2E results.

## Review method
Phase 36C reviewed the merged Phase 36B evidence documents, validator expectations, and workflow registration from clean `origin/main` after the Phase 36B merge.

The review checks whether Phase 36B evidence is sufficient to carry the pilot forward to a scope/backlog review, not whether broader mobile runtime work should start automatically.

## Bottom Navigation evidence review table
Review surface | Phase 36B evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim
--- | --- | --- | --- | --- | --- | ---
375px mobile no horizontal overflow | Playwright Chromium 375x812 reported document horizontal overflow `0`, bottom nav `x: 8`, `width: 359`, `height: 74`, `bottom: 798`. | Evidence supports no horizontal overflow for the tested Chromium viewport. | Does not prove every device/browser density or OS chrome variant. | Supports pass to Phase 36D scope/backlog review. | Phase 36B pilot had 375px Chromium no-horizontal-overflow evidence. | Broad mobile layout validation is approved.
bottom nav touch target comfort | Four bottom nav item rects were reported as `83x52`; scoped CSS minimum height was `52px`. | Evidence supports improved item height on the tested mobile viewport. | Does not prove all physical-device touch ergonomics. | Supports pass to Phase 36D scope/backlog review. | BottomNav touch comfort was improved in a scoped pilot. | App-wide touch target comfort is approved.
safe-area fallback path | CSS uses `--phase36b-bottom-nav-safe-area: var(--bottom-nav-safe-area, 0px)` and fallback evidence reported `navBottom: 14px`, `navPaddingBottom: 10px`. | Evidence supports the fallback path on Chromium. | Physical safe-area inset devices were not validated. | Supports pass with limitation carried forward. | Safe-area fallback behavior was reviewed. | Completion of physical-device safe-area validation.
physical device safe-area limitation | Phase 36B risk notes identify reliance on `env(safe-area-inset-bottom, 0px)` and fallback behavior. | Limitation is explicit and must remain open. | Real-device notch/home-indicator validation remains unproven. | Requires Phase 36D to carry the limitation forward. | Physical-device safe-area limitation is carried forward. | Physical-device safe-area validation is claimed.
active route indicator correctness | At `/dashboard`, active text was `Tổng quan`; after tapping Library, active text moved to `Thư viện`. | Evidence supports active indicator correctness for tested routes. | Does not prove every route and redirect state. | Supports pass to Phase 36D scope/backlog review. | Active-route indicator behavior was preserved for reviewed cases. | Active-route logic was changed or broadly revalidated.
tap Library reaches `/library` | Tapping the mobile bottom nav Library link reached `/library` and rendered `Thư viện học liệu`. | Evidence supports tap navigation for the reviewed Library path. | Does not prove every route transition or browser history path. | Supports pass to Phase 36D scope/backlog review. | Library tap navigation was verified. | Route behavior changes are approved.
`NavLink` destinations unchanged | Phase 36B documented `to={item.path}` and route definitions were not changed. | Preservation evidence is sufficient for this review. | Static preservation is not a broad navigation redesign review. | Supports pass to Phase 36D scope/backlog review. | `NavLink` destinations were preserved. | `NavLink` destinations were changed.
no click handler changes | Phase 36B documented no added click handler and the validator rejected `onClick=` or `navigate(` in BottomNav. | Preservation evidence is sufficient for this review. | Does not review unrelated click behavior outside BottomNav. | Supports pass to Phase 36D scope/backlog review. | BottomNav click handlers were preserved. | Click handler changes are approved.
active-route logic unchanged | Phase 36B documented `navRoutes.findIndex(item => item.path === location.pathname)`. | Preservation evidence is sufficient for this review. | Does not prove future nested route handling. | Supports pass to Phase 36D scope/backlog review. | Active-route logic was preserved. | Active-route logic was changed.
page rendering outside BottomNav unchanged | Phase 36B documented no page rendering changes outside BottomNav. | Preservation evidence is sufficient for this review. | Does not review unrelated future rendering changes. | Supports pass to Phase 36D scope/backlog review. | Page rendering outside BottomNav was not changed. | Page rendering changes outside BottomNav are approved.
focus-visible behavior | Keyboard tabbing reported focused element `A.bottomNav__item` with solid `3px` outline. | Evidence supports focus-visible preservation in the tested viewport. | Does not replace a full accessibility audit. | Supports pass to Phase 36D scope/backlog review. | Focus-visible behavior was reviewed for BottomNav. | Full accessibility readiness is approved.
reduced-motion behavior | Reduced-motion Chromium reported indicator transition duration effectively disabled (`1e-05s`). | Evidence supports reduced-motion coverage for reviewed BottomNav transitions. | Does not prove all animation surfaces. | Supports pass to Phase 36D scope/backlog review. | BottomNav reduced-motion behavior was reviewed. | App-wide reduced-motion validation is approved.
desktop bottom nav hidden | Desktop 1200x800 reported bottom nav `display: none`. | Evidence supports no visible desktop bottom nav impact in the tested viewport. | Does not prove all desktop breakpoints. | Supports pass to Phase 36D scope/backlog review. | Desktop bottom nav remained hidden in reviewed evidence. | Broad desktop UI validation is approved.
desktop sidebar non-impact | Desktop 1200x800 reported sidebar `display: block` and no Phase 36B pilot class on the sidebar. | Evidence supports sidebar non-impact for the tested viewport. | Does not prove unrelated sidebar future behavior. | Supports pass to Phase 36D scope/backlog review. | Sidebar was not changed by the pilot. | Sidebar behavior changes are approved.
E2E smoke | `npm run test:e2e:smoke` passed 7 tests in Phase 36B. | Evidence supports no smoke regression at that point. | Does not prove broad production flows. | Supports pass to Phase 36D scope/backlog review. | Smoke E2E passed for the Phase 36B handoff. | Broad validation or stress-tested readiness is approved.
E2E onboarding | `npm run test:e2e:onboarding` passed 3 tests in Phase 36B. | Evidence supports no onboarding smoke regression at that point. | Does not prove all onboarding variants. | Supports pass to Phase 36D scope/backlog review. | Onboarding E2E passed for the Phase 36B handoff. | Broad onboarding validation is approved.
package/dependency unchanged | Phase 36B documented no package or dependency changes. | Preservation evidence is sufficient for this review. | Does not approve future package changes. | Supports pass to Phase 36D scope/backlog review. | Package/dependency files remained unchanged. | Package/dependency changes are approved.
storage/data/scheduler/import/sync/backend/auth/telemetry unchanged | Phase 36B documented no changes to those systems. | Preservation evidence is sufficient for this review. | Does not approve future system behavior changes. | Supports pass to Phase 36D scope/backlog review. | These systems were not changed by the pilot. | Storage, data, scheduler, import, sync, backend, auth, or telemetry changes are approved.
validator post-merge safety | Phase 36C validator is required to support `pr-diff`, `post-merge-main`, and `validator-hotfix`. | New validator implements the three modes from initial implementation. | Depends on `origin/main` ref availability in CI checkout. | Supports pass to Phase 36D scope/backlog review. | Phase 36C validator is post-merge-main-safe by design. | Historical validator chain should block Phase 36C.
Phase 36D follow-up scope/backlog review seed | New Phase 36D seed is prepared with review options and non-goals. | Seed supports a review/scope gate only. | Does not select or implement a runtime candidate. | Supports pass to Phase 36D scope/backlog review. | Phase 36D seed is prepared. | Phase 36D runtime implementation is approved by default.

## 375px mobile no-overflow review
The merged Phase 36B evidence supports the claim that the scoped BottomNav pilot avoided horizontal overflow at a 375x812 Chromium viewport.

The allowed claim is limited to the reviewed evidence. Phase 36C does not approve broad mobile validation or stress-tested readiness.

## Touch target comfort review
The merged Phase 36B evidence supports the claim that four bottom nav items measured `83x52` in the reviewed mobile viewport and that the scoped CSS used a `52px` minimum height.

The allowed claim is limited to BottomNav. Phase 36C does not approve app-wide touch comfort changes.

## Safe-area behavior and fallback review
The merged Phase 36B evidence supports the safe-area fallback path through `var(--bottom-nav-safe-area, 0px)` and Chromium fallback measurements.

Physical-device safe-area validation remains unproven and is carried forward as a limitation.

## Active route indicator review
The merged Phase 36B evidence supports active indicator behavior at `/dashboard` and after tapping Library to reach `/library`.

Phase 36C does not claim active-route logic changes.

## Tap navigation review
The merged Phase 36B evidence supports that tapping Library in the mobile BottomNav reached `/library` and rendered the expected Library heading.

Phase 36C does not approve route behavior changes.

## Route and navigation preservation review
The merged Phase 36B evidence supports preservation of route definitions, `NavLink` destinations, click handlers, active-route logic, and page rendering outside BottomNav.

Phase 36C does not approve `NavLink` destination changes, click handler changes, active-route logic changes, or page rendering changes outside BottomNav.

## Accessibility and focus-visible review
The merged Phase 36B evidence supports focus-visible preservation for a keyboard-focused BottomNav item in the reviewed mobile viewport.

This is not a full accessibility audit.

## Reduced-motion review
The merged Phase 36B evidence supports reduced-motion coverage for BottomNav item and indicator transitions.

This is not an app-wide reduced-motion validation.

## Desktop and sidebar non-impact review
The merged Phase 36B evidence supports that the BottomNav remained hidden and the sidebar remained visible at the reviewed desktop viewport.

The desktop Sidebar runtime file was not changed by Phase 36B.

## E2E smoke and onboarding review
The merged Phase 36B handoff recorded `npm run test:e2e:smoke` passing 7 tests and `npm run test:e2e:onboarding` passing 3 tests.

Phase 36C re-runs the required validation commands before handoff.

## Forbidden system change review
Phase 36C does not change runtime source, test source, E2E specs, package/dependency files, storage, backup, restore, import, parser, database, scheduler, FSRS, sync, backend, auth, telemetry, route/navigation implementation, Study Room answer logic, or data model files.

## Validator post-merge safety review
The Phase 36C validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix` from initial implementation.

`pr-diff` mode requires the exact Phase 36C allowed changed files and rejects forbidden files. `post-merge-main` mode allows the validator to pass after merge when the required files exist and content checks pass even when the diff is empty. `validator-hotfix` mode allows only `scripts/validate-phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review.js` to change while keeping content and claim checks active.

## Claim guardrail review
Next recommended phase: Phase 36D — Mobile Touch Follow-up Scope or Backlog Review

Phase 36D is a review/scope gate and is not automatic runtime implementation.

Phase 36C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 36C does not approve BETA_READY.

Phase 36C does not approve public production readiness.

Phase 36C does not approve broad validation or stress-tested readiness.

Phase 36C does not approve guaranteed data-loss prevention.

Phase 36C does not approve storage/backup/restore behavior changes.

Phase 36C does not approve sync/cloud/account/auth/backend.

Phase 36C does not approve telemetry/network calls.

Phase 36C does not approve built-in AI/OCR/API-key/BYOK behavior.

Phase 36C does not approve route behavior changes.

Phase 36C does not approve NavLink destination changes.

Phase 36C does not approve click handler changes.

Phase 36C does not approve active-route logic changes.

Phase 36C does not approve page rendering changes outside BottomNav.

Phase 36C does not approve package/dependency changes.

Phase 36C does not approve Study Room correctness/scoring/scheduler/queue/data changes.

Phase 36C does not approve Dynamic Canvas Themes implementation.

Phase 36C does not approve Streak Fire.

Phase 36C does not approve Collapsible Header.

Phase 36C does not approve broad UI redesign.

Phase 36C does not approve broader mobile runtime changes.

Phase 36C does not claim physical-device safe-area validation.

## Risks and follow-up
Physical-device safe-area behavior remains the main limitation because Phase 36B evidence used Chromium fallback measurements, not a physical safe-area device.

Phase 36D should decide whether to hold further mobile work, request a small BottomNav evidence/fix follow-up, or select exactly one small mobile/touch candidate.

## Chosen review decision
PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE36D_MOBILE_TOUCH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW

## Decision rationale
Phase 36B evidence is sufficient to carry the scoped BottomNav pilot forward to a review/scope gate, with physical-device safe-area validation explicitly not claimed.

No runtime changes are needed in Phase 36C.

## What Phase 36C supports
Phase 36C supports carrying the merged Bottom Navigation Touch Comfort and Safe-Area Pilot evidence forward to Phase 36D.

## What Phase 36C does not approve
Phase 36C does not approve runtime implementation, broad UI redesign, broader mobile runtime changes, route/navigation changes, data/system changes, production readiness, or `BETA_READY`.

## Next recommended phase
Phase 36D — Mobile Touch Follow-up Scope or Backlog Review.
