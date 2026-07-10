# BIG-UPDATE-10 Antigravity UI Benchmark and Roadmap

**Ngày nghiên cứu**: 2026-07-10
**Agent**: Antigravity — Product UI Lead
**Phase**: BIG-UPDATE-10 Premium Start Experience + Robot Identity + UX Writing Polish

---

## 1. Executive Product Verdict

Shime Quiz hiện có kiến trúc logic vững, bộ test ổn định, và privacy boundary rõ ràng. Đây là nền tảng tốt. Tuy nhiên, trải nghiệm người dùng ở tầng presentation còn thiếu bản sắc sản phẩm riêng, CTA hierarchy chưa rõ, và Start page chưa truyền đạt được giá trị local-first một cách nhanh và đáng nhớ.

**Nhận định Antigravity**: Shime có lợi thế thực sự — local-first, không cần tài khoản, không cloud, privacy rõ ràng, scheduler phẳng, companion robot concept. Đây là những thứ phần lớn app học tập không có. Vấn đề là UI hiện tại chưa khiến người dùng *cảm nhận được* những lợi thế này ngay ở màn hình đầu tiên.

---

## 2. Current Shime Product Experience

Dựa trên đọc trực tiếp source code:

| Area | Trạng thái hiện tại |
|------|---------------------|
| Start/Home | Text-heavy, generic card layout, hero chưa có visual anchor rõ |
| Robot identity | Chưa có visual element robot trước BIG-UPDATE-10 |
| CTA hierarchy | Ba button primary/secondary/ghost cạnh tranh ngang nhau |
| Local-first messaging | Có nhưng nằm trong đoạn text dài, không nổi bật |
| Mobile | Đã có responsive breakpoints, nhưng hero vẫn là 2-col hơi sớm |
| Motion | Có transition trên button/nav, nhưng không có entrance animation |
| Copy tone | Mix giữa learner-friendly và technical evidence language |
| Dashboard | Tab Hôm nay / Nhật ký tiến độ. Tab tiến độ có quá nhiều panel kỹ thuật |
| App shell | Sidebar có glassmorphism tốt, bottom nav có, nhưng brand chip chỉ là chữ "S" |

---

## 3. Current-Market Benchmark Method

Nghiên cứu dựa trên:
- Kiến thức product hiện tại của model về các app được nêu
- Public product positioning, landing page design patterns
- Design system patterns phổ biến trong learning apps

**Disclaimer**: Đây là nhận định từ knowledge cutoff của model, không phải live screenshot research. Các fact về feature cụ thể có thể thay đổi. Các pattern UX/design được nhận định là ổn định hơn.

Sản phẩm nghiên cứu: Duolingo, Quizlet, Anki, Brilliant, Khan Academy, RemNote, Headspace, Finch, Notion, Linear, Obsidian, Bear.

---

## 4. Competitive Product Matrix

| Dimension | Duolingo | Quizlet | Anki | Brilliant | Khan Academy | RemNote | Headspace | Shime Quiz |
|-----------|----------|---------|------|-----------|--------------|---------|-----------|------------|
| First impression | Mascot-driven, game-feel | Flashcard-first, clean | Technical, data-heavy | Premium, dark, math | Educational authority | Knowledge graph | Calm, breathing | Generic cards, text-heavy |
| Primary action | Play / Start streak | Create set / Study | Add/Review cards | Continue path | Watch lesson | Open notes | Start session | Tổng quan / Thư viện (không rõ ưu tiên) |
| Returning-user value | Streak, XP, daily goal | Study progress, sets | Due count, stats | Path progress | Continue where left off | Recent notes | Session history | Due items (nhưng chỉ thấy ở Dashboard) |
| Mobile quality | Native-feel, thumb-friendly | Good, tab heavy | Basic | Excellent scroll | Good | Mediocre | Native-feel | Functional, desktop-ish |
| Visual hierarchy | Owl + color drives eye | Card grid | List-based | Dark + typography | Logo + breadcrumb | Graph-centric | Gradient + breathing | Flat card stack |
| Learning motivation | Gamification + social | Progress + sharing | Cognitive science framing | Elegance + completeness | Free access + progress | PKM power | Mindfulness | Privacy + local ownership |
| Progress communication | XP + streak + league | % studied + accuracy | Retention graph | Skill % | Progress bar + points | Link graph | Session count | Study history + mastery (nhưng ẩn trong tab tiến độ) |
| Content density | High gamification UI | Medium | Low (minimal) | Low (focused) | Medium | High (graph) | Very low | Medium-high (nhiều card) |
| Companion identity | Duo (owl, very childish) | None | None | None | None | None | Animated blob | Shime Robot (chưa visual) |
| Motion grammar | Heavy reward animations | Subtle card flips | None | Smooth transitions | Basic | None | Breathing animations | Basic button transitions |
| Trust/Privacy | Account-required, cloud | Account-required, cloud | Local + sync optional | Account | Account | Account | Account + privacy | Local-first, no account (chưa communicated strongly) |

