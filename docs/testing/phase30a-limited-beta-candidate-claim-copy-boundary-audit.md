# Phase 30A — Limited Beta Candidate Claim/Copy Boundary Audit

## Status tokens

```text
PHASE30A_CLAIM_COPY_BOUNDARY_AUDIT_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_CLAIM_COPY_AUDIT
PHASE30A_CLAIM_COPY_BOUNDARY_DECISION: PASS_TO_PHASE30B_LIMITED_BETA_CANDIDATE_GATE
PHASE30A_DECISION_SCOPE: CLAIM_COPY_AUDIT_ONLY_NOT_LIMITED_BETA_CANDIDATE_NOT_BETA_READY
PHASE30A_OPEN_GAPS_STATUS: DOCUMENTED_EVIDENCE_LIMITATIONS_AND_BLOCKED_LANES
PHASE30B_LIMITED_BETA_CANDIDATE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 30A is a static claim/copy boundary audit of all user-visible and release-facing surfaces in ShimeChamhoc v2.0.0-rc1, conducted before any limited beta candidate decision. Its purpose is to verify that no user-visible copy, wording, or claim violates the established claim boundary for this project.

Phase type: docs/testing/audit/release/planning/static-validator/CI-only. No runtime source changes. No unit test changes. No e2e changes. No production imports. No restore execution. No backup/export/restore behavior changes. No backup file format changes. No restore overwrite behavior changes. No storage driver changes. No migrations. No telemetry/analytics. No sync/cloud/account/auth/backend. No production-visible UI changes. No route/navigation/settings/library/dashboard changes. No new browser/manual evidence execution. No LIMITED_BETA_CANDIDATE approval. No BETA_READY or public production readiness approval.

Phase 30A is a separate claim/copy audit gate and is not automatically approved by Phase 29F or any prior phase.

## Inputs from Phase 29F

Phase 29F delivered:
- Evidence review doc: `docs/testing/phase29f-evidence-review-limited-beta-candidate-redecision.md`
- Release summary: `docs/release/phase29f-evidence-review-limited-beta-candidate-redecision-summary.md`
- Phase 30A seed: `docs/planning/phase30a-limited-beta-candidate-claim-copy-boundary-audit-seed.md`
- Validator: `scripts/validate-phase29f-evidence-review-limited-beta-candidate-redecision.js`

Phase 29F tokens:

```text
PHASE29F_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE29C_29D_29E_EVIDENCE_REVIEW
PHASE29F_LIMITED_BETA_CANDIDATE_REDECISION: PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT
PHASE29F_DECISION_SCOPE: PASS_TO_AUDIT_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
PHASE29F_OPEN_GAPS_STATUS: DOCUMENTED_BLOCKED_LANES_AND_LIMITATIONS
PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 29F chose PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT. This advanced to Phase 30A audit only. It did not approve LIMITED_BETA_CANDIDATE or BETA_READY.

Open evidence gaps inherited from Phase 29F:
1. Restore rehearsal browser lane — BLOCKED (not resolved in Phase 29E or 29F).
2. Adapter-awareness browser lane — BLOCKED (not resolved in Phase 29E or 29F).
3. No before/after localStorage diffs — not captured.
4. No 100+ card stress test — not performed.
5. No full rollback/removal — rollback/removal lane was navigation-only.
6. No real learner data — all prior evidence was generated/test data only.

## Audit method

Phase 30A used read-only static analysis only. No browser execution. No runtime evaluation. No fabrication of evidence.

Methods used:
- `grep -RIn` on `src/`, `docs/`, `index.html`, `README.md`, `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`, `package.json`, `.github/`
- Direct file read of key surfaces: `index.html`, `README.md`, `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`, `src/version.js`, `src/ui/analyticsPanel.js`, `src/ui/dataBackupPanel.js`, `src/data/demoSampleQuiz.js`, `src/data/aiOutputReview.js`, `src/main.js`, `docs/public-release-notes.md`
- Surface-by-surface review of each claim area listed in the Phase 30A seed

Where a surface was not fully auditable by static grep (e.g., dynamically rendered routes), that limitation is documented.

## Claim surfaces audited

All surfaces required by the Phase 30A seed were audited:

1. Landing page visible copy — `index.html` meta, README
2. Dashboard copy — `src/ui/analyticsPanel.js`, `src/main.js`
3. Library/import copy — `src/ui/modals.js`, import flows
4. Backup/export/restore copy if visible — `src/ui/dataBackupPanel.js`
5. Settings copy — FSRS experimental settings area
6. Release notes/PR notes — `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`, `docs/public-release-notes.md`
7. User-facing docs — `README.md`, `docs/` public-facing docs
8. Future limited beta candidate wording — all visible surfaces
9. Forbidden AI/OCR/API-key/BYOK wording — `src/data/demoSampleQuiz.js`, `src/data/aiOutputReview.js`, `src/data/aiPromptBuilder.js`
10. Forbidden cloud/sync/account/auth/backend wording — `README.md`, `RELEASE_NOTES.md`, `docs/`
11. Forbidden data-loss guarantee wording — all surfaces
12. Forbidden production restore wording — `src/ui/dataBackupPanel.js`, `docs/`
13. Forbidden telemetry/analytics approval wording — `src/main.js`, `src/ui/analyticsPanel.js`

## Claim/copy audit table

| Surface | Files or routes reviewed | Audit method | Finding | Required fix | Decision impact | Claim allowed | Claim not allowed |
|---------|--------------------------|--------------|---------|--------------|-----------------|---------------|-------------------|
| Landing page visible copy | `index.html` (meta description, title), `README.md` hero | Static grep, file read | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — meta says "A local-first quiz study app"; README says "local-first quiz study app — không cần tài khoản" | None | None | "local-first quiz study app", "no account required" | Any production-ready or BETA_READY claim |
| Dashboard copy | `src/ui/analyticsPanel.js`, dashboard sections of `src/main.js` | Static grep, file read | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — uses "dữ liệu học cục bộ" (local learning data), "chỉ báo dựa trên dữ liệu học cục bộ" | None | None | Local learning analytics, local study progress | Guaranteed prediction accuracy, production AI/ML claim |
| Library/import copy | `src/ui/modals.js`, import modal surfaces | Static grep | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — standard import with preview and explicit confirm before save | None | None | Import with preview and user-confirm before save | Guaranteed import accuracy or data-loss prevention |
| Backup/export/restore copy if visible | `src/ui/dataBackupPanel.js` | Static grep, file read | `PASS_WITH_LIMITATIONS` — `restoreBackupData` function is wired into UI; no production readiness claim found in copy; copy does not claim restore is safe against all data-loss scenarios | None (function present, no readiness claim in copy) | Documented limitation only | Backup/export/restore feature available | Any guaranteed restore safety or production restore readiness claim |
| Settings copy | FSRS experimental toggle area, `docs/phase14h-fsrs-experimental-toggle-ui.md` | Static grep | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — FSRS feature flagged as "experimental" | None | None | "experimental" FSRS scheduling toggle | Any production scheduling safety guarantee |
| Release notes/PR notes | `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`, `docs/public-release-notes.md` | File read | `LEGACY_CLAIM_FINDING` — `RELEASE_NOTES.md` and `RELEASE_NOTES_V2.md` contain "AI-verified beta candidate: YES — SHIP" from very early phases (v2.0.0-beta.1 label, predating Phase 29C–29F evidence collection). Claim is qualified with "chưa được chứng nhận QA thủ công trên thiết bị thật" (not certified by manual QA on real device). `docs/public-release-notes.md` is conservative. | Flag for Phase 30B: legacy RELEASE_NOTES "AI-verified beta candidate: YES — SHIP" claim should be reviewed in Phase 30B limited beta candidate gate. It predates current evidence level. Not a Phase 30A blocker given qualifications, but must be noted. | Documented finding; not a Phase 30A blocker. Phase 30B must review. | "beta candidate" with explicit qualifications and caveats | "AI-verified beta candidate: YES — SHIP" without reference to Phase 29C–29F evidence scope; unqualified beta readiness claim |
| User-facing docs | `README.md`, `docs/public-release-notes.md`, `docs/readme-public-facing-guide.md` | File read | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — README says "no cloud sync", "no backend", "no account required"; public-release-notes is conservative | None | None | "no cloud sync", "no backend", "no account", local-first positioning | Any production-certified or security-certified claim |
| Future limited beta candidate wording | All visible surfaces (grep all) | Static grep across `src/`, `docs/`, root | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — no user-visible copy claims LIMITED_BETA_CANDIDATE is approved; `src/version.js` uses `2.0.0-beta.1` as a version label only | None | None | Version label `2.0.0-beta.1`; "beta" as version qualifier | Any claim that LIMITED_BETA_CANDIDATE or LIMITED_BETA is approved |
| Forbidden AI/OCR/API-key/BYOK wording | `src/data/demoSampleQuiz.js`, `src/data/aiOutputReview.js`, `src/data/aiPromptBuilder.js`, `edugen/edugenDraftParser.js` | Static grep, file read | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — demo card says "Shime không tự gọi AI API khi dùng bộ mẫu này" (Shime does not call AI API); `edugenDraftParser.js` states "NO AI call, NO OCR"; AI output review notes AI-generated content needs user review | None | None | Manual AI workflow (user copies prompt, pastes result), explicit "no built-in AI" guardrail | Built-in AI generation, API key / BYOK, OCR, or automatic AI call claims |
| Forbidden cloud/sync/account/auth/backend wording | `README.md`, `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`, `docs/` | Static grep, file read | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — README: "Không có cloud sync"; RELEASE_NOTES: "không có tài khoản, đồng bộ cloud, backend" | None | None | "no cloud sync", "no backend", "no account" | Any sync/cloud/account/auth/backend feature claim |
| Forbidden data-loss guarantee wording | All surfaces | Static grep | `NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT` — no "guaranteed" data safety, no "guaranteed data-loss prevention" found | None | None | Backup feature available; user is responsible for backups | Any "guaranteed" data-loss prevention or data-safety guarantee |
| Forbidden production restore wording | `src/ui/dataBackupPanel.js`, `docs/` | Static grep, file read | `PASS_WITH_LIMITATIONS` — restore from backup is a UI feature; no claim of "production restore" readiness or "restore execution approved" found in copy | Note in Phase 30B: restore function exists in UI; limited beta gate should verify no production restore readiness is claimed | Documented limitation | Restore from backup as user-facing feature | "Production restore approved", "restore execution safe", "guaranteed restore" |
| Forbidden telemetry/analytics approval wording | `src/main.js`, `src/ui/analyticsPanel.js`, `src/quiz/analytics.js` | Static grep, file read | `PASS_WITH_LIMITATIONS` — "analytics" in codebase refers to local learning analytics (study progress, daily recommendations, exam readiness indicators) — not user telemetry, not external tracking. No external analytics service found. | Note for Phase 30B: distinguish local learning analytics (study progress) from telemetry/tracking in limited beta copy to avoid confusion | Documented limitation | Local learning analytics (local study progress, recommendations) | External user telemetry, analytics tracking service, approval of telemetry/analytics sending |

