# ShimeChamhoc v2

ShimeChamhoc v2 is a React/Vite, local-first learning app for multi-subject study. It helps learners turn local study content into reviewed quiz drafts, focused Study Room sessions, and browser-based progress tracking without claiming cloud-backed or production-certified status.

Current beta label: **v2.0.0-beta-ai.1**

Release status: **release candidate with Phase 8H Ubuntu manual smoke passed**. This is not a hosted production/security certification or broad device certification; users should still verify the target environment before wider release.


## Final RC audit / release tag readiness

Final release-candidate audit documentation exists at [`docs/final-rc-audit.md`](docs/final-rc-audit.md). It summarizes the audited Phase 8W baseline, current RC capabilities and caveats, EduGen and manual AI boundaries, scoped Ubuntu/manual/E2E evidence, and release tag readiness checklist.

This audit does not create a release tag, publish a GitHub release, certify production readiness, certify security posture, or claim GitHub Actions / CI Green Verification unless a current CI run is actually verified.

## Public release and deployment readiness


## Current RC capabilities

This release-candidate documentation locks the current public positioning for Shime Quiz:

- Local-first quiz study app with browser-local study data and no backend account requirement.
- Library **Dùng quiz mẫu** demo sample quickstart for trying a bundled local sample.
- Library first-run hint and empty-state onboarding that point users to safe first actions.
- Dashboard first-run onboarding that sends empty-data users to Library before they start studying.
- JSON/CSV import, paste text/Markdown draft import, and local `.txt`/`.md` draft import.
- PDF/DOCX/PPTX/ZIP draft import only through a separately configured, browser-reachable EduGen File Processor service.
- Advisory quiz draft quality review before save, including duplicate-choice style warnings where applicable.
- Manual AI prompt/export and manual pasted-output review/import hardening.
- Public demo sample pack plus demo, deployment, screenshot, and visual-asset readiness docs.

The demo sample quickstart and import paths keep the safety boundary: users review validation, advisory quality review, preview, and confirm-save before local storage is updated. Shime does not provide built-in AI quiz generation, external AI/API integration, API key/BYOK support, OCR, backend/cloud sync, bundled EduGen, or production/security certification.

- Public release notes: [`docs/public-release-notes.md`](docs/public-release-notes.md)
- Deployment readiness notes: [`docs/deployment-readiness.md`](docs/deployment-readiness.md)

Current supported import paths include JSON/CSV import, paste text/Markdown draft import, local `.txt`/`.md` draft import, and PDF/DOCX/PPTX/ZIP draft import through a separately configured EduGen service. EduGen is not bundled into Shime; hosted or frontend-only deployments need a browser-reachable `VITE_FILE_PROCESSOR_URL` for document import.

AI-related support is manual only: Shime can help users export a prompt and review pasted AI output, but it does not provide built-in AI quiz generation, external AI/API calls, API key/BYOK support, OCR, backend accounts, authentication, or cloud sync.



## Public demo sample pack

Use [`docs/demo-samples/README.md`](docs/demo-samples/README.md) for small synthetic JSON, CSV, text/Markdown, and manual AI paste-back samples that exercise supported demo paths without relying on external services. The samples preserve the current boundaries: EduGen remains separate for document import, and AI support remains manual/workflow-only.

## In-app demo sample quickstart

The Library includes a local **Dùng quiz mẫu** quickstart so reviewers and new users can load a safe sample quiz without uploading files. The quickstart only creates an import preview: users still review validation results, advisory quality review, and explicitly confirm save before anything is stored locally. It does not call AI/API, does not use EduGen, and does not auto-save or reset existing data.

A small first-run hint beside the quickstart helps new users discover this path. The hint does not auto-load the sample, does not auto-save, does not add storage keys, does not call AI/API, and does not require EduGen; it only explains that the user must continue through preview, review, and confirm-save.

When the Library has no saved quiz items, an empty-state guide points new users to safe first actions: use the local demo sample, import JSON/CSV, paste text/Markdown, use the manual AI prompt/export copy-paste workflow, or configure a separate EduGen service for document import. This empty state is guidance only: it does not auto-load, auto-save, bypass preview/review/confirm-save, call AI/API, or require EduGen.

The Dashboard also includes a first-run getting-started callout when there is no meaningful saved library or study data. It points users to the Library as the safe start location for the demo sample quickstart, JSON/CSV import, text/Markdown import, manual AI copy/paste workflow, and separately configured EduGen document import. The callout does not auto-load, auto-save, reset storage, call AI/API, or bypass preview/review/confirm-save.


## Local E2E verification