---

## 5. Patterns Worth Adopting

**Từ Brilliant**: Typography-first hierarchy. Một headline lớn. Subtext ngắn. Primary action rõ. Dark surfaces với accent màu teal/purple tạo cảm giác premium mà không childish.

**Từ Headspace**: Companion presence yên tĩnh. Không animated quá mức. Presence là identity, không phải gimmick. Reduced motion vẫn giữ được cảm giác.

**Từ Linear**: Spacing thoáng, CTA hierarchy rõ (primary > text links), không dùng card grid cho marketing message. Chỉ một điểm focal.

**Từ Notion**: Proof panels ngắn, icon + title + 1-2 câu. Không over-explain.

**Từ Finch**: Companion có trạng thái (mood, energy) nhưng không claim real AI. Copy tone warm và encouraging mà không gian dối.

**Từ RemNote**: Privacy positioning rõ ràng ở landing. "Your notes, your data" là anchor message.

**Từ Anki**: Không overclaim. Honest về what the app does. Người dùng technical tin tưởng vì không hype.

---

## 6. Patterns Shime Should Avoid

**Tránh Duolingo-style mascot overload**: Robot không nên có nhiều animation, expression phức tạp, hay choreography.

**Tránh Quizlet-style card grid marketing**: Grid nhiều card trông như product catalog, không như learning companion.

**Tránh Khan Academy-style authority tone**: Shime không phải educational authority. Shime là công cụ.

**Tránh streak/XP gamification**: Shime không có gamification và không nên giả vờ có.

**Tránh "AI-powered" claims**: Shime không có built-in AI và copy không nên ngụ ý điều này.

**Tránh background sync implication**: Không animation hay copy nào gợi ý dữ liệu đang sync.

---

## 7. What Shime Currently Lacks

| Thiếu | Mức độ | Có thể fix trong BIG-UPDATE-10 |
|-------|--------|-------------------------------|
| Visual focal point ở Start | High | Yes |
| Robot companion visual identity | High | Yes |
| Rõ CTA hierarchy | High | Yes |
| Trust cue local-first ngắn và nổi bật | High | Yes |
| Proof panels ngắn gọn | Medium | Yes |
| Motion grammar nhất quán | Medium | Yes |
| Returning-user quick action ở Start | Low | Partial (route to study-room) |
| Overview metric simplification | High | No — defer BIG-UPDATE-11 |
| Onboarding experience | Medium | No — defer |
| Empty/error state system | Medium | No — defer |
| Design token documentation | Low | No — defer |

---

## 8. Shime-Specific Competitive Advantages

Đây là những thứ Shime có mà đối thủ không có hoặc không nhấn mạnh:

1. **Local-first thực sự**: Không phải "offline mode", mà là default local. Không cần tài khoản.
2. **Privacy-first robot companion**: Robot không đọc câu hỏi. Safe Capsule là kỹ thuật thật.
3. **Pluggable scheduler**: SM2 stable, FSRS beta opt-in. Không lock-in vào một thuật toán.
4. **Subject spaces**: Phòng học theo môn.
5. **No cloud/AI dependency**: Không cần subscription hay API key.
6. **Import từ nhiều format**: JSON, CSV, text, Markdown.

