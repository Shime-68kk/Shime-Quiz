# Phase 12H — Study Flow Micro-feedback Plan

## 1. Purpose

Phase 12H documents a future Study Flow micro-feedback plan for Shime Quiz. The goal is to prepare a narrow future Study Room UX improvement that makes answer feedback feel clearer, calmer, and more responsive while preserving learning correctness.

Phase 12H is docs/static-validator/CI-only. Phase 12H does not implement runtime feedback changes. Phase 12H does not change answer correctness/scoring/SRT/mastery/recommendation behavior. Answer correctness logic is not changed by Phase 12H. Scoring/SRT/mastery/recommendation algorithms are not changed by Phase 12H. Runtime app behavior is not changed by Phase 12H. Package dependencies are not changed by Phase 12H. Phase 12H prepares a future Phase 12I runtime implementation.

## 2. Baseline

The project is completed/merged through Phase 12G. Phase 12G added the Vitest unit test foundation, `npm run test:unit`, and initial deterministic unit tests. The current app remains local-first/browser-local. Manual backup/export/import remains the portability model. There is no backend/cloud/account sync.

## 3. Problem statement

Study Room feedback should help learners understand what happened after each answer without changing how answers are judged. Learning feedback should be clear and motivating. Correct/incorrect feedback should be understandable without changing scoring. The app should avoid overwhelming or distracting the learner. Micro-feedback should support focus, not gamify aggressively. Accessibility and reduced-motion support are important.

This is a planning assumption and UX risk statement only. Phase 12H does not claim formal user research, quantified retention improvement, or implemented runtime feedback.

## 4. Feedback principles

Future Phase 12I feedback should follow these principles:

- feedback must be immediate but non-disruptive
- correct/incorrect feedback must not alter correctness logic
- copy should be calm and learner-friendly
- no shame/punitive language
- no exaggerated success claims
- no sound by default
- motion should respect prefers-reduced-motion
- feedback should not block navigation or answer flow
- feedback should be understandable without relying only on color

## 5. Planned micro-feedback surfaces

Possible future Study Flow micro-feedback surfaces include:

- answer submitted feedback
- correct answer confirmation
- incorrect answer explanation/encouragement
- short session progress cue
- completion encouragement
- retry/continue prompt
- optional subtle visual state

Exact implementation depends on the current Study Room structure and must be confirmed in Phase 12I. These surfaces are planned only and are not implemented by Phase 12H.

## 6. Copy guidance

Vietnamese-friendly copy examples for future Phase 12I include:

- "Đúng rồi — tiếp tục nhé."
- "Chưa đúng — xem lại đáp án rồi thử câu tiếp theo."
- "Bạn đang làm tốt. Học thêm vài câu nữa nhé."
- "Hoàn thành phiên học ngắn."

These examples are guidance only. They are not implemented by Phase 12H.

## 7. Accessibility and reduced-motion requirements

Future runtime work should consider:

- visible text feedback
- ARIA/live region consideration if appropriate
- keyboard flow preserved
- focus not stolen unexpectedly
- no required hover interaction
- non-color-only feedback
- prefers-reduced-motion respected
- no flashing/high-frequency animation
- sufficient contrast
- mobile-friendly layout

## 8. Algorithm and data boundaries

This section defines the algorithm boundaries for Phase 12I.

Future Phase 12I must not change:

- answer correctness logic
- scoring
- SRT/review scheduling
- mastery/progress calculation
- recommendation/selection algorithms
- persisted data shape
- storage schema
- backup format
- import/restore behavior

## 9. Testing/evidence requirements for Phase 12I

Future Phase 12I runtime work should provide evidence for:

- npm ci or approved GitHub Actions dependency-install workflow
- npm run build
- npm run test:unit
- target validator
- full static validator chain
- E2E smoke/onboarding pass or environment-blocked classification
- manual Study Room render check
- manual correct/incorrect answer flow check
- keyboard navigation check
- reduced-motion check if feasible
- no scoring/SRT/mastery regression
- no backup/storage regression

## 10. Non-goals for Phase 12H

Phase 12H does not:

- implement runtime micro-feedback
- change Study Room behavior
- change answer correctness logic
- change scoring/SRT/mastery/recommendation algorithms
- add animations
- add sound effects
- add badges/achievements
- add streak algorithm changes
- add tests
- add dependencies
- change package version
- change storage schema
- change backup format
- implement FSRS
- implement IndexedDB
- create release package
- create release tag
- publish GitHub Release

## 11. Allowed claims after Phase 12H

Allowed claims:

- Study Flow Micro-feedback Plan exists.
- Future feedback principles are documented.
- Accessibility/reduced-motion requirements are documented.
- Algorithm/scoring boundaries for future Study Flow feedback are documented.
- Phase 12I runtime work is planned next.
- No Study Room runtime behavior changed by Phase 12H.

## 12. Forbidden claims after Phase 12H

Forbidden claims:

- Study Flow micro-feedback implemented
- correct/incorrect feedback changed
- Study Room runtime changed
- scoring changed
- SRT changed
- mastery changed
- recommendation algorithm changed
- animations implemented
- sound effects implemented
- badges/achievements implemented
- retention improved
- package dependencies changed
- release package created
- release tag created
- GitHub Release published

## 13. Recommended next phase

Recommended next phase: Phase 12I — Study Flow Micro-feedback Runtime.

Phase 12I should be a narrow runtime UX phase that implements the planned feedback without changing correctness, scoring/SRT/mastery/recommendation, storage schema, backup format, package dependencies, or product claims.