Onboarding E2E smoke coverage exists for the Dashboard first-run onboarding, Library empty-state onboarding, and **Dùng quiz mẫu** quickstart safety path. See [`docs/local-e2e-verification.md`](docs/local-e2e-verification.md) for Ubuntu Playwright Chromium setup and the commands `npm run test:e2e:smoke` and `npm run test:e2e:onboarding`.

Automated onboarding E2E passed on the local Ubuntu run after Playwright Chromium was installed. Future pass claims require actual successful command output in the target environment; missing Chromium should be reported as environment-blocked, not as an app failure.

## GitHub Actions / CI Green Verification

CI green verification guidance exists at [`docs/ci-green-verification.md`](docs/ci-green-verification.md). It documents the expected GitHub Actions release-readiness workflow: `npm ci`, `npm run build`, the full static validator chain, Playwright Chromium setup with `npx playwright install --with-deps chromium`, `npm run test:e2e:smoke`, and `npm run test:e2e:onboarding`.

Do not claim GitHub Actions CI is green unless an actual GitHub Actions run passes for the relevant branch and commit. Phase 8Y does not create a release tag, publish a GitHub release, certify hosted production readiness, or certify security readiness.


## Version / release tag decision

Version and release tag options are documented in [`docs/release-tag-decision.md`](docs/release-tag-decision.md). The current package version is captured there, along with RC tag options such as keeping the existing package version, using a future `v2.0.0-rc1` tag, using a future `v2.0.0-rc2` tag if the user wants a new RC after the final audit/CI-readiness phases, or keeping beta-style tag continuity.

Phase 9A does not change `package.json`, create a git tag, publish a GitHub release, or certify production/security readiness. The next release-finalization step is Phase 9B — GitHub Release Draft.

## GitHub release draft

GitHub Release draft content is documented in [`docs/github-release-draft.md`](docs/github-release-draft.md). It provides later-publication release notes, draft title/tag placeholders, capability notes, install/run commands, validation expectations, EduGen and manual AI boundaries, and a pre-publish checklist.

Phase 9B does not change the package version, create a release tag, publish a GitHub release, certify production readiness, or certify security readiness. The next release-finalization step is Phase 9C — Release Package / Source Archive Verification.

## Suggested demo flow

For a launch or reviewer walkthrough, use the demo order in [`docs/demo-script.md`](docs/demo-script.md): Dashboard, Library, import, advisory draft quality review, Study Room, today-plan completion guard, manual AI prompt/export, and the EduGen document import caveat.

## Screenshots to capture

For README or public documentation screenshots, use [`docs/screenshot-checklist.md`](docs/screenshot-checklist.md). The checklist highlights recommended Dashboard, Library, import preview, quality review, Study Room, manual AI, EduGen, and release-doc link screenshots while avoiding unsupported AI/OCR/API/cloud implications.

## Screenshots / Demo assets

README and public screenshots are prepared through guidance/checklists, not committed as image files in this phase. Use [`docs/screenshot-checklist.md`](docs/screenshot-checklist.md), [`docs/visual-asset-guidance.md`](docs/visual-asset-guidance.md), and [`docs/demo-samples/README.md`](docs/demo-samples/README.md) when capturing future visual assets. Do not reference screenshot image files until those files are actually added and reviewed.

## What is included in v2

- `/dashboard`: learning overview, today journey, goal progress, analytics, mastery, review schedule, Smart Practice, and study history.
- `/library`: local learning library, JSON/CSV import preview, library export, and v2 backup/restore.
- `/study-room`: focus-mode item study for multiple-choice, short-answer, and flashcard items.
- Local persistence for library data, study drafts, study history, spaced repetition schedule, recommendation feedback, study goal, and plan progress.
- Full, redacted, and progress-only v2 backup export modes.

## Run locally

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4173
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Import JSON or CSV

Open **Thư viện** and choose a local `.json` or `.csv` file. Files are read in the browser and are not uploaded.

Supported v2 data includes:

- `subjects`
- `topics`
- `items`

Supported item types:

- `multiple_choice`
- `short_answer`
- `flashcard`

CSV import supports common columns such as `subject`, `topic`, `type`, `prompt`, `choices`, `correctAnswer`, `answer`, `front`, `back`, `explanation`, `tags`, `difficulty`, and `source`. The preview validates data before import. Invalid data is blocked; warnings can still allow import.

## Local persistence

v2 stores learning data locally in the browser with versioned localStorage keys:

- `shimeV2LibraryDataV1`
- `shimeV2StudyDraftV1`
- `shimeV2StudyHistoryV1`
- `shimeV2ReviewScheduleV1`
- `shimeV2RecommendationFeedbackV1`
- `shimeV2StudyGoalV1`
- `shimeV2StudyPlanProgressV1`

There is no account, cloud sync, backend, or cross-device sync in this beta build.

## Study Room

The Study Room renders v2 learning items locally:

- multiple choice: choose an answer and check it;
- short answer: type an answer and check it with simple normalized matching;
- flashcard: reveal the answer side.

Study Room state can restore a local draft after refresh. Finishing a session creates a local result summary, saves v2 study history, and updates the local review schedule. This does not use the old v1 quiz engine.

## Dashboard learning flow

The Dashboard includes:

- **Hành trình hôm nay**: unified recommendation, plan steps, and daily goal summary;
- **Mục tiêu học tập**: local daily target and focus mode;
- basic analytics from v2 study history;
- basic mastery insights;
- local spaced repetition schedule and due review summary;
- Smart Practice and due-review entry points;
- recent study history and detail view.

These features are local heuristics. They are not AI/ML predictions and do not guarantee exam results.

## Backup and restore

Open **Thư viện** and use **Sao lưu dữ liệu** / **Khôi phục dữ liệu**.

Backup modes:

- **Sao lưu đầy đủ**: includes library content, answer keys, and local learning state. This is the only mode that supports full restore in v2.0.0-beta-ai.1.
- **Sao lưu đã ẩn đáp án**: removes direct answer fields where practical. It helps reduce sharing risk but is not encryption and cannot be restored as a full answer-key backup.
- **Sao lưu tiến trình**: excludes library question content and answer keys. It requires the matching library later to be meaningful and is not restored as a full backup in this beta candidate.

Restore validates the file, asks for confirmation, and writes only recognized v2 keys. Redacted and progress-only backups are blocked from full restore with a Vietnamese explanation.

## Deployment and PWA note

v2.0.0-beta-ai.1 is deployable as a static Vite app. The release includes Vietnamese web app manifest metadata and a safe `sw.js` file for compatibility with origins that previously used a service worker, but the React v2 entry does not actively register a new service worker in this beta. Treat offline/PWA cache behavior as best-effort only unless verified on the target staging host.

See [`DEPLOY_V2.md`](DEPLOY_V2.md) for Netlify, Vercel, Cloudflare Pages, GitHub Pages, SPA fallback, and cache troubleshooting notes.

## Local security limitation

ShimeChamhoc v2 is a static, local-first app. Offline scoring requires answer data to exist in the browser. Data and answers can exist in localStorage, in memory, imported files, full backup JSON, and browser DevTools.

Do not use this static/offline mode as an absolute anti-cheat system. True answer-key protection or server-side scoring requires a future backend architecture. Redacted/progress-only backups reduce sharing risk but are not encryption.

## Migration from v1

v2 is a new React/Vite architecture. Stable v1 data may not automatically migrate unless a v2 import/restore flow explicitly supports it. Keep v1 backups separately before testing v2.

The legacy vanilla source remains in the repository during the transition, but v2 uses `src/main.jsx` and React routes.

## QA and release docs

- v2 release checklist: [`RELEASE_QA_V2.md`](RELEASE_QA_V2.md)
- public release notes: [`docs/public-release-notes.md`](docs/public-release-notes.md)
- deployment readiness notes: [`docs/deployment-readiness.md`](docs/deployment-readiness.md)
- final RC audit: [`docs/final-rc-audit.md`](docs/final-rc-audit.md)
- CI green verification guide: [`docs/ci-green-verification.md`](docs/ci-green-verification.md)
- version / release tag decision: [`docs/release-tag-decision.md`](docs/release-tag-decision.md)
- v2 deployment guide: [`DEPLOY_V2.md`](DEPLOY_V2.md)
- v2 release notes: [`RELEASE_NOTES_V2.md`](RELEASE_NOTES_V2.md)
- v2 data model notes: [`docs/V2_DATA_MODEL.md`](docs/V2_DATA_MODEL.md)
- migration boundaries: [`docs/MIGRATION_BOUNDARIES.md`](docs/MIGRATION_BOUNDARIES.md)
- design system notes: [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)

## Known limitations

- No backend, account sync, encryption, notifications, or calendar integration.
- Not manually QA-certified on physical devices.
- Full real-browser/manual/device staging smoke remains required before wider release.
- Redacted/progress-only backups are safer export options but are not full restore modes yet.
- Direct reload of special Study Room modes may fall back to the default Study Room view.
- Current learning models are simple local heuristics, not AI.
- Browser localStorage quota can limit very large libraries or long histories.


