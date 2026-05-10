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
- Do not change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Change storage/schema/scoring/SRT/mastery logic.
- Do not change package version or dependencies.
- Do not create a release tag.
- Do not publish a GitHub Release.
- Do not publish a release package.
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
- Do not change storage/schema behavior.
- Change import/parser logic.
- Do not change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Do not change scoring/SRT/mastery/study history/recommendation logic.
- Do not change package version or dependencies.
- Do not create a release tag.
- Do not publish a GitHub Release.
- Do not publish a release package.
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
- Do not change Study Room logic.
- Change Dashboard runtime logic.
- Do not change scoring/SRT/mastery/study history/recommendation logic.
- Do not change storage/schema behavior.
- Do not change import/parser behavior.
- Do not change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Do not change package version or dependencies.
- Do not create a release tag.
- Publish a GitHub release.
- Do not publish a release package.
- Do not claim production/security certification.

Recommended next phase: Phase 9H — Accessibility / Keyboard Smoke.


## Phase 9H — Accessibility / Keyboard Smoke

Scope: documentation/accessibility-keyboard-smoke/static-validator/CI only.

Added:
- Accessibility / keyboard manual smoke checklist: `docs/accessibility-keyboard-smoke.md`.
- Checklist coverage for keyboard navigation, focus visibility, controls, import surfaces, Library, demo quickstart, preview/review/confirm-save, Study Room, Dashboard, backup/restore controls, readable labels, validation/error messages, EduGen unavailable guidance, and manual AI workflow caveats.
- Evidence rules: do not claim manual accessibility smoke passed or manual keyboard smoke passed unless an actual tester/user run passes.
- Explicit boundary: this is not a full accessibility audit; do not claim WCAG compliance or accessibility certification.
- Static validator: `scripts/validate-accessibility-keyboard-smoke.js`.
- CI coverage for `validate-accessibility-keyboard-smoke`.

Phase 9H does not:
- Change runtime app behavior.
- Change user-facing features.
- Change accessibility implementation.
- Change keyboard/focus behavior.
- Do not change Study Room logic.
- Change Dashboard runtime logic.
- Do not change scoring/SRT/mastery/study history/recommendation logic.
- Change backup/restore logic.
- Do not change storage/schema behavior.
- Do not change import/parser behavior.
- Do not change E2E logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Do not change package version or dependencies.
- Do not create a release tag.
- Publish a GitHub release.
- Do not publish a release package.
- Do not claim WCAG compliance.
- Do not claim accessibility certification.
- Do not claim production/security certification.

Recommended next step: stop and ask whether to proceed with the actual release tag/publish flow, or run a real manual regression pass using 9E–9H checklists.

## Phase 10A — Public Landing Page / Root Route Polish

Phase 10A adds a public-facing root route landing experience and documentation at [`docs/public-landing-page.md`](docs/public-landing-page.md). The landing route introduces ShimeChamhoc v2 as a local-first quiz study app, points to Dashboard, Library, Study Room, and the Library **Dùng quiz mẫu** path, and summarizes supported local imports, backup/restore, EduGen separate-service boundaries, manual AI copy/paste boundaries, and local-first privacy boundaries.

Landing page checklist:

- Root `/` should show a clear public introduction instead of immediately redirecting to Dashboard.
- CTAs should route to existing app areas such as Dashboard and Library.
- Landing copy should mention JSON, CSV, text/Markdown, `.txt/.md`, Library, Study Room, Dashboard, backup/restore, and the local demo quickstart.
- EduGen/File Processor remains separate and not bundled; PDF/DOCX/PPTX/ZIP import requires a configured browser-reachable service.
- Manual AI remains manual prompt/export and manual output paste/import only.

CTA/manual smoke expectations:

- Open `/` and verify landing content appears.
- Open `/dashboard` directly and verify Dashboard still works.
- Open `/library` directly and verify Library still works.
- Check Dashboard/Library CTAs from the landing page.
- Confirm unsupported AI/EduGen/cloud/OCR/certification claims are absent.

React/Vite SPA note:

- This is a React/Vite SPA, not a Next.js App Router project.
- Phase 10A focuses on user-visible root route polish, not full SEO.
- SEO/Open Graph/social preview metadata remains a separate future phase.

Phase 10A does not:

- Do not add auth/login, middleware, protected routes, backend, or cloud sync.
- Do not add built-in AI generation, external AI/API calls, API key/BYOK support, or OCR.
- Do not bundle EduGen into Shime or make frontend-only document conversion claims.
- Do not change import/parser behavior, backup/restore behavior, storage schema, Study Room logic, Dashboard learning logic, scoring/SRT/mastery/study history/recommendation logic, or E2E test logic.
- Do not change package version or dependencies.
- Create a release tag, publish a GitHub Release, or publish a release package.
- Claim production, security, accessibility, SEO, crawler indexing, or social preview certification/completion.

Validator and CI coverage:

- Added `scripts/validate-public-landing-page.js`.
- Registered `node scripts/validate-public-landing-page.js` in `.github/workflows/e2e-smoke.yml` while preserving prior validators, Playwright install, E2E smoke/onboarding, and failure artifact upload.

## Phase 10B — SEO / Open Graph / Social Preview Metadata

Phase 10B adds basic static SEO/social preview metadata for the React/Vite SPA public entry point and documents it in [`docs/social-preview-metadata.md`](docs/social-preview-metadata.md). This phase updates `index.html` title/description, Open Graph tags, Twitter/social card tags, and a static preview image at `public/og-image.svg`.

Scope and limitations:

- This is a Vite SPA metadata/social-preview polish phase, not a Next.js App Router change.
- Static metadata is available from `index.html`; body content may still require JavaScript rendering.
- Do not claim SEO ranking improvement, SEO optimization success, or that all crawlers render SPA content.
- Do not claim production/security/accessibility certification.
- Do not claim release tag creation, GitHub Release publication, or release package publication.

Phase 10B does not:

- Do not add auth/login, middleware, backend, or cloud sync.
- Do not add built-in AI generation, external AI/API calls, API key/BYOK support, or OCR.
- Do not bundle EduGen into Shime or make frontend-only PDF/DOCX/PPTX/ZIP document conversion claims.
- Do not change import/parser behavior, backup/restore behavior, storage schema, Study Room logic, Dashboard learning logic, scoring/SRT/mastery/study history/recommendation logic, or E2E test logic.
- Do not change package version or dependencies.

Validator and CI coverage:

- Added `scripts/validate-social-preview-metadata.js`.
- Registered `node scripts/validate-social-preview-metadata.js` in `.github/workflows/e2e-smoke.yml` while preserving prior validators, Playwright install, E2E smoke/onboarding, and failure artifact upload.

Recommended next phase: Phase 10C — Direct Route / SPA Fallback UX Audit.

## Phase 10C — Direct Route / SPA Fallback UX Audit

Phase 10C adds direct-route/static-hosting fallback audit documentation at [`docs/direct-route-spa-fallback.md`](docs/direct-route-spa-fallback.md). The guide documents React/Vite SPA direct-route behavior, static-host fallback to `index.html`, existing Vercel/Netlify/`_redirects` fallback expectations, and a manual smoke checklist for `/`, `/dashboard`, `/library`, `/study-room`, and unknown routes.

