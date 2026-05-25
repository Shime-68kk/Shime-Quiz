# Phase 34A — Leader UI Effects Design Spec

## Status tokens

```text
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_STATUS: COMPLETED_UI_EFFECTS_DESIGN_GATE
PHASE34A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE34A_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_DECISION: PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION
PHASE34A_DESIGN_SCOPE: DESIGN_GATE_AND_TARGET_AUDIT_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE34A_EFFECTS_BOUNDARY_STATUS: PERFORMANCE_ACCESSIBILITY_ROLLBACK_BOUNDARIES_DEFINED
PHASE34A_LIMITATION_CARRYFORWARD_STATUS: ALL_10_LIMITATIONS_CARRIED_FORWARD_UNRESOLVED
PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_SEED_STATUS: PREPARED_PLANNING_SEED
```

This design spec is a design-only output of Phase 34A.
No runtime implementation. No source changes. No unit test changes. No e2e changes.
No storage writes. No sync/cloud/backend. No telemetry. No restore behavior changes.
No production-visible UI changes in Phase 34A itself.

This document is for internal review only. Not for public use.

## Scope

Phase 34A is the Leader UI Effects Design Gate. It defines the design boundaries, effect
inventory, performance budget, accessibility requirements, rollback plan, and implementation
scope boundaries for Leader UI visual effects to be implemented in Phase 34B and beyond.

Leader UI effects are visual CSS/animation enhancements to the primary study session
interface. They do not change data behavior, storage behavior, scheduling logic, or
any runtime non-visual behavior.

Phase 34A does not implement any effect. Implementation is deferred to Phase 34B,
subject to the design boundaries defined here.

## Design method

Phase 34A reviews the effect inventory, ownership model, candidate implementation
surfaces, performance budget, accessibility and reduced-motion rules, screenshot/manual
evidence plan, rollback/removal plan, and claim boundaries before issuing a design gate
decision. This method is static and documentation-only; it does not execute or implement
Leader UI effects.

## Inputs from Phase 33F

```text
PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_STATUS: COMPLETED_FINAL_GO_NO_GO
PHASE33F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_DECISION: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS
PHASE33F_GO_NO_GO_SCOPE: CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE33F_LIMITATION_STATUS: LIMITATIONS_ACCEPTED_FOR_CONTROLLED_LIMITED_BETA_ONLY
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
```

Highest approved readiness entering Phase 34A: `LIMITED_BETA_CANDIDATE`
BETA_READY: not approved.
Public production readiness: not approved.
Phase 30C Beta Ready hold: not lifted.

## Inherited limitations (all 10 carried forward, unresolved)

| # | Limitation | Status |
|---|---|---|
| 1 | Restore rehearsal browser lane | `BLOCKED_DEFAULT_OFF` — not production restore proof |
| 2 | Adapter-awareness browser lane | `BLOCKED_DEFAULT_OFF` — not production adapter proof |
| 3 | Generated/test stress evidence | smoke-level only — not production-grade |
| 4 | Rollback/removal evidence | simulation-only — not a guaranteed rollback proof |
| 5 | No real learner data evidence | no real learner data present |
| 6 | No public production readiness evidence | not intended |
| 7 | No guaranteed data-loss prevention | participants must maintain independent backups |
| 8 | Ordinary-user Data Safety UX visibility | not approved — internal only |
| 9 | No sync/cloud/account/auth/backend evidence | not present or intended |
| 10 | Phase 30C Beta Ready hold not lifted | BETA_READY not approved |

These 10 limitations are carried forward from Phase 32F and confirmed unresolved through
Phase 33A–33F. Phase 34A does not resolve any of them. Phase 34B implementation must
operate within LIMITED_BETA_CANDIDATE constraints subject to all 10 limitations.

---

## Effect inventory

### Proposed Leader UI effects

Phase 34A defines 4 Leader UI effects for Phase 34B implementation consideration.
All effects are CSS-only (transitions or keyframe animations). No JavaScript animation
loops. No requestAnimationFrame. No Web Animations API.

