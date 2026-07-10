# BIG-UPDATE-10 UX Writing Guide

## Phase identification
**big-update-10** — Premium Start Experience + Robot Identity + UX Writing Polish

---

## Product Voice

### Core voice attributes
| Attribute | Description |
|-----------|-------------|
| **Calm** | Never urgent, never pushy. The app is a quiet companion. |
| **Precise** | Say exactly what is true. No vague claims. |
| **Encouraging** | Positive without being preachy or childish. |
| **Local-first** | Always honest that data is local. Never imply cloud. |
| **Not overpromising** | Never claim features that don't exist. Never imply real robot bridge is active. |

### What to say
- "Học quiz cục bộ, rõ ràng, không cần tài khoản."
- "Dữ liệu học ở trên máy của bạn."
- "Phòng học theo môn, ôn đúng lúc trước khi quên."
- "Shime chỉ nhận tín hiệu an toàn, không nhận nội dung câu hỏi."
- "Bắt đầu học nhanh"
- "Mở Phòng học"
- "Dùng quiz mẫu"

### What NOT to say
- ❌ "AI thông minh" / "AI giúp bạn học" — no AI features built-in
- ❌ "Đồng bộ với đám mây" / "Sync to cloud" — not supported
- ❌ "Robot nhìn thấy bạn" / "Robot sees you" — robot does not perceive user
- ❌ "Kết nối robot thật đang hoạt động" — real bridge not active in this version
- ❌ "Được chứng nhận bảo mật" — no security certification
- ❌ Overlong paragraphs (>5 lines) — use bullet lists instead
- ❌ Stiff/literal translations that sound machine-generated

---

## Copy Inventory — Updated in BIG-UPDATE-10

### Hero Section (src/routes/Home.jsx)
| Key | Vietnamese | English |
|-----|------------|---------|
| eyebrow | ShimeChamhoc v2 | ShimeChamhoc v2 |
| headline | Học quiz cục bộ, rõ ràng, không cần tài khoản. | Local quiz learning, clear and private, no account needed. |
| identityLine | Dữ liệu học ở trên máy của bạn — riêng tư, rõ ràng, luôn ở đây. | Your study data lives on your device — private, yours, always here. |
| ctaPrimary | Bắt đầu học nhanh | Start studying |
| ctaSecondary | Mở Thư viện | Open Library |
| ctaGhost | Dùng quiz mẫu | Use sample quiz |

### Robot Chip
| Key | Vietnamese | English |
|-----|------------|---------|
| robotCaption | Robot Shime · chỉ nhận tín hiệu an toàn | Shime Robot · receives only safe signals |

### Proof Panels
| Panel | Title | Key message |
|-------|-------|-------------|
| Local-first | Dữ liệu của bạn, ở đây. | No account, no backend, no cloud sync |
| Subject Rooms | Phòng học theo môn. | Study rooms organized by subject |
| Privacy | Shime chỉ nhận tín hiệu an toàn. | Redacted signals only, never question content |
| Review Reminder | Ôn đúng lúc, trước khi quên. | Local review schedule, offline capable |

---

## Voice Rules (machine-verifiable — see src/copy/productVoice.js VOICE_RULES)

| Rule ID | Forbidden Pattern | Reason |
|---------|-------------------|--------|
| no-cloud-claim | cloud sync (without negation) | Must not claim cloud sync |
| no-ai-api-claim | calls external AI/API | Must not claim external AI calls |
| no-ocr-claim | OCR support / supports OCR | Must not claim OCR |
| no-auth-claim | login/auth or auth/login | Must not claim auth/login |
| no-robot-sense | robot sees/hears/listens/watches | Robot does not perceive user |
| no-real-bridge-active | real robot bridge is now active | Real bridge not active in this version |

---

## Language Priority
- **Default**: Tiếng Việt (vi)
- **Preview**: English (en) — available via ShimeLanguageProvider
- **Fallback**: vi for any unknown locale
- **Storage**: No persistence (preview mode only in current phase)
- **Runtime integration**: Deferred to Codex for global wiring

---

## Copy Checklist

- [x] Hero headline includes local-first message
- [x] Hero CTA hierarchy is primary > secondary > ghost
- [x] Robot chip does not imply robot perceives user
- [x] Privacy/safety copy uses "dữ liệu đã làm mờ/rút gọn"
- [x] No cloud/AI/API implied where feature doesn't exist
- [x] No "tài khoản" (account) required claim
- [x] EduGen noted as optional, not bundled
- [x] Real robot bridge stated as not active
- [x] Proof panels are concise (≤3 lines each)
- [x] No Vietnamese sentences longer than 40 words in hero
- [x] Vietnamese labels wrap safely on mobile (tested CSS)

---

## no blocking intro animation: yes
## no autoplay video: yes
## no cloud/backend/network added: yes
## no real robot bridge: yes