Scope and limitations:
- This is a Vite SPA/static-host fallback audit phase, not a Next.js App Router change.
- Static metadata exists, but app body content may require JavaScript rendering.
- Simple crawlers may not render SPA body content.
- No SSR claim is made.
- No all-crawlers-render claim is made.
- No direct-route smoke pass is claimed without actual run evidence.
- No auth/login, middleware, backend, cloud sync, or protected routes are added.

Phase 10C does not:
- Do not add built-in AI generation.
- Do not add external AI/API calls.
- Do not add API key/BYOK support.
- Do not bundle EduGen/File Processor.
- Do not add OCR.
- Do not change import/parser behavior.
- Do not change backup/restore behavior.
- Do not change storage/schema behavior.
- Do not change Study Room logic.
- Do not change Dashboard learning logic.
- Do not change scoring/SRT/mastery/study history/recommendation logic.
- Do not change E2E logic.
- Do not change package version or dependencies.
- Do not create a release tag.
- Do not publish a GitHub Release.
- Do not publish a release package.
- Do not claim production/security/accessibility certification.

Validator and CI:
- Added `scripts/validate-direct-route-spa-fallback.js`.
- Registered `node scripts/validate-direct-route-spa-fallback.js` in `.github/workflows/e2e-smoke.yml` while preserving prior validators, Playwright install, E2E smoke/onboarding, and failure artifact upload.

## Phase 10D — Screenshot Asset Pack

Phase 10D adds screenshot asset pack/checklist documentation at [`docs/screenshot-asset-pack.md`](docs/screenshot-asset-pack.md) and prepares `docs/assets/screenshots/` with `.gitkeep` for future real screenshots.

Screenshot asset status:
- Actual screenshots included: NO.
- Screenshots are pending actual capture from the current app.
- README and GitHub Release docs should link to the checklist rather than embed missing screenshot images.
- Do not claim screenshots exist or screenshot capture completed unless actual reviewed image files are present.

Screenshot capture rules:
- Use the current app build and public release-safe sample data.
- Avoid private data, secrets, browser-extension noise, and unsupported visual claims.
- Do not fake screenshots or add misleading mockups.
- Only reference screenshot image files that actually exist.

Phase 10D does not:
- Change runtime app behavior or user-facing app features.
- Do not claim auth/login, middleware, backend, or cloud sync; none were added.
- Do not claim built-in AI generation, external AI/API calls, API key/BYOK support, or OCR; none were added.
- Do not claim EduGen is bundled or that frontend-only hosting provides PDF/DOCX/PPTX/ZIP document conversion.
- Change import/parser behavior, backup/restore behavior, storage schema, Study Room logic, Dashboard learning logic, scoring/SRT/mastery/study history/recommendation logic, or E2E logic.
- Change package version or dependencies.
- Create a release tag, publish a GitHub Release, or publish a release package.
- Do not claim production/security/accessibility certification.

Validator and CI coverage:
- Added `scripts/validate-screenshot-asset-pack.js`.
- Registered `node scripts/validate-screenshot-asset-pack.js` in `.github/workflows/e2e-smoke.yml` while preserving prior validators, Playwright install, E2E smoke/onboarding, and failure artifact upload.

Recommended next phase: Phase 10E — README Public-Facing Rewrite / Split.


## Phase 10E — README Public-Facing Rewrite / Split

Status: documentation/static-validator/CI only.

Phase 10E rewrites `README.md` into a shorter public-facing entry point and adds `docs/readme-public-facing-guide.md` for README structure and claims-control guidance.

Covered:
- Public-facing README intro, quick start, demo quickstart, supported imports, local-first privacy, learning features, manual AI boundary, EduGen boundary, public polish docs, release docs, validation, and unsupported/not-claimed section.
- Detailed release and guardrail docs are linked instead of duplicated in full.
- Screenshot status remains explicit: screenshot capture checklist exists, but actual screenshot image files are pending unless real reviewed files are added.
- Claim guardrails are preserved for no built-in AI generation, no external AI/API calls, no API key/BYOK support, no OCR, no backend/cloud sync, no EduGen bundled into Shime, no frontend-only document conversion, no production/security/accessibility certification, no SEO ranking/all-crawlers-render success, and no release tag/GitHub Release publication claim.

Scope control:
- No runtime app behavior changes.
- No user-facing app feature changes.
- No screenshot image assets added.
- No package version/dependency changes.
- No release tag created.
- No GitHub Release published.
- No production/security/accessibility certification claim.

Validation/CI:
- Added `scripts/validate-readme-public-facing.js`.
- CI runs `node scripts/validate-readme-public-facing.js` with the existing validator chain.


## Phase 10F — Performance / Bundle-Size Audit

Status: documentation/static-validator/CI only.

Adds:
- Performance / bundle-size audit documentation: `docs/performance-bundle-audit.md`.
- Build observation that `npm run build` passes while the known Vite/Rolldown chunk-size warning appears.
- Current observed largest JS chunk and gzip size when visible from local build output.
- Interpretation that the chunk-size warning is non-blocking unless build fails.
- Future optimization options such as route-level lazy loading/code splitting and dependency review.
- Static validator: `scripts/validate-performance-bundle-audit.js`.
- CI coverage for `validate-performance-bundle-audit`.

Scope guardrails:
- No runtime app behavior changes.
- No Vite config changes.
- No warning suppression.
- No chunk limit increase just to hide the warning.
- No package version or dependency changes.
- No screenshot image assets added.
- No release tag created.
- No GitHub Release published.
- No performance optimization claim unless implemented and measured.
- No Lighthouse/Core Web Vitals claim unless measured.
- No production/security/accessibility/performance certification claim.
- No backend/auth/cloud sync, built-in AI generation, external AI/API calls, API key/BYOK support, OCR, or EduGen bundling added.

## Phase 10G — Mobile UX Smoke / Responsive Polish

Status: documentation/static-validator/CI only.

Adds:
- Mobile UX smoke checklist documentation: `docs/mobile-ux-smoke.md`.
- Suggested responsive viewports: `360x640`, `375x667`, `390x844`, `412x915`, and `768x1024` tablet.
- Mobile surfaces covered: root `/`, `/dashboard`, `/library`, Dashboard, Library, Study Room, `Dùng quiz mẫu` demo quickstart, import controls, JSON/CSV/text/Markdown/`.txt/.md` surfaces, EduGen boundary, manual AI workflow, preview/review/confirm-save, backup/restore, readable text, horizontal overflow, clipped controls, and tap reachability.
- Evidence rules: do not claim mobile UX smoke passed unless an actual mobile/responsive run passes; do not claim Lighthouse/Core Web Vitals pass unless measured; do not claim mobile performance certification.
- Static validator: `scripts/validate-mobile-ux-smoke.js`.
- CI coverage for `validate-mobile-ux-smoke`.

Scope guardrails:
- No runtime app behavior changes unless explicitly stated; none were made in Phase 10G.
- No CSS/layout changes.
- No package version/dependency changes.
- No release tag created.
- No GitHub Release published.
- No production/security/accessibility certification claim.
- No mobile UX pass claim without run evidence.
- No backend/auth/cloud sync, built-in AI generation, external AI/API calls, API key/BYOK support, OCR, or EduGen bundling added.

