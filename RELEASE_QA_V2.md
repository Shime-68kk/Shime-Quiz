# ShimeChamhoc v2.0.0-beta-ai.1 Release QA Checklist

Beta label: **v2.0.0-beta-ai.1**. AI-verified candidate only; not manually QA-certified on physical devices.

This checklist covers the React/Vite v2 local-first learning app. User-facing app copy should remain Vietnamese. The app is static/local-first; offline/PWA cache behavior is not release-certified unless a tester confirms an active service worker. Full answer-key protection is not possible without future server-side scoring.


## Required staging evidence

For Phase 5B beta approval, attach or record:

- browser and device/viewport used;
- whether the browser profile was clean/incognito;
- console result showing no critical red errors;
- screenshots or notes for JSON/CSV import, Study Room completion, localStorage persistence, backup/restore, and mobile layout;
- service worker/PWA state: active, inactive, or intentionally not registered in this beta.

## Manual QA limitation

This checklist is still required before broader beta/production use. Do not mark this build as real-device QA certified until the checklist is completed in a real browser/device environment.

## 1. Fresh load and shell

- [ ] Open the app from a clean browser profile or after clearing site data.
- [ ] Confirm `/dashboard` renders without critical red console errors and record the console status.
- [ ] Confirm desktop sidebar appears on desktop widths.
- [ ] Confirm mobile bottom navigation appears on mobile widths.
- [ ] Confirm `/study-room` hides sidebar and bottom navigation.
- [ ] Confirm no horizontal overflow at 320px, 375px, and 390px widths.

## 2. Dashboard render

- [ ] Confirm **Hành trình hôm nay** renders.
- [ ] Confirm **Mục tiêu học tập** renders.
- [ ] Confirm analytics, mastery, review schedule, smart practice, and study history sections render safely with empty state or data.
- [ ] Confirm corrupted localStorage keys do not crash the dashboard.

## 3. Library data fallback and persistence

- [ ] With no saved library, confirm mock data fallback appears.
- [ ] Confirm source label says **Dữ liệu mẫu**.
- [ ] Import valid JSON and confirm preview summary.
- [ ] Import invalid JSON and confirm a Vietnamese error state.
- [ ] Import valid CSV and confirm preview summary.
- [ ] Import malformed/invalid CSV and confirm errors or warnings without a crash.
- [ ] Confirm imported library persists after reload.
- [ ] Confirm **Xóa dữ liệu import** clears only v2 library data and returns to mock data.

## 4. Library export and v2 backup/restore

- [ ] Export library JSON with **Xuất thư viện**.
- [ ] Export **Sao lưu đầy đủ** and confirm backup file downloads.
- [ ] Restore a full backup and confirm Dashboard/Library refresh without a forced reload.
- [ ] Export **Sao lưu đã ẩn đáp án** and confirm direct answer fields are not present.
- [ ] Confirm redacted backup restore is blocked with Vietnamese explanation.
- [ ] Export **Sao lưu tiến trình** and confirm `data.library` is absent.
- [ ] Confirm progress-only backup restore is blocked with Vietnamese explanation.
- [ ] Confirm backup security warning is visible and Vietnamese.

## 5. Study Room item rendering

- [ ] Open `/study-room` directly and confirm first valid item renders.
- [ ] Multiple choice: select an option, check answer, see **Đúng** or **Sai** feedback.
- [ ] Short answer: type an answer, press Enter or check, see normalized correct/wrong feedback.
- [ ] Flashcard: reveal and hide the answer side.
- [ ] Unsupported/missing item data shows a safe fallback.

## 6. Study draft persistence

- [ ] Select a multiple-choice answer, type short answer text, reveal a flashcard, and navigate to another item.
- [ ] Reload `/study-room` and confirm draft state restores for the same item set.
- [ ] Use **Làm lại phiên học** and confirm only the study draft is cleared.
- [ ] Confirm normal, due-review, and smart-practice drafts do not restore into each other.

## 7. Finish session and result summary

- [ ] Click **Hoàn thành phiên học**.
- [ ] If unanswered items exist, confirm warning: **Bạn còn câu chưa trả lời. Vẫn hoàn thành?**
- [ ] Confirm **Tổng kết phiên học** appears.
- [ ] Confirm summary counts: **Tổng số mục**, **Đã trả lời**, **Đúng**, **Sai**, **Chưa trả lời**, **Tỷ lệ đúng**, **Thẻ ghi nhớ đã xem**.
- [ ] Confirm result detail rows show user answer and correct answer when available.

## 8. Study history and detail

- [ ] After finishing a session, open Dashboard and confirm **Lịch sử học** shows the recent session.
- [ ] Click **Xem chi tiết**.
- [ ] Confirm item status labels are Vietnamese.
- [ ] Confirm missing/deleted library item fallback says **Mục học này không còn trong thư viện hiện tại.**
- [ ] Use **Xóa lịch sử** and confirm only v2 study history is removed.

## 9. Analytics, mastery, and review schedule

- [ ] Confirm empty analytics state says **Chưa có dữ liệu thống kê**.
- [ ] Complete sessions and confirm analytics cards update.
- [ ] Confirm **Mức độ nắm vững** appears after enough evidence.
- [ ] Confirm weak/strong topic sections render safely.
- [ ] Confirm completing a scorable session updates **Lịch ôn tập cục bộ**.
- [ ] Confirm corrupted history/schedule storage does not crash.

## 10. Due review and smart practice

- [ ] With due items, click **Ôn tập hôm nay** and confirm Study Room shows **Chế độ ôn tập**.
- [ ] Confirm only due items appear.
- [ ] Finish due review and confirm history/schedule update.
- [ ] Click **Luyện tập thông minh** and confirm Study Room shows **Luyện tập thông minh**.
- [ ] Confirm selected item count appears and finish flow works.

## 11. Recommendation, feedback, goal, and daily journey

- [ ] Confirm **Gợi ý hôm nay** section inside **Hành trình hôm nay** has a reason and action.
- [ ] Click **Hữu ích**, **Không phù hợp**, and **Ẩn hôm nay** and confirm Vietnamese status feedback.
- [ ] Create, edit, and clear **Mục tiêu học tập**.
- [ ] Confirm today progress updates after completed sessions.
- [ ] Confirm **Kế hoạch hôm nay** shows 2–3 steps when possible.
- [ ] Mark a step complete with **Đánh dấu hoàn thành** and undo with **Bỏ đánh dấu**.
- [ ] Start a plan step, complete Study Room, and confirm the matching step becomes **Đã hoàn thành**.
- [ ] Use **Đặt lại tiến trình hôm nay** and confirm only today’s plan progress resets.

