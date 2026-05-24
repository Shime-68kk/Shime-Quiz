# Phase 30B — Limited Beta Candidate Gate

## Status tokens

```text
PHASE30B_LIMITED_BETA_CANDIDATE_GATE_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_GATE
PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: PASS_LIMITED_BETA_CANDIDATE
PHASE30B_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
PHASE30B_OPEN_LIMITATIONS_STATUS: DOCUMENTED_LIMITED_CANDIDATE_WITH_EVIDENCE_GAPS
PHASE30C_BETA_READY_DECISION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 30B is the formal limited beta candidate gate for ShimeChamhoc v2.0.0-rc1. It is a separate gate, not automatically approved by Phase 30A, Phase 29F, or any prior phase. It weighs all accumulated evidence from Phase 29C through Phase 30A, reviews all Phase 30A required copy fixes, and makes an explicit limited beta candidate decision.

Phase type: docs/testing/evidence/release/planning/static-validator/CI-only. No runtime source changes. No unit test changes. No e2e changes. No production imports. No restore execution. No backup/export/restore behavior changes. No backup file format changes. No restore overwrite behavior changes. No storage driver changes. No migrations. No telemetry/analytics. No production-visible UI changes. No route/navigation/settings/library/dashboard changes. No new browser/manual evidence execution. No BETA_READY or public production readiness approval. No broad beta release approval.

## Inputs from Phase 30A

Phase 30A delivered:
- Claim/copy boundary audit doc: `docs/testing/phase30a-limited-beta-candidate-claim-copy-boundary-audit.md`
- Release summary: `docs/release/phase30a-limited-beta-candidate-claim-copy-boundary-audit-summary.md`
- Phase 30B seed: `docs/planning/phase30b-limited-beta-candidate-gate-seed.md`
- Validator: `scripts/validate-phase30a-limited-beta-candidate-claim-copy-boundary-audit.js`

Phase 30A tokens:

```text
PHASE30A_CLAIM_COPY_BOUNDARY_AUDIT_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_CLAIM_COPY_AUDIT
PHASE30A_CLAIM_COPY_BOUNDARY_DECISION: PASS_TO_PHASE30B_LIMITED_BETA_CANDIDATE_GATE
PHASE30A_DECISION_SCOPE: CLAIM_COPY_AUDIT_ONLY_NOT_LIMITED_BETA_CANDIDATE_NOT_BETA_READY
PHASE30A_OPEN_GAPS_STATUS: DOCUMENTED_EVIDENCE_LIMITATIONS_AND_BLOCKED_LANES
PHASE30B_LIMITED_BETA_CANDIDATE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 30A chose PASS_TO_PHASE30B_LIMITED_BETA_CANDIDATE_GATE. This advances to Phase 30B only. It did not approve LIMITED_BETA_CANDIDATE or BETA_READY.

Phase 30A required copy fixes reviewed in Phase 30B:
1. Review legacy RELEASE_NOTES.md / RELEASE_NOTES_V2.md "AI-verified beta candidate: YES — SHIP" claim relative to Phase 29C–29F evidence scope.
2. Clarify analytics/telemetry distinction in limited beta candidate documentation.

Open evidence gaps inherited from Phase 30A:
1. Restore rehearsal browser lane — BLOCKED.
2. Adapter-awareness browser lane — BLOCKED.
3. No before/after localStorage diffs — not captured.
4. No 100+ card stress test — not performed.
5. No full rollback/removal execution — navigation-only.
6. No real learner data — generated/test data only.
7. Static audit limitation — dynamically rendered route content not evaluated in live browser.

## Gate method

Phase 30B used review-only gate method. No browser execution. No runtime evaluation. No fabrication of evidence. No new evidence collected.

Methods used:
- Review of Phase 30A claim/copy audit findings.
- Review of Phase 30A required copy fixes.
- Explicit weighing of all Phase 29C–30A open evidence gaps.
- Review of legacy release-notes claim.
- Clarification of analytics versus telemetry distinction.
- Static content verification of all docs.
- Validator execution against existing file set.

