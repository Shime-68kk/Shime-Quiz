# Phase 15G — Release / Claim Guardrail Re-Audit

Status: closed for Phase 15G. This phase is docs/static-validator/CI/release-claim
audit only. No runtime files changed. No src/, tests/, or e2e/ files changed.
No package.json or package-lock.json changed. No new dependencies added. No new
runtime behavior added. No new UI added. No new ts-fsrs.next() call sites added.

## Scope

Phase 15G re-audits release/public claims after the active FSRS foundation
established through Phases 15A–15F. It ensures all public-facing docs, release
notes, README copy, validator strings, and user-facing claims remain accurate and
safe. It prevents accidental overclaims about active scheduling availability,
AI scheduling, cloud sync, or security certification.

Allowed changed files for Phase 15G:

- `.github/workflows/e2e-smoke.yml`
- `docs/phase15g-release-claim-guardrail-reaudit.md`
- `scripts/validate-phase15g-release-claim-guardrail-reaudit.js`
- Historical validators with exact Phase 15G allowlist entries only

## Active FSRS foundation status

Active FSRS scheduling foundation exists behind strict gates and remains
experimental and internal-controlled:

- `fsrsExperimentalEnabled === true` AND `fsrsActiveSchedulingEnabled === true`
  must both be set for active scheduling to engage (double-gated).
- `fsrsActiveSchedulingEnabled` is internal-only, default OFF, and not
  user-visible.
- The internal active flag is never rendered as user-facing text and is never
  exposed in public Settings UI.
- Normal users continue to use existing scheduling unless gates are deliberately
  enabled by an internal/test activation path.
- Active FSRS scheduling remains experimental with no public rollout.

## Phase 15B–15F guarantees remain intact

- Phase 15B: active FSRS scheduling double-gated behind
  `fsrsExperimentalEnabled` AND `fsrsActiveSchedulingEnabled`, both default OFF.
- Phase 15C: Dashboard mixed-scheduler due-count display uses
  `computeMixedSchedulerDueSummary` for supported scheduler families.
- Phase 15D: rollback/fallback/default-OFF safety audited; `scheduleActiveFsrsOrFallback`
  falls back correctly when gates are off.
- Phase 15E: controlled internal/test activation harness exists for developers;
  `fsrsActiveSchedulingEnabled` is never user-visible.
- Phase 15F: Study Room memory-rating bridge copy is claim-safe for default-OFF
  and internal-active-capable contexts; `isActiveSchedulingCopyEnabled` is
  a code-level prop only, never rendered as user-facing text.

## Safe claims

The following claims are accurate for Phase 15G:

- Active FSRS scheduling foundation exists behind strict gates.
- Active FSRS scheduling is experimental and internal/test activation only.
- The internal active flag defaults OFF and is not user-visible.
- Normal users continue to use existing scheduling unless gates are deliberately
  enabled.
- Dashboard due counts include supported scheduler families.
- Study Room memory-rating copy is claim-safe for inactive and internal-active
  contexts.
- Rollback/fallback/default-OFF safety is covered by tests/validators.
- No public rollout of active FSRS scheduling has occurred or is claimed.

## Forbidden claims

The following claims are forbidden and do not appear in docs, README, or
release notes:

- FSRS scheduling is live for everyone.
- FSRS is broadly available as a user-facing feature.
- Active scheduling is guaranteed better.
- AI scheduling is enabled.
- Built-in AI scheduling exists.
- External AI/API integration exists.
- API key/BYOK support exists.
- OCR exists.
- Backend/cloud sync exists.
- Hybrid local-first sync exists.
- E2EE sync exists.
- Production/security certification exists.
- Dashboard fully supports every future scheduler.
- Active FSRS rollout is complete.

## Preferred wording

```
experimental memory scheduling
internal/test activation
double-gated
default OFF
not user-visible
rollback/fallback-safe
```

## Phase 16 and beyond

Phase 16 hybrid local-first architecture and optional sync direction remain a
future architecture track. Hybrid local-first is not implemented. No cloud sync,
E2EE sync, or backend account sync is implemented or claimed. These remain
planned future work only.

## Manual/browser smoke

Manual/browser smoke not run because Phase 15G is docs/static-validator/CI-only
and no runtime/UI files changed.

## Recommended next phase

Phase 16A: Hybrid Local-First Architecture / Optional Sync Direction —
docs/static-validator/CI only, or a separate post-15 release readiness audit
if needed before moving to Phase 16.