## Phase 10H — EduGen Boundary / Integration Polish

Scope: documentation/static-validator/CI registration only. Runtime UI copy was not changed in this phase.

Adds:
- EduGen/File Processor boundary polish document: `docs/edugen-boundary-polish.md`.
- Clear supported local import surfaces: JSON, CSV, paste text/Markdown, and local `.txt/.md` files.
- Clear PDF/DOCX/PPTX/ZIP service requirement: a separate configured browser-reachable EduGen/File Processor service.
- `VITE_FILE_PROCESSOR_URL` boundary for hosted document import.
- Frontend-only hosting limitation: frontend-only hosting alone does not provide document conversion.
- Evidence rules: do not claim document import passed without a real configured run.
- Static validator: `scripts/validate-edugen-boundary-polish.js`.
- CI coverage in `.github/workflows/e2e-smoke.yml`.

Scope controls:
- Runtime app behavior changed? NO.
- UI copy changed? NO.
- Import/parser logic changed? NO.
- File processor client behavior changed? NO.
- Package version/dependencies changed? NO.
- Do not claim release tag created.
- Do not claim GitHub Release published.
- Do not claim EduGen bundled into Shime.
- Do not claim OCR.
- Do not claim backend/cloud sync.
- Do not claim built-in AI generation or external AI/API calls.
- Do not claim production/security/accessibility certification.

Claim guardrails:
- Can claim EduGen/File Processor boundary docs exist.
- Can claim document import requires a separate configured browser-reachable service.
- Can claim frontend-only hosting alone does not provide document conversion.
- Do not claim document import passed without actual configured run evidence.
- Do not claim OCR, bundled EduGen, backend/cloud sync, release tag creation, GitHub Release publication, or production/security/accessibility certification.

## Phase 10I — Cross-Device Export/Import Polish

Scope: documentation/static-validator/CI registration only. Runtime UI copy was not changed in this phase.

Adds:
- Cross-device export/import guidance document: `docs/cross-device-export-import.md`.
- Local-first portability model: browser-local storage, no backend/cloud sync, no account sync, and no automatic cross-device sync.
- Explicit export/import or backup/restore workflow for moving data between source device and destination device or clean browser profile.
- Backup privacy notes: full backup may contain quiz content, answers, progress, study history, and local app data; backups should be kept private.
- Supported import/export surfaces: backup/restore portability, JSON, CSV, text/Markdown, `.txt/.md`, and PDF/DOCX/PPTX/ZIP only through a separate configured EduGen/File Processor service.
- Evidence rules: do not claim cross-device restore passed without actual run evidence; do not claim encrypted backups unless implemented.
- Static validator: `scripts/validate-cross-device-export-import.js`.
- CI coverage in `.github/workflows/e2e-smoke.yml`.

Scope controls:
- Runtime app behavior changed? NO.
- UI copy changed? NO.
- Backup/restore logic changed? NO.
- Storage/schema changed? NO.
- Import/parser logic changed? NO.
- File processor client behavior changed? NO.
- Package version/dependencies changed? NO.
- Do not claim release tag created.
- Do not claim GitHub Release published.
- Do not claim encrypted backup unless implemented.
- Do not claim backend/cloud sync or account sync.
- Do not claim production/security/accessibility certification.

Claim guardrails:
- Can claim cross-device export/import guidance exists.
- Can claim manual backup/restore portability workflow is documented.
- Can claim no automatic cloud/account sync is provided.
- Do not claim cross-device restore passed without actual run evidence.
- Do not claim encrypted backups, backend/cloud sync, account sync, release tag creation, GitHub Release publication, or production/security/accessibility certification.

## Phase 10J — Final Public Release Readiness Re-Audit

Scope: documentation/static-validator/CI registration only. Runtime app behavior was not changed in this phase.

Adds:
- Final public release readiness re-audit document: `docs/final-public-release-readiness-reaudit.md`.
- Readiness inventory for Phase 10A–10I public-polish documentation.
- Validation inventory covering `npm ci`, `npm run build`, full static validator chain, and optional E2E when Chromium is available.
- Known evidence gaps: actual screenshots not captured, manual mobile UX smoke not run unless separately done, configured EduGen document import smoke not run unless separately done, cross-device backup/restore smoke not run unless separately done, Lighthouse/Core Web Vitals not measured unless separately done, release tag not created, GitHub Release not published, and release package not published.
- Known non-blocking Vite/Rolldown chunk-size warning remains documented, non-blocking when build passes, not suppressed, and not used for a performance optimization claim.
- Allowed and forbidden claims inventory for public release readiness.
- Static validator: `scripts/validate-final-public-release-readiness-reaudit.js`.
- CI coverage in `.github/workflows/e2e-smoke.yml`.

Scope controls:
- Runtime app behavior changed? NO.
- Package version/dependencies changed? NO.
- Do not claim release tag created.
- Do not claim GitHub Release published.
- Do not claim release package published.
- Do not claim built-in AI generation, external AI/API integration, API key/BYOK support, OCR, EduGen bundled into Shime, frontend-only document conversion, backend/auth/cloud sync, account sync, automatic cross-device sync, encrypted backups unless implemented, cross-device restore passed without evidence, mobile UX passed without evidence, Lighthouse/Core Web Vitals pass without measurement, SEO ranking/all-crawlers-render success, or production/security/accessibility/performance certification.

Claim guardrails:
- Can claim final public release readiness re-audit docs exist.
- Can claim Phase 10 public-polish docs are inventoried.
- Can claim known evidence gaps are documented.
- Do not claim release tag creation, GitHub Release publication, release package publication, or certification.

## Phase 10K — Release Candidate Tag Decision / Publish Gate

Phase 10K adds the release candidate tag decision / publish gate document and static validator. It documents current publication state, tag options as proposals only, explicit user approval before any tag/publish action, available evidence, remaining evidence gaps, and allowed/forbidden release claims.

Files added/changed:
- `.github/workflows/e2e-smoke.yml`
- `README.md`
- `RELEASE_QA_V2.md`
- `docs/release-candidate-tag-publish-gate.md`
- `docs/final-public-release-readiness-reaudit.md`
- `docs/final-rc-audit.md`
- `docs/github-release-draft.md`
- `docs/release-tag-decision.md`
- `docs/release-tag-publish-checklist.md`
- `docs/release-package-cleanliness.md`
- `docs/public-release-notes.md`
- `docs/deployment-readiness.md`
- `scripts/validate-release-candidate-tag-publish-gate.js`

Scope and claims:
- Release candidate tag/publish gate docs exist.
- Tag/publish decision checklist exists.
- Tag options are examples only.
- Explicit user approval is required before tag/publish.
- Evidence available: `npm ci`, `npm run build`, full static validator chain, documented non-blocking Vite/Rolldown chunk-size warning, docs/validators/CI coverage.
- Evidence gaps remain documented: screenshots, manual mobile UX, configured EduGen document import, cross-device backup/restore, environment-blocked E2E, and Lighthouse/Core Web Vitals unless separately run.
- No runtime app behavior changes.
- No package version/dependency changes.
- No release tag created.
- No GitHub Release published.
- No release package published.
- No production/security/accessibility/performance certification claim.

