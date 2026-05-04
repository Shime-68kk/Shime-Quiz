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