## 12. Mobile layout and accessibility

- [ ] Test Dashboard, Library, and Study Room at 320px, 375px, and 390px widths.
- [ ] Confirm bottom nav does not cover content.
- [ ] Confirm buttons are touch-friendly.
- [ ] Keyboard-tab through main actions on Dashboard, Library, and Study Room.
- [ ] Confirm visible focus states.
- [ ] Confirm active navigation state is not color-only.
- [ ] Confirm disabled buttons communicate state clearly.

## 13. Local security disclosure

- [ ] Confirm backup panel shows Vietnamese local security warning.
- [ ] Confirm docs explain that full backup is plaintext JSON and may contain answers.
- [ ] Confirm redacted/progress-only export is presented as risk reduction, not encryption.

## 14. Smoke checklist, 15–20 minutes

1. Fresh load `/dashboard`.
2. Check mobile/desktop navigation quickly.
3. Import valid JSON.
4. Reload and confirm persistence.
5. Import valid CSV.
6. Open `/study-room`, answer one multiple choice, one short answer, and reveal one flashcard.
7. Reload and confirm draft restore.
8. Finish session and inspect result summary.
9. Confirm Dashboard history, analytics, mastery, and review schedule update.
10. Start due review if due items exist.
11. Start smart practice.
12. Create a study goal and verify daily journey plan.
13. Mark a plan step complete and reset today’s progress.
14. Export full backup, redacted backup, and progress-only backup.
15. Restore a full backup.
16. Confirm redacted/progress-only restore is blocked with Vietnamese explanation.
17. Confirm no unexpected red console errors.

## 15. Release decision rubric

- **READY**: build passes, no blockers/high bugs, critical flows work manually.
- **READY AFTER FIXES**: only low/medium bugs with clear patches remain.
- **NOT READY**: boot failure, import failure, restore data-loss risk, Study Room crash, or non-Vietnamese blocker in visible UI.

## 16. Automated E2E smoke harness

Phase 6A adds a minimal Playwright smoke harness that complements the previous AI-only source/runtime validation. It does not replace real Chrome/Edge manual smoke or real-device QA.

### Install browsers when needed

After dependencies are installed with `npm ci`, install the local Playwright browser binary if it is not already available:

```bash
npx playwright install chromium
```

### Run automated smoke

```bash
npm run build
npm run test:e2e:smoke
```

The smoke command runs against local Vite preview on `127.0.0.1:4173`. It must not depend on Netlify, external services, accounts, or network APIs.

### Current automated coverage

- Route rendering for `/`, `/dashboard`, `/library`, and `/study-room`.
- Critical console error and uncaught page error capture.
- Dashboard **Học tiếp** CTA navigation to Study Room.
- Mobile viewport smoke at 375px for Dashboard, Library, and Study Room, including document-level horizontal overflow checks.
- JSON import UI smoke for valid data, malformed JSON, empty usable import, and invalid `multiple_choice.correctAnswer`.
- Default Study Room flow through multiple choice, flashcard, short answer, session finish, Vietnamese result summary, and local persistence keys.
- Backup panel smoke for full backup download and restore file input availability.
- Basic keyboard focus reachability for Dashboard, Library, and Study Room.

### Known limitations

- This harness is browser automation smoke only; it is not full manual smoke approval.
- It is not manually QA-certified on physical devices.
- It currently uses deterministic mock/fixture data and the default local browser context.
- It does not certify production-grade PWA/offline behavior, stale service worker behavior, or all browser/device combinations.
- Beta users should still report UI, runtime, import, export, backup, and restore issues found during real use.

## 17. GitHub Actions E2E smoke workflow

Phase 6A.CI adds a browser-capable GitHub Actions workflow for the Playwright smoke harness at `.github/workflows/e2e-smoke.yml`.

### Workflow triggers

The workflow runs on:

- `pull_request`
- `workflow_dispatch`
- `push` to `main`

Use `workflow_dispatch` from the GitHub Actions tab when a manual CI smoke run is needed without changing app code.

### CI commands

The workflow uses an Ubuntu GitHub-hosted runner, sets up Node.js 20 LTS, and runs:

```bash
npm ci
npm run build
node scripts/validate-smoke-fixture.js
node scripts/validate-v2-release-hardening.js
node scripts/validate-exam-readiness.js
node scripts/validate-recommendation-feedback.js
node scripts/validate-weighted-selection.js
npx playwright install --with-deps chromium
npm run test:e2e:smoke
```

### Failure artifacts

If the E2E smoke job fails, the workflow uploads available Playwright artifacts from:

- `playwright-report/`
- `test-results/`

Missing artifact folders are ignored so artifact upload does not hide the original failure.

### Release-claim limitation

A successful CI E2E smoke run may support the narrow claim that the automated Playwright smoke passed in that GitHub Actions environment. It still does not mean:

- full manual QA approval
- real-device QA certification
- production-grade PWA/offline certification
- zero runtime risk
- guaranteed data safety

Do not claim CI E2E smoke passed until a real GitHub Actions run completes successfully and the run evidence is recorded.

## 18. Phase 6B localStorage multi-tab resilience

Phase 6B keeps the v2 local-first architecture on `localStorage` and adds lightweight cross-tab refresh notifications for learning-state changes. The app uses metadata-only `BroadcastChannel` messages with a `storage` event fallback so another open tab can refresh dashboard/library-derived state after study history, review schedule, recommendation feedback, study goal, study plan progress, or library/restore writes change local storage.

This improves multi-tab freshness but does not make `localStorage` transactional. Closely timed writes can still be limited by browser storage behavior, quota errors, tab crashes, or private-mode restrictions. IndexedDB, backend sync, account sync, and stronger conflict resolution remain future work, not part of this beta hardening phase.

The sync payload must remain metadata-only: storage key, section, reason, timestamp, and source id. It must not broadcast full library content, answer keys, prompts, or backup payloads.

## 19. Phase 6C import validation hardening

Phase 6C keeps the existing v2 JSON/CSV import schema and adds runtime schema validation before the existing semantic validator. The validator uses Result-style return objects so malformed JSON, wrong field types, missing fields, invalid item types, empty usable imports, and invalid `multiple_choice.correctAnswer` values are reported as Vietnamese validation feedback instead of raw exceptions.