| Effect ID | Effect name | Description | Owner component scope | Rendering boundary |
|---|---|---|---|---|
| `E01` | `CardAnswerRevealEffect` | Smooth opacity + scale CSS transition when the answer panel is revealed after the user taps "Show Answer" | Answer reveal panel within study card component | Study session view only; no effect outside session |
| `E02` | `RatingButtonFeedbackEffect` | Brief CSS `:active` / `transform: scale(0.96)` press-down effect on FSRS rating buttons (Again / Hard / Good / Easy) | Rating button component | Study session rating step only; no effect on other buttons |
| `E03` | `SessionCompleteEffect` | Lightweight CSS keyframe pulse/glow on the session-complete status indicator when all due cards are finished | Session completion screen component | Session complete screen only; removed/hidden on session start |
| `E04` | `ProgressTickEffect` | Brief CSS `transform: scale(1.1) → 1.0` tick animation on the due-count display when the count decrements | Due-count / progress display component | Dashboard and study session progress area only |

### Required effect inventory alignment

| Required inventory row | Phase 34A mapping |
|---|---|
| page/route entrance calm fade or slide | Deferred; target audit identifies shell candidates, but E01-E04 keep Phase 34B narrow. |
| card hover/press micro-interaction | Partially covered by E02 rating button press feedback; broader card hover is deferred. |
| quiz answer feedback transition | Covered by E01 CardAnswerRevealEffect. |
| progress/completion celebration restraint | Covered by E03 SessionCompleteEffect and E04 ProgressTickEffect. |
| settings/help panel transition | Deferred; settings/help remains out of Phase 34B scope. |
| skeleton/loading calm placeholder | Deferred; no loading placeholder effect is authorized for Phase 34B. |
| focus/keyboard-visible state polish | Required as a constraint; no effect may obscure focus-visible states. |
| reduced-motion fallback | Required for every effect through `prefers-reduced-motion`. |

## Effect ownership model

### Ownership rules

- Each effect is owned by and contained to a single named component scope (column 4).
- No effect may propagate visual changes outside its declared rendering boundary (column 5).
- No effect interacts with storage, scheduling, backup, export, restore, or any non-visual
  runtime behavior.
- Effect ownership is established in this design spec. Phase 34B must not expand ownership
  without a dedicated design gate amendment.

## Candidate implementation surfaces

Candidate implementation surfaces are limited to the owner component scopes listed in the
effect inventory, the effect-specific CSS needed for E01-E04, and any narrowly scoped test
file created by Phase 34B. The broader target audit identifies additional candidate UI
surfaces, but those are deferred unless a later design gate amendment approves them.

---

## Performance budget

### Budget definition

| Metric | Budget limit | Rejection threshold |
|---|---|---|
| Frame rate | ≥ 60 fps maintained during any active effect | Reject if any effect causes >3 dropped frames in a 60 fps session |
| Effect CSS weight | ≤ 4 KB total across all 4 effects (minified CSS) | Reject if total CSS weight exceeds 4 KB |
| JavaScript runtime cost | 0 ms (CSS-only; no JS animation permitted) | Reject if any effect introduces a JS animation loop |
| Layout shift (CLS) | 0 (no effect may change layout-impacting properties) | Reject any effect that modifies `width`, `height`, `top`, `left`, `margin`, `padding` during animation |
| Render-blocking | No effect may block the initial render path | Reject if any effect CSS is render-blocking |

### Per-effect budget

| Effect ID | Permitted CSS properties | Prohibited properties | Max duration |
|---|---|---|---|
| `E01` | `opacity`, `transform` (scale only) | `width`, `height`, `position`, `margin`, `padding`, `left`, `top` | 200 ms |
| `E02` | `transform` (scale only) | layout-impacting properties | 100 ms |
| `E03` | `opacity`, `transform` (scale only), `box-shadow` | layout-impacting properties | 400 ms |
| `E04` | `transform` (scale only) | layout-impacting properties | 150 ms |

