# Shime Quiz / ShimeChamhoc v2

> Shime là một phòng học yên tĩnh và riêng tư, nơi bạn tạo, xem lại và ôn tập thẻ học theo cách thuộc về mình.

---

## Shime là gì?

Shime là một **local-first quiz study app** — ứng dụng học quiz local-first cho người dùng tiếng Việt. Bạn nhập nội dung học, xem trước bản nháp, kiểm tra chất lượng, lưu vào trình duyệt và ôn tập trong Phòng học — tất cả không cần tài khoản, không cần kết nối internet.

Dữ liệu học nằm trong trình duyệt của bạn. Sao lưu/xuất/khôi phục vẫn là cách chính để bạn giữ quyền sở hữu dữ liệu.

---

## Dành cho ai?

- Học sinh, sinh viên muốn tự tạo và ôn tập thẻ ghi nhớ
- Giáo viên muốn chuẩn bị bộ câu hỏi riêng từ tài liệu của mình
- Phụ huynh muốn giúp con ôn tập một cách có kế hoạch
- Người dùng muốn học riêng tư mà không cần gửi dữ liệu lên server

---

## Thử trong 5 phút

1. Mở ứng dụng — không cần đăng ký, không cần tài khoản.
2. Vào **Thư viện** và nhấn **Dùng quiz mẫu** để tải một bộ quiz mẫu.
3. Xem trước bản nháp, xem lại chất lượng, rồi nhấn **Xác nhận lưu** để lưu vào thư viện.
4. Vào **Phòng học** để bắt đầu ôn tập.
5. Xem tiến độ của bạn tại **Tổng quan**.

Demo mẫu không tự lưu, không gọi AI/API và không cần EduGen. Bạn vẫn xem trước và xác nhận trước khi bất kỳ thứ gì được lưu.

---

## Tính năng chính

- **Thư viện** — nhập, lưu và quản lý nội dung quiz
- **Phòng học** — ôn tập trắc nghiệm, câu ngắn và flashcard
- **Tổng quan (Dashboard)** — theo dõi tiến độ học cục bộ và gợi ý học tập
- **Sao lưu / Khôi phục** — tự quản lý dữ liệu, chuyển giữa thiết bị
- **Nhập nhiều định dạng** — JSON, CSV, text/Markdown, file .txt/.md
- **Xem trước và kiểm tra chất lượng** — mọi bản nháp đều qua bước kiểm tra trước khi lưu
- **Xưởng bản nháp EduGen** — tùy chọn xem lại bản nháp từ tài liệu PDF/DOCX (cần dịch vụ riêng)

---

## Xưởng bản nháp EduGen là gì?

EduGen là Xưởng bản nháp tùy chọn chạy riêng. Shime có thể giúp bạn xem lại bản nháp trước khi lưu vào thư viện, nhưng không tự gọi AI/OCR và không đảm bảo nội dung tạo ra luôn đúng.

**Điều quan trọng cần biết:**

- EduGen không được tích hợp sẵn trong Shime — đây là dịch vụ bạn tự cấu hình và chạy riêng.
- Chỉ hosting frontend không có khả năng chuyển đổi PDF/DOCX/PPTX/ZIP mà không có dịch vụ EduGen.
- Kết quả từ EduGen chỉ là bản nháp — bạn cần xem lại trước khi lưu vào thư viện.
- Shime không có built-in AI generation, không gọi external AI/API và không có API key/BYOK.

Nếu không có dịch vụ EduGen, bạn vẫn có thể dùng JSON/CSV import, text/Markdown paste và file .txt/.md — tất cả hoạt động hoàn toàn local.

---

## Quyền riêng tư và local-first

- **Không cần tài khoản** — không đăng ký, không đăng nhập.
- **Dữ liệu ở đâu?** — Dữ liệu học nằm trong bộ nhớ cục bộ của trình duyệt (localStorage).
- **Không có cloud sync** — Shime không thêm backend, không tự đồng bộ hóa cross-device.
- **Sao lưu và khôi phục** — Bạn tự xuất/nhập file sao lưu để di chuyển dữ liệu giữa thiết bị.
- **Cảnh báo** — Bộ nhớ trình duyệt không phải vault bảo mật server-side. Không dùng ứng dụng này như hệ thống chống gian lận hay bảo mật production.

