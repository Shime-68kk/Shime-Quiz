# Phase 16I — Public README / Landing / Screenshots Polish + Demo Quickstart Refresh

## Phase statement

Phase 16I is market-readiness / public-facing copy / docs polish only.

This phase:

- Rewrites README.md with Vietnamese-first user sections.
- Creates demo quickstart guide for Vietnamese users.
- Creates screenshot capture guide for demo asset preparation.
- Updates public release notes with Phase 16I note.
- Updates deployment readiness with Phase 16I note.
- Does NOT implement new runtime features.
- Does NOT change EduGen runtime.
- Does NOT change scheduler/FSRS behavior.
- Does NOT change storage/schema.
- Does NOT change package.json or package-lock.json.
- Does NOT add dependencies.
- Does NOT add binary screenshot/video assets.

---

## Public copy changes

### README.md

README has been restructured to lead with user-facing sections in Vietnamese, with developer technical sections moved below.

New top-level sections (Vietnamese-first):

```text
Shime là gì?
Dành cho ai?
Thử trong 5 phút
Tính năng chính
Xưởng bản nháp EduGen là gì?
Quyền riêng tư và local-first
Trạng thái ghi nhớ thích ứng / FSRS
Cách chạy local
Cách chụp ảnh demo
Giới hạn hiện tại
Vietnamese-first design
```

Developer technical sections follow below.

### Core public copy identity lines used

```text
Shime là một phòng học yên tĩnh và riêng tư, nơi bạn tạo, xem lại và ôn tập thẻ học theo cách thuộc về mình.
```

EduGen explanation:

```text
EduGen là Xưởng bản nháp tùy chọn chạy riêng. Shime có thể giúp bạn xem lại bản nháp trước khi lưu vào thư viện, nhưng không tự gọi AI/OCR và không đảm bảo nội dung tạo ra luôn đúng.
```

Local-first explanation:

```text
Dữ liệu học nằm trong trình duyệt của bạn. Sao lưu/xuất/khôi phục vẫn là cách chính để bạn giữ quyền sở hữu dữ liệu.
```

FSRS explanation:

```text
Tính năng ghi nhớ thích ứng đang ở trạng thái thử nghiệm và được kiểm soát cẩn thận. Shime không bật rộng rãi lịch FSRS cho mọi người dùng.
```

---

## Screenshot and demo quickstart guidance

Phase 16I adds:

- [`docs/demo-quickstart.md`](demo-quickstart.md) — Vietnamese-first quickstart guide for first-time users and reviewers.
- [`docs/screenshot-capture-guide.md`](screenshot-capture-guide.md) — step-by-step guide for capturing screenshots and demo assets.

These are text guides only. Binary screenshot/video files are not included. README does not claim screenshots are present until real screenshot files are reviewed and added.

Recommended viewport sizes for screenshot capture:
- Desktop: 1280×800
- Mobile: 390×844

---

## Claim guardrails

Phase 16I explicitly does not claim:

- Built-in AI quiz generation
- Built-in OCR
- EduGen bundled into Shime
- Cloud sync available
- Sync is implemented
- E2EE implemented
- Active FSRS public rollout
- Generated questions guaranteed correct
- Production/security certification
- Frontend-only hosting can process PDF/DOCX without EduGen service
- Screenshot files exist (none have been added in this phase)

---

## No runtime feature expansion

Phase 16I does not:

- Add, modify, or delete any runtime JavaScript in `src/quiz/`, `src/state/`, `src/data/`, `src/edugen/`, `src/components/edugen/`.
- Change Study Room behavior, Dashboard behavior, scoring, SRT, mastery, FSRS, or recommendation algorithms.
- Change the import/export/backup/restore behavior or file format.
- Add any network call, AI/API integration, cloud sync service, account system, or EduGen runtime change.

---

## No EduGen runtime change

`src/edugen/edugenConnector.js`, `src/edugen/edugenDraftParser.js`, `src/edugen/edugenDraftImport.js`, and `src/components/edugen/EduGenDraftReviewPanel.jsx` are not modified by Phase 16I.

---

## No scheduler/FSRS/storage change

`src/quiz/reviewSchedulerAdapter.js`, `src/quiz/fsrsWrapper.js`, `src/state/reviewScheduleStorage.js`, `src/state/settingsStorage.js` are not modified by Phase 16I.

---

## Changed files

```text
README.md                                                              (updated — Vietnamese-first restructure)
docs/phase16i-public-readme-landing-screenshots-demo-refresh.md       (new)
docs/demo-quickstart.md                                                (new)
docs/screenshot-capture-guide.md                                       (new)
docs/public-release-notes.md                                           (updated — Phase 16I note appended)
docs/deployment-readiness.md                                           (updated — Phase 16I note appended)
scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js (new)
.github/workflows/e2e-smoke.yml                                        (updated — Phase 16I validator step added)
```

---

## Validation

Run:

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
npm run build
npm run test:unit
node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js
node scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js
```

Full validator chain:

```bash
for f in scripts/validate-*.js; do
  echo "== $f =="
  node "$f" || { echo "FAILED: $f"; break; }
done
```

Expected: FINAL_STATUS=0

---

## Suggested next phase

Phase 16J — Mobile UX / PWA Quick Wins