Validator / CI:
- New validator: `scripts/validate-release-candidate-tag-publish-gate.js`.
- CI coverage added in `.github/workflows/e2e-smoke.yml`.

## Phase 10L — Manual Evidence Run Pack
Status: documentation/static-validator/CI registration only.

Phase 10L adds [`docs/manual-evidence-run-pack.md`](docs/manual-evidence-run-pack.md), a single optional pre-release evidence checklist for screenshots, mobile/responsive smoke, configured EduGen document import smoke, cross-device backup/restore smoke, E2E smoke/onboarding when Chromium is available, and optional Lighthouse/Core Web Vitals measurement.

Evidence recording template fields include date/time, commit SHA/branch, environment, commands run, browser/device, screenshots captured, PASS/PARTIAL/FAIL, blockers, evidence artifacts, and claims allowed after the run.

Claims rules:
- No evidence pass is claimed by this phase.
- Do not claim screenshots captured unless actual image files exist.
- Do not claim mobile UX passed unless an actual mobile/responsive run passes.
- Do not claim configured EduGen import passed unless an actual configured service run passes.
- Do not claim cross-device restore passed unless an actual source/destination or clean-profile run passes.
- Do not claim E2E passed unless tests pass.
- Do not claim Lighthouse/Core Web Vitals pass unless measured.
- Do not claim release tag created, GitHub Release published, or release package published.
- Do not claim production/security/accessibility/performance certification.

Scope control:
- No runtime app behavior changes.
- No package version/dependency changes.
- No screenshot image assets added.
- No release tag created.
- No GitHub Release published.
- No release package published.

Validator: `scripts/validate-manual-evidence-run-pack.js`.
CI coverage: `.github/workflows/e2e-smoke.yml` runs the validator.

## Phase 10M — Release Tag Creation Plan
Status: documentation/static-validator/CI registration only.

Phase 10M adds [`docs/release-tag-creation-plan.md`](docs/release-tag-creation-plan.md), a release tag creation plan for the current release-candidate state. Candidate tag names are examples only. Explicit user approval is required before any tag or publish action.

The plan documents:
- current package version state and publication state
- pre-tag validation checklist
- tag command plan only, not executed
- rollback notes
- GitHub Release follow-up as a separate, user-approved step
- manual evidence gaps carried forward from Phase 10L
- allowed and forbidden release claims

Scope control:
- No runtime app behavior changes.
- No package version/dependency changes.
- No release tag created.
- No GitHub Release published.
- No release package published.
- No screenshot image assets added.
- No production/security/accessibility/performance certification claim.

Validator: `scripts/validate-release-tag-creation-plan.js`.
CI coverage: `.github/workflows/e2e-smoke.yml` runs the validator.

## Phase 10N — GitHub Release Publication Plan

Status: DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 10N adds [`docs/github-release-publication-plan.md`](docs/github-release-publication-plan.md), a GitHub Release publication plan for the current release-candidate state.

Coverage:
- Publication policy: this phase does not publish a GitHub Release.
- GitHub Release publication requires explicit user approval.
- A release tag should exist before publishing a GitHub Release.
- The final tag name must be chosen by user.
- Release notes must preserve claims guardrails.
- Release package/upload artifacts remain separate unless explicitly approved.
- Pre-publication checklist covers latest validated main, clean working tree, approved release tag, `npm ci`, `npm run build`, full static validator chain, optional E2E, optional manual evidence pack, generated-artifact check, secret check, and release-note review.
- GitHub UI / `gh release create` examples are documentation only and are not executed in this phase.
- Rollback/correction notes are documented.

Evidence gaps remain documented:
- screenshots not captured unless separately done
- manual mobile UX smoke not run unless separately done
- configured EduGen import smoke not run unless separately done
- cross-device restore smoke not run unless separately done
- Lighthouse/Core Web Vitals not measured unless separately done
- E2E may be environment-blocked if Chromium is unavailable

Scope control:
- No runtime app behavior changes.
- No package version or dependency changes.
- No release tag created.
- No GitHub Release published.
- No release package published.
- No production/security/accessibility/performance certification claim.
- No unsupported AI/EduGen/OCR/backend/cloud/account-sync claims.

Validator:
- `scripts/validate-github-release-publication-plan.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-github-release-publication-plan.js` and preserves previous validators.


## Phase 10O — Release Package Assembly Plan

Status: DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 10O adds [`docs/release-package-assembly-plan.md`](docs/release-package-assembly-plan.md), a release package assembly plan for a future user-approved release.

Coverage:
- Package policy: this phase does not create, publish, or upload a release package.
- Package assembly and package upload/publication require explicit user approval.
- Release tag creation and GitHub Release publication remain separate actions.
- Recommended source-package contents are documented.
- Exclusions are documented for `node_modules`, `dist` unless explicitly building a deploy artifact, `test-results`, `playwright-report`, `coverage`, `.git`, `FETCH_HEAD`, real `.env` files, private keys, credentials, service account files, local user data/backups, and fake/mock screenshots.
- Optional package variants are documented: source package, deploy artifact package, and documentation/evidence package.
- Assembly and verification checklists are documented, including `npm ci`, `npm run build`, full static validator chain, package unzip verification, generated-artifact checks, secret checks, and safe-claims review.
- Command examples such as `git archive`, clean zip assembly, and checksum generation are a plan only and are not executed in this phase.
- Release asset guidance states that package upload remains separate and requires explicit user approval.

Evidence gaps remain documented:
- screenshots not captured unless separately done
- manual mobile UX smoke not run unless separately done
- configured EduGen import smoke not run unless separately done
- cross-device restore smoke not run unless separately done
- Lighthouse/Core Web Vitals not measured unless separately done
- E2E may be environment-blocked if Chromium is unavailable

Scope control:
- No runtime app behavior changes.
- No package version or dependency changes.
- No release package created.
- No release package uploaded or published.
- No release tag created.
- No GitHub Release published.
- No screenshot image assets added.
- No production/security/accessibility/performance certification claim.
- No unsupported AI/EduGen/OCR/backend/cloud/account-sync claims.

Validator:
- `scripts/validate-release-package-assembly-plan.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-release-package-assembly-plan.js` and preserves previous validators.

## Phase 10P — Final Release Execution Checklist

Status: DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 10P adds [`docs/final-release-execution-checklist.md`](docs/final-release-execution-checklist.md), a final ordered release execution checklist for a future user-approved release.

Coverage:
- Current baseline: completed/merged through Phase 10O.
- Existing release package assembly, GitHub Release publication, release tag creation, manual evidence, release candidate gate, and final public re-audit docs are referenced.
- Final release execution policy states this phase does not execute release actions.
- Tag creation, package assembly, release asset upload, and GitHub Release publication are separate user-approved actions.
- Final tag name must be chosen by user.
- Ordered release execution flow is documented, including latest `main`, clean working tree, package version decision, `npm ci`, `npm run build`, full static validator chain, optional E2E, optional manual evidence pack, generated-artifact check, secret/user-data check, release-note review, claims review, tag creation, package assembly, GitHub Release publication, asset upload, and release evidence recording.
- Command checklist is a plan only and includes `git checkout main`, `git pull origin main`, `git status --short`, `npm ci`, `npm run build`, `git tag -a <chosen-tag> -m "<message>"`, `git push origin <chosen-tag>`, package assembly placeholders, and `gh release create <tag>` / GitHub UI guidance.
- Evidence recording template and pre-release blockers are documented.
- Existing evidence gaps remain documented: screenshots not captured, manual mobile UX smoke not run, configured EduGen import smoke not run, cross-device restore smoke not run, Lighthouse/Core Web Vitals not measured, and E2E may be environment-blocked if Chromium is unavailable.