### Measurement method

Performance budget compliance is verified by:
1. Browser DevTools Performance panel: record a study session run with all 4 effects active
   and confirm no dropped frames exceeding the threshold.
2. Visual inspection: confirm no layout shift occurs during any effect.
3. CSS size audit: measure minified CSS weight of all effect styles combined.

This is manual evidence only. No automated perf CI is required for Phase 34B. The evidence
plan in Design Surface 8 documents the required manual screenshots/observations.

---

## Accessibility and reduced-motion rules

### Reduced-motion requirement

All 4 effects MUST respect `@media (prefers-reduced-motion: reduce)`.

When `prefers-reduced-motion: reduce` is active:
- `E01 CardAnswerRevealEffect`: transition disabled; answer panel appears instantly with
  no animation. Static state change (opacity: 0 → 1 instant) is acceptable.
- `E02 RatingButtonFeedbackEffect`: scale transform disabled; button state communicated
  via color/background change only (e.g. `background-color` shift on `:active`). No motion.
- `E03 SessionCompleteEffect`: keyframe animation disabled; completion state communicated
  via static color/icon change only. No pulse, no glow motion.
- `E04 ProgressTickEffect`: scale animation disabled; count updates immediately with no
  motion animation.

### Implementation rule

Each effect CSS block MUST be wrapped in a `@media (prefers-reduced-motion: no-preference)`
query OR the reduced-motion alternative MUST be declared within a
`@media (prefers-reduced-motion: reduce)` override block.

Acceptable pattern (preferred):
```css
/* Default: effect active */
.card-answer-reveal {
  transition: opacity 200ms ease, transform 200ms ease;
}

/* Reduced motion: disable effect */
@media (prefers-reduced-motion: reduce) {
  .card-answer-reveal {
    transition: none;
  }
}
```

### WCAG compliance note

These effects are decorative. They do not convey information that is unavailable without
motion. All state changes (answer revealed, rating selected, session complete, count
decremented) are communicated through text, icon, or color — not motion alone.
Motion is enhancement only.

No effect may be the sole indicator of an interactive state change.

### Keyboard and focus

No effect may interfere with keyboard navigation or focus ring visibility.
The `RatingButtonFeedbackEffect (E02)` scale transform must not obscure or shift the
button's focus ring.

## Motion and visual language principles

Leader UI effects must be quiet, short-duration, and study-supportive. Motion is decorative
only and must never be the sole indicator of a state change. Phase 34B must prefer CSS-first
effects where possible, use short duration effects only, introduce no new dependencies by
default, and include no animation that blocks quiz interaction. The design permits no
network calls, no backend/cloud/sync claims, and rollback by removing the effect
module/styles only.

---

## Storage and data safety boundary

**Confirmation: CONFIRMED — no proposed effect requires or implies any storage, backup,
export, or restore behavior change.**

Detailed confirmation:

| Effect ID | Storage dependency | Backup/export dependency | Restore dependency | Verdict |
|---|---|---|---|---|
| `E01` | None | None | None | CONFIRMED no behavior change |
| `E02` | None | None | None | CONFIRMED no behavior change |
| `E03` | None | None | None | CONFIRMED no behavior change |
| `E04` | None | None | None | CONFIRMED no behavior change |

All 4 effects are purely visual CSS transitions/animations. They do not read from or
write to any storage driver, localStorage key, IndexedDB store, or export/import
pipeline. They have no effect on backup file format, restore overwrite behavior,
migration logic, or storage adapter selection.

Phase 34B implementation must not introduce any storage dependency not covered by
this design spec.

---

## No cloud/sync/backend/account/auth claim boundary

**Confirmation: CONFIRMED — no proposed effect requires or implies cloud sync, account
system, authentication, or server-side features.**

All 4 effects are local-only CSS animations rendered in the browser. They require no
network request, no API call, no authentication token, no server-side state, and no
account identifier.

