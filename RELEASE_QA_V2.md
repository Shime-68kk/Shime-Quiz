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