Đây là những thứ marketing message ở Start page phải communicate, không phải ẩn trong tech docs.

---

## 9. Visual Direction Options

### Option A — "Minimal Focus Tool"
- Màu: white/off-white nền, black text, single accent color
- Hero: chỉ headline + CTA, không robot
- Motion: không animation
- Mobile: full-width single column
- **Benefits**: Nhanh, rõ, không distraction
- **Risks**: Không memorable, không có companion identity, giống Anki basic
- **Cost**: Low
- **Fit với local-first**: Good nhưng không differentiated

### Option B — "Calm Robotic Study Companion" (ưu tiên)
- Màu: warm off-white nền (#f7f3ea), deep ink text, emerald/teal accent, glass cards
- Hero: headline mạnh + robot identity chip + proof panels
- Motion: short opacity/transform transitions, idle glow pulse, reduced-motion safe
- Mobile: stacked hero, single-column proof panels
- **Benefits**: Premium, differentiated, robot companion không childish, privacy message tự nhiên
- **Risks**: CSS complexity cần scoped, robot không được ngụ ý kết nối
- **Cost**: Medium
- **Fit với local-first**: Excellent — robot chip có thể mang message "safe signals only"

### Option C — "Data Dashboard Entry"
- Màu: dark surface, data viz accents
- Hero: live due-item count + streak, direct jump to study
- Motion: number counter, loading state
- Mobile: large action button
- **Benefits**: Returning-user utility cao
- **Risks**: Cần đọc data vào Start page (forbidden), too dashboard-like for Home
- **Cost**: High + violates constraints
- **Fit với local-first**: Risk — có thể gây impression của dynamic sync

**Lựa chọn**: **Option B — Calm Robotic Study Companion**

---

## 10. Chosen Product Direction

**"Calm Robotic Study Companion"**

Shime Quiz là công cụ học tập yên tĩnh với companion robot. Start page phải truyền đạt:

1. Đây là ứng dụng học quiz — local, rõ, không cần tài khoản.
2. Dữ liệu ở trên máy của bạn.
3. Robot đồng hành bằng tín hiệu an toàn, không đọc câu hỏi.
4. Bạn có thể bắt đầu ngay.

Visual implementation:
- Warm surface, glass cards, emerald accent
- Robot chip nhỏ gọn trong hero (không phải mascot page)
- 4 proof panels ngắn
- CTA: primary "Bắt đầu học nhanh" → /dashboard, secondary "Mở Thư viện" → /library, ghost "Dùng quiz mẫu" → /library
- Motion: fade-slide hero 240ms, robot idle glow pulse 2.4s, hover lift 180ms
- Reduced motion: tắt tất cả animation, giữ state

---

## 11. Mobile Experience Strategy

**Vấn đề hiện tại**: Hero 2-column vẫn hiện ở màn hình không đủ rộng. Proof panels 4-col không collapse đúng lúc.

**Strategy**:
- Breakpoint 1024px: proof grid 4-col → 2-col
- Breakpoint 860px: hero stacked (existing publicLandingHero rule)
- Breakpoint 640px: proof grid 2-col → 1-col, robot chip wrap safe
- Hero headline dùng `clamp()` cho mobile readability
- Buttons dùng `width: 100%` trên mobile
- Touch targets tối thiểu 44px (CSS `min-height: 46px` đã có trên .button)
- Không horizontal overflow

---

## 12. Motion Grammar

**Nguyên tắc đã áp dụng trong BIG-UPDATE-10**:

| Animation | Purpose | Duration | Easing |
|-----------|---------|----------|--------|
| Hero content entry | Clarify page load context | 240ms | decelerate |
| Robot chip entry | Layered entry after hero | 180ms, 40ms delay | decelerate |
| Robot idle glow pulse | Companion alive, not static | 2400ms infinite alternate | ease-in-out |
| Proof card hover | Affordance for interactivity | 180ms | ease |
| Button hover/press | Immediate feedback | 120-180ms | ease / emphasized |

**Reduced motion**: Tất cả animation bị tắt. State vẫn clear thông qua màu sắc và layout. Không mất thông tin.

---

## 13. Vietnamese Product Voice

**Đã cập nhật**:
- "Học quiz cục bộ, rõ ràng, không cần tài khoản."
- "Dữ liệu học ở trên máy của bạn — riêng tư, rõ ràng, luôn ở đây."
- "Robot Shime · chỉ nhận tín hiệu an toàn"
- "Bắt đầu học nhanh" (primary CTA — rõ, action-oriented)
- "Mở Thư viện" (secondary)
- "Dùng quiz mẫu" (ghost)

**Voice rules** (xem `src/copy/productVoice.js`):
- Không claim cloud sync
- Không claim AI/API built-in
- Không claim OCR
- Robot không nhìn/nghe người dùng
- Real bridge chưa active

---

## 14. Accessibility Strategy

**Đã implement**:
- `ShimeRobotPresence`: `decorative=true` → `aria-hidden="true"`. `decorative=false` → `role="img"` + `aria-label`.
- Hero section: `aria-labelledby="shime-landing-title"` trên `<section>`.
- Proof panels: `role="list"` + `role="listitem"` để screen reader đọc đúng.
- `@media (prefers-reduced-motion: reduce)`: tắt tất cả animation mới.
- `focus-visible` styles đã có qua existing `.button:focus-visible`, `.navItem:focus-visible`.
- Long Vietnamese labels: `overflow-wrap: anywhere` đã có trên `p, h1, h2, h3`.

**Còn hạn chế** (deferred):
- Keyboard tab order chưa được audit toàn app.
- Skip-to-main-content link chưa có.
- Screen reader order trên mobile bottom nav chưa được test.

---

## 15. Performance Strategy

**Trong BIG-UPDATE-10**:
- Không thêm dependency.
- Không thêm raster asset.
- Robot: CSS border-radius + inline styles. Không SVG phức tạp, không canvas.
- Animation: `transform` + `opacity` only. Composited. Không gây layout/paint.
- Glow layer: `filter: blur()` — composited trên modern browsers.
- CSS addition: ~9KB cho toàn bộ BIG-UPDATE-10 styles.
- JS addition: ~8KB cho 3 module mới (motionTokens, productVoice, ShimeRobotPresence).

**LCP**: Hero text là LCP element. Text render đồng bộ với HTML. Ước tính < 1.5s trên fast 3G.
**INP**: Không blocking JS. Button callbacks là pure navigation. Ước tính < 200ms.
**CLS**: transform-only animations, không affect document flow. CLS = 0.000.

*Lưu ý: Không có measurement thực tế do không có tooling trong phase này.*

---

## 16. BIG-UPDATE-10 Implementation Scope

### Đã triển khai

| File | Thay đổi |
|------|---------|
| `src/routes/Home.jsx` | Redesign: robot chip, proof panels, CTA hierarchy |
| `src/components/brand/ShimeRobotPresence.jsx` | Mới: CSS robot identity component |
| `src/uiMotion/motionTokens.js` | Mới: motion token constants |
| `src/copy/productVoice.js` | Mới: product voice + copy maps |
| `src/styles/global.css` | Thêm: shimeLanding* + shimeRobotPresence* + keyframes + reduced-motion |
| `tests/unit/ShimeRobotPresence.test.jsx` | Mới: unit tests |
| `tests/unit/motionTokens.test.js` | Mới: unit tests |
| `tests/unit/productVoice.test.js` | Mới: unit tests |
| `scripts/validate-big-update-10-premium-ui.js` | Mới: validator |
| `docs/reports/big-update-10-*` | Mới: 5 report files |

### Không triển khai (deferred)

- Overview simplification → BIG-UPDATE-11
- App shell polish (Sidebar, BottomNav) → BIG-UPDATE-11
- Onboarding → future phase
- Design token documentation → future phase

---

## 17. BIG-UPDATE-11 Recommendation

**Tên**: BIG-UPDATE-11 — Overview Simplification + User-Friendly Progress Dashboard

**User value**: Normal users không bị overwhelm bởi technical metrics. Key learning signals hiện rõ. Evidence/debug data ẩn sau advanced panel.

**Scope**:
- Giữ nguyên data provider, storage, review schedule, study history logic.
- Collapse StudyHistoryPanel raw item prompts mặc định.
- Collapse MasteryInsightsPanel evidence chi tiết.
- Collapse MixedSchedulerDueNote vào Advanced section.
- Chỉ show key metrics: due count, daily goal, recent accuracy, weak area count.
- Thêm "Chi tiết / Nâng cao" button để expand technical panels.
- Không xóa data.

**Risks**: Dashboard có nhiều storage write paths và navigation contracts cần preserve.

**Logic boundaries**: Không thay DashboardLearningDataContext, không thay TodayJourneyCard write order, không thay StudyRoom route state.

**PASS criteria**: Overflow metrics hidden behind explicit expand. Key metrics visible. All existing tests pass. Storage behavior unchanged.

---

## 18. Medium-Term UI Roadmap

### NOW (BIG-UPDATE-10)
- ✅ Premium Start/Home redesign
- ✅ Robot identity component
- ✅ Motion token system
- ✅ Product voice system
- ✅ Proof panels
- ✅ Reduced motion support
- ✅ Bilingual copy foundation

### NEXT (BIG-UPDATE-11)
- Overview simplification (metric tiering, advanced panels)
- Progress dashboard clarity
- Key metric focus

### LATER (phân loại theo user value)

| Phase | Nội dung | User value | Risk |
|-------|---------|-----------|------|
| BIG-UPDATE-12 | StudyRoom interaction polish (answer feedback, transitions) | High — core flow | Medium |
| BIG-UPDATE-13 | Library UX polish (bookshelf, import flow, empty state) | High | Low |
| BIG-UPDATE-14 | Onboarding + first-run experience | High | Medium |
| BIG-UPDATE-15 | Empty/loading/error state system | Medium | Low |
| BIG-UPDATE-16 | App-wide design system consolidation | Medium | High |
| BIG-UPDATE-17 | Accessibility hardening (keyboard nav, skip link, screen reader audit) | Medium | Low |
| BIG-UPDATE-18 | Performance hardening (LCP measurement, INP, CLS) | Medium | Low |
| BIG-UPDATE-19 | Settings UX simplification | Low | Low |

---

## 19. Risks and Trade-offs

| Risk | Mức độ | Mitigation |
|------|--------|-----------|
| Global CSS blast radius | Medium | Classes namespaced dưới `.shimeLanding*` và `.shimeRobotPresence*` |
| Robot chip copy ngụ ý active bridge | High | Copy: "chỉ nhận tín hiệu an toàn" — không phải "đang kết nối" |
| Proof panel text quá dài trên mobile | Medium | CSS: `overflow-wrap: anywhere`, clamp font |
| Dashboard metrics overwhelming users | High | Defer to BIG-UPDATE-11 |
| Animation delay interaction | Medium | Tất cả animation là CSS-only, không delay JS callbacks |

---

## 20. Final Implementation Recommendation

**PASS — triển khai BIG-UPDATE-10 và chuẩn bị BIG-UPDATE-11.**

BIG-UPDATE-10 đã tạo ra bản sắc sản phẩm Shime riêng biệt ở Start page với robot identity, proof panels, CTA hierarchy rõ, motion nhẹ, và copy bình tĩnh. Không thay đổi logic, storage, scheduler, hay Safe Capsule.

BIG-UPDATE-11 cần được lên kế hoạch ngay để giải quyết vấn đề metric density ở Dashboard — đây là vấn đề product thực sự ảnh hưởng đến normal user experience.