This phase does not add PDF, OCR, Markdown, RAG, backend sync, accounts, encryption, or a new storage format. It also does not change scoring, spaced repetition, mastery, backup schema, or the v2 import fields documented in `docs/V2_DATA_MODEL.md`.

Current behavior intentionally remains conservative: if any item-level errors are present, the import is blocked, even when some items could be normalized. The preview still reports valid item counts and rejected item paths so a future phase can decide whether partial import should become a user-facing feature.

## 20. Phase 6D dashboard analytics performance guardrail

Phase 6D adds a lightweight synthetic Dashboard analytics performance validator.

The validator checks Dashboard-scale derived data behavior with:
- study history sessions
- item result records
- library items
- review schedule records
- recommendation feedback
- active study goal data

It verifies that Dashboard analytics derivations complete without throwing, preserve expected result shapes, handle empty or malformed inputs safely, avoid mutating inputs, and stay under a generous CI threshold.

This is a synthetic performance guardrail only. It does not certify real-device performance, low-end mobile behavior, Safari/iOS behavior, or complete absence of browser jank. Manual real-device QA remains required before making stronger performance claims.

## 21. Phase 6E backup/restore disaster-recovery drill

Phase 6E adds a lightweight backup/restore disaster-recovery validator.

The validator checks:
- full backup creation and successful restore
- malformed backup rejection
- missing required full-backup library section rejection
- redacted backup restore blocking
- progress-only backup restore blocking
- storage preflight failure
- simulated mid-restore write failure rollback
- in-memory library update timing
- no sync publish before failed restore
- metadata-only sync after successful restore
- unchanged backup schema marker

Full backup is the main disaster-recovery format and may contain library content, prompts, choices, correct answers, flashcard backs, explanations, and progress data. Redacted and progress-only backups reduce sharing risk but are not encryption and are not full restore sources.

Restore rollback remains best-effort. Browser storage quota errors, private browsing restrictions, tab crashes, and device/browser-specific behavior can still prevent recovery. This validator does not certify production-grade data recovery or replace manual real-device backup/restore QA.

## 22. Phase 6H public deployment readiness and Lighthouse hygiene

Phase 6H adds public deployment readiness documentation and static metadata hygiene for the local-first Netlify deployment.

The app remains a static/local-first React app. Core v2 learning flows do not require login, account backend, Supabase/Firebase, SSR, or API secrets. Learning data is stored in the user’s browser localStorage. Opening the Dashboard does not expose other users’ remote data in the current local-first model, but data may remain visible on the same browser/device. Users on shared devices should clear site data or use a separate browser profile.

Phase 6H also documents that rate limiting, CORS, backend secret rotation, and account security become active concerns only if future cloud sync/API/backend features are added.

Public metadata and deployment hygiene include title/description metadata, Open Graph/Twitter metadata, manifest/icon linkage, robots handling, and conservative static deployment notes. A canonical URL and sitemap should only be added after a stable production domain is selected; do not hardcode a random Netlify preview URL as canonical.

Lighthouse has not been certified by this phase unless a report is attached for the exact deployed URL and commit. Do not claim Lighthouse passed, production security certification, real-device QA, or production-grade PWA/offline certification from this checklist alone.

## Phase 7B — Local .txt/.md file upload for text/Markdown quiz drafts

Phase 7B adds a local `.txt` / `.md` file upload path in the Library page. The browser reads the selected text file locally, reuses the Phase 7A `textQuizParser`, and sends the generated draft through the existing import validation and preview flow before the user saves anything.

This does not add PDF, Word/DOCX, PPTX, ZIP, OCR, AI quiz generation, backend services, authentication, cloud sync, or schema changes. JSON/CSV import and paste-based text/Markdown draft import remain available.

## Phase 7D — Minimal EduGen PDF-to-draft integration

Phase 7D adds a minimal Shime PDF-to-draft path through the standalone EduGen File Processor. Shime sends a selected PDF to EduGen `POST /api/extract/single`, consumes only `extraction.cleanedText`, then reuses the existing `parseTextQuizDraft` parser and import validation/preview flow. The user must review the generated draft and explicitly confirm save; there is no auto-save after extraction.

EduGen remains a separate service. Shime does not copy EduGen source code and does not directly import EduGen JSON as library data.

This phase is PDF-only inside Shime. It does not add DOCX, PPTX, ZIP, OCR, AI quiz generation, backend/auth/cloud sync, storage schema changes, backup schema changes, scoring changes, spaced repetition changes, mastery changes, or weighted-selection changes.


## Phase 7E — EduGen document-to-draft import

- Phase 7E expands the EduGen draft import path in Shime to PDF, DOCX, PPTX, and ZIP files.
- EduGen remains a separate service; Shime sends the selected file to `POST /api/extract/single` and consumes only `extraction.cleanedText`.
- Generated drafts still go through the existing `parseTextQuizDraft` parser, import validation, and preview before the user confirms save.
- There is no auto-save after extraction.
- Legacy `.doc` and `.ppt` files are not supported.
- This does not add OCR, AI quiz generation, backend/auth/cloud sync, schema/storage changes, scoring/SRT/mastery changes, or production security certification.

### Phase 7F — Quiz draft quality review

- Adds advisory quality review warnings for draft imports before saving.
- Covers generated/imported drafts from text/Markdown, local text files, EduGen document extraction, and the shared import preview path.
- Warnings help users notice duplicate choices, missing answers, short prompts, default subject/topic names, and very small drafts.
- Existing import validation remains the hard blocking layer; quality warnings do not guarantee automatic high-quality quiz generation.
- No AI, OCR, schema/storage/scoring/SRT/mastery, backend/auth/cloud sync, or auto-save changes were added.
- Users should still review draft questions before saving.

### Phase 7G — Import UX polish and release readiness

- Phase 7G improves Library import guidance, EduGen setup/error wording, and release-readiness documentation.
- No new import file types were added; existing text, `.txt`/`.md`, and EduGen PDF/DOCX/PPTX/ZIP flows remain unchanged.
- EduGen remains a separate service. Shime requires a reachable `VITE_FILE_PROCESSOR_URL` for document extraction, especially from hosted deployments.
- The manual smoke checklist for import readiness is documented in `docs/import-readiness-checklist.md`.
- This phase does not add OCR, AI quiz generation, backend/auth/cloud sync, schema/storage/scoring/SRT/mastery changes, auto-save, or automatic correction/fixing.