Scope control:
- No runtime app behavior changes.
- No package version or dependency changes.
- No final release execution.
- No release package created, uploaded, or published.
- No release tag created or pushed.
- No GitHub Release published.
- No screenshot image assets added.
- No production/security/accessibility/performance certification claim.
- No unsupported AI/EduGen/OCR/backend/cloud/account-sync claims.

Validator:
- `scripts/validate-final-release-execution-checklist.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-final-release-execution-checklist.js` and preserves previous validators.


## Phase 10Q — Final Main Verification / Release Authorization Packet

Phase 10Q adds [`docs/final-main-release-authorization.md`](docs/final-main-release-authorization.md), a final main verification / release authorization packet for a future user-approved release decision.

Scope: documentation/static-validator/CI registration only. No runtime app behavior changed, no package version/dependency changes, no final release execution occurred, no release package was created or published, no release tag was created, and no GitHub Release was published.

The authorization packet documents latest main verification, build/static-validator expectations, the known non-blocking Vite/Rolldown chunk-size warning, known evidence gaps, release actions still pending, and explicit approval gates for tag creation, package assembly, GitHub Release publication, asset upload, and package version changes.

Allowed claims: final main verification / release authorization packet exists; release authorization checklist exists; release actions remain gated by explicit user approval.

Forbidden claims: final release executed; release package created/published/uploaded; GitHub Release published; release tag created or pushed; package version changed; production/security/accessibility/performance certification; built-in AI generation; external AI/API integration; API key/BYOK support; OCR; EduGen bundled into Shime; frontend-only document conversion; backend/cloud/account sync; automatic cross-device sync; encrypted backups unless implemented; screenshots captured unless actual files exist; mobile UX passed unless actual evidence exists; configured EduGen import passed unless actual configured run exists; cross-device restore passed unless actual run exists; Lighthouse/Core Web Vitals pass unless measured.

New validator: `scripts/validate-final-main-release-authorization.js`. CI coverage: `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-final-main-release-authorization.js`.


## Phase 10R — Release Candidate Freeze / Final Decision Memo

- Added `docs/release-candidate-freeze-final-decision.md`.
- Documents that the Phase 10 release-readiness planning track is complete through Phase 10Q.
- Documents completed readiness inventory: public landing/root route polish, social preview metadata, direct-route SPA fallback audit, screenshot capture checklist, public README rewrite, performance/bundle audit docs, mobile UX smoke checklist, EduGen/File Processor boundary docs, cross-device export/import guidance, final public release re-audit, release tag/publish gate, manual evidence run pack, release tag creation plan, GitHub Release publication plan, release package assembly plan, final release execution checklist, and final main authorization packet.
- Documents final decision options: user-approved final release execution, keep the release candidate unpublished, run optional manual evidence first, or reopen product development only with explicit user request.
- Documents approval gates: tag creation, package assembly, GitHub Release publication, asset upload, package version change, and product development reopening all require explicit user approval.
- No runtime app behavior changed.
- No package version/dependency changes.
- No final release execution happened.
- No release package created or published/uploaded.
- No release tag created.
- No GitHub Release published.
- No production/security/accessibility/performance certification claimed.
- New validator: `scripts/validate-release-candidate-freeze-final-decision.js`.
- CI coverage added for `validate-release-candidate-freeze-final-decision`.


## Phase 10S — Optional Manual Evidence Run Log / Evidence Results Template

Status: DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 10S adds [`docs/manual-evidence-results-log.md`](docs/manual-evidence-results-log.md), an optional manual evidence results log/template for future user-approved evidence recording.

Coverage:
- Default evidence statuses remain NOT RUN unless separately executed.
- Result categories are documented: PASS, PARTIAL PASS, FAIL, NOT RUN, and ENVIRONMENT-BLOCKED.
- Evidence fields are documented for date/time, commit SHA, branch, environment, browser/device/viewport, command or manual path used, result, evidence artifact path or URL, notes, blocker/follow-up, and claim allowed after this evidence.
- Evidence areas include screenshot capture, mobile/responsive smoke, configured EduGen/File Processor import, cross-device backup/restore, E2E smoke/onboarding, Lighthouse/Core Web Vitals, release package/tag/GitHub Release evidence if later executed, and final release evidence notes if later executed.
- Claims guardrails state that no PASS claim is allowed from template existence alone.
- Phase 10S does not execute manual evidence, capture screenshots, claim mobile UX passed, claim configured EduGen import passed, claim cross-device restore passed, claim Lighthouse/Core Web Vitals passed, create a release tag, publish a GitHub Release, or create/publish a release package.

Scope control:
- No runtime app behavior changes.
- No package version or dependency changes.
- No E2E spec/test logic changes.
- No release action executed.
- No production/security/accessibility/performance certification claim.
- No unsupported backend/cloud sync, OCR, built-in AI generation, EduGen bundled, or frontend-only document conversion claims.

Validator:
- `scripts/validate-manual-evidence-results-log.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-manual-evidence-results-log.js` and preserves previous validators and Playwright E2E smoke steps.

## Phase 10T — Manual Evidence Execution Checklist / Evidence Capture Guide

Status: DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 10T adds [`docs/manual-evidence-execution-checklist.md`](docs/manual-evidence-execution-checklist.md), an optional Manual Evidence Execution Checklist / Evidence Capture Guide for future user-approved evidence runs.

Coverage:
- Evidence execution policy states that Phase 10T creates a checklist/guide only and does not execute manual evidence or capture screenshots.
- Preconditions cover latest validated main, clean working tree, `npm ci`, `npm run build`, the full static validator chain, optional Chromium/browser availability, optional configured EduGen/File Processor service, and a clean profile or second device/profile for cross-device restore smoke.
- Guidance covers screenshot capture, mobile/responsive viewports, configured EduGen/File Processor import smoke, cross-device backup/restore smoke, E2E smoke/onboarding commands, and optional Lighthouse/Core Web Vitals measurement.
- Evidence recording instructions point future operators to [`docs/manual-evidence-results-log.md`](docs/manual-evidence-results-log.md) and require date/time, commit SHA, branch, environment, browser/device/viewport, command or manual path used, result, evidence artifact path or URL, notes, blockers/follow-ups, and allowed claims.
- Claims guardrails state that checklist existence does not imply evidence passed. No screenshot, mobile UX, configured EduGen import, cross-device restore, E2E, Lighthouse/Core Web Vitals, release tag, GitHub Release, release package, or certification claim is allowed without actual evidence or release execution.
- Phase 10T does not create a release tag, publish a GitHub Release, create/publish a release package, or execute release actions.