Sao lưu/xuất/khôi phục vẫn là cách chính để bạn giữ quyền sở hữu dữ liệu.

---

## Trạng thái ghi nhớ thích ứng / FSRS

Tính năng ghi nhớ thích ứng đang ở trạng thái thử nghiệm và được kiểm soát cẩn thận. Shime không bật rộng rãi lịch FSRS cho mọi người dùng.

- FSRS (Free Spaced Repetition Scheduler) là tính năng thực nghiệm, chỉ bật nội bộ có kiểm soát.
- Phần lớn người dùng hiện tại sẽ dùng bộ lập lịch SRT mặc định.
- Không có FSRS public rollout nào đang diễn ra.

---

## Quick start — Cách chạy local

```bash
npm ci
npm run dev
```

Mở địa chỉ local do Vite hiển thị. Để build production:

```bash
npm run build
npm run preview
```

Để chạy unit tests:

```bash
npm run test:unit
```

---

## Cách chụp ảnh demo

Xem hướng dẫn chi tiết tại [`docs/screenshot-capture-guide.md`](docs/screenshot-capture-guide.md) và quickstart tại [`docs/demo-quickstart.md`](docs/demo-quickstart.md).

Tóm tắt nhanh cho ảnh demo:
1. Chạy app local (`npm run dev`).
2. Dùng dữ liệu mẫu/demo — không dùng dữ liệu học thật.
3. Chụp ở viewport 1280×800 (desktop) hoặc 390×844 (mobile).
4. Không chụp khi có thông tin cá nhân trên màn hình.
5. Các màn hình nên chụp: Home, Dashboard, Thư viện, Phòng học, Settings EduGen Draft Workshop.

Ảnh demo thực chưa được tạo; hướng dẫn này tồn tại để hỗ trợ việc chụp ảnh trong tương lai. README không nhận là đã có ảnh demo cho đến khi file ảnh thật được thêm vào.

---

## Giới hạn hiện tại

Shime hiện **không** bao gồm:

- Không có built-in AI generation hay OCR
- Không có external AI/API integration từ Shime
- Không có API key/BYOK support
- Không có backend, auth hay cloud sync
- Không có cross-device sync tự động
- Không có EduGen tích hợp sẵn trong Shime frontend
- Không có chuyển đổi PDF/DOCX/PPTX/ZIP khi chỉ dùng frontend-only
- Không có production/security/accessibility certification
- Không có release tag hay GitHub Release (chưa publish)
- Ảnh demo thực chưa có; hướng dẫn chụp ảnh tồn tại để chụp trong tương lai

---

## Vietnamese-first design

Shime được thiết kế với tiếng Việt là ngôn ngữ ưu tiên. Tất cả copy chính trong UI đều bằng tiếng Việt. Tài liệu kỹ thuật bằng tiếng Anh nằm ở phía sau cho developer.

---

## Supported import paths

Shime supports these local-first import surfaces:

- JSON quiz data
- CSV quiz data
- pasted text/Markdown draft content
- local `.txt` / `.md` draft files
- PDF/DOCX/PPTX/ZIP draft import only through a separately configured, browser-reachable EduGen/File Processor service

EduGen/File Processor is not bundled into Shime. Frontend-only hosting alone does not provide PDF/DOCX/PPTX/ZIP document conversion. See [`docs/edugen-boundary-polish.md`](docs/edugen-boundary-polish.md) for deployment copy and evidence rules.

---

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

---

## Local-first privacy model

Shime is designed as a static, local-first browser app:

- no backend/auth/cloud sync
- no automatic cross-device/account sync
- no account required
- no cross-device sync service
- browser-local storage for app data
- backup export/import for user-controlled portability
- moving data between devices requires explicit user export/import/backup/restore; full backups may contain private study data and answers

Local/browser storage is not a secure server-side vault. Do not use this app as an anti-cheat or production security system.

---

## Manual AI workflow boundary

Shime includes manual AI workflow support only:

- manual prompt/export workflow
- manual paste/import of AI output
- advisory review/import hardening for pasted output

Shime does not provide built-in AI generation, external AI/API calls, API key/BYOK support, or OCR.

---

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

---

## Unsupported / not claimed