### Phase 8A — AI quiz draft generation planning and safety contract

- Phase 8A is planning/spec only. It does not add working AI generation, API keys, backend calls, external provider calls, OCR, schema/storage changes, or auto-save.
- The planning docs are `docs/ai-quiz-draft-generation-plan.md` and `docs/ai-safety-and-privacy-contract.md`.
- Any future AI draft flow must require explicit user action before sending content to an AI provider, disclose privacy implications, and keep preview-before-save.
- Future AI output must still be normalized into the existing flat v2 draft shape, pass import validation, and show advisory quality review before the user confirms save.
- Do not claim Shime supports AI quiz generation until a later implementation phase is explicitly built, reviewed, tested, and merged.

### Phase 8B — Manual AI prompt/export workflow

- Phase 8B adds a manual prompt/export helper in Library.
- Shime builds a prompt locally so users can manually copy it to an external AI tool if they choose.
- Shime does not send content to AI, does not call external AI APIs, does not handle API keys, and does not add backend/auth/cloud sync.
- Users must manually paste any AI result back into the existing text/Markdown import flow.
- AI results still go through existing parsing, import validation, advisory quality review, preview, and user-confirm-save.
- This phase does not add working built-in AI quiz generation, OCR, schema/storage changes, scoring/SRT/mastery changes, auto-import, or auto-save.
- User-facing privacy warning remains required because copied content may leave the user's device when pasted into an external AI tool.


### Phase 8C — Manual AI output import hardening

- Adds advisory checks for manual AI paste-back output before users run the existing text/Markdown import flow.
- Flags common formatting issues such as JSON-like AI output, extra commentary, missing answer markers, missing choice labels, Markdown tables, and weak parse signals.
- Preserves the existing flow: parseTextQuizDraft -> import validation -> advisory quality review -> preview -> user confirms save.
- does not add built-in AI generation, external AI/API calls, API key handling, BYOK, backend/auth/cloud sync, OCR, auto-import, or auto-save.
- does not guarantee AI correctness, privacy, or automatic high-quality quiz generation; users must still verify AI output before saving.

### Phase 8D — AI integration readiness / provider contract planning

- Phase 8D is planning/readiness only. It does not add built-in AI generation, API calls, provider SDKs, does not add API key handling, does not add BYOK, backend/auth/cloud sync, OCR, schema/storage changes, auto-import, or auto-save.
- The readiness document is `docs/ai-integration-readiness.md`.
- Any future AI provider flow must require explicit user confirmation before sending content, disclose that data may leave the device, and preserve the validation/quality-review/preview/user-confirm-save path.
- Phase 8B manual prompt/export remains the default safe mode until a later security decision approves a provider architecture.
- Future provider options such as BYOK, hosted backend proxy, or local/private models require separate design, security review, implementation, and testing.
- Do not claim Shime supports built-in AI quiz generation, external AI API calls, API keys/BYOK, backend AI generation, or automatic high-quality quiz generation from this phase.
- no auto-save or auto-import behavior was added.


## Phase 8E — AI Draft Evaluation Fixtures / Provider-Output Test Suite

- Adds a static AI draft evaluation fixture suite for future provider-output readiness.
- This is not built-in AI generation and does not call an AI provider.
- No API calls, no API keys, no BYOK implementation, and no backend/auth/cloud sync are added.
- The fixtures exercise good and bad AI-like output through manual AI output review, `parseTextQuizDraft`, import validation, and quiz draft quality review.
- Existing validation/quality review/preview/user-confirm-save boundaries remain.
- The suite documents that Shime cannot prove factual correctness, privacy behavior of external AI tools, no hallucination, or perfect quiz quality.

## Phase 8F — Dashboard plan completion guard

- Dashboard/Overview “Kế hoạch hôm nay” now treats completed plan items as stable: clicking a completed item again no longer toggles it back to incomplete.
- Incomplete plan items can still be marked complete, and the existing local study-plan progress storage shape is preserved.
- Added `scripts/validate-dashboard-plan-completion-guard.js` and CI coverage for the regression.
- Scope remains dashboard UX/state hardening only: no AI/API/backend/import/EduGen/scoring/SRT/mastery/schema/storage migration changes.

## Phase 8G — Release candidate hardening / status consolidation

- Phase 8G is docs/release-readiness only and does not change runtime app behavior.
- Adds `docs/release-candidate-status.md` to consolidate current capabilities, validator coverage, allowed/forbidden claims, manual smoke gaps, and deployment caveats.
- Phase 8F.1 remains **PARTIAL / manual Ubuntu browser smoke still pending** unless a separate real Ubuntu browser test is provided. Do not claim Phase 8F.1 browser smoke passed from this phase.
- Adds `scripts/validate-release-candidate-status.js` and CI coverage for release-candidate status wording.
- The validator chain includes all current release validators, including dashboard plan completion guard, AI draft evaluation fixtures, AI integration readiness, manual AI output hardening, import UX readiness, EduGen document integration, and text import validators.
- Release claims remain constrained: no built-in AI generation, no external AI/API calls, no API key/BYOK support, no OCR, no backend/auth/cloud sync, no hosted production/security certification, and EduGen is not bundled into Shime.

## Phase 8I — Public release notes / deployment readiness copy

- Phase 8I is documentation/release-readiness only and does not change runtime app behavior.
- Adds `docs/public-release-notes.md` for public-facing release-candidate capabilities, limitations, EduGen boundaries, manual AI workflow boundaries, deployment caveats, recommended setup, and Phase 8H final RC manual smoke status.
- Adds `docs/deployment-readiness.md` for local preview basics, frontend hosting caveats, `VITE_FILE_PROCESSOR_URL`, separate EduGen hosting requirements, unsupported backend/OCR/AI-provider claims, and pre/post-deploy smoke checklists.
- Updates `README.md` conservatively to link the public release notes and deployment readiness notes and summarize supported capabilities accurately.
- Adds `scripts/validate-public-release-docs.js` and CI coverage for the public release/deployment documentation claim guardrails.
- Phase 8H final RC manual smoke already passed by user confirmation on Ubuntu browser.
- No runtime app behavior, user-facing app feature, import/parser, EduGen source, AI/API/BYOK/OCR/backend, schema/storage/scoring/SRT/mastery, package version, or dependency changes were added.
- Release claims remain constrained: no built-in AI generation, no external AI/API integration, no API key/BYOK support, no OCR, no backend/auth/cloud sync, no hosted production/security certification, and EduGen is not bundled into Shime.

