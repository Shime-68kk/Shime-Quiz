# Phase 34B — Leader UI Effects Implementation Seed

## Status token

```text
PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 34B is the Leader UI Effects Implementation phase. It implements the 4 Leader UI
effects (E01–E04) defined and authorized by the Phase 34A design gate.

Phase 34B is a separate implementation gate and is not automatically approved.
No readiness status change is implied by the existence of this seed. Phase 34B must
independently reach its own evidence-reviewed implementation gate decision.

Phase 34B does not inherit BETA_READY from Phase 34A. Phase 34A's
`PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION` decision authorizes implementation
within the Phase 34A design boundaries only; it does not grant BETA_READY, public
production readiness, or any higher status.

## Inputs from Phase 34A

```text
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_STATUS: COMPLETED_DESIGN_GATE
PHASE34A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_DECISION: PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION
PHASE34A_DESIGN_SCOPE: DESIGN_ONLY_NO_RUNTIME_SOURCE_TEST_E2E_OR_BEHAVIOR_CHANGES
PHASE34A_LIMITATION_CARRYFORWARD_STATUS: ALL_10_LIMITATIONS_CARRIED_FORWARD_UNRESOLVED
```

Highest approved readiness entering Phase 34B: `LIMITED_BETA_CANDIDATE`
BETA_READY: not approved.
Public production readiness: not approved.
Phase 30C Beta Ready hold: not lifted.

All 10 limitations carried forward from Phase 32F through Phase 34A remain unresolved.
Phase 34B implementation must operate within the LIMITED_BETA_CANDIDATE readiness boundary.

## Authorized effect inventory

Phase 34B may implement only the following 4 effects as defined in
`docs/design/phase34a-leader-ui-effects-design-spec.md`:

| Effect ID | Effect name | Owner component scope | Max CSS duration | Rollback method |
|---|---|---|---|---|
| E01 | CardAnswerRevealEffect | Answer reveal panel in study card component | 200 ms | Remove CSS transition class |
| E02 | RatingButtonFeedbackEffect | Rating button `:active` state | 100 ms | Remove CSS `:active` block |
| E03 | SessionCompleteEffect | Session completion screen component | 400 ms | Remove CSS keyframe + class toggle |
| E04 | ProgressTickEffect | Due-count / progress display component | 150 ms | Remove CSS animation + class toggle |

No additional effects may be introduced in Phase 34B without a Phase 34A design gate
amendment.

## Design constraints (inherited from Phase 34A)

Phase 34B implementation must comply with all Phase 34A design constraints:

1. **CSS-only effects** — CSS transitions and keyframe animations only. No JavaScript
   animation loop, no requestAnimationFrame, no Web Animations API.

2. **Performance budget** — ≤ 60 fps maintained; ≤ 4 KB total CSS (minified); 0 layout
   shift; all effect-animated properties must be `opacity` or `transform` only (no
   layout-impacting property transitions during animation).

3. **Reduced-motion** — All effects must respect `@media (prefers-reduced-motion: reduce)`.
   Each effect must have a declared reduced-motion alternative (instant/static state
   change). No motion-only state communication.

4. **Rendering boundary** — Each effect must be contained to its declared rendering
   boundary. No effect may propagate outside its owner component scope.

5. **Rollback path** — Each effect must be independently removable via CSS class/attribute
   removal without affecting other effects or non-visual runtime behavior.

6. **No storage/data interaction** — No effect may read from or write to any storage
   driver, localStorage key, or IndexedDB store.

7. **No cloud/sync/backend** — No effect may introduce any network, API, authentication,
   or server-side dependency.

8. **No telemetry** — No effect may introduce telemetry or analytics.

## Implementation scope

### Permitted file patterns

| Scope area | Permitted file pattern |
|---|---|
| Effect CSS | `src/**/*.css` — effect-specific rules only |
| Component activation | `src/**/*.tsx` or `src/**/*.ts` — only files owning E01–E04 rendering boundaries |
| New effect tests | `tests/**/*effects*.test.*` — new test file(s) only |

### Explicitly out-of-scope files

- Storage drivers, adapters, migration logic
- Backup, export, import, restore pipeline
- FSRS scheduling logic
- Dashboard non-effect components
- Settings panel
- Routing configuration
- `.github/workflows/`
- `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`
- Any Phase 33 or earlier docs
- Validator scripts for prior phases
- `e2e/**`
- `package.json`, `package-lock.json`, `yarn.lock`

## Required evidence plan

Phase 34B must produce all 7 evidence items before reaching a gate decision:

| Evidence ID | Effect | Type | Required observation |
|---|---|---|---|
| EV01 | E01 | Browser screenshot (2 frames) | Before/after answer reveal; no layout shift |
| EV02 | E02 | Browser screenshot (2 frames) | Rating button at rest and active; accessible |
| EV03 | E03 | Browser screenshot (1 frame) | Session complete screen with effect |
| EV04 | E04 | Browser screenshot (2 frames) | Due count before/after decrement |
| EV05 | All | Browser screenshot (reduced-motion) | All effects with `prefers-reduced-motion: reduce` active |
| EV06 | All | Performance panel screenshot | No dropped frames; no layout shift |
| EV07 | All | Regression smoke | Core study session flow unaffected; no JS errors |

Evidence must be logged in `docs/testing/phase34b-leader-ui-effects-implementation.md`
(to be created by Phase 34B).

## Regression test plan

Phase 34B must verify the following are unaffected:

1. Study session loads and displays cards normally.
2. "Show Answer" reveals the answer panel.
3. FSRS rating buttons (Again / Hard / Good / Easy) are functional and accessible.
4. Session completion screen appears when all due cards are complete.
5. Due count updates correctly.
6. Existing unit tests: all passing at ≥ 2567 count.
7. No new JS console errors introduced.

## Decision options for Phase 34B

Phase 34B must choose one of the following:

```text
HOLD_LEADER_UI_EFFECTS_IMPLEMENTATION
NEEDS_IMPLEMENTATION_REWORK
PASS_TO_PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW
```

**`HOLD_LEADER_UI_EFFECTS_IMPLEMENTATION`** — Use if a blocking implementation finding
is identified: performance budget exceeded, reduced-motion alternative absent, scope
boundary violated, rollback path broken, or regression introduced.

**`NEEDS_IMPLEMENTATION_REWORK`** — Use if specific implementation gaps are identified
that can be addressed without a full re-evaluation.

**`PASS_TO_PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW`** — Use only if all effects
implemented within design boundaries, all 7 evidence items produced, all regressions
absent, and all 10 limitations confirmed carried forward.

## Forbidden defaults

Phase 34B must not:
- Pass automatically on the basis of Phase 34A PASS decision.
- Approve BETA_READY.
- Approve public production readiness.
- Implement effects outside the E01–E04 inventory.
- Expand rendering boundaries beyond those declared in Phase 34A.
- Introduce storage, backup, restore, cloud, sync, or backend dependencies.
- Skip manual evidence collection.
- Describe any inherited limitation as resolved.

## Inherited limitations (all 10 must be carried forward)

1. Restore rehearsal browser lane: `BLOCKED_DEFAULT_OFF` — not production restore proof.
2. Adapter-awareness browser lane: `BLOCKED_DEFAULT_OFF` — not production adapter proof.
3. Generated/test stress evidence: smoke-level only — not production-grade.
4. Rollback/removal evidence: simulation-only — not a guaranteed rollback proof.
5. No real learner data evidence.
6. No public production readiness evidence.
7. No guaranteed data-loss prevention — participants must maintain independent backups.
8. Ordinary-user Data Safety UX visibility: not approved — internal only.
9. No sync/cloud/account/auth/backend evidence present or intended.
10. Phase 30C Beta Ready hold not lifted — BETA_READY not approved.

## Recommended starting point

Phase 34B should begin by reading:
- `docs/design/phase34a-leader-ui-effects-design-spec.md` — authoritative design spec
- `docs/testing/phase34a-leader-ui-effects-design-gate.md` — gate review record
- `docs/release/phase34a-leader-ui-effects-design-gate-summary.md` — summary
- `docs/planning/phase34b-leader-ui-effects-implementation-seed.md` — this file

Phase 34B is a separate implementation gate and is not automatically approved.
Phase 34B does not inherit BETA_READY from Phase 34A.
Phase 34B must independently reach its own evidence-reviewed gate decision.

LIMITED_BETA_CANDIDATE remains the highest approved readiness status entering Phase 34B.
BETA_READY is not approved. Phase 30C hold is not lifted.