## Gate decision table

| Gate item | Source | Evidence reviewed | Status | Limitation | Decision impact | Claim allowed | Claim not allowed |
|-----------|--------|-------------------|--------|------------|-----------------|---------------|-------------------|
| Phase 29C claim/copy partial evidence | `docs/testing/phase29c-generated-test-manual-browser-evidence-run.md` | Partial manual browser evidence on generated/test data; 3 of 5 lanes completed; restore rehearsal and adapter-awareness lanes BLOCKED | COMPLETED_PARTIAL | Two lanes BLOCKED; no real data; no localStorage diffs | Acknowledged; partial evidence basis documented | Basic flow navigation on generated/test data | Production readiness, restore execution, adapter-awareness correctness |
| Phase 29D beta gate hold/review | `docs/testing/phase29d-evidence-packet-review-beta-gate-redecision.md` | Evidence packet review; beta gate held pending more evidence | COMPLETED_HOLD_BETA_GATE | Evidence gaps acknowledged; beta gate not approved | Acknowledged; conservative hold documented | Evidence gap acknowledgment | BETA_READY, public production readiness |
| Phase 29E 3/5 targeted evidence threshold | `docs/testing/phase29e-targeted-missing-evidence-collection.md` | 3 of 5 targeted evidence items collected; 2 remained unresolved | COMPLETED_TARGETED_3_OF_5_PASS_WITH_LIMITATIONS | 2 of 5 evidence items unresolved; blocked lanes not resolved | Acknowledged; partial targeted collection documented | Partial targeted evidence basis | Full evidence coverage, guaranteed correctness |
| Phase 29F pass-to-audit-only re-decision | `docs/testing/phase29f-evidence-review-limited-beta-candidate-redecision.md` | Evidence review and re-decision; passed to Phase 30A claim/copy audit only | PASS_TO_PHASE30A_AUDIT_ONLY | Not LIMITED_BETA_CANDIDATE; not BETA_READY; passed to audit gate only | Acknowledged; audit-only advancement documented | Audit gate advancement | LIMITED_BETA_CANDIDATE, BETA_READY, public production readiness |
| Phase 30A claim/copy audit | `docs/testing/phase30a-limited-beta-candidate-claim-copy-boundary-audit.md` | Static grep and file read of all required claim surfaces; no blocking forbidden claim found; legacy RELEASE_NOTES claim documented | NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT | Static audit only; dynamically rendered routes not evaluated in live browser; legacy RELEASE_NOTES claim flagged for Phase 30B review | Acknowledged; claim/copy boundary verified as of Phase 30A | Local-first app copy, negative guardrails, conservative wording | Any newly introduced forbidden claim |
| Legacy release-notes claim review | `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md` | "AI-verified beta candidate: YES — SHIP" predates Phase 29C–29F evidence collection; qualified with "chưa được chứng nhận QA thủ công trên thiết bị thật" | LEGACY_CLAIM_BOUNDED_AS_HISTORICAL | Legacy claim from early project phases; not a current evidence claim; qualified with caveats; not newly introduced in Phase 30A or 30B; these files are not modified in Phase 30B | Bounded as historical/legacy; not a current evidence claim; existing caveats present; no new modification required | Legacy qualified claim with existing caveats; historical context | Any unqualified current "AI-verified beta candidate: YES — SHIP" without reference to evidence scope |
| Analytics versus telemetry clarification | `src/ui/analyticsPanel.js`, `src/quiz/analytics.js`, Phase 30B docs | "Analytics" in codebase refers to local learning analytics (study progress, daily recommendations, exam readiness indicators); no external analytics service found; no user telemetry | PASS_LOCAL_ANALYTICS_NOT_TELEMETRY | Terminology may be confusing to users expecting external analytics; Phase 30B documentation explicitly distinguishes local learning analytics from external user telemetry | Acknowledged; distinction documented; limited beta candidate documentation must state this clearly | Local learning analytics (local study progress, recommendations, exam readiness) labeled as local data | External user telemetry, analytics tracking service, approval of telemetry/analytics sending |
| Restore rehearsal browser lane blocked | Phase 29E evidence | Restore rehearsal browser execution was not completed in any phase | BLOCKED | No live browser restore rehearsal evidence; not resolved through Phase 30A | Acknowledged; no restore execution claim may be made | Restore from backup as a user-managed feature (with caveats) | Production restore readiness, guaranteed restore, any restore execution claim |
| Adapter-awareness browser lane blocked | Phase 29E evidence | Adapter-awareness browser execution was not completed in any phase | BLOCKED | No live browser adapter-awareness evidence; not resolved through Phase 30A | Acknowledged; no adapter-awareness production safety claim may be made | App uses browser localStorage; users should maintain backups | Production adapter-aware storage safety, storage driver correctness |
| localStorage diff limitation | Phase 29C–29F evidence | No before/after localStorage diffs captured in any phase | LIMITATION | Cannot verify localStorage correctness by diff evidence | Acknowledged; no localStorage correctness verification claim may be made | Data stored locally in browser; users should maintain backups | localStorage correctness verified by diff evidence |
| 100+ card stress test limitation | Phase 29C–29F evidence | No 100+ card stress test performed in any phase | LIMITATION | Cannot claim stress-tested readiness | Acknowledged; no stress-tested readiness claim may be made | App suitable for ordinary local study workflows | Stress-tested readiness, performance under very large libraries guaranteed |
| Rollback/removal limitation | Phase 29C–29F evidence | Only navigation verified; no full rollback/removal execution performed | LIMITATION | No live-data rollback tested | Acknowledged; no rollback safety claim may be made | Features can be disabled via settings | Rollback safety verified against live data |
| No real learner data boundary | Phase 29C–29F evidence | All evidence used generated/test data only | BOUNDARY | No real learner data evidence exists | Acknowledged; all evidence scope limited to generated/test data | Generated/test data evidence basis | Real-world data correctness, production readiness with real learner data |
| No restore execution boundary | All phases | No restore execution against production state in any phase | BOUNDARY | Restore function exists in UI; no production restore rehearsal executed | Acknowledged; restore execution not approved | Restore from backup as user-managed feature | Any claim that restore execution is safe or production restore rehearsal is approved |
| No sync/cloud/account/backend boundary | All phases | No sync, no cloud, no account, no backend in any phase | BOUNDARY | Not implemented | Acknowledged; guardrail confirmed | "No cloud sync", "no backend", "no account required" | Any sync/cloud/account/auth/backend feature |
| BETA_READY absence | All phases | No phase has approved BETA_READY | NOT_APPROVED | BETA_READY has not been reviewed or approved | Acknowledged; Phase 30B does not approve BETA_READY; Phase 30C is required for any BETA_READY decision | LIMITED_BETA_CANDIDATE decision (Phase 30B scope only) | BETA_READY, public production readiness, public release |