## Allowed wording boundaries

The following wording is within the allowed claim boundary for limited beta candidate preparation:

- App is "local-first" or "local-first quiz study app" — allowed.
- "No cloud sync", "no backend", "no account required" — allowed and encouraged.
- "Experimental" or "limited" features (FSRS experimental toggle) — allowed if not claiming full stability.
- Backup/export/restore is available as a user-managed feature — allowed if not claiming guaranteed data-loss prevention.
- "beta.1" as a version label (`2.0.0-beta.1`) — allowed as version string, not a readiness claim.
- Manual AI workflow (copy prompt, paste result) with explicit "no built-in AI" guardrail — allowed.
- Local learning analytics (study progress, recommendations, exam readiness) labeled as "local data" and "heuristic" — allowed.
- "Not for production use" or "use at your own risk" — allowed and encouraged.
- Vietnamese-first user-facing language — allowed per Phase 16D product principles.
- "chưa được chứng nhận QA thủ công" (not manually QA certified) — allowed as a qualification/limitation statement.
- No sync, no cloud, no account, no backend, no encryption, no notifications — allowed as negative guardrails.

## Forbidden wording checks

The following forbidden wording was checked for on all user-visible surfaces:

- "production ready" or "production-ready" without qualification — **not found as positive claim**.
- "beta ready" or "BETA_READY" as a positive user-facing claim — **not found as positive claim**.
- "guaranteed" data safety, data preservation, or data-loss prevention — **not found**.
- "restore" as a production feature claim with readiness guarantee — **not found as production readiness claim** (restore is present as a feature but no readiness guarantee claim found).
- "sync" or "cloud" as a feature claim (unless implemented and gated) — **found only as negative guardrail** ("no cloud sync", "no automatic sync").
- Any wording that implies LIMITED_BETA_CANDIDATE has been approved — **not found**.
- "AI-verified beta candidate: YES — SHIP" as current claim without qualification — **found in legacy `RELEASE_NOTES.md` / `RELEASE_NOTES_V2.md` only, with caveats, from early phases** (see Required copy fixes).
- External telemetry/analytics approval — **not found**.
- Built-in AI generation, OCR, API-key, BYOK — **not found as positive claim** (only negative guardrails found).

