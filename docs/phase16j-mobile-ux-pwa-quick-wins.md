# Phase 16J — Mobile UX / PWA Quick Wins

## Summary

Phase 16J makes small, safe improvements to mobile/narrow-screen usability and basic PWA coherence. It does not redesign the app, add features, change study logic, change storage, change the FSRS scheduler, or change EduGen runtime.

---

## What changed

### 1. Mobile/narrow UX improvements (`src/styles/global.css`)

Added a rule at the 860px breakpoint to make landing page hero action buttons full-width on narrow viewports:

```css
@media (max-width: 860px) {
  .publicLandingHero__actions .button {
    width: 100%;
  }
}
```

**Why:** At mobile widths (below 860px) the hero section already collapses to a single column. The action buttons (`Mở Tổng quan`, `Mở Thư viện`, `Dùng quiz mẫu`) were wrapping via `flex-wrap: wrap` but remained their natural width. Making them full-width improves tap target size and readability on narrow screens in line with the existing responsive pattern already applied to `.pageHeader__actions .button` and other action groups throughout the app.

The rest of the layout — bottom navigation, card grids, page headers, study room, import flow, analytics, history, backup/restore — already had comprehensive mobile breakpoints from earlier phases. No changes to those areas were needed.

### 2. PWA quick wins (`public/sw.js`)

Updated `CACHE_VERSION` from `'shimechamhoc-v2.0.0-beta-ai.1'` to `'shimechamhoc-v2.0.0-rc1.1'`.

**Why:** The previous cache version identifier included `ai.1` which is an internal build suffix unrelated to any AI feature and potentially misleading in the context of a local-first app with no built-in AI/OCR. The updated identifier accurately reflects the project's current RC1 status and avoids any false implication of an AI-powered build. Changing the version string also causes existing clients to refresh their app-shell cache on next visit, which is safe and desirable during the RC phase.

**No other PWA changes were needed:**
- `public/manifest.webmanifest`: Valid JSON; app name/short_name coherent (`ShimeChamhoc v2` / `Shime v2`); `theme_color` and `background_color` present and consistent (`#07111f`); icon paths (`icons/icon-192.png`, `icons/icon-512.png`) point to existing files; `display: standalone` is correct; no misleading claims.
- `index.html`: `lang="vi"` present; `viewport` meta correct; `manifest` link present; `apple-touch-icon` present; description copy does not overclaim cloud/sync/AI/OCR.

---

## Mobile/narrow UX improvements

| Area | Status | Notes |
|------|--------|-------|
| Bottom navigation | ✅ Already responsive | Fixed bottom nav with `env(safe-area-inset-bottom)` support |
| Page headers | ✅ Already responsive | Stack column, full-width buttons at 860px |
| Card grids (two/three column) | ✅ Already responsive | Collapse to 1fr at 860px |
| Landing hero layout | ✅ Already responsive | Collapses to 1fr at 860px |
| Landing hero action buttons | ✅ Fixed in 16J | Now full-width at ≤860px |
| Study Room (choice list, stepper) | ✅ Already responsive | Responsive at 720px |
| Import flow | ✅ Already responsive | Responsive at 720–860px |
| Analytics / history panels | ✅ Already responsive | Responsive at 640px |
| Backup / restore | ✅ Already responsive | Responsive at 640px |
| Dashboard Today Card | ✅ Already responsive | 860px breakpoint |
| Mastery/recommendation panels | ✅ Already responsive | 700–720px breakpoints |
| Vietnamese copy readability | ✅ Preserved | `overflow-wrap: anywhere` on p/h1/h2/h3; min-width: 320px on body |

No horizontal overflow issues were found in any existing section. The `body` already has `overflow-x: hidden` and `min-width: 320px` from global.css baseline.

---

## PWA/readiness checks