## Evidence rollup

Evidence accumulated across Phase 29C through Phase 30A:

1. **Phase 29C (2426 tests)**: Manual browser evidence run on generated/test data. 3 of 5 lanes completed. Restore rehearsal and adapter-awareness lanes BLOCKED. Basic navigation, import, and FSRS toggle flows observed.

2. **Phase 29D (2426 tests)**: Evidence packet review. Beta gate held. Specific missing evidence items identified.

3. **Phase 29E (2426 tests)**: Targeted missing evidence collection. 3 of 5 targeted items collected. Rollback navigation and localStorage inspection observed. Restore rehearsal and adapter-awareness remained BLOCKED.

4. **Phase 29F (2426 tests)**: Evidence review and re-decision. Passed to Phase 30A audit-only. Not LIMITED_BETA_CANDIDATE.

5. **Phase 30A (2426 tests)**: Static claim/copy boundary audit. No blocking forbidden claim found. Legacy RELEASE_NOTES claim documented. Analytics/telemetry distinction flagged.

Current test count: 2426 tests passing as of Phase 30A/30B baseline.

Evidence classification:
- Static file analysis: COMPLETE
- Generated/test data browser flows: PARTIAL (3 of 5 lanes)
- Restore rehearsal browser lane: BLOCKED
- Adapter-awareness browser lane: BLOCKED
- Before/after localStorage diffs: NOT COLLECTED
- 100+ card stress test: NOT PERFORMED
- Real learner data evidence: NONE
- Full rollback/removal execution: NOT PERFORMED