Shime does not claim or include:

- no backend/auth/cloud sync
- no automatic cross-device/account sync
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

---

## Public polish docs

- Public landing/root route polish: [`docs/public-landing-page.md`](docs/public-landing-page.md)
- SEO/Open Graph/social preview metadata: [`docs/social-preview-metadata.md`](docs/social-preview-metadata.md)
- Direct-route / SPA fallback audit: [`docs/direct-route-spa-fallback.md`](docs/direct-route-spa-fallback.md)
- Screenshot asset checklist: [`docs/screenshot-asset-pack.md`](docs/screenshot-asset-pack.md)
- Demo quickstart: [`docs/demo-quickstart.md`](docs/demo-quickstart.md)
- Screenshot capture guide: [`docs/screenshot-capture-guide.md`](docs/screenshot-capture-guide.md)

Actual screenshot image files are not included yet; the screenshot checklist exists for future capture. README does not claim screenshots are available until real reviewed image files are added.

---

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
- Cross-device export/import guidance: [`docs/cross-device-export-import.md`](docs/cross-device-export-import.md)
- Study Room / Dashboard regression smoke checklist: [`docs/study-dashboard-regression-smoke.md`](docs/study-dashboard-regression-smoke.md)
- Accessibility / keyboard smoke checklist: [`docs/accessibility-keyboard-smoke.md`](docs/accessibility-keyboard-smoke.md)
- Final public release readiness re-audit: [`docs/final-public-release-readiness-reaudit.md`](docs/final-public-release-readiness-reaudit.md)
- Release candidate tag/publish gate: [`docs/release-candidate-tag-publish-gate.md`](docs/release-candidate-tag-publish-gate.md)
- Release tag creation plan: [`docs/release-tag-creation-plan.md`](docs/release-tag-creation-plan.md)
- GitHub Release publication plan: [`docs/github-release-publication-plan.md`](docs/github-release-publication-plan.md)
- Release package assembly plan: [`docs/release-package-assembly-plan.md`](docs/release-package-assembly-plan.md)
- Final release execution checklist: [`docs/final-release-execution-checklist.md`](docs/final-release-execution-checklist.md)
- Final main verification / release authorization packet: [`docs/final-main-release-authorization.md`](docs/final-main-release-authorization.md)
- Full QA/release checklist: [`RELEASE_QA_V2.md`](RELEASE_QA_V2.md)
- README rewrite/split guide: [`docs/readme-public-facing-guide.md`](docs/readme-public-facing-guide.md)
- Performance / bundle-size audit: [`docs/performance-bundle-audit.md`](docs/performance-bundle-audit.md)
- Mobile UX smoke checklist: [`docs/mobile-ux-smoke.md`](docs/mobile-ux-smoke.md)
- EduGen/File Processor boundary polish: [`docs/edugen-boundary-polish.md`](docs/edugen-boundary-polish.md)
- Manual evidence results log/template: [`docs/manual-evidence-results-log.md`](docs/manual-evidence-results-log.md)
- Manual evidence execution checklist / evidence capture guide: [`docs/manual-evidence-execution-checklist.md`](docs/manual-evidence-execution-checklist.md)
- Cross-device transfer UX decision plan: [`docs/cross-device-transfer-ux-decision.md`](docs/cross-device-transfer-ux-decision.md)
- Backup transfer safety hardening plan: [`docs/backup-transfer-safety-hardening.md`](docs/backup-transfer-safety-hardening.md)
- Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](docs/manual-evidence-run-pack.md)
- Release candidate freeze / final decision: [`docs/release-candidate-freeze-final-decision.md`](docs/release-candidate-freeze-final-decision.md)

Current RC capabilities and release readiness are documented in the files above.

The release candidate tag/publish gate documents that explicit user approval is required before tagging or publishing. The release tag decision, GitHub Release draft, and publish checklist are documentation only. They do not create a tag, publish a GitHub Release, or certify production/security/accessibility readiness.

---

## Phase 10S manual evidence results log

The optional manual evidence results log/template is documented in [`docs/manual-evidence-results-log.md`](docs/manual-evidence-results-log.md). Phase 10S adds a structured place to record future evidence results only. No manual evidence was executed by Phase 10S, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, and no release package was created or published. Package version/dependencies remain unchanged, no runtime app behavior changed, and no production/security/accessibility/performance certification is claimed.