Scope control:
- No runtime app behavior changes.
- No package version or dependency changes.
- No E2E spec/test logic changes.
- No manual evidence executed.
- No screenshot image files added.
- No release action executed.
- No production/security/accessibility/performance certification claim.
- No unsupported backend/cloud sync, OCR, built-in AI generation, EduGen bundled, or frontend-only document conversion claims.

Validator:
- `scripts/validate-manual-evidence-execution-checklist.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-manual-evidence-execution-checklist.js` after the manual evidence results log validator and preserves previous validators and Playwright E2E smoke steps.


## Phase 11A — Cross-device Transfer UX Decision / Convenience Plan

Status: DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 11A adds [`docs/cross-device-transfer-ux-decision.md`](docs/cross-device-transfer-ux-decision.md), a Cross-device Transfer UX Decision / Convenience Plan for improving future desktop-to-phone and cross-device transfer UX without changing runtime behavior in this phase.

Coverage:
- Documents the current baseline completed/merged through Phase 10T.
- Re-states that the app is local-first/browser-local and current portability remains backup/export/import.
- Documents that no backend/cloud/account sync exists and no automatic cross-device sync exists.
- Explains that desktop-to-phone transfer is currently too technical for general users and that JSON/import/export wording should move behind friendlier UX language.
- Compares candidate solutions: one-click backup plus friendlier import UX, Web Share API sharing, QR code payloads, QR/short transfer code with a temporary transfer session, optional local-first encrypted transfer package, and optional account/cloud sync as future architecture only.
- Recommends a staged roadmap: Phase 11B transfer UX copy and backup flow polish, Phase 11C backup format/transfer safety hardening, Phase 11D Web Share/mobile sharing prototype, Phase 11E QR/session-code prototype decision, and Phase 12 optional cloud/account sync only with explicit approval.
- Recommends user-facing language such as Transfer data, Send to another device, Receive data, Save a backup file, Restore from backup, and Move my quizzes to this device.
- Safety requirements cover backup data that may contain private study data, import preview, merge/replace/keep-both decision points, checksum or error detection, and no encryption/cloud-sync claims until implemented.

Scope control:
- No runtime app behavior changes.
- No package version or dependency changes.
- No backup/restore/import/storage source changes.
- No QR transfer implementation.
- No Web Share implementation.
- No WebRTC/session transfer implementation.
- No backend/cloud/account sync.
- No automatic cross-device sync.
- No encryption implementation or encrypted backup claim.
- No release package created or published.
- No release tag created.
- No GitHub Release published.

Claims guardrails:
- Safe to claim the cross-device transfer UX decision plan exists.
- Safe to claim the recommended staged roadmap exists.
- Do not claim QR transfer implemented.
- Do not claim Web Share implemented.
- Do not claim WebRTC/session transfer implemented.
- Do not claim cloud/account sync implemented.
- Do not claim automatic cross-device sync implemented.
- Do not claim encryption implemented.

Validator:
- `scripts/validate-cross-device-transfer-ux-decision.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-cross-device-transfer-ux-decision.js` after the Phase 10T manual evidence execution checklist validator and preserves previous validators and Playwright E2E smoke steps.


## Phase 11B — Cross-device Transfer UX Copy + Backup Flow Polish

Status: RUNTIME UI COPY / DOCUMENTATION / STATIC VALIDATOR / CI ONLY.

Phase 11B polishes the existing backup/restore surface with user-friendly cross-device transfer language while preserving the current local-first backup/export/import mechanics. It follows the Phase 11A staged roadmap and does not implement a new transfer transport.

Coverage:
- The backup panel now frames the flow as transfer data between devices and this device only.
- Export/download action copy is friendlier: Save backup file.
- Restore/import action copy is friendlier: Restore from backup and Move my quizzes to this device.
- Helper text explains that Shime stores data on this device and that moving quizzes to another device currently means saving a backup file on one device and restoring it on the other.
- Privacy copy warns that backup files may include quiz content, answers, progress, and study history.
- No-sync copy states that the flow does not create automatic cloud sync.
- Existing preview/confirmation behavior is preserved and clarified. Future import preview, merge/replace/keep-both, checksum, compression, or encryption hardening remains Phase 11C scope unless separately approved.

Scope control:
- Runtime app copy changed only in the existing backup/restore UI.
- No backup/restore behavior change.
- No storage schema change.
- No backup file format change.
- No package version or dependency changes.
- No QR transfer implementation.
- No transfer code implementation.
- No WebRTC/session transfer implementation.
- No Web Share/PWA Share Target implementation.
- No backend/cloud/account sync.
- No automatic sync.
- No encryption implementation or encrypted-backup claim.
- No release package created or published.
- No release tag created.
- No GitHub Release published.

Claims guardrails:
- Safe to claim transfer UX copy was polished.
- Safe to claim friendlier backup/restore wording exists.
- Do not claim QR transfer implemented.
- Do not claim Web Share implemented.
- Do not claim WebRTC/session transfer implemented.
- Do not claim cloud/account sync implemented.
- Do not claim automatic sync implemented.
- Do not claim encryption implemented.

Validator:
- `scripts/validate-cross-device-transfer-ux-copy.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-cross-device-transfer-ux-copy.js` after the Phase 11A cross-device transfer UX decision validator and preserves previous validators and Playwright E2E smoke steps.


## Phase 11C — Backup Format / Transfer Safety Hardening

Phase 11C adds [`docs/backup-transfer-safety-hardening.md`](docs/backup-transfer-safety-hardening.md), a docs/static-validator/CI-only plan for safer future backup and transfer foundations after Phase 11A and Phase 11B.

Coverage:
- Documents future backup metadata requirements, including schema/version marker, app/version metadata, created-at timestamp, optional source device/browser label, and data category summary.
- Documents future checksum/error-detection, import preview, compatibility check, unknown/unsupported version handling, and safe failure behavior requirements.
- Documents merge/replace/keep-both decision options, duplicate/conflict handling, no silent destructive overwrite without confirmation, and privacy/security boundaries for backup files that may include private quiz/study data.
- Re-states current portability remains manual backup/export/import.
- Re-states no backup format/runtime behavior changes are implemented by this phase.
- Re-states no backup file format change, no storage schema change, no import/restore behavior change, no checksum implementation, no compression implementation, no encryption implementation, no import preview implementation, and no merge/replace/keep-both runtime implementation.
- Re-states no QR transfer implementation, no Web Share implementation, no WebRTC/session transfer implementation, no backend/cloud/account sync, and no automatic cross-device sync.
- Re-states no package version or dependency changes and no release package/tag/GitHub Release creation or publication.
- Static validator: `scripts/validate-backup-transfer-safety-hardening.js`.
- CI coverage: `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-backup-transfer-safety-hardening.js` after the Phase 11A/11B transfer validators.

Allowed claims:
- Backup transfer safety hardening plan exists.
- Future checksum/import-preview/merge requirements are documented.
- Privacy and compatibility requirements for future transfer work are documented.

Forbidden claims:
- Do not claim checksum implemented, compression implemented, encryption implemented, import preview implemented, merge/replace/keep-both implemented, backup format changed, or storage schema changed.
- Do not claim QR transfer implemented, Web Share implemented, WebRTC/session transfer implemented, cloud/account sync implemented, or automatic sync implemented.
- Do not claim release tag created, GitHub Release published, or release package created/published.