## Phase 8J — Landing / public README polish and demo script

- Phase 8J is documentation/launch-readiness only and does not change runtime app behavior.
- Adds `docs/demo-script.md` with a 60-second pitch, 3-minute guided demo flow, honest manual AI positioning, honest EduGen positioning, demo fallback guidance, and demo forbidden-claims guidance.
- Adds `docs/screenshot-checklist.md` with recommended README/public documentation screenshots and warnings against implying unsupported AI/OCR/API/cloud/backend/security-certified capabilities.
- Updates `README.md` conservatively with a tagline-style summary, suggested demo flow link, and screenshot checklist link while preserving public release and deployment readiness links.
- Updates `docs/public-release-notes.md` with links to the demo script and screenshot checklist.
- Adds `scripts/validate-demo-readiness-docs.js` and CI coverage for launch/readiness documentation claim guardrails.
- No runtime app behavior, user-facing app feature, import/parser, EduGen source, AI/API/BYOK/OCR/backend, schema/storage/scoring/SRT/mastery, package version, or dependency changes were added.
- Release claims remain constrained: no built-in AI generation, no external AI/API integration, no API key/BYOK support, no OCR, no backend/auth/cloud sync, no hosted production/security certification, and EduGen is not bundled into Shime.

## Phase 8K — Public demo sample pack / import fixture polish

- Phase 8K is documentation/demo-sample/fixture-readiness only and does not change runtime app behavior.
- Adds `docs/demo-samples/README.md` plus sample JSON, CSV, text/Markdown, and manual AI output files for public demos, reviewer checks, and screenshot preparation.
- Updates README, public release notes, demo script, and screenshot checklist with links to the public demo sample pack.
- Adds `scripts/validate-demo-sample-pack.js` to verify sample files, docs links, Phase 8K QA notes, package version stability, claim guardrails, and practical parse/import compatibility where current helper modules can be safely invoked.
- Registers `node scripts/validate-demo-sample-pack.js` in `.github/workflows/e2e-smoke.yml` while preserving existing validators and Playwright E2E smoke behavior.
- No runtime app behavior changes, user-facing feature changes, import/parser changes, EduGen source changes, AI/API/BYOK/OCR/backend changes, schema/storage/scoring/SRT/mastery changes, package version changes, or dependency changes were made.

## Phase 8M — README screenshots placeholder / visual asset guidance

- Phase 8M is documentation/visual-asset/readiness only and does not change runtime app behavior.
- Adds `docs/visual-asset-guidance.md` with recommended screenshot filenames, recommended `docs/assets/screenshots/` path, alt text, demo sample pack usage guidance, EduGen visual boundary guidance, and unsupported-claim guardrails.
- Updates README with a conservative screenshots/demo assets section linking the screenshot checklist, visual asset guidance, and demo sample pack.
- Updates screenshot checklist, demo script, and public release notes with links to the visual asset guidance.
- No actual screenshot/image assets are added in this phase.
- Adds `scripts/validate-visual-asset-guidance.js` and CI coverage for visual asset documentation claim guardrails.
- No runtime app behavior changes, user-facing feature changes, import/parser changes, EduGen source changes, AI/API/BYOK/OCR/backend changes, schema/storage/scoring/SRT/mastery changes, package version changes, or dependency changes were made.

## Phase 8N — In-app demo sample quickstart

- Phase 8N adds a small Library quickstart for loading a local demo sample quiz into the existing import preview flow.
- Adds `src/data/demoSampleQuiz.js` with safe, neutral, Vietnamese-friendly sample content compatible with existing import validation and advisory quiz draft quality review.
- Updates the Library route so **Dùng quiz mẫu** creates a draft preview only; users still review validation, advisory quality review, and explicitly confirm save before anything is stored locally.
- The quickstart does not auto-save, does not reset localStorage, does not call AI/API, does not use EduGen, and does not bypass preview/review/save safety.
- Updates README, demo script, screenshot checklist, and public release notes with conservative quickstart documentation.
- Adds `scripts/validate-demo-sample-quickstart.js` and CI coverage for the in-app demo quickstart guardrails.
- No import/parser changes, EduGen source changes, AI/API/BYOK/OCR/backend changes, schema/storage/scoring/SRT/mastery changes, package version changes, or dependency changes were made.

## Phase 8P — First-run onboarding hint for demo quickstart

- Phase 8P adds a small, non-blocking Library onboarding hint near **Dùng quiz mẫu** so new users can discover the local demo sample quickstart.
- The hint is copy-only guidance: it does not auto-load the demo sample, does not auto-save, does not insert anything directly into the Library, does not reset localStorage, and does not add a new storage key or schema migration.
- The existing demo sample quickstart still routes through preview, import validation, advisory quality review, and explicit confirm-save before anything is stored locally.
- The hint and quickstart do not call AI/API, do not add API key/BYOK support, do not require EduGen, do not add OCR, and do not add backend/auth/cloud sync.
- Adds `scripts/validate-demo-quickstart-onboarding.js` and CI coverage for the onboarding hint guardrails.
- No import/parser changes, EduGen source changes, scoring/SRT/mastery changes, storage/backup schema changes, package version changes, or dependency changes were made.

## Phase 8Q — Library empty-state onboarding polish

- Phase 8Q adds a small, non-blocking Library empty-state onboarding section for users with no saved quiz items.
- The empty state points users to safe first actions: local demo sample quickstart, JSON/CSV import, text/Markdown paste/import, manual AI prompt/export copy-paste workflow, and separately configured EduGen document import.
- The empty state is guidance only: it does not auto-load the demo sample, does not auto-save, does not insert directly into the Library, does not reset localStorage, and does not add a new storage key or schema migration.
- Existing import, manual AI, EduGen document import, preview, validation, advisory quality review, and explicit confirm-save behavior remain unchanged.
- Adds `scripts/validate-library-empty-state-onboarding.js` and CI coverage for the empty-state onboarding guardrails.
- No import/parser changes, EduGen source changes, AI/API/BYOK/OCR/backend changes, scoring/SRT/mastery changes, storage/backup schema changes, package version changes, or dependency changes were made.

## Phase 8S — Dashboard first-run empty-state onboarding

