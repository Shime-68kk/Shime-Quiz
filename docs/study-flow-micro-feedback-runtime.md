# Phase 12I — Study Flow Micro-feedback Runtime

## Purpose

Phase 12I implements a narrow Study Flow runtime UX improvement based on the Phase 12H Study Flow Micro-feedback Plan.

This phase adds lightweight, non-blocking feedback and recovers session action controls so learners can complete, restart, continue, or leave a Study Room session without relying on the browser Back button.

## Baseline

The baseline is completed/merged through Phase 12H. Phase 12H documented feedback principles, Vietnamese-friendly copy guidance, accessibility/reduced-motion requirements, algorithm/data boundaries, testing/evidence expectations, non-goals, allowed claims, and forbidden claims.

The app remains local-first and browser-local. Manual backup/export/import remains the portability model. No backend, account system, or cloud sync is introduced.

## Runtime changes

Phase 12I changes only the Study Room session UX surface:

- Replaces native `window.confirm` prompts for session completion/restart with inline confirmation UI.
- Adds visible micro-feedback after answer updates, answer checks, flashcard reveal/reset, session restart, session continuation, and session completion.
- Keeps session completion available when unanswered items remain, but requires an inline explicit confirmation.
- Adds a direct “Về tổng quan” action in the Study Result Summary.
- Keeps “Quay về thư viện” available after a completed session.

These changes are intended to recover the reported Vercel UX issue where “Hoàn thành phiên học” or “Làm lại phiên học” could appear unresponsive when native dialogs were blocked or not surfaced by the browser environment.

## Feedback principles implemented

The implemented feedback follows Phase 12H principles:

- immediate but non-disruptive feedback
- calm Vietnamese copy
- no shame/punitive language
- no sound effects
- no added animation dependency
- visible text feedback through `role="status"` / `aria-live="polite"`
- no reliance on color alone
- session actions remain explicit and reversible before destructive draft reset

## Session action recovery

Phase 12I specifically ensures:

- “Hoàn thành phiên học” no longer depends on a native `window.confirm` dialog when unanswered items remain.
- “Làm lại phiên học” no longer depends on a native `window.confirm` dialog.
- Result summary actions expose “Làm lại phiên học”, “Tiếp tục học”, “Quay về thư viện”, and “Về tổng quan”.
- The user can leave the result screen through app navigation instead of browser Back.

## Algorithm and data boundaries

Phase 12I does not change:

- answer correctness logic
- scoring
- SRT/review scheduling algorithms
- mastery/progress calculations
- recommendation/selection algorithms
- persisted data shape
- storage schema
- backup format
- import/restore behavior
- package dependencies

The added answer-state checks are display-only micro-feedback and do not feed scoring, SRT, mastery, recommendation, storage, or backup logic.

## Testing and validation expectations

Expected validation:

- `npm run build`
- `npm run test:unit`
- `node scripts/validate-study-flow-micro-feedback-runtime.js`
- full static validator chain
- E2E smoke/onboarding when Playwright Chromium is available

Manual runtime smoke expectations:

- start Study Room
- answer/check an item and see visible micro-feedback
- click “Hoàn thành phiên học” with incomplete items and see inline confirmation
- confirm completion and see result summary
- click “Làm lại phiên học” and see inline confirmation instead of a native browser dialog
- click “Quay về thư viện” from summary and navigate to Library
- click “Về tổng quan” from summary and navigate to Dashboard

## Non-goals

Phase 12I does not:

- implement new scoring behavior
- implement FSRS
- implement IndexedDB
- add sound effects
- add badges/achievements
- add streak algorithm changes
- add package dependencies
- change package version
- change backup format
- change storage schema
- implement cloud/account sync
- create a release package
- create a release tag
- publish a GitHub Release

## Allowed claims after Phase 12I

If accepted, safe claims are:

- Study Flow micro-feedback runtime exists.
- Study Room session action recovery exists.
- “Hoàn thành phiên học” and “Làm lại phiên học” use inline confirmation instead of native browser dialogs.
- Result summary includes direct Library and Dashboard navigation actions.
- Accessibility-friendly visible status feedback is present.
- No answer correctness/scoring/SRT/mastery/recommendation algorithms changed.
- No package/dependency changes were made.

## Forbidden claims after Phase 12I

Do not claim:

- scoring changed
- SRT changed
- mastery changed
- recommendation algorithm changed
- learning outcomes or retention improved
- sound effects implemented
- badges/achievements implemented
- FSRS implemented
- IndexedDB implemented
- cloud/account sync implemented
- release package created
- release tag created
- GitHub Release published

## Recommended next phase

Recommended next phase: Phase 12J — Phase 12 Closure / Release Decision.