## Phase 11D — Web Share / Mobile Sharing Prototype Plan

Phase 11D adds [`docs/web-share-mobile-sharing-prototype-plan.md`](docs/web-share-mobile-sharing-prototype-plan.md), a docs/static-validator/CI-only plan for a future mobile share-sheet convenience layer over the existing local backup file flow.

Coverage:
- Documents why Web Share could improve mobile backup transfer UX while current portability remains manual backup/export/import.
- Documents candidate future behavior where a user taps Share backup file, the browser/native share sheet opens if supported, and fallback remains normal backup file download.
- Documents that restore from backup file remains available on the receiving device.
- Documents browser/platform support considerations, unsupported-browser fallback, user-cancellation handling, and privacy requirements for backup files that may contain quiz content, answers, progress, and study history.
- Re-states no server upload, no cloud sync claim, no account sync claim, no automatic sync claim, and no encryption implementation claim.
- Re-states no Web Share runtime implementation, no QR transfer implementation, no WebRTC/session transfer implementation, no backend/cloud/account sync, no backup format/storage schema/import behavior change, no runtime app code change, no package/dependency change, and no release package/tag/GitHub Release creation or publication.

Validator:
- `scripts/validate-web-share-mobile-sharing-prototype-plan.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-web-share-mobile-sharing-prototype-plan.js` after the Phase 11A/11B/11C transfer validators and preserves previous validators and Playwright E2E smoke steps.

Allowed claims:
- Web Share mobile sharing prototype plan exists.
- Future mobile share-sheet behavior, fallback requirements, and privacy requirements are documented.

Forbidden claims:
- Do not claim Web Share runtime implemented, QR transfer implemented, WebRTC/session transfer implemented, cloud/account sync implemented, automatic sync implemented, encryption implemented, backup format changed, storage schema changed, or import/restore behavior changed.
- Do not claim release tag created, GitHub Release published, or release package created/published.


## Phase 11E — Web Share Runtime Prototype

Phase 11E adds a small, optional Web Share runtime prototype to the existing backup/restore panel. Where the browser/platform supports sharing files, the user can choose `Chia sẻ file sao lưu` to open the browser/native share sheet for the same Shime v2 backup file content used by the normal backup download flow.

Coverage:
- Preserves the existing backup download fallback and the existing E2E-visible controls: heading `Sao lưu dữ liệu`, backup button `Sao lưu dữ liệu`, success text `Đã tạo file sao lưu`, and file input label `Chọn file sao lưu`.
- Uses Web Share feature detection through `navigator.share` and file-share capability checks through `navigator.canShare` where supported.
- Documents browser/platform support caveats and fallback to normal backup file download when direct file sharing is unsupported, cancelled, or blocked.
- Preserves privacy boundaries: backup files may include quiz content, answers, progress, and study history; the user chooses the share destination; Shime does not upload backup data to a server.
- Keeps the current local-first manual backup/export/import model.
- No QR transfer implementation, no WebRTC/session transfer implementation, no backend/cloud/account sync, no automatic sync, and no encryption implementation.
- No backup file format change, no storage schema change, and no import/restore behavior change.
- No package version or dependency changes.
- No release package created or published, no release tag created, and no GitHub Release published.

Validator:
- `scripts/validate-web-share-runtime-prototype.js`

CI coverage:
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-web-share-runtime-prototype.js` after the Phase 11D Web Share mobile sharing prototype plan validator and preserves previous validators and Playwright E2E smoke/onboarding steps.

Allowed claims:
- Web Share runtime prototype exists where supported.
- Normal backup file download remains available as the fallback.

Forbidden claims:
- Do not claim QR transfer implemented, WebRTC/session transfer implemented, cloud/account sync implemented, automatic sync implemented, encryption implemented, backup format changed, storage schema changed, or import/restore behavior changed.
- Do not claim release tag created, GitHub Release published, or release package created/published.


Phase 11E validation phrases: backup files may include quiz content, answers, progress, and study history; normal backup file download remains the fallback; no QR transfer; no WebRTC/session transfer; no backend/cloud/account sync; no cloud/automatic sync; no automatic sync; no encryption implementation.

Phase 11E exact guardrail: no QR/WebRTC.

## Phase 11F — Web Share Runtime QA / Fallback Hardening

Phase 11F hardens the Phase 11E Web Share runtime prototype in the existing backup/restore panel and adds [`docs/web-share-runtime-qa-fallback-hardening.md`](docs/web-share-runtime-qa-fallback-hardening.md).

Scope:
- Preserves the primary normal backup file download through `Sao lưu dữ liệu`.
- Preserves restore from backup through `Chọn file sao lưu` and the existing restore parser behavior.
- Adds clearer unsupported browser fallback guidance for `navigator.share` and `navigator.canShare` capability gaps.
- Handles user cancel behavior and share failure behavior as non-destructive outcomes.
- Documents privacy boundaries: backup files may contain private quiz/study data, including quiz content, answers, progress, and study history.
- Re-states no server upload / no cloud sync and no automatic sync.

Guardrails:
- No QR transfer implemented.
- No WebRTC/session transfer implemented.
- No backend/cloud/account sync implemented.
- No automatic sync implemented.
- No encryption implementation.
- No backup format change.
- No storage schema change.
- No import/restore behavior change.
- No package/dependency change.
- No release package/tag/GitHub Release created or published.

Validation and CI:
- Adds `scripts/validate-web-share-runtime-fallback-hardening.js`.
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-web-share-runtime-fallback-hardening.js` after the Phase 11E Web Share runtime prototype validator and preserves previous validators and Playwright E2E smoke/onboarding steps.

Claims control:
- Web Share fallback hardening exists.
- Normal backup file download remains fallback.
- Unsupported/cancel/failure paths are non-destructive.
- Do not claim QR transfer implementation, WebRTC/session transfer implementation, cloud/account sync implementation, automatic sync implementation, encryption implementation, backup format/storage schema/import behavior changes, or completed release publication/tag/package actions.


## Phase 11H — Cross-device Transfer Track Closure / Release Readiness Re-audit

Phase 11H adds [`docs/cross-device-transfer-track-closure.md`](docs/cross-device-transfer-track-closure.md), a docs/static-validator/CI-only closure and re-audit document for the Phase 11 cross-device transfer track.

Scope:
- Audits Phase 11A through Phase 11F continuity.
- Summarizes current user-facing capability: local-first/browser-local backup files, restore from backup files, optional Web Share runtime prototype where supported, normal backup file download fallback, and manual/user-initiated restore.
- Documents allowed claims and forbidden claims after Phase 11H.
- Documents remaining limitations, including browser/platform-dependent Web Share support, user-initiated transfer, no automatic sync, no cloud/account sync, no encrypted backup package, no QR/session transfer, and optional manual evidence if not run.

Guardrails:
- No runtime app code changed.
- No backup format change.
- No storage schema change.
- No import/restore behavior change.
- No QR transfer implemented.
- No transfer-code flow implemented.
- No WebRTC/session transfer implemented.
- No backend/cloud/account sync implemented.
- No automatic sync implemented.
- No encryption implementation.
- No package version or dependency change.
- No release package created, no release tag created, and no GitHub Release published.