## Phase 10T manual evidence execution checklist

The optional manual evidence execution checklist / evidence capture guide is documented in [`docs/manual-evidence-execution-checklist.md`](docs/manual-evidence-execution-checklist.md). Phase 10T adds step-by-step guidance for future user-approved evidence capture and for filling [`docs/manual-evidence-results-log.md`](docs/manual-evidence-results-log.md). No manual evidence was executed by Phase 10T, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no E2E pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, and no release package was created or published. Package version/dependencies remain unchanged, no runtime app behavior changed, and no production/security/accessibility/performance certification is claimed.


## Phase 11A cross-device transfer UX decision

The cross-device transfer UX decision / convenience plan is documented in [`docs/cross-device-transfer-ux-decision.md`](docs/cross-device-transfer-ux-decision.md). Phase 11A evaluates friendlier transfer options and recommends a staged roadmap for future UX polish while keeping the current app local-first/browser-local.

Current portability remains manual backup/export/import. No QR transfer was implemented, no Web Share implementation was added, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic cross-device sync was added, no encryption claim was added, no backup/restore/import/storage runtime behavior changed, no package version/dependencies changed, no release tag was created, no GitHub Release was published, and no release package was created or published.

## Phase 11B cross-device transfer UX copy polish

Phase 11B adds friendlier in-app transfer/backup wording around the existing local backup flow. The backup panel now presents the flow as "Transfer data between devices," with "Save backup file," "Restore from backup," and "Move my quizzes to this device" language so non-technical users understand the manual desktop-to-phone path.

Current transfer still uses manual backup/export/import. No QR transfer was implemented, no Web Share implementation was added, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic sync was added, no encryption implementation was added, no storage schema changed, no backup file format changed, no package version/dependencies changed, no release tag was created, no GitHub Release was published, and no release package was created or published.

## Phase 11C backup transfer safety hardening

The backup transfer safety hardening plan is documented in [`docs/backup-transfer-safety-hardening.md`](docs/backup-transfer-safety-hardening.md). Phase 11C documents future backup metadata, checksum/error-detection, import preview, merge/replace/keep-both, duplicate/conflict handling, privacy, compatibility, and safe-failure requirements for future transfer work.

Current transfer still uses manual backup/export/import. No backup format changed, no storage schema changed, no import/restore behavior changed, no checksum/compression/encryption was implemented, no QR transfer was implemented, no Web Share implementation was added, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic sync was added, no package version/dependencies changed, no release tag was created, no GitHub Release was published, and no release package was created or published.

## Phase 11D Web Share / mobile sharing prototype plan

The Web Share / mobile sharing prototype plan is documented in [`docs/web-share-mobile-sharing-prototype-plan.md`](docs/web-share-mobile-sharing-prototype-plan.md). Phase 11D evaluates a future mobile-friendly share-sheet flow for backup files while preserving the current local-first/manual backup/export/import model.

No Web Share runtime was implemented, no QR transfer was implemented, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic sync was added, no encryption implementation was added, no runtime app behavior changed, no backup format/storage schema/import behavior changed, no package version/dependencies changed, no release tag was created, no GitHub Release was published, and no release package was created or published.


## Phase 11E Web Share runtime prototype

Phase 11E adds a small Web Share runtime prototype in the existing backup/restore panel where browser/platform support is available. The existing manual backup file download remains the fallback, and the E2E-visible Vietnamese controls remain preserved: heading `Sao lưu dữ liệu`, button `Sao lưu dữ liệu`, success text `Đã tạo file sao lưu`, and file input label `Chọn file sao lưu`.

The prototype uses the same backup file content as the normal backup download flow and does not change the backup format, storage schema, or import/restore behavior. Web Share support depends on the browser/platform. The app does not upload backup files to a server, does not create cloud sync or automatic sync, does not implement QR transfer or WebRTC/session transfer, and does not implement encryption. Package version/dependencies are unchanged, and the release package/tag/GitHub Release remain uncreated/unpublished.


