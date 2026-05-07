# ShimeChamhoc v2

ShimeChamhoc v2 is a React/Vite, local-first learning app for multi-subject study. It helps learners turn local study content into reviewed quiz drafts, focused Study Room sessions, and browser-based progress tracking without claiming cloud-backed or production-certified status.

Current beta label: **v2.0.0-beta-ai.1**

Release status: **release candidate with Phase 8H Ubuntu manual smoke passed**. This is not a hosted production/security certification or broad device certification; users should still verify the target environment before wider release.


## Public release and deployment readiness

- Public release notes: [`docs/public-release-notes.md`](docs/public-release-notes.md)
- Deployment readiness notes: [`docs/deployment-readiness.md`](docs/deployment-readiness.md)

Current supported import paths include JSON/CSV import, paste text/Markdown draft import, local `.txt`/`.md` draft import, and PDF/DOCX/PPTX/ZIP draft import through a separately configured EduGen service. EduGen is not bundled into Shime; hosted or frontend-only deployments need a browser-reachable `VITE_FILE_PROCESSOR_URL` for document import.

AI-related support is manual only: Shime can help users export a prompt and review pasted AI output, but it does not provide built-in AI quiz generation, external AI/API calls, API key/BYOK support, OCR, backend accounts, authentication, or cloud sync.



## Public demo sample pack

Use [`docs/demo-samples/README.md`](docs/demo-samples/README.md) for small synthetic JSON, CSV, text/Markdown, and manual AI paste-back samples that exercise supported demo paths without relying on external services. The samples preserve the current boundaries: EduGen remains separate for document import, and AI support remains manual/workflow-only.

## In-app demo sample quickstart

The Library includes a local **Dùng quiz mẫu** quickstart so reviewers and new users can load a safe sample quiz without uploading files. The quickstart only creates an import preview: users still review validation results, advisory quality review, and explicitly confirm save before anything is stored locally. It does not call AI/API, does not use EduGen, and does not auto-save or reset existing data.

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