- Phase 8S adds a small, non-blocking Dashboard first-run callout for users with no meaningful saved library or study data.
- The callout points users to the Library as the safe start location for the local demo sample quickstart, JSON/CSV import, text/Markdown paste/import, manual AI prompt/export copy-paste workflow, and separately configured EduGen document import.
- The callout is guidance only: it does not auto-load the demo sample, does not auto-save, does not insert directly into the Library, does not reset localStorage, and does not add a new storage key or schema migration.
- Existing Dashboard metrics, today-plan behavior, recommendations, study history, import/manual AI/EduGen flows, Library quickstart, preview, validation, advisory quality review, and explicit confirm-save behavior remain unchanged.
- Adds `scripts/validate-dashboard-first-run-onboarding.js` and CI coverage for the Dashboard first-run onboarding guardrails.
- No import/parser changes, EduGen source changes, AI/API/BYOK/OCR/backend changes, scoring/SRT/mastery changes, storage/backup schema changes, package version changes, or dependency changes were made.


## Phase 8U - RC Polish Summary / Final Public Positioning Lock

Scope: documentation/public positioning/readiness only.

What changed:

- Locked README current RC capability positioning for the local-first app, Library demo sample quickstart, Library empty-state onboarding, Dashboard first-run onboarding, supported import paths, manual AI workflow, advisory quality review, demo sample pack, and readiness docs.
- Updated public release notes with Phase 8N-8T onboarding/demo quickstart improvements and Ubuntu browser verification references for the demo quickstart, Library empty-state onboarding, and Dashboard first-run onboarding.
- Added a recommended RC demo path from Dashboard first-run onboarding to Library, demo sample preview/quality review, optional confirm-save, Study Room, manual AI boundary, and EduGen boundary.
- Reaffirmed deployment readiness boundaries: frontend-only app shell hosting, browser-reachable separate EduGen requirement for document import, browser-local data, no backend/auth/cloud sync, no built-in AI/API provider, and no OCR.
- Added Dashboard first-run onboarding, Library empty-state onboarding, Library quickstart, and demo sample preview/quality review to visual asset guidance and screenshot checklist.
- Added `scripts/validate-public-positioning-lock.js`.
- Registered `node scripts/validate-public-positioning-lock.js` in `.github/workflows/e2e-smoke.yml`.

Scope guardrails:

- No runtime app behavior changes.
- No user-facing app feature changes.
- No import/parser changes.
- No EduGen source changes.
- No AI generation, external AI/API calls, API key/BYOK support, OCR, backend/auth/cloud sync, or hosted production/security certification.
- No storage/schema/scoring/SRT/mastery changes.
- No package version or dependency changes.
- No screenshot/image assets added.

Validation added:

- `node scripts/validate-public-positioning-lock.js` checks final public positioning docs, onboarding/demo verification references, deployment caveats, screenshot guidance, claim guardrails, unchanged package version, and CI registration.

## Phase 8V - Onboarding Flow E2E Smoke Coverage

Scope: E2E/test automation and release-safety validation only.

What changed:

- Added `e2e/onboarding-smoke.spec.js` to cover the Phase 8N-8S onboarding/demo quickstart path.
- Added `npm run test:e2e:onboarding` for targeted onboarding smoke execution without changing the existing `npm run test:e2e:smoke` command.
- Added `scripts/validate-onboarding-e2e-smoke.js` to statically verify onboarding E2E coverage, CI registration, unchanged package version/dependency metadata, and claim guardrails.
- Registered `node scripts/validate-onboarding-e2e-smoke.js` in `.github/workflows/e2e-smoke.yml`.
- Added `npm run test:e2e:onboarding` to CI after the existing Playwright smoke command and after Playwright Chromium installation.
- Updated public release notes and demo script with concise Phase 8V coverage notes.

Coverage intent:

- Dashboard first-run onboarding appears in the empty-data state and points to Library safe start options.
- Library onboarding surfaces the local demo sample quickstart, JSON/CSV import, text/Markdown import, manual AI copy/paste boundaries, and separate EduGen document-import boundary.
- The **Dùng quiz mẫu** quickstart opens the existing preview, validation, and advisory quality review flow.
- The demo sample is not auto-saved before explicit confirmation.
- No API key/BYOK UI is expected, and EduGen is not required for the local demo sample quickstart.

Scope guardrails:

- No runtime app behavior changes.
- No user-facing app feature changes.
- No import/parser changes.
- No EduGen source changes.
- No AI generation, external AI/API calls, API key/BYOK support, OCR, backend/auth/cloud sync, or hosted production/security certification.
- No storage/schema/scoring/SRT/mastery changes.
- No package version or dependency changes.


## Phase 8W - Local E2E Verification Guide / Playwright Browser Setup Docs

Scope: documentation, local QA guidance, static validator, and CI validator registration only.

What changed:

- Added `docs/local-e2e-verification.md` with Ubuntu/local Playwright Chromium setup guidance.
- Documented `npx playwright install chromium` and `npx playwright install --with-deps chromium` for missing browser/system dependency cases.
- Documented the local commands `npm ci`, `npm run build`, `npm run test:e2e:smoke`, and `npm run test:e2e:onboarding`.
- Documented port-conflict handling for 4173/4174, missing Chromium classification, failure categories, and claims-control rules.
- Linked the local E2E guide from README, public release notes, and demo script.
- Added `scripts/validate-local-e2e-verification-docs.js`.
- Registered `node scripts/validate-local-e2e-verification-docs.js` in `.github/workflows/e2e-smoke.yml` while preserving previous validators and Playwright smoke commands.

Verification reference:

- Phase 8V onboarding E2E coverage exists.
- The local Ubuntu onboarding E2E run passed after Playwright Chromium was installed: `npm run test:e2e:onboarding` completed with 3 tests passed.
- Future automated E2E pass claims still require actual successful command output in the target environment.
- Missing Chromium remains an environment/browser issue, not an app failure.

Scope guardrails:

- No runtime app behavior changes.
- No user-facing app feature changes.
- No E2E test logic changes.
- No import/parser changes.
- No EduGen changes.
- No AI/API/OCR/backend changes.
- No storage/schema/scoring/SRT/mastery changes.
- No package version changes.
- No dependency changes.


## Phase 8X - Final RC Audit / Release Tag Readiness

Scope: documentation, final RC audit, release tag readiness checklist, static validator, and CI validator registration only.

