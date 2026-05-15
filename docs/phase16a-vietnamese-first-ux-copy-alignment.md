# Phase 16A — Vietnamese-First UX Copy / Button Terminology Alignment

## Phase summary

Phase 16A is a Vietnamese-first UX copy / button terminology alignment
phase. It reduces friction for Vietnamese users by replacing or
supplementing high-impact English visible copy in the shipped UI with
clear, natural Vietnamese wording. This is not a full i18n localization
framework phase, and Phase 16A explicitly adds no language switcher.

The previous Phase 16A plan — Hybrid Local-First Architecture / Optional
Sync Direction — has been moved to **Phase 16B**.

## Scope (what changed)

Visible UI copy alignment only:

- `src/routes/Home.jsx` — landing page CTA buttons, navigation pills,
  Dashboard/Library/Study Room references and limit/boundary copy now
  read Vietnamese-first ("Mở Tổng quan", "Mở Thư viện", "Mở Phòng học",
  "Cần dịch vụ riêng đã cấu hình", "Chỉ sao chép/dán thủ công",
  "Xem trước · kiểm tra · xác nhận lưu").
- `src/routes/Dashboard.jsx` — the mixed-scheduler due note now uses a
  single Vietnamese sentence; the trailing English "Some cards may use
  experimental memory scheduling." was removed.
- `src/routes/StudyRoom.jsx` — "Lựa chọn từ Library" → "Lựa chọn từ
  Thư viện"; stepper buttons "Item trước" / "Item tiếp theo" →
  "Câu trước" / "Câu tiếp theo".
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx` — the
  experimental memory-rating bridge renders Vietnamese-first labels and
  helper text ("Mức độ nhớ thử nghiệm", "Có thể điều chỉnh khi bạn gặp
  lại thẻ này", "Cần ôn lại", "Tiếp tục không đánh giá",
  "Nhớ khó / Nhớ được / Nhớ dễ") with the original Phase 14N/15F
  English wording preserved as secondary helper text so existing
  claim-safety semantics, validators, and tests stay intact.
- `src/components/settings/FsrsExperimentalSettingsPanel.jsx` — toggle
  title, helper, status, disable note and confirm modal now lead with
  Vietnamese ("Bật xếp lịch ghi nhớ thử nghiệm", "Chỉ là giai đoạn
  chuẩn bị", "Trạng thái: Đang chờ", "Bật chuẩn bị"), keeping the
  English copy that Phase 14H and downstream validators look for as
  secondary helper lines.

The main navigation (`src/routes/routeConfig.js`) already used Vietnamese
labels (`Tổng quan`, `Thư viện`, `Phòng học`, `Cài đặt`); no rename was
needed there.

## Non-goals (intentional)

- No i18n framework. No locale files. No language switcher.
- No language settings key.
- No `package.json` / `package-lock.json` changes. No new dependencies.
- No route restructuring. No new persistent storage keys.
- No scheduling/storage/backup/import runtime logic changes.
- No FSRS behavior changes. No `ts-fsrs.next()` call sites added.
- No cloud/sync added. No EduGen runtime introduced.
- No broad AI/FSRS/sync/EduGen rollout claims.
- Future multi-language support is **deferred**.

Internal code symbols (component names, prop names, function names,
storage keys, internal rating values such as `Hard`/`Good`/`Easy`) stay
in English to avoid code churn.

## Translation principles applied

- Tone: clear, friendly, natural Vietnamese; not academic, not childish,
  not overloaded with technical terms.
- Forbidden in visible UI: `FSRS`, `fsrsActiveSchedulingEnabled`,
  `schedulerKind`, `fsrsPayload`, `ts-fsrs`. The bridge and settings
  panel never render these identifiers as user-facing text.
- FSRS / memory-rating bridge keeps Phase 15F semantics:
  - default OFF copy says the study schedule is not changed yet
    (Vietnamese: "Lịch học hiện tại chưa bị thay đổi");
  - internal-active copy says the rating may adjust when the card is
    next seen ("Có thể điều chỉnh khi bạn gặp lại thẻ này");
  - "Continue without rating" → "Tiếp tục không đánh giá" with the
    schedule-not-affected helper text.
- EduGen / AI / sync copy stays boundary-safe:
  Shime "không gọi AI/API", "không có API key/BYOK", EduGen "cần dịch
  vụ riêng đã cấu hình" / "không được bundle".

## Vietnamese terminology summary

Action labels used in this phase:

| English | Vietnamese |
|---|---|
| Dashboard | Tổng quan |
| Library | Thư viện |
| Study Room | Phòng học |
| Settings | Cài đặt |
| Start / Begin | Bắt đầu |
| Continue | Tiếp tục |
| Backup | Sao lưu |
| Restore | Khôi phục |
| Memory rating | Mức độ nhớ |
| Again | Chưa nhớ |
| Hard | Nhớ khó |
| Good | Nhớ được |
| Easy | Nhớ dễ |

## Claim guardrails (preserved)

- No "built-in AI" claim.
- No "OCR" claim.
- No "cloud sync enabled" claim.
- No "EduGen bundled" claim.
- No "FSRS active for everyone" / "AI scheduling enabled" claim.
- The experimental FSRS toggle remains double-gated and default OFF.

## Future multi-language support

A full i18n / locale system is intentionally deferred. If/when that
phase happens, the Vietnamese strings introduced here are the natural
seed for a `vi` locale; until then, Shime Quiz uses direct Vietnamese
copy in the existing UI without any locale infrastructure.