## Release package cleanliness

Release package/source archive cleanliness guidance is documented in [`docs/release-package-cleanliness.md`](docs/release-package-cleanliness.md). It documents generated/local artifacts that should not be committed before a tag or GitHub Release. Phase 9C does not publish a release package, create a release tag, publish a GitHub Release, change package version, or certify production/security readiness.

## Release tag / publish checklist

Final release tag and publish steps are documented in [`docs/release-tag-publish-checklist.md`](docs/release-tag-publish-checklist.md). The checklist covers pre-tag review, validation evidence, source archive cleanliness, GitHub Release draft review, safe example tag commands, stop conditions, and claims control. Phase 9D does not change the package version, create a release tag, publish a GitHub Release, publish a release package, or certify production/security readiness. The existing Vite chunk-size warning is documented as non-blocking when `npm run build` still completes successfully.

## Import regression smoke checklist

Manual import surface regression smoke guidance is documented in [`docs/import-regression-smoke.md`](docs/import-regression-smoke.md). The checklist covers JSON, CSV, paste text/Markdown, local `.txt/.md`, public demo sample pack, **“Dùng quiz mẫu”**, manual AI output paste/import, EduGen unavailable behavior, and the separately configured EduGen PDF/DOCX/PPTX/ZIP path. Phase 9E does not change import/parser behavior, does not claim manual import regression passed without an actual tester/user run, does not claim EduGen document import passed without a separately configured service, and does not create or publish a release.

## Backup / restore regression smoke

Backup/restore manual regression smoke guidance is documented in [`docs/backup-restore-regression-smoke.md`](docs/backup-restore-regression-smoke.md). The checklist covers export backup, restore backup, Library/quiz data preservation, study history/progress, review schedule, recommendation feedback, study goal/plan progress, malformed backup handling, and local-first/no-backend boundaries. Phase 9F does not change backup/restore behavior, storage schema, package version, or release status, and it does not claim manual backup/restore regression passed without an actual tester/user run.

Study Room / Dashboard learning flow smoke guidance is documented in [`docs/study-dashboard-regression-smoke.md`](docs/study-dashboard-regression-smoke.md). The checklist covers saved quiz setup, Library-to-Study-Room flow, answer handling, study history/progress, review schedule/SRT, Dashboard progress, recommendations, study goal/plan progress, local-first boundaries, and evidence rules. Phase 9G does not change Study Room or Dashboard runtime behavior and does not claim manual Study Room/Dashboard regression passed without an actual tester/user run.


## Accessibility / keyboard smoke

Accessibility and keyboard manual smoke guidance is documented in [`docs/accessibility-keyboard-smoke.md`](docs/accessibility-keyboard-smoke.md). The checklist covers keyboard navigation, focus visibility, reachable controls, import surfaces, Library, **“Dùng quiz mẫu”**, preview/review/confirm-save, Study Room, Dashboard, backup/restore controls, readable labels, visible validation/error messages, EduGen unavailable guidance, and manual AI caveats. Phase 9H does not change accessibility implementation, keyboard/focus behavior, runtime app behavior, package version, or release status, and it does not claim WCAG compliance, accessibility certification, or manual accessibility/keyboard smoke pass without an actual tester/user run.

## Public landing / root route polish

Public landing page guidance is documented in [`docs/public-landing-page.md`](docs/public-landing-page.md). Phase 10A adds a clearer root route introduction for new visitors, with CTAs to Dashboard, Library, Study Room, and the Library demo quickstart path. It does not add auth/login, backend/cloud sync, EduGen bundling, built-in AI generation, external AI/API calls, OCR, package version changes, release tag creation, or GitHub Release publishing. SEO/Open Graph metadata remains a separate future phase.

## SEO / social preview metadata

Basic static SEO/social preview metadata is documented in [`docs/social-preview-metadata.md`](docs/social-preview-metadata.md). Phase 10B adds `index.html` title/description, Open Graph and Twitter/social card tags, and a static preview image for sharing. This does not claim SEO optimization success, search ranking improvement, all crawler rendering, production/security/accessibility certification, release tag creation, or GitHub Release publication.

Direct-route / SPA fallback guidance is documented in [`docs/direct-route-spa-fallback.md`](docs/direct-route-spa-fallback.md). Phase 10C audits root/direct route expectations for the React/Vite SPA and documents Vercel/Netlify/static-host fallback behavior. It does not add auth/login, middleware, backend/cloud sync, SSR, package version changes, release tag creation, GitHub Release publishing, or all-crawlers-render claims.