| Check | Status | Notes |
|-------|--------|-------|
| `manifest.webmanifest` exists | ✅ | Valid JSON |
| `name` and `short_name` coherent | ✅ | "ShimeChamhoc v2" / "Shime v2" |
| `theme_color` present | ✅ | `#07111f` |
| `background_color` present | ✅ | `#07111f` |
| Icon paths valid | ✅ | `icons/icon-192.png`, `icons/icon-512.png` exist |
| `display: standalone` | ✅ | Correct |
| `start_url` coherent | ✅ | `./index.html` |
| `orientation` set | ✅ | `portrait-primary` |
| SW cache version accurate | ✅ Fixed in 16J | Updated from `beta-ai.1` to `rc1.1` |
| index.html metadata | ✅ | No cloud/sync/AI/OCR overclaims |
| SW offline fallback | ✅ | Vietnamese offline message present |

---

## Manual smoke notes

Manual browser smoke was not possible in this automated environment. The following should be verified manually before public release:

- Home at desktop width (≥860px): three hero buttons display inline
- Home at mobile/narrow width (<860px): three hero buttons stack full-width
- Dashboard at mobile/narrow width: card grids collapse, Today Card stacks
- Study Room at mobile/narrow width: choice options full-width, stepper stacks
- Library at mobile/narrow width: topic pills usable
- Settings at mobile/narrow width: toggle row usable
- No horizontal overflow in any route
- PWA manifest loads without missing icon/path issues
- `navigator.serviceWorker` registers without console errors

**Limitation:** This report confirms code-level changes only. Visual pixel-level confirmation requires manual browser testing at 390px (iPhone SE) and 768px (tablet) widths.

---

## Claim guardrails

Phase 16J does not introduce, imply, or enable:

- Built-in AI quiz generation
- Built-in OCR
- Cloud sync or account/auth
- EduGen bundled with Shime
- E2EE / end-to-end encryption
- Production security or accessibility certification
- Active FSRS public rollout
- Any guarantee of quiz content correctness

The service worker cache version update (`rc1.1`) refers to the project's RC1 release stage, not an AI feature.

**Không có AI/OCR tích hợp. Không có đồng bộ đám mây. Không có tài khoản. Không đảm bảo nội dung.**

---

## Scope control

### No runtime logic expansion

- No new study scheduling logic
- No new storage schema changes
- No new backup/import behavior changes
- No new recommendation or mastery calculation changes

### No EduGen, No scheduler, No FSRS, No storage changes

- `src/edugen/` — not changed
- `src/components/edugen/` — not changed
- `src/quiz/reviewSchedulerAdapter.js` — not changed
- `src/quiz/fsrsWrapper.js` — not changed
- `src/state/reviewScheduleStorage.js` — not changed
- `src/state/settingsStorage.js` — not changed
- `src/data/learningDataAdapter.js` — not changed
- `src/data/importValidator.js` — not changed
- No new `ts-fsrs.next()` call sites

### No package or dependency changes

- `package.json` — not changed
- `package-lock.json` — not changed
- No new npm dependencies added

---

## Changed files

| File | Change |
|------|--------|
| `src/styles/global.css` | Added `.publicLandingHero__actions .button { width: 100%; }` at 860px breakpoint |
| `public/sw.js` | Updated `CACHE_VERSION` from `shimechamhoc-v2.0.0-beta-ai.1` to `shimechamhoc-v2.0.0-rc1.1` |
| `docs/phase16j-mobile-ux-pwa-quick-wins.md` | This document (new) |
| `scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js` | Phase 16J static validator (new) |
| `.github/workflows/e2e-smoke.yml` | Added Phase 16J validator step after Phase 16I |
| `scripts/validate-phase16e-visual-polish-quick-wins.js` | Added Phase 16J forward-compat entries to allowlist |
| `scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js` | Added Phase 16J forward-compat entries to allowlist |
| `scripts/validate-phase16g-edugen-draft-review-import-flow.js` | Added Phase 16J forward-compat entries to allowlist |
| `scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js` | Added Phase 16J forward-compat entries to allowlist |
| `scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js` | Added Phase 16J forward-compat entries to allowlist |

---

## Required terms checklist

- mobile: ✅
- narrow: ✅
- PWA: ✅
- viewport: ✅
- tap target: ✅
- manifest: ✅
- service worker: ✅
- Vietnamese: ✅ (Không có AI/OCR tích hợp)
- overflow: ✅
- responsive: ✅