## Findings

```text
NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT
```

No currently active user-visible copy or wording found that newly claims:
- BETA_READY
- LIMITED_BETA_CANDIDATE approval
- Public production readiness
- Guaranteed data-loss prevention
- Production restore safety
- Built-in AI/OCR/API-key/BYOK
- Cloud/sync/account/auth/backend features
- External telemetry/analytics

One legacy finding documented:

**LEGACY_CLAIM_FINDING — RELEASE_NOTES.md / RELEASE_NOTES_V2.md**: These files contain "AI-verified beta candidate: YES — SHIP" from very early project phases (before Phase 29C–29F evidence collection). The claim is qualified ("chưa được chứng nhận QA thủ công trên thiết bị thật") and the documents are not newly written. This is a pre-existing legacy claim, not a newly introduced Phase 30A violation. It is documented here for Phase 30B review.

Two surface limitations documented:
- Restore from backup is a UI feature but copy does not claim production restore readiness.
- Local learning analytics is a local study-progress feature but "analytics" term should be clarified in limited beta documentation to distinguish from user telemetry.

## Required copy fixes

The following required copy fixes are documented for Phase 30B limited beta candidate gate review:

1. **RELEASE_NOTES.md / RELEASE_NOTES_V2.md legacy claim**: Before any limited beta candidate gate approval, review whether "AI-verified beta candidate: YES — SHIP" in `RELEASE_NOTES.md` and `RELEASE_NOTES_V2.md` should be updated to reference current evidence scope (Phase 29C–29F evidence level, with open gaps including two BLOCKED lanes). These files predate the current evidence-collection effort and may mislead limited beta reviewers. This is a Phase 30B concern, not a Phase 30A blocker.

2. **Analytics/telemetry disambiguation**: Limited beta candidate documentation should clarify that "analytics" in the app refers to local learning analytics (study progress, recommendations) and not to external user telemetry or tracking services.

## Evidence limitations carried forward

The following evidence limitations from Phase 29F are carried forward and explicitly acknowledged:

1. **Restore rehearsal browser lane**: BLOCKED — not resolved in Phase 29E, 29F, or 30A.
2. **Adapter-awareness browser lane**: BLOCKED — not resolved in Phase 29E, 29F, or 30A.
3. **No before/after localStorage diffs**: Not captured in any phase.
4. **No 100+ card stress test**: Not performed.
5. **No full rollback/removal execution**: Rollback/removal lane was navigation-only.
6. **No real learner data**: All prior evidence used generated/test data only.
7. **Static audit limitation**: Phase 30A used static grep and file read only. Dynamically rendered route content (e.g., runtime-composed dashboard copy, study room feedback text) was not evaluated in a live browser.

## Chosen claim/copy boundary decision

```text
PHASE30A_CLAIM_COPY_BOUNDARY_DECISION: PASS_TO_PHASE30B_LIMITED_BETA_CANDIDATE_GATE
```

## Decision rationale

Static audit of all required claim surfaces found no currently active user-visible copy that newly claims BETA_READY, LIMITED_BETA_CANDIDATE approval, public production readiness, guaranteed data-loss prevention, production restore safety, built-in AI/OCR/API-key/BYOK, cloud/sync/account/auth/backend, or external telemetry/analytics.

One legacy claim finding was documented in `RELEASE_NOTES.md` / `RELEASE_NOTES_V2.md` ("AI-verified beta candidate: YES — SHIP"), predating the current evidence-collection effort and qualified with explicit caveats. This is a Phase 30B concern.