Phase 11E validation phrases: backup files may include quiz content, answers, progress, and study history; normal backup file download remains the fallback; no QR transfer; no WebRTC/session transfer; no backend/cloud/account sync; no cloud/automatic sync; no automatic sync; no encryption implementation.

## Phase 11F Web Share runtime QA / fallback hardening

Phase 11F documents and hardens Web Share fallback behavior in [`docs/web-share-runtime-qa-fallback-hardening.md`](docs/web-share-runtime-qa-fallback-hardening.md). Where supported, the optional Web Share action remains a convenience path for the same backup file. Normal backup file download remains the fallback, and restore from backup remains available.

Unsupported browser, `navigator.canShare` false/unsupported, user cancel, and share failure paths use non-destructive guidance. Backup files may include quiz content, answers, progress, and study history, so users should share them only through destinations they trust. This does not upload backup files to a server and does not create cloud sync or automatic sync.

No QR transfer was implemented, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no encryption implementation was added, no backup format changed, no storage schema changed, no import/restore behavior changed, package version/dependencies are unchanged, and release package/tag/GitHub Release remain uncreated/unpublished.


## Phase 11H cross-device transfer track closure

The Phase 11 cross-device transfer track closure and release-readiness re-audit is documented in [`docs/cross-device-transfer-track-closure.md`](docs/cross-device-transfer-track-closure.md). Phase 11H summarizes Phase 11A–11F continuity, allowed and forbidden claims, remaining limitations, and next-phase options.

Current transfer remains local-first/manual backup/export/import. Web Share runtime prototype exists where supported. Normal backup file download remains fallback, and restore from backup remains available. No QR transfer was implemented, no transfer-code flow was implemented, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic sync was added, no encryption implementation was added, no backup format/storage schema/import behavior changed, package version/dependencies are unchanged, and release package/tag/GitHub Release remain uncreated/unpublished.

## Phase 12 roadmap / risk register / scope lock

The Phase 12 roadmap, risk register, and scope lock is documented in [`docs/phase12-roadmap-risk-register.md`](docs/phase12-roadmap-risk-register.md). Phase 12 is planned as a Stability + UX + Performance + Data Safety track after the completed Phase 11H baseline.

Phase 12A does not implement runtime work. IndexedDB migration, FSRS evaluation, QR transfer, cloud/account sync, automatic sync, and encryption remain future/planned only unless later phases explicitly implement and validate them.

## Phase 12B storage capacity / IndexedDB migration planning

The Phase 12B storage capacity and IndexedDB migration planning document is available at [`docs/storage-capacity-indexeddb-migration-plan.md`](docs/storage-capacity-indexeddb-migration-plan.md).

Phase 12B documents storage capacity risk and evaluates a future IndexedDB migration path only. IndexedDB is not implemented by Phase 12B, no storage schema or backup format change is made by Phase 12B, and manual backup/export/import remains the current portability model.

## Phase 12C storage quota warning runtime

Phase 12C adds a small advisory storage quota warning where browser storage estimate APIs are available. The warning is non-blocking and encourages manual backup when estimated browser-local storage usage is high.

Manual backup/export/import remains the portability model. IndexedDB is still not implemented, localStorage is not migrated, and storage schema and backup format are unchanged by Phase 12C. See [`docs/storage-quota-warning-runtime.md`](docs/storage-quota-warning-runtime.md).

## Phase 12D Dashboard Today Card UX planning

The Dashboard Today Card UX plan is documented in [`docs/dashboard-today-card-ux-plan.md`](docs/dashboard-today-card-ux-plan.md). Phase 12D plans a future Dashboard simplification strategy around the learner question "What should I study today?"

Today Card runtime is planned for a future phase and is not implemented by Phase 12D. Dashboard runtime behavior is unchanged by Phase 12D, and the app remains local-first/browser-local.


### Phase 12E Dashboard Today Card runtime

Phase 12E adds a small [Dashboard Today Card runtime](docs/dashboard-today-card-runtime.md) so the Dashboard has a clearer first study action. The card uses existing app data and existing routes, keeps existing Dashboard metrics available, and does not change Study Room logic or scoring/SRT/mastery/recommendation algorithms. Shime remains local-first and browser-local.

### Phase 12F Unit Test Foundation planning

