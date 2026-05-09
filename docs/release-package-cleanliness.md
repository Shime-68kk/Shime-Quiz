# Release Package / Source Archive Verification

## Purpose of Phase 9C

Phase 9C documents release package cleanliness and source archive verification expectations before any release tag or GitHub Release is created. It gives maintainers a conservative checklist for reviewing the repository state, generated artifacts, local files, and release-readiness evidence before moving to Phase 9D — Release Tag / Publish Checklist.

This phase is documentation/static-validator/CI registration only. It does not produce or publish an actual release package.

## Current baseline

The current repository baseline is completed/merged through Phase 9B.

Known release-readiness documents exist:

- Final RC audit docs: [`docs/final-rc-audit.md`](final-rc-audit.md)
- CI green verification docs: [`docs/ci-green-verification.md`](ci-green-verification.md)
- Release tag decision docs: [`docs/release-tag-decision.md`](release-tag-decision.md)
- GitHub release draft docs: [`docs/github-release-draft.md`](github-release-draft.md)

Current release state:

- Release tag has not been created.
- GitHub release has not been published.
- No release package published in Phase 9C.
- Package version is not changed in this phase.
- Dependencies are not changed in this phase.
- No production/security certification is claimed.

## Source archive/package cleanliness goals

A release source archive should be reproducible from tracked source, docs, scripts, workflow files, and lockfiles. It should not include generated build output, dependency folders, browser automation artifacts, local logs, environment files, or secrets.

This checklist is intended for source archive/package hygiene. It does not replace GitHub Actions, E2E evidence, manual browser smoke, release tag approval, or GitHub Release publishing approval.

## Files and directories that must not be committed

Before a release tag or publish step, verify that these are not committed as new tracked release artifacts:

- `node_modules/`
- `dist/`
- `test-results/`
- `playwright-report/`
- `coverage/`
- `.env`
- `.env.*`
- local temp files
- `FETCH_HEAD`
- `.DS_Store`
- debug logs
- npm/yarn/pnpm error logs
- secret/key files and other secrets

Do not commit API credentials, tokens, private keys, or local machine configuration files.

## Files that should remain tracked

The release source archive should retain project files that are intentionally part of the repository:

- source files
- docs
- public demo sample files
- scripts/validators
- GitHub workflow files
- `package.json`
- `package-lock.json` if already tracked

## Release cleanliness checklist

Before a release tag or publish step, confirm:

- `git status --short` is clean before tag/publish.
- Main branch is up to date.
- No generated build output is committed unless intentionally tracked.
- No dependency folders are committed.
- No Playwright artifacts are committed.
- No coverage artifacts are committed.
- No local environment/secrets are committed.
- Docs links are reviewed.
- README/release docs are reviewed.
- Package version/tag decision is reviewed.
- GitHub release draft is reviewed.
- Static validators pass.
- `npm ci` passes.
- `npm run build` passes.
- Full validator chain passes.
- E2E evidence is available if claiming E2E pass.

## Suggested review commands

Run dry-run and inspection commands before using any destructive cleanup command:

```bash
git status --short
git clean -ndX
git clean -nd
find . -name ".env*" -print
find . \( -name "playwright-report" -o -name "test-results" -o -name "coverage" \) -print
npm ci
npm run build
# Run the full validator chain registered in .github/workflows/e2e-smoke.yml
```

Important warning: do not run destructive `git clean` commands without reviewing dry-run output first. Prefer `git clean -ndX` and `git clean -nd` before any cleanup. Only remove files after confirming they are safe to delete.

## Claims control

Safe claims after Phase 9C:

- Release package cleanliness docs exist.
- Source archive cleanliness checklist exists.
- Release package/source archive verification expectations are documented for later release steps.

Unsafe claims after Phase 9C:

- Do not claim a release package was published.
- Do not claim a release tag was created.
- Do not claim a GitHub release was published.
- Do not claim the package version was changed.
- Do not claim production certification.
- Do not claim security certification.
- Do not claim built-in AI quiz generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR support.
- Do not claim EduGen is bundled into Shime.
- Do not claim backend/cloud sync.

## Next step

After Phase 9C is accepted, the recommended next phase is **Phase 9D — Release Tag / Publish Checklist**. Phase 9D should remain a checklist/decision gate unless the user explicitly asks to create a tag or publish a GitHub Release.

## Phase 9D release tag / publish checklist reference

After source archive cleanliness is reviewed, use [`docs/release-tag-publish-checklist.md`](release-tag-publish-checklist.md) as the final decision gate before any tag or GitHub Release publishing action. Phase 9D documents pre-tag checks, validation requirements, stop conditions, and example tag commands as examples only. It does not create a release tag, publish a GitHub Release, publish a release package, or change package version.

## Phase 10K release candidate tag/publish gate

The release candidate tag/publish gate is documented in [`release-candidate-tag-publish-gate.md`](release-candidate-tag-publish-gate.md). It records that no release tag has been created, no GitHub Release has been published, no release package has been published, and explicit user approval is required before any tag or publish action. Known evidence gaps and allowed/forbidden claims remain documented.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) may produce optional evidence artifacts. Do not commit generated artifacts, private backups, reports, screenshots, or test output unless intentionally reviewed and allowed.

## Phase 10M release tag creation plan

Use [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md) before any tag command. Release package publication remains separate and is not claimed by the plan.