Phase 34B implementation must not introduce any cloud, sync, backend, account, or auth
dependency not covered by this design spec. If any such dependency is discovered during
Phase 34B implementation, Phase 34B must halt and return a NEEDS_DESIGN_AMENDMENT finding.

---

## Design Surface 6 — No data-loss guarantee claims

**Confirmation: CONFIRMED — no proposed effect implies a data-loss guarantee.**

The absence-of-data-loss-guarantee limitation (limitation #7) remains in force.
No data-loss guarantee proof exists in Phase 34A.
Phase 34A Leader UI effects do not imply, suggest, or depend on any data-loss prevention
guarantee. Participants must continue to maintain independent backups as required by the
Phase 30B conditions.

No effect name, label, copy, or description in Phase 34A or Phase 34B may imply that
user data is protected, synced, or guaranteed against loss.

---

## No Beta Ready or public production claim boundary

**Confirmation: CONFIRMED — no proposed effect implies BETA_READY or public production
readiness.**

Phase 34A and Phase 34B operate within the LIMITED_BETA_CANDIDATE boundary.
No effect introduced in Phase 34B implies BETA_READY, public production readiness, or
any readiness status not approved at the time of Phase 34B.

The Phase 30C Beta Ready hold is not lifted by Phase 34A.
GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS (Phase 33F) is not BETA_READY.
PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION (Phase 34A) is not BETA_READY.

---

## Screenshot and manual evidence plan

### Purpose

Phase 34B must produce manual evidence demonstrating each effect works as intended and
does not cause regressions in core study session behavior.

### Required evidence items per effect

| Evidence ID | Effect ID | Evidence type | Required observation | Pass criterion |
|---|---|---|---|---|
| `EV01` | `E01` | Browser screenshot (2 frames) | Before and after answer reveal | Answer panel visible; no layout shift; transition smooth or instant per motion preference |
| `EV02` | `E02` | Browser screenshot (2 frames) | Rating button at rest and at `:active` | Scale feedback visible; no layout shift; button accessible |
| `EV03` | `E03` | Browser screenshot (1 frame) | Session complete screen with effect active | Completion indicator styled; no extraneous layout elements |
| `EV04` | `E04` | Browser screenshot (2 frames) | Due count before and after decrement | Count updated; animation brief; no layout shift |
| `EV05` | All | Browser screenshot (reduced-motion) | All effects with `prefers-reduced-motion: reduce` active | All motion disabled; state changes still visible via non-motion cues |
| `EV06` | All | Performance panel screenshot | DevTools Performance recording during session run | No dropped frames exceeding threshold; no layout shift |
| `EV07` | All | Regression smoke | Core study session: load cards, show answer, rate, complete session | No regression in study session flow; no JS errors; no data corruption |

### Evidence format

Evidence must be produced as browser screenshots or screen recordings captured during
a local development session. Remote evidence is not required. Evidence is internal only.

Evidence must be logged in the Phase 34B evidence doc (to be created as
`docs/testing/phase34b-leader-ui-effects-implementation.md`).

---

## Rollback and removal plan

### Per-effect rollback plan

| Effect ID | Activation boundary | Rollback method | Removal path |
|---|---|---|---|
| `E01` | CSS class toggle on answer panel container (`data-effects-enabled` attribute or equivalent) | Remove or set CSS class to disable transition | Delete CSS block in Phase 34B implementation PR |
| `E02` | CSS `:active` pseudo-class; no JS required | Remove CSS `:active` block | Delete CSS block in Phase 34B implementation PR |
| `E03` | CSS class toggled by session-complete state | Remove CSS class application on session complete | Delete CSS block + class toggle in Phase 34B implementation PR |
| `E04` | CSS class toggled by count-decrement event | Remove CSS class application on decrement | Delete CSS block + class toggle in Phase 34B implementation PR |

### Rollback requirements

1. Each effect must be removable without affecting any other effect or any non-visual
   runtime behavior.
2. Removing all 4 effects must leave the study session functional and visually coherent.
3. No effect may be structurally coupled to storage, scheduling, backup, or restore logic
   such that removal of the effect requires changes to those systems.
4. Rollback may be executed by deleting the relevant CSS block and, where applicable,
   removing the class-toggle call at the activation site.

### Activation boundary design

The preferred activation boundary for Phase 34B is a top-level CSS class on a container
element (e.g., `<body class="effects-enabled">` or a study session root container). This
allows all effects to be toggled off in a single declaration change, providing the fastest
possible rollback path.

Alternatively, each effect may be individually toggled via a dedicated class or
`data-` attribute. Phase 34B must document its chosen activation boundary in the
implementation doc.

---

## Phase 34B implementation boundaries

### Files permitted for Phase 34B modification

| Scope area | Permitted file pattern | Constraint |
|---|---|---|
| Effect CSS | `src/**/*.css` — effect-specific styles only | New rules for E01–E04 only; no changes to existing rules except to add effect classes |
| Component class toggle | `src/**/*.tsx` or `src/**/*.ts` — only the component files that own E01–E04 rendering boundaries | Only add/remove CSS class names at the activation site; no logic changes |
| Effect-specific test | `tests/**/*effects*.test.*` — new test file(s) only | Only new tests covering CSS class toggle behavior; no changes to existing tests |

### Files explicitly out of scope for Phase 34B

- Storage drivers, adapters, migration logic
- Backup, export, import, restore pipeline
- FSRS scheduling logic
- Dashboard non-effect components
- Settings panel
- Routing configuration
- CI pipeline config (`.github/workflows/`)
- `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`
- Any Phase 33 or earlier docs
- Validator scripts for prior phases
- `e2e/**`
- `package.json`, `package-lock.json`, `yarn.lock`

### Regression test plan

Phase 34B must verify the following are unaffected after implementation:

1. Study session loads and displays cards normally.
2. "Show Answer" reveals the answer panel.
3. FSRS rating buttons (Again / Hard / Good / Easy) are functional and accessible.
4. Session completion screen appears when all due cards are complete.
5. Due count updates correctly.
6. Existing unit tests: all passing at the same count as at Phase 34A baseline.
7. No new JS console errors introduced by effect activation.

---

## What Phase 34A supports

Phase 34A supports a design-only pass to Phase 34B for E01-E04 within the performance,
accessibility, reduced-motion, evidence, rollback/removal, storage, and claim boundaries
defined in this document.

## What Phase 34A does not approve

Data Safety UX remains internal-only.

Phase 34A does not approve BETA_READY, public production readiness, guaranteed data-loss
prevention, restore execution, production restore rehearsal, real learner data restore
rehearsal, runtime backup/export/restore behavior changes, backup file format changes,
restore overwrite behavior changes, storage migration, sync/cloud/account/auth/backend,
telemetry/analytics, built-in AI/OCR/API-key/BYOK behavior, BYOC/WebDAV/P2P/device-transfer
implementation, limited settings visibility to ordinary users, or Leader UI effects
implementation in Phase 34A itself.

## Next recommended phase

Next recommended phase: Phase 34B — Leader UI Effects Implementation

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

## Design gate decision

All 10 required design surfaces reviewed. No blocking finding.

```text
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_DECISION: PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION
```

This decision authorizes Phase 34B to implement Leader UI effects E01–E04 within the
design boundaries defined in this spec only.

PASS_TO_PHASE34B does NOT approve BETA_READY.
PASS_TO_PHASE34B does NOT approve public production readiness.
PASS_TO_PHASE34B does NOT lift the Phase 30C Beta Ready hold.
PASS_TO_PHASE34B does NOT resolve any of the 10 inherited limitations.
PASS_TO_PHASE34B does NOT automatically approve Phase 34C or any subsequent phase.

This document is for internal review only. Not for public use.
