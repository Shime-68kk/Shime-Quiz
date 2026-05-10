# Final Main Verification / Release Authorization Packet

## Purpose of Phase 10Q

Phase 10Q creates the **Final Main Verification / Release Authorization Packet** for ShimeChamhoc v2 / Shime Quiz. It is a documentation, static-validator, and CI registration phase only.

This packet is intended to help the user decide whether to proceed with explicit, user-approved release actions later. It does **not** execute a release, create a package, create or push a tag, publish a GitHub Release, upload release assets, change package version, or change runtime app behavior.

## Current baseline

- Shime Quiz is completed/merged through Phase 10P.
- Final release execution checklist docs exist.
- Release package assembly plan docs exist.
- GitHub Release publication plan docs exist.
- Release tag creation plan docs exist.
- Manual evidence run pack docs exist.
- Release candidate tag/publish gate docs exist.
- Final public release readiness re-audit docs exist.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been created.
- Release package has not been published.
- Package version remains unchanged unless explicitly approved by the user.

## Latest main verification checklist

Use this checklist on latest `main` before any release action:

1. `git checkout main`
2. `git pull origin main`
3. Confirm clean working tree with `git status --short`.
4. Confirm package version in `package.json`.
5. Run `npm ci`.
6. Run `npm run build`.
7. Run the full static validator chain.
8. Optionally run E2E smoke/onboarding if Chromium available.
9. Optionally run the manual evidence pack.
10. Confirm generated artifacts are absent from the source package.
11. Confirm no secrets, credentials, private keys, local user data, or backups are present.
12. Confirm release notes, README, GitHub Release draft, and package plans preserve allowed/forbidden claims.

## Authorization packet

Before release execution, record:

- release candidate state
- package version
- validation status
- known Vite/Rolldown chunk-size warning
- known evidence gaps
- release actions still pending
- explicit approvals required

The known Vite/Rolldown chunk-size warning is documented as non-blocking when `npm run build` succeeds. It has not been suppressed, and no performance optimization certification is claimed.

## Release actions still pending

These actions remain pending and must be explicitly approved by the user before execution:

1. Choose final tag name.
2. Create annotated tag.
3. Assemble release package.
4. Publish GitHub Release.
5. Upload release assets.
6. Record final release evidence.

## Evidence gaps

Known evidence gaps remain unless separately run and documented:

- screenshots not captured unless separately done
- manual mobile UX smoke not run unless separately done
- configured EduGen import smoke not run unless separately done
- cross-device restore smoke not run unless separately done
- Lighthouse/Core Web Vitals not measured unless separately done
- E2E may be environment-blocked if Chromium unavailable

## Approval gates

- Tag creation requires explicit user approval.
- Package assembly requires explicit user approval.
- GitHub Release publication requires explicit user approval.
- Asset upload requires explicit user approval.
- Package version change requires explicit user approval.

## Allowed claims

After Phase 10Q, it is safe to claim:

- final main verification / release authorization packet exists
- release authorization checklist exists
- release actions remain gated by explicit user approval
- Phase 10P final release execution checklist docs exist
- release package assembly, GitHub Release publication, tag creation, manual evidence, tag/publish gate, and final re-audit docs exist

## Forbidden claims

Do not claim:

- final release executed
- release package created
- release package published/uploaded
- GitHub Release published
- release tag created
- tag pushed
- package version changed
- production/security/accessibility/performance certification
- built-in AI generation
- external AI/API integration
- API key/BYOK support
- OCR
- EduGen bundled into Shime
- frontend-only document conversion
- backend/cloud/account sync
- automatic cross-device sync
- encrypted backups unless implemented
- screenshots captured unless actual files exist
- mobile UX passed unless actual run evidence exists
- configured EduGen import passed unless actual configured run exists
- cross-device restore passed unless actual run exists
- Lighthouse/Core Web Vitals pass unless measured

## Recommended next step

Recommended next step: user-approved final release execution, or stop planning and keep the release candidate unpublished.

## Phase 10R follow-up

See [Release Candidate Freeze / Final Decision Memo](release-candidate-freeze-final-decision.md). The freeze memo confirms the planning track is complete, no release action was executed, and final release/package/tag/GitHub Release actions remain gated by explicit user approval.

## Phase 10S manual evidence results log note

Future optional evidence results may be recorded in [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md). The log is a template only: Phase 10S does not execute manual evidence, capture screenshots, claim mobile UX/EduGen/cross-device/Lighthouse PASS, create a tag, publish a GitHub Release, create or publish a release package, change package version/dependencies, or change runtime app behavior.

## Phase 10T manual evidence execution checklist

Manual evidence execution guidance is documented in [`docs/manual-evidence-execution-checklist.md`](manual-evidence-execution-checklist.md). Phase 10T adds a checklist/evidence capture guide only: no manual evidence was executed, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no E2E pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, no release package was created or published, package version/dependencies remain unchanged, runtime app behavior was not changed, and no production/security/accessibility/performance certification is claimed. Future results should be copied into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after actual evidence exists.


## Phase 11A cross-device transfer UX decision note

The cross-device transfer UX decision plan is available at [`docs/cross-device-transfer-ux-decision.md`](cross-device-transfer-ux-decision.md). It is a planning document only and does not alter final release authorization: current portability remains manual backup/export/import; no QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, runtime behavior change, package/dependency change, release package, release tag, or GitHub Release was added.

