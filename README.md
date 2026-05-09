# ShimeChamhoc v2 / Shime Quiz

ShimeChamhoc v2 is a **React + Vite local-first quiz study app**. It helps you import quiz content, review it in the Library, study in Study Room, and track browser-local learning progress on the Dashboard.

- No account is required.
- Data stays in your browser storage unless you export or share a backup.
- Current package version: `2.0.0-beta-ai.1`.
- Release status: release-candidate/beta preparation docs exist, but no release tag or GitHub Release has been published.

## Quick start

```bash
npm ci
npm run dev
```

Open the local app shown by Vite. For a production build preview:

```bash
npm run build
npm run preview
```

## Try it quickly

Open the app and go to **Thư viện / Library**. Use **Dùng quiz mẫu** to load a bundled local demo sample into the existing preview, validation, advisory quality review, and confirm save flow.

The demo quickstart does not auto-load, does not auto-save, does not call AI/API, and does not require EduGen. You still review the preview and explicitly confirm save before anything is saved locally.

## Supported import paths

Shime supports these local-first import surfaces:

- JSON quiz data
- CSV quiz data
- pasted text/Markdown draft content
- local `.txt` / `.md` draft files
- PDF/DOCX/PPTX/ZIP draft import only through a separately configured, browser-reachable EduGen/File Processor service

EduGen/File Processor is not bundled into Shime. Frontend-only hosting alone does not provide PDF/DOCX/PPTX/ZIP document conversion. See [`docs/edugen-boundary-polish.md`](docs/edugen-boundary-polish.md) for deployment copy and evidence rules.

## Current RC capabilities

See the concise sections below for the current release-candidate capabilities and boundaries.

## Learning features

The Dashboard first-run getting-started callout appears for empty local study data and points users to Library safe start options without auto-loading or auto-saving content.

The Library empty-state onboarding appears when the Library has no saved quiz items. It points users to the demo sample / **Dùng quiz mẫu**, JSON/CSV import, text/Markdown import, manual AI copy-paste workflow, and separately configured EduGen service for document import.

- **Library** for saved quiz content and import/backup/restore surfaces
- **Study Room** for local study sessions
- **Dashboard** for local progress, today-plan surfaces, review cues, and recommendations
- Advisory quiz draft quality review before save
- Duplicate multiple-choice choice ID detection in quality review where applicable
- Backup/restore for local data portability

Recommendations and quality review are advisory local heuristics, not guarantees of correctness, mastery, or exam results.

## Local-first privacy model

Shime is designed as a static, local-first browser app:

- no backend/auth/cloud sync
- no account required
- no cross-device sync service
- browser-local storage for app data
- backup export/import for user-controlled portability

Local/browser storage is not a secure server-side vault. Do not use this app as an anti-cheat or production security system.

## Manual AI workflow boundary

Shime includes manual AI workflow support only:

- manual prompt/export workflow
- manual paste/import of AI output
- advisory review/import hardening for pasted output

Shime does not provide built-in AI generation, external AI/API calls, API key/BYOK support, or OCR.

## Public polish docs

- Public landing/root route polish: [`docs/public-landing-page.md`](docs/public-landing-page.md)
- SEO/Open Graph/social preview metadata: [`docs/social-preview-metadata.md`](docs/social-preview-metadata.md)
- Direct-route / SPA fallback audit: [`docs/direct-route-spa-fallback.md`](docs/direct-route-spa-fallback.md)
- Screenshot asset checklist: [`docs/screenshot-asset-pack.md`](docs/screenshot-asset-pack.md)

Actual screenshot image files are not included yet; the screenshot checklist exists for future capture. README does not claim screenshots are available until real reviewed image files are added.

## Release and readiness docs

- Demo walkthrough script: [`docs/demo-script.md`](docs/demo-script.md)
- Public demo sample pack: [`docs/demo-samples/README.md`](docs/demo-samples/README.md)
- Screenshot checklist: [`docs/screenshot-checklist.md`](docs/screenshot-checklist.md)
- Visual asset guidance: [`docs/visual-asset-guidance.md`](docs/visual-asset-guidance.md)
- Public release notes: [`docs/public-release-notes.md`](docs/public-release-notes.md)
- Deployment readiness: [`docs/deployment-readiness.md`](docs/deployment-readiness.md)
- Final RC audit: [`docs/final-rc-audit.md`](docs/final-rc-audit.md)
- Local E2E verification guide: [`docs/local-e2e-verification.md`](docs/local-e2e-verification.md)
- CI green verification guide: [`docs/ci-green-verification.md`](docs/ci-green-verification.md)
- Version / release tag decision: [`docs/release-tag-decision.md`](docs/release-tag-decision.md)
- GitHub Release draft: [`docs/github-release-draft.md`](docs/github-release-draft.md)
- Release package cleanliness: [`docs/release-package-cleanliness.md`](docs/release-package-cleanliness.md)
- Release tag / publish checklist: [`docs/release-tag-publish-checklist.md`](docs/release-tag-publish-checklist.md)
- Import regression smoke checklist: [`docs/import-regression-smoke.md`](docs/import-regression-smoke.md)
- Backup/restore regression smoke checklist: [`docs/backup-restore-regression-smoke.md`](docs/backup-restore-regression-smoke.md)
- Study Room / Dashboard regression smoke checklist: [`docs/study-dashboard-regression-smoke.md`](docs/study-dashboard-regression-smoke.md)
- Accessibility / keyboard smoke checklist: [`docs/accessibility-keyboard-smoke.md`](docs/accessibility-keyboard-smoke.md)
- Full QA/release checklist: [`RELEASE_QA_V2.md`](RELEASE_QA_V2.md)
- README rewrite/split guide: [`docs/readme-public-facing-guide.md`](docs/readme-public-facing-guide.md)
- Performance / bundle-size audit: [`docs/performance-bundle-audit.md`](docs/performance-bundle-audit.md)
- Mobile UX smoke checklist: [`docs/mobile-ux-smoke.md`](docs/mobile-ux-smoke.md)
- EduGen/File Processor boundary polish: [`docs/edugen-boundary-polish.md`](docs/edugen-boundary-polish.md)

The release tag decision, GitHub Release draft, and publish checklist are documentation only. They do not create a tag, publish a GitHub Release, or certify production/security/accessibility readiness.

## Validation

Common local checks:

```bash
npm ci
npm run build
```

The repository includes a static validator chain in `.github/workflows/e2e-smoke.yml`. Local browser E2E checks are available when Playwright Chromium is installed:

```bash
npm run test:e2e:smoke
npm run test:e2e:onboarding
```

If Chromium/browser setup is missing, report that as environment-blocked rather than as a product failure. Do not claim E2E, CI, or direct-route smoke passed without actual passing command/run evidence.

## Unsupported / not claimed

Shime does not claim or include:

- no backend/auth/cloud sync
- no built-in AI generation
- no external AI/API integration
- no API key/BYOK support
- no OCR
- no EduGen bundled into Shime
- no frontend-only PDF/DOCX/PPTX/ZIP conversion
- no production certification
- no security certification
- no accessibility/WCAG certification
- no SEO ranking improvement or all-crawlers-render success
- no performance optimization, Lighthouse, Core Web Vitals, or mobile performance certification claim
- no mobile UX pass claim unless an actual responsive/mobile run provides evidence
- no release tag creation or GitHub Release publication
- no actual screenshot capture or README screenshots until real screenshot files exist