## Claim/copy audit rollup

Phase 30A static claim/copy boundary audit finding:

```text
NO_BLOCKING_FORBIDDEN_CLAIM_FOUND_IN_STATIC_AUDIT
```

All required claim surfaces reviewed:
- Landing page visible copy: PASS — "local-first quiz study app", no forbidden claims.
- Dashboard copy: PASS — local learning data wording, no forbidden claims.
- Library/import copy: PASS — import with preview and explicit confirm.
- Backup/export/restore copy: PASS_WITH_LIMITATIONS — restore UI present; no production readiness claim in copy.
- Settings copy: PASS — FSRS labeled "experimental".
- Release notes/PR notes: LEGACY_CLAIM_FINDING — legacy "AI-verified beta candidate: YES — SHIP" with qualifications; see legacy review section.
- User-facing docs: PASS — conservative, negative guardrails.
- Limited beta candidate wording: PASS — no active claim of LIMITED_BETA_CANDIDATE approved.
- AI/OCR/API-key/BYOK wording: PASS — explicit "no built-in AI" guardrails.
- Cloud/sync/account/auth/backend wording: PASS — only negative guardrails found.
- Data-loss guarantee wording: PASS — no "guaranteed" data safety found.
- Production restore wording: PASS_WITH_LIMITATIONS — restore feature present; no production readiness claim.
- Telemetry/analytics approval wording: PASS_WITH_LIMITATIONS — local study analytics, not external telemetry.

## Legacy release-notes claim review

Phase 30A identified a legacy claim in `RELEASE_NOTES.md` and `RELEASE_NOTES_V2.md`:

> "AI-verified beta candidate: YES — SHIP"

**Review finding**: This claim is from very early project phases, predating the current evidence-collection effort (Phase 29C–29F). It was written before:
- Phase 29C generated/test manual browser evidence run.
- Phase 29D beta gate hold and evidence review.
- Phase 29E targeted missing evidence collection (3 of 5).
- Phase 29F evidence review and re-decision.
- Phase 30A static claim/copy boundary audit.

**Qualification status**: The claim is qualified in the source documents with "chưa được chứng nhận QA thủ công trên thiết bị thật" (not certified by manual QA on real device). This qualification partially bounds the claim.

**Phase 30B resolution**: The claim is bounded as **historical/legacy** — it represents an early project assessment from before the current evidence-collection framework was established. It does not represent the current Phase 29C–30A evidence level. Phase 30B does not rewrite `RELEASE_NOTES.md` or `RELEASE_NOTES_V2.md` (these files are not modified in Phase 30B per the master spec). However, Phase 30B explicitly documents that the current evidence basis is the Phase 29C–30A evidence packet with documented open limitations.

**Current claim basis**: Limited beta candidate status, if approved, rests on the Phase 29C–30A evidence packet with explicit open limitations, not on the legacy "AI-verified beta candidate: YES — SHIP" claim.

## Analytics versus telemetry clarification

Phase 30A flagged the "analytics" terminology for clarification.

**Clarification**: In ShimeChamhoc v2.0.0-rc1, "analytics" refers exclusively to **local learning analytics** — study progress tracking, daily review recommendations, and exam readiness indicators computed from the user's local study history stored in browser localStorage. This is:
- Computed entirely locally in the user's browser.
- Never sent to any external service.
- Not user telemetry.
- Not an external analytics tracking service.
- Not behavioral tracking or user monitoring.

