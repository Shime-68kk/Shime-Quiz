# Phase 35C — Library Bookshelf Evidence Review Seed

## Status token

```
PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 35C reviews the evidence produced by Phase 35B (Library Bookshelf tab system) and decides whether the implementation is ready to proceed, needs fixes, or should be held.

## Inputs from Phase 35B

- Runtime implementation: `src/routes/Library.jsx` (tab split), `src/styles/global.css` (tab styles)
- Unit tests: `tests/unit/libraryBookshelfTabs.test.jsx` (12 static source tests)
- Evidence doc: `docs/testing/phase35b-library-bookshelf-evidence.md`
- Release summary: `docs/release/phase35b-library-bookshelf-summary.md`
- Phase 35B validator result (Codex lane): to be collected in integration
- Manual browser evidence: to be collected by tester

## Review focus

1. **Default tab correctness** — Library opens to "Kệ sách của tôi"; learner-facing subject/catalog content is visible; import/admin panels are not visible.
2. **Workshop tab correctness** — "Xưởng nạp tài liệu" shows all existing import/configuration/admin panels and they remain usable.
3. **Raw input state preservation** — Typed text in the workshop tab textarea survives repeated tab switches. Both panels are confirmed to stay mounted.
4. **Accessibility** — Tab buttons receive visible keyboard focus; hidden panel controls are not keyboard-reachable; `aria-selected`, `aria-controls`, `role="tablist"`, `role="tab"`, `role="tabpanel"` are present.
5. **Reduced-motion safety** — Tab switching works without animation under `prefers-reduced-motion: reduce`.
6. **Mobile/responsive** — Tabs are readable and tappable at 375px viewport width.
7. **Scope compliance** — No forbidden files changed; no package/dependency changes; no import parser, storage, backup/restore, scheduler, FSRS, or route changes.
8. **Build and unit tests pass** — `npm run build` and `npm run test:unit` pass.
9. **Phase 35B validator** — Validator from Codex lane passes (if available).

## Tester focus

Tester must perform and record results for all manual browser checks listed in `docs/testing/phase35b-library-bookshelf-evidence.md`:

- Library opens to "Kệ sách của tôi" by default.
- Subject/catalog cards visible on shelf tab; import panels hidden.
- "Xưởng nạp tài liệu" tab reveals all import/admin panels.
- Type text in textarea, switch to shelf, switch back — text preserved.
- Import controls (file picker, demo sample, backup/restore) remain usable.
- Subject/catalog actions (topic pills, smart practice, study room) remain usable.
- Keyboard focus visible on tab buttons.
- Tab key does not reach hidden panel controls.
- Reduced-motion: tabs switch immediately.
- Mobile 375px: tabs readable and tappable.

## Decision options

```
PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_SCOPE_GATE
NEEDS_LIBRARY_BOOKSHELF_FIXES
HOLD_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
```

`PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_SCOPE_GATE` — evidence passes: default shelf tab correct, workshop tab correct, raw input preserved, accessibility verified, build/tests pass, no forbidden files changed.

`NEEDS_LIBRARY_BOOKSHELF_FIXES` — implementation has specific identified issues that must be fixed before proceeding (document the issues clearly).

`HOLD_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW` — evidence is incomplete or ambiguous; hold for additional evidence collection.

## Forbidden approvals

Phase 35C must NOT approve:

- BETA_READY
- Public production readiness
- Broad validation
- Stress-tested readiness
- Guaranteed data-loss prevention
- Sync, cloud, account, auth, or backend behavior
- Telemetry or network calls
- Built-in AI, OCR, API-key, or BYOK behavior
- Dynamic Canvas Themes implementation

Current readiness remains: `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`

## Recommended next step

Collect Phase 35B validator result (Codex lane integration), run manual browser checks, and record all evidence in a Phase 35C evidence doc before making the decision.