Validation and CI:
- Adds `scripts/validate-cross-device-transfer-track-closure.js`.
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-cross-device-transfer-track-closure.js` after the Phase 11F Web Share fallback hardening validator and preserves previous validators and Playwright E2E smoke/onboarding steps.

Claims control:
- Can claim Phase 11 cross-device transfer track closure exists.
- Can claim Web Share runtime prototype exists where supported.
- Can claim Web Share fallback hardening exists.
- Can claim normal backup file download remains fallback.
- Do not claim QR transfer, transfer-code flow, WebRTC/session transfer, cloud/account sync, automatic sync, encryption, backup format/storage schema/import behavior changes, release package creation, release tag creation, GitHub Release publication, production/security/privacy certification, or 99.99% reliability.

## Phase 12A — Roadmap / Risk Register / Scope Lock

Phase 12A adds [`docs/phase12-roadmap-risk-register.md`](docs/phase12-roadmap-risk-register.md), an official Phase 12 roadmap, risk register, and scope lock for the next track after the completed Phase 11H baseline. Phase 12 roadmap / risk register / scope lock added.

Theme:
- Phase 12 is scoped as a Stability + UX + Performance + Data Safety track.
- The track prioritizes safe incremental planning before runtime implementation.

Technical track:
- Storage capacity risk.
- IndexedDB migration planning.
- Storage quota warning runtime planning.
- Unit test foundation planning.
- Route-level code splitting planning.
- Future FSRS evaluation only.

UX track:
- Dashboard Today Card planning.
- Study flow micro-feedback planning.
- Later exploration for onboarding aha moment, mobile readability/typography, keyboard navigation, and mastery visualization/heatmap.

Recommended next phase:
- Phase 12B — Storage Capacity / IndexedDB Migration Plan.

Guardrails:
- No runtime app behavior changes.
- No `src/` changes.
- No package version or dependency changes.
- No storage schema changes.
- No backup format changes.
- No IndexedDB implementation.
- No FSRS implementation.
- No QR transfer, cloud/account sync, automatic sync, or encryption implementation.
- No release package created, no release tag created, and no GitHub Release published.

Validation and CI:
- Adds `scripts/validate-phase12-roadmap-risk-register.js`.
- `.github/workflows/e2e-smoke.yml` runs `node scripts/validate-phase12-roadmap-risk-register.js` after the Phase 11H closure validator and preserves previous validators and Playwright E2E smoke/onboarding steps.

## Phase 12B — Storage Capacity / IndexedDB Migration Plan

Phase 12B adds `docs/storage-capacity-indexeddb-migration-plan.md`, a dedicated storage capacity and IndexedDB migration planning document. Phase 12A roadmap/scope-lock is the completed baseline for this work.

The current app remains local-first and browser-local. Current portability remains manual backup/export/import. IndexedDB migration is planned/evaluated only and is not implemented by Phase 12B. Storage Quota Warning Runtime is recommended for Phase 12C and is not implemented by Phase 12B.

The Phase 12B plan documents backup/restore compatibility requirements, rollback/fallback requirements, and testing/evidence requirements for any future storage migration.

Scope controls for Phase 12B:

- No runtime app behavior changes.
- No `src/` changes.
- No `e2e/` changes.
- No package version/dependency changes.
- No storage schema changes.
- No backup format changes.
- No import/restore behavior changes.
- No cloud/account/automatic sync.
- No encryption.
- No release package/tag/GitHub Release created.
- New validator: `scripts/validate-storage-capacity-indexeddb-migration-plan.js`.
- CI registration added for the new validator.

## Phase 12C — Storage Quota Warning Runtime

Phase 12C adds `docs/storage-quota-warning-runtime.md` and a narrow runtime warning that uses the browser storage estimate API where available. The warning is advisory and non-blocking, and it encourages manual backup when estimated browser-local storage usage is high.

Scope controls for Phase 12C:

- No IndexedDB implementation.
- No localStorage migration.
- No storage schema change.
- No backup format change.
- No import/restore behavior change.
- No cloud/account/automatic sync.
- No encryption.
- No package version/dependency changes.
- New validator: `scripts/validate-storage-quota-warning-runtime.js`.
- CI registration added for the new validator.
- Build/static validation required; E2E may be environment-blocked if Playwright Chromium is unavailable locally.

## Phase 12D — Dashboard Today Card UX Plan

Phase 12D adds `docs/dashboard-today-card-ux-plan.md`, a Dashboard Today Card UX planning document. Phase 12C is the completed baseline for this work.

The plan documents:

- Today Card concept planned for a future runtime phase.
- Primary CTA plan documented.
- Progressive disclosure plan documented.
- Empty states documented.
- Accessibility/mobile-first requirements documented.
- Data/source requirements for Phase 12E documented.
- Testing/evidence requirements documented.
- Recommended next phase: Phase 12E — Dashboard Today Card Runtime.

Scope controls for Phase 12D:

- No runtime app behavior changes.
- No `src/` changes.
- No `e2e/` changes.
- No package version/dependency changes.
- No Dashboard runtime changes.
- No Study Room changes.
- No scoring/SRT/mastery/recommendation changes.
- No storage schema changes.
- No backup format changes.
- No IndexedDB/FSRS/cloud/account/encryption implementation.
- No release package/tag/GitHub Release created.
- New validator: `scripts/validate-dashboard-today-card-ux-plan.js`.
- CI registration added for the new validator.


## Phase 12E — Dashboard Today Card Runtime

- Added `docs/dashboard-today-card-runtime.md`.
- Phase 12D Dashboard Today Card UX plan is the completed baseline.
- Dashboard Today Card runtime added.
- Today Card provides a primary Dashboard study action using existing app data and routes.
- Existing Dashboard metrics remain available.
- Empty/fallback states are handled.
- No Study Room behavior changes.
- No scoring/SRT/mastery/recommendation algorithm changes.
- No storage schema changes.
- No backup format changes.
- No import/restore behavior changes.
- No package version/dependency changes.
- No IndexedDB, FSRS, cloud/account sync, automatic sync, or encryption implementation.
- New validator: `scripts/validate-dashboard-today-card-runtime.js`.
- CI registration added for the new validator.
- Build/static validation should pass. E2E is PASS only when browser execution actually passes; otherwise classify browser failures as environment-blocked, not product failure.

## Phase 12F — Unit Test Foundation Plan

Phase 12F adds `docs/unit-test-foundation-plan.md` and keeps Phase 12E as the completed baseline.

Covered planning areas:

- candidate pure-function test targets documented
- future Vitest strategy documented
- future CI expectations documented
- recommended next phase: Phase 12G — Vitest Unit Test Foundation

Scope boundaries:

- no runtime app behavior changes
- no `src/` changes
- no `e2e/` changes
- no tests added
- no Vitest added
- no package version/dependency changes
- no algorithm changes
- no Study Room/Dashboard behavior changes
- no storage schema changes
- no backup format changes
- no IndexedDB/FSRS/cloud/account/encryption implementation
- no release package/tag/GitHub Release created

Validation:

- new validator: `scripts/validate-unit-test-foundation-plan.js`
- CI registration added for the new validator