What changed:

- Added `docs/final-rc-audit.md` as the final release-candidate audit for the Phase 8W baseline.
- Documented current capabilities and caveats that can be safely claimed.
- Audited manual Ubuntu browser smoke references for the demo quickstart, Library empty-state onboarding, and Dashboard first-run onboarding.
- Audited local onboarding E2E evidence: `npm run test:e2e:onboarding` passed on local Ubuntu after Playwright Chromium was installed, with future pass claims requiring actual command output.
- Audited EduGen boundary: EduGen is separate, not bundled, and PDF/DOCX/PPTX/ZIP import requires a configured browser-reachable service.
- Audited manual AI boundary: manual prompt/export and paste/import workflow only, with no built-in AI generation, external AI/API calls, or API key/BYOK support.
- Added release tag readiness checklist and next-step caveats for later GitHub Actions / CI Green Verification, release tag/version decision, GitHub release draft, and package cleanliness review.
- Added `scripts/validate-final-rc-audit.js`.
- Registered `node scripts/validate-final-rc-audit.js` in `.github/workflows/e2e-smoke.yml` while preserving previous validators and Playwright smoke commands.

Scope guardrails:

- No runtime app behavior changes.
- No user-facing app feature changes.
- No E2E test logic changes.
- No import/parser changes.
- No EduGen source changes.
- No AI/API/BYOK/OCR/backend changes.
- No storage/schema/scoring/SRT/mastery changes.
- No package version changes.
- No dependency changes.
- No release tag created.
- No GitHub release published.
- No production/security certification claim.

## Phase 8Y - GitHub Actions / CI Green Verification

Scope: CI verification guidance, workflow expectation documentation, static validator, and CI validator registration only.

What changed:

- Added `docs/ci-green-verification.md` documenting the expected GitHub Actions release-readiness workflow.
- Documented expected checks: `npm ci`, `npm run build`, full static validator chain, Playwright Chromium install via `npx playwright install --with-deps chromium`, `npm run test:e2e:smoke`, and `npm run test:e2e:onboarding`.
- Documented how to classify CI failures as app bugs, test bugs, browser/environment issues, timeout/flakiness, or selector issues.
- Documented claims control: GitHub Actions CI green and GitHub Actions E2E pass can only be claimed after an actual passing GitHub Actions run for the relevant branch/commit.
- Documented that Phase 8Y does not create a release tag, publish a GitHub release, certify production readiness, or certify security readiness.
- Added `scripts/validate-ci-green-verification.js`.
- Registered `node scripts/validate-ci-green-verification.js` in `.github/workflows/e2e-smoke.yml` while preserving all previous validators, Playwright Chromium install, E2E smoke/onboarding commands, and failure artifact uploads.

Scope guardrails:

- No runtime app behavior changes.
- No user-facing app feature changes.
- No E2E test logic changes.
- No import/parser changes.
- No EduGen source changes.
- No AI/API/BYOK/OCR/backend changes.
- No storage/schema/scoring/SRT/mastery changes.
- No package version changes.
- No dependency changes.
- No broad `continue-on-error`.
- No skipped E2E.
- No release tag created.
- No GitHub release published.
- No production/security certification claim.



## Phase 9A - Version / Release Tag Decision

Scope: release tag/version decision documentation, static validator, and CI validator registration only.

What changed:

- Added `docs/release-tag-decision.md` documenting version and release tag strategy options.
- Captured the current `package.json` version in the decision document.
- Documented options including keeping the existing package version, using a future `v2.0.0-rc1` tag, using a future `v2.0.0-rc2` tag if the user wants a new RC after Phase 8X/8Y, or keeping beta-style tag continuity.
- Documented that the final package version/tag decision belongs to the user and should be approved before any tag or version change.
- Linked the release tag decision document from README, the final RC audit, and CI green verification docs.
- Added `scripts/validate-release-tag-decision.js`.
- Registered `node scripts/validate-release-tag-decision.js` in `.github/workflows/e2e-smoke.yml` while preserving previous validators, Playwright Chromium install, E2E smoke/onboarding commands, and failure artifact uploads.

Scope guardrails:

- No package version change unless explicitly requested by the user.
- No release tag created.
- No GitHub release published.
- No runtime app behavior changes.
- No user-facing app feature changes.
- No E2E test logic changes.
- No import/parser changes.
- No EduGen source changes.
- No AI/API/BYOK/OCR/backend changes.
- No storage/schema/scoring/SRT/mastery changes.
- No dependency changes.
- No production/security certification claim.

Recommended next phase: Phase 9B — GitHub Release Draft.

## Phase 9B - GitHub Release Draft

Scope: GitHub release draft documentation, static validator, and CI validator registration only.

What changed:

- Added `docs/github-release-draft.md` with safe release notes content for later publication.
- Documented draft title options and a tag placeholder that requires user approval before publishing.
- Drafted the current capability summary, install/run commands, validation expectations, EduGen boundary, manual AI boundary, unsupported claims, and release checklist before publishing.
- Linked the GitHub release draft document from README, the final RC audit, the release tag decision document, and CI green verification docs.
- Added `scripts/validate-github-release-draft.js`.
- Registered `node scripts/validate-github-release-draft.js` in `.github/workflows/e2e-smoke.yml` while preserving previous validators, Playwright Chromium install, E2E smoke/onboarding commands, and failure artifact uploads.

Scope guardrails:

- No package version change.
- No release tag created.
- No GitHub release published.
- No runtime app behavior changes.
- No user-facing app feature changes.
- No E2E test logic changes.
- No import/parser changes.
- No EduGen source changes.
- No AI/API/BYOK/OCR/backend changes.
- No storage/schema/scoring/SRT/mastery changes.
- No dependency changes.
- No production/security certification claim.

Recommended next phase: Phase 9C — Release Package / Source Archive Verification.

## Phase 9C — Release Package / Source Archive Verification

Scope: documentation/release package cleanliness/static-validator/CI registration only.

Added:

- Release package/source archive cleanliness document: `docs/release-package-cleanliness.md`.
- Forbidden generated/local artifact list covering `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `coverage/`, `.env`, `.env.*`, local temp files, `FETCH_HEAD`, `.DS_Store`, debug logs, package-manager error logs, and secret/key files.
- Source archive cleanliness checklist covering clean `git status --short`, up-to-date main, no generated build output, no dependency folders, no Playwright artifacts, no coverage artifacts, no local environment/secrets, reviewed README/release docs, reviewed package version/tag decision, reviewed GitHub release draft, static validators, build, and E2E evidence if claiming E2E pass.
- Dry-run cleanup guidance using `git clean -ndX` and `git clean -nd` before any destructive cleanup command.
- Static validator: `scripts/validate-release-package-cleanliness.js`.
- CI coverage for `validate-release-package-cleanliness`.

Not changed:

- No package version change.
- No dependency change.
- No release tag created.
- No GitHub release published.
- No release package published.
- No runtime app behavior changes.
- No user-facing feature changes.
- No E2E logic changes.
- No import/parser changes.
- No EduGen source changes.
- No AI/API/OCR/backend changes.
- No storage/schema/scoring/SRT/mastery changes.
- No production/security certification claim.

Recommended next phase: Phase 9D — Release Tag / Publish Checklist.

## Phase 9D — Release Tag / Publish Checklist

Status: documentation/static-validator/CI registration only.

Scope:
- Release tag / publish checklist document: `docs/release-tag-publish-checklist.md`.
- Final pre-tag checklist covering clean/up-to-date main branch, clean `git status --short`, user-selected tag name, release draft review, source/archive cleanliness review, public docs review, and final RC audit review.
- Validation checklist covering `npm ci`, `npm run build`, full static validator chain, E2E evidence only when claiming E2E pass, and GitHub Actions green only when claiming CI green.
- Source/archive cleanliness checkpoint references `docs/release-package-cleanliness.md`.
- GitHub release draft checkpoint references `docs/github-release-draft.md`.
- Vite chunk-size warning documented as non-blocking if `npm run build` still completes successfully.
- Stop conditions documented for dirty git status, failing build, failing validators, missing release tag decision, missing release draft, generated artifacts/secrets, CI not green when claiming CI green, and E2E not passing when claiming E2E pass.
- Static validator: `scripts/validate-release-tag-publish-checklist.js`.
- CI coverage for `validate-release-tag-publish-checklist`.

Phase 9D does not:
- change package version
- create a release tag
- publish a GitHub release
- publish a release package
- change runtime app behavior
- change user-facing features
- change E2E test logic
- change import/parser logic
- change EduGen source
- add AI/API/OCR/backend behavior
- change storage/schema/scoring/SRT/mastery behavior
- change dependencies
- does not claim production certification
- does not claim security certification

Recommended next step: stop and ask the user whether to create the actual release tag/publish flow, or run optional regression hardening phases 9E–9H.

## Phase 9E — Import Surface Manual Regression Smoke

Scope: documentation/import-regression-smoke/static-validator/CI only.

Added:
- Import surface manual regression smoke checklist: `docs/import-regression-smoke.md`.
- Coverage for JSON import, CSV import, paste text/Markdown draft import, local `.txt/.md` file import, public demo sample pack import, in-app **“Dùng quiz mẫu”** quickstart, manual AI output paste/import, EduGen unavailable behavior, and EduGen configured PDF/DOCX/PPTX/ZIP import only when a separate browser-reachable service is configured.
- Evidence rules for manual smoke claims: do not claim manual import regression passed without an actual tester/user run, and do not claim EduGen document import passed without the separate service being configured and tested.
- Static validator: `scripts/validate-import-regression-smoke.js`.
- CI coverage for `validate-import-regression-smoke`.

Phase 9E does not:
- Change runtime app behavior.
- Change user-facing app features.
- Change import/parser logic.
- Change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Change storage/schema/scoring/SRT/mastery logic.
- Change package version or dependencies.
- Create a release tag.
- Publish a GitHub Release.
- Publish a release package.
- Do not claim production/security certification.

Recommended next phase: Phase 9F — Backup / Restore Manual Regression Smoke.

## Phase 9F — Backup / Restore Manual Regression Smoke

Scope: documentation/backup-restore-regression-smoke/static-validator/CI only.

Added:
- Backup/restore manual regression smoke checklist: `docs/backup-restore-regression-smoke.md`.
- Coverage for export backup, restore backup, malformed/bad backup handling, Library data, quiz content, study history/progress, review schedule, recommendation feedback, and study goal/plan progress where applicable.
- Local-first/no-backend/no-cloud-sync and no account/auth backup boundaries.
- Evidence rules: do not claim manual backup/restore regression passed unless an actual tester/user run passes, and do not claim all state categories are preserved unless each was actually checked.
- Static validator: `scripts/validate-backup-restore-regression-smoke.js`.
- CI coverage for `validate-backup-restore-regression-smoke`.

Phase 9F does not:
- Change runtime app behavior.
- Change user-facing app features.
- Change backup/restore logic.
- Change storage/schema behavior.
- Change import/parser logic.
- Change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Change scoring/SRT/mastery/study history/recommendation logic.
- Change package version or dependencies.
- Create a release tag.
- Publish a GitHub Release.
- Publish a release package.
- Do not claim production/security certification.

Recommended next phase: Phase 9G — Study Room / Dashboard Learning Flow Smoke.
## Phase 9G — Study Room / Dashboard Learning Flow Smoke

Scope: documentation/study-dashboard-regression-smoke/static-validator/CI only.

Added:
- Study Room / Dashboard learning flow manual regression smoke checklist: `docs/study-dashboard-regression-smoke.md`.
- Checklist coverage for saved quiz setup, Library-to-Study-Room flow, answer handling, study history/progress, review schedule/SRT, Dashboard progress, recommendation/recommendation feedback, study goal/plan progress, and no unexpected data reset checks.
- Local-first/no-backend/no-cloud-sync boundaries and no account/auth sync claims.
- Evidence rules: do not claim manual Study Room/Dashboard regression passed without an actual tester/user run; do not claim all learning state categories updated unless each category was actually checked.
- Static validator: `scripts/validate-study-dashboard-regression-smoke.js`.
- CI coverage for `validate-study-dashboard-regression-smoke`.

Phase 9G does not:
- Change runtime app behavior.
- Change user-facing features.
- Change Study Room logic.
- Change Dashboard runtime logic.
- Change scoring/SRT/mastery/study history/recommendation logic.
- Change storage/schema behavior.
- Change import/parser behavior.
- Change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Change package version or dependencies.
- Create a release tag.
- Publish a GitHub release.
- Publish a release package.
- Do not claim production/security certification.

Recommended next phase: Phase 9H — Accessibility / Keyboard Smoke.