Files involved:
- `src/ui/analyticsPanel.js` — displays local study progress (no external calls).
- `src/quiz/analytics.js` — computes local study metrics from localStorage data.

**Distinction**: "Telemetry" in the context of this project's forbidden claims refers to external services that collect user behavior data, send events to a backend, or track user actions for monitoring purposes. ShimeChamhoc v2.0.0-rc1 has no such service. The existing "analytics" functionality is a local-only feature.

**Limited beta documentation must state**: "Analytics" in the app refers to local learning analytics (local study progress, recommendations) and is not external user telemetry or tracking.

## Open limitations

The following evidence limitations are carried forward from Phase 29F and Phase 30A and are explicitly documented as open:

1. **Restore rehearsal browser lane**: BLOCKED — no real browser restore rehearsal evidence collected in any phase.
2. **Adapter-awareness browser lane**: BLOCKED — no real browser adapter-awareness evidence collected in any phase.
3. **No before/after localStorage diffs**: Not collected in any phase.
4. **No 100+ card stress test**: Not performed in any phase.
5. **No full rollback/removal execution**: Navigation-only; no live-data rollback or removal tested.
6. **No real learner data**: All evidence used generated/test data only.
7. **Static audit limitation**: Phase 30A used static grep and file read only; dynamically rendered route content (runtime-composed dashboard copy, study room feedback text) was not evaluated in a live browser.
8. **Legacy release-notes claim**: "AI-verified beta candidate: YES — SHIP" in RELEASE_NOTES.md / RELEASE_NOTES_V2.md predates current Phase 29C–30A evidence level; bounded as historical/legacy in Phase 30B.
9. **Test count static**: Test count (2426) unchanged from Phase 29C. No new tests added in Phase 29D–30A or Phase 30B.

## Limited beta candidate decision options

The following three decision options are available:

### Option 1: HOLD_LIMITED_BETA_CANDIDATE

```text
PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: HOLD_LIMITED_BETA_CANDIDATE
```

Use when: Open gaps are too significant, copy fixes are unresolved, or evidence is insufficient. No LIMITED_BETA_CANDIDATE advancement.

### Option 2: NEEDS_MORE_EVIDENCE_OR_COPY_FIXES

```text
PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: NEEDS_MORE_EVIDENCE_OR_COPY_FIXES
```

Use when: Some criteria are met but specific evidence or copy fixes remain outstanding. Issues are bounded and resolvable.

### Option 3: PASS_LIMITED_BETA_CANDIDATE

```text
PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: PASS_LIMITED_BETA_CANDIDATE
```

Use when: All required criteria are met, all Phase 30A copy fixes are resolved, all open gaps are explicitly weighed and acknowledged, and accumulated evidence supports a limited beta candidate decision within documented scope limitations.

## Chosen limited beta candidate decision

```text
PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: PASS_LIMITED_BETA_CANDIDATE
```

## Decision rationale

The following criteria for PASS_LIMITED_BETA_CANDIDATE are met:

1. **Phase 30A merge confirmed**: Phase 30A is visible in origin/main (commit c75524e — Merge pull request #221 from Shime-68kk/phase30a-limited-beta-candidate-claim-copy-boundary-audit).

2. **Phase 30A claim/copy audit passed**: Static audit found no blocking forbidden claim on any user-visible surface. No newly introduced BETA_READY claim, no newly introduced guaranteed-data-safety claim, no forbidden wording.

3. **Phase 30A required copy fixes addressed**:
   - Legacy RELEASE_NOTES claim bounded as historical/legacy with explicit scope documentation. Not rewritten (per Phase 30B scope). Current evidence basis documented separately.
   - Analytics/telemetry distinction clarified in Phase 30B documentation (this document and the release summary).

4. **All Phase 29F/30A open gaps explicitly weighed**: All 9 open limitations documented in the gate decision table with status, limitation, decision impact, and claim boundaries. No gap is ignored.

5. **No blocking forbidden claims**: Phase 30A found no currently active forbidden claims. Phase 30B introduces no new runtime changes that could introduce forbidden claims.

6. **Conservative scope**: Decision is scoped to LIMITED_BETA_CANDIDATE only — for controlled limited beta preparation with generated/test-data-first instructions and explicit caveats.

7. **Evidence basis sufficient for limited candidate**: Phase 29C–30A evidence packet (partial browser evidence on generated/test data, static claim audit, conservative claim boundaries) is sufficient to support a limited beta candidate state with documented limitations — not BETA_READY, not public production readiness.

8. **No runtime changes**: Phase 30B is docs/validator/CI-only. No storage, source, or test changes.

The two BLOCKED lanes (restore rehearsal, adapter-awareness browser) do not block LIMITED_BETA_CANDIDATE because: (a) the restore and adapter-awareness features are not newly introduced claims in the copy, (b) the app's core study flow evidence was collected in Phase 29C–29E, and (c) LIMITED_BETA_CANDIDATE explicitly excludes production restore rehearsal, adapter-awareness production safety, and real learner data claims.

## Limited beta candidate definition

**PASS_LIMITED_BETA_CANDIDATE** means:

- The app has passed a formal limited beta candidate gate review under documented scope limitations.
- It is a **bounded candidate state** suitable for controlled limited beta preparation only.
- It is prepared for limited beta use with controlled users/testers, generated/test-data-first instructions, and explicit caveats.
- All evidence limitations are documented and carried forward.
- The decision is conservative and scope-limited.

It is **not**:
- BETA_READY.
- Public production readiness.
- A public release.
- A safety/data-loss guarantee.
- Approval for use without caveats or without generated/test-data-first instructions.
- Approval for restore execution against real learner data.
- Approval for production restore rehearsal.
- Stress-tested readiness.
- Any claim not directly supported by Phase 29C–30A evidence.

## What this decision supports

- LIMITED_BETA_CANDIDATE status for controlled limited beta preparation.
- Use with controlled users/testers who have received explicit caveats.
- Generated/test-data-first approach for any limited beta testing.
- Documentation that the app is a local-first quiz study tool with the described feature set.
- Continued development toward BETA_READY (Phase 30C required).
- Static claim/copy discipline maintained.
- All evidence limitations explicitly acknowledged.

## What this decision does not support

- BETA_READY.
- Public production readiness.
- Broad beta release without operator/user-facing caveats.
- Guaranteed data-loss prevention.
- Production restore rehearsal.
- Real learner data restore rehearsal.
- Runtime backup/export/restore behavior changes.
- Backup file format changes.
- Restore overwrite behavior changes.
- Storage migration.
- Sync/cloud/account/auth/backend.
- Telemetry/analytics (external user tracking).
- Built-in AI/OCR/API-key/BYOK behavior.
- Stress-tested readiness.
- Broad external real-user validation without evidence.
- Any claim not directly supported by Phase 29C–30A evidence reviewed.
- Phase 30C (Phase 30C is a separate gate not yet executed).

## Conditions for any limited beta use

If LIMITED_BETA_CANDIDATE status is used to prepare a limited beta:

1. Use only with controlled users/testers who have explicitly accepted caveats.
2. Use generated/test data only for any testing or demonstration. Do not use real learner data without resolving the real-learner-data evidence gap.
3. Provide explicit operator/user-facing caveats (see next section).
4. Do not represent the app as production-ready, BETA_READY, or safe for all data-loss scenarios.
5. Do not use as evidence of restore execution approval.
6. Do not use as evidence of adapter-awareness production safety.
7. Do not use without documenting all open limitations to any operator or tester.

## Required operator/user-facing caveats

Any limited beta use must include all of the following caveats:

1. This app is a **local-first quiz study app** and is not a production-certified, server-backed, or commercially supported application.
2. Data is stored in **browser localStorage**. Data may be lost if localStorage is cleared. **Users should maintain regular backups using the export feature.**
3. Backup/export/restore is a **user-managed feature**. There is no guaranteed data-loss prevention. Users are responsible for verifying their own backup integrity.
4. This is a **limited beta candidate** with documented evidence limitations. It is not BETA_READY and has not been certified for production use.
5. **No cloud sync**, **no backend**, **no account** required. App works entirely locally.
6. **Analytics** in the app refers to local learning progress (study history, recommendations) — it is not external user telemetry or tracking.
7. FSRS scheduling is **experimental** and may not be suitable for all users.
8. Performance under large card libraries (100+ cards) has not been stress-tested.
9. **Not for production use without operator verification.**

## Remaining blockers before BETA_READY

The following remain as blockers or open items before any BETA_READY decision can be made in Phase 30C:

1. **Restore rehearsal browser lane**: Must be unblocked or explicitly de-scoped with rationale.
2. **Adapter-awareness browser lane**: Must be unblocked or explicitly de-scoped with rationale.
3. **Before/after localStorage diffs**: Collecting diffs would strengthen the evidence basis.
4. **100+ card stress test**: Must be performed or explicitly de-scoped with rationale.
5. **Full rollback/removal execution**: Must be performed or explicitly de-scoped with rationale.
6. **Real learner data evidence**: Must be collected (with appropriate consent/privacy protections) or explicitly de-scoped.
7. **Legacy release-notes claim update**: If RELEASE_NOTES.md / RELEASE_NOTES_V2.md are to remain as current documentation, the legacy "AI-verified beta candidate: YES — SHIP" claim should be updated or qualified relative to Phase 29C–30A evidence level. This is a separate docs-cleanup phase concern.
8. **Phase 30C explicit gate**: Phase 30C must be separately executed and reviewed before any BETA_READY claim.

## Claim boundary

```text
ALLOWED under PASS_LIMITED_BETA_CANDIDATE:
- Limited beta candidate for controlled limited beta preparation (with caveats)
- Local-first quiz study app (local browser storage)
- No cloud sync, no backend, no account required
- Backup/export/restore as user-managed features (no guaranteed data-loss prevention)
- Manual AI workflow (copy prompt, paste result, no built-in AI)
- Local learning analytics (study progress, local heuristics, not external telemetry)
- Experimental FSRS scheduling toggle
- Vietnamese-first UX
- "beta.1" as version label only

NOT ALLOWED under PASS_LIMITED_BETA_CANDIDATE:
- BETA_READY or public production readiness
- Guaranteed data-loss prevention
- Production restore safety or any restore execution claim
- Stress-tested readiness
- Cloud/sync/account/auth/backend features
- External telemetry/analytics
- Built-in AI/OCR/API-key/BYOK
- Real learner data correctness guarantee
- Adapter-awareness production safety
- Any claim not supported by Phase 29C–30A evidence level
```

## Next recommended phase

```text
Next recommended phase: Phase 30C — Beta Ready Decision / Hold
Phase 30C is a separate beta-ready decision gate and is not automatically approved.
Phase 30B approves LIMITED_BETA_CANDIDATE only if the chosen decision token is PASS_LIMITED_BETA_CANDIDATE.
Phase 30B does not approve BETA_READY.
Phase 30B does not approve public production readiness.
Phase 30B does not approve guaranteed data-loss prevention.
Phase 30B does not approve restore execution.
Phase 30B does not approve production restore rehearsal.
Phase 30B does not approve real learner data restore rehearsal.
Phase 30B does not approve runtime backup/export/restore changes.
Phase 30B does not approve backup file format changes.
Phase 30B does not approve restore overwrite behavior changes.
Phase 30B does not approve storage migration.
Phase 30B does not approve sync/cloud/account/auth/backend.
Phase 30B does not approve telemetry/analytics.
Phase 30B does not approve built-in AI/OCR/API-key/BYOK behavior.
```