The [Unit Test Foundation Plan](docs/unit-test-foundation-plan.md) documents candidate future unit test targets and a future Vitest adoption strategy. Phase 12F does not add Vitest, does not add unit tests, and does not change package/dependencies.


### Phase 12G Vitest Unit Test Foundation

Phase 12G adds a minimal [Vitest Unit Test Foundation](docs/vitest-unit-test-foundation.md). Unit tests can be run with `npm run test:unit`.

The initial unit tests are limited to selected pure/near-pure helpers and do not replace Playwright E2E smoke/onboarding checks. Phase 12G does not claim runtime app behavior changes or scoring/SRT/mastery/recommendation algorithm changes.

## Phase 12H Study Flow Micro-feedback Plan

The Study Flow Micro-feedback Plan is documented in [`docs/study-flow-micro-feedback-plan.md`](docs/study-flow-micro-feedback-plan.md). Phase 12H plans future Study Room feedback principles, copy guidance, accessibility/reduced-motion requirements, and algorithm boundaries.

Runtime micro-feedback is planned for a future phase and is not implemented by Phase 12H. Study Room behavior is unchanged by Phase 12H, scoring/SRT/mastery/recommendation algorithms are unchanged by Phase 12H, and the app remains local-first/browser-local.


## Phase 12I Study Flow Micro-feedback Runtime

Phase 12I implements a narrow Study Room runtime UX improvement based on the Phase 12H plan. The runtime note is documented in [`docs/study-flow-micro-feedback-runtime.md`](docs/study-flow-micro-feedback-runtime.md).

This phase adds lightweight visible micro-feedback and replaces native browser confirmation prompts for Study Room session completion/restart with inline confirmation UI. It also keeps direct result-summary navigation to Library and Dashboard so learners are not forced to use the browser Back button after a session.

Phase 12I does not change answer correctness, scoring, SRT, mastery, recommendation algorithms, storage schema, backup format, package version, or package dependencies. The app remains local-first and browser-local.

## Phase 12J Phase 12 Closure / Release Decision

Phase 12J closes the Phase 12 track. The closure note is documented in [`docs/phase12-closure-release-decision.md`](docs/phase12-closure-release-decision.md).

Phase 12 is closed through Phase 12J after the completed Phase 12A–12I work. Phase 12J is docs/static-validator/CI-only and does not change runtime behavior, package/dependency state, Study Room behavior, Dashboard behavior, scoring/SRT/mastery/recommendation algorithms, storage schema, backup format, import/restore behavior, or release artifacts.

No release package, release tag, or GitHub Release is created by Phase 12J. Phase 13 is ready for handoff to a different working setup/chatbot from latest main after Phase 12J merge.

## Phase 16I — Public README / Landing / Screenshots Polish + Demo Quickstart Refresh

Phase 16I is market-readiness / public-facing copy / docs polish only. No runtime feature expansion, no EduGen runtime change, no scheduler/FSRS change, no storage/schema change, no package/dependency change.

Changes in Phase 16I:
- README rewritten with Vietnamese-first user sections (Shime là gì, Dành cho ai, Thử trong 5 phút, Tính năng chính, Xưởng bản nháp EduGen là gì, Quyền riêng tư và local-first, Trạng thái ghi nhớ thích ứng/FSRS, Cách chạy local, Cách chụp ảnh demo, Giới hạn hiện tại).
- Developer technical sections moved below user-facing sections.
- New: [`docs/demo-quickstart.md`](docs/demo-quickstart.md) — Vietnamese-first demo quickstart guide.
- New: [`docs/screenshot-capture-guide.md`](docs/screenshot-capture-guide.md) — screenshot/demo asset capture instructions.
- Updated: [`docs/public-release-notes.md`](docs/public-release-notes.md) — Phase 16I note.
- Updated: [`docs/deployment-readiness.md`](docs/deployment-readiness.md) — Phase 16I note.
- New: [`docs/phase16i-public-readme-landing-screenshots-demo-refresh.md`](docs/phase16i-public-readme-landing-screenshots-demo-refresh.md) — phase doc.
- New: [`scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js`](scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js) — static validator.

See [`docs/phase16i-public-readme-landing-screenshots-demo-refresh.md`](docs/phase16i-public-readme-landing-screenshots-demo-refresh.md) for the full phase doc and claim guardrails.