Two surface limitations were documented (restore backup UI without readiness claim; local analytics vs. telemetry distinction). Both are within the allowed wording boundary and are flagged for Phase 30B attention.

The claim/copy audit did not find blockers that prevent advancing to a formal limited beta candidate gate. Phase 30B is that separate gate.

## What this decision supports

- Advancing to Phase 30B — Limited Beta Candidate Gate as a separate, non-automatically-approved gate.
- Continued static claim/copy audit discipline.
- Documentation of all findings and required copy fixes for Phase 30B review.

## What this decision does not support

- LIMITED_BETA_CANDIDATE approval.
- BETA_READY approval.
- Public production readiness.
- Guaranteed data-loss prevention.
- Production restore rehearsal.
- Real learner data restore rehearsal.
- Runtime backup/export/restore behavior changes.
- Backup file format changes.
- Restore overwrite behavior changes.
- Storage migration.
- Sync/cloud/account/auth/backend.
- Telemetry/analytics.
- Built-in AI/OCR/API-key/BYOK behavior.
- Phase 30B implementation (Phase 30B is a separate gate not yet executed).

## Restore rehearsal blocked-lane wording boundary

Restore rehearsal browser lane remains BLOCKED from Phase 29E. No new restore rehearsal evidence was collected in Phase 30A. Any user-visible copy about restore must not claim production restore readiness, restore execution approved, or safe restore against all data-loss scenarios. Allowed wording: restore from backup is available as a user-managed feature; the user is responsible for verifying their own backup integrity.

## Adapter-awareness blocked-lane wording boundary

Adapter-awareness browser lane remains BLOCKED from Phase 29E. No new adapter-awareness evidence was collected in Phase 30A. Any user-visible copy about storage must not claim production adapter-aware storage safety. Allowed wording: app uses browser localStorage; users should maintain backups.

## LocalStorage diff wording boundary

No before/after localStorage diffs were collected in any phase. Any user-visible copy about data persistence must not claim localStorage correctness has been verified by diff evidence. Allowed wording: data is stored locally in the browser; users should maintain backups.

## Stress-adjacent wording boundary

No 100+ card stress test was performed. Any user-visible copy about performance must not claim stress-tested readiness. Allowed wording: app is suitable for ordinary local study workflows; performance under very large libraries is not guaranteed.

## Rollback/removal wording boundary

No full rollback/removal execution was performed; only navigation was verified. Any user-visible copy about rollback must not claim rollback safety has been verified against live data. Allowed wording: features can be disabled via settings; rollback against live learner data has not been tested.

## Claim boundary

```text
ALLOWED:
- Local-first quiz study app (local browser storage)
- No cloud sync, no backend, no account required
- Backup/export/restore as user-managed features (no guaranteed data-loss prevention)
- Manual AI workflow (copy prompt, paste result, no built-in AI)
- Local learning analytics (study progress, local heuristics)
- Experimental FSRS scheduling toggle
- Vietnamese-first UX
- "beta.1" as version label only

NOT ALLOWED:
- BETA_READY or LIMITED_BETA_CANDIDATE approval
- Public production readiness
- Guaranteed data-loss prevention
- Production restore safety
- Stress-tested readiness
- Cloud/sync/account/auth/backend features
- External telemetry/analytics
- Built-in AI/OCR/API-key/BYOK
- Any claim unsupported by Phase 29C–29F evidence level
```

## Next recommended phase

```text
Next recommended phase: Phase 30B — Limited Beta Candidate Gate
Phase 30B is a separate limited beta candidate gate and is not automatically approved.
Phase 30A does not approve LIMITED_BETA_CANDIDATE.
Phase 30A does not approve BETA_READY.
Phase 30A does not approve public production readiness.
Phase 30A does not approve guaranteed data-loss prevention.
Phase 30A does not approve restore execution.
Phase 30A does not approve production restore rehearsal.
Phase 30A does not approve real learner data restore rehearsal.
Phase 30A does not approve runtime backup/export/restore changes.
Phase 30A does not approve backup file format changes.
Phase 30A does not approve restore overwrite behavior changes.
Phase 30A does not approve storage migration.
Phase 30A does not approve sync/cloud/account/auth/backend.
Phase 30A does not approve telemetry/analytics.
Phase 30A does not approve built-in AI/OCR/API-key/BYOK behavior.
```
