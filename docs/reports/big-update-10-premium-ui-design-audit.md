# BIG-UPDATE-10 Premium UI Design Audit

## Phase identification
**big-update-10** — Premium Start Experience + Robot Identity + UX Writing Polish

---

## Design direction chosen

**"Calm Robotic Study Companion"**

- Soft glass cards using existing token system
- Warm off-white/green surface (existing default theme)
- Deep ink text (--color-text)
- Emerald/teal robot glow accents matching --brand
- Subtle robot face/companion chip in hero
- Polished CTA hierarchy: primary → secondary → ghost
- No childish mascot overload, no blocking intro, no autoplay

Alternative directions considered but not implemented:
- "Minimal Focus Mode" (too stripped, loses robot identity)
- "Data Dashboard First" (not a start page, better for Dashboard route)

---

## Design Issues Audit

### 1. Start Page Visual Hierarchy
**Severity**: high
**Affected files**: `src/routes/Home.jsx`, `src/styles/global.css`
**Problem**: Previous hero had equal-weight eyebrow + h1 + lead + CTA without strong visual rhythm. No clear first visual anchor.
**Fix in this phase**: Yes — headline increased in size, robot identity chip added as warm-up anchor, accent color on headline secondary line.
**Applied**: Larger h1 (`clamp(2rem, 5vw, 3.6rem)`), `--headlineAccent` brand color on second line, robot chip before eyebrow.

### 2. CTA Hierarchy
**Severity**: high
**Affected files**: `src/routes/Home.jsx`
**Problem**: All three CTAs had equal visual weight (Button primary/secondary/ghost existed but lacked clear narrative).
**Fix in this phase**: Yes — primary "Bắt đầu học nhanh" → dashboard, secondary "Mở Thư viện", ghost "Dùng quiz mẫu".
**Applied**.

### 3. Robot/Companion Identity
**Severity**: high
**Affected files**: New `src/components/brand/ShimeRobotPresence.jsx`
**Problem**: No visual robot identity element on start page. Product identity was purely text-based.
**Fix in this phase**: Yes — new `ShimeRobotPresence` component with 5 states, CSS/SVG face, ambient glow, idle pulse.
**Applied**: Robot chip in hero, robot in start card, decorative/non-decorative modes.

### 4. Motion and Transitions
**Severity**: medium
**Affected files**: `src/styles/global.css`, new `src/uiMotion/motionTokens.js`
**Problem**: No systematic motion tokens. Animations existed but weren't consistent or documented.
**Fix in this phase**: Yes — `motionTokens.js` defines 120/180/240ms durations, `shimeFadeSlideIn` keyframe for hero, `shimeRobotGlowPulse` for robot idle pulse.
**Applied**: All animations use `transform`/`opacity` only. Full `@media (prefers-reduced-motion: reduce)` block.

### 5. Mobile Layout
**Severity**: medium
**Affected files**: `src/styles/global.css`
**Problem**: Proof panels didn't exist; hero was 2-column even on small screens.
**Fix in this phase**: Yes — proof grid collapses: 4-col → 2-col at 1024px → 1-col at 640px. Robot chip wraps safely. Headline uses clamp.
**Applied**.

### 6. Desktop Layout
**Severity**: medium
**Affected files**: `src/routes/Home.jsx`, `src/styles/global.css`
**Problem**: Card grid was generic 2-column. No visual rhythm above the fold.
**Fix in this phase**: Yes — added proof panel row as 4-column strip, hero retains asymmetric 1.7fr/0.8fr layout with glassmorphism card.
**Applied**.

### 7. Typography and Spacing
**Severity**: medium
**Affected files**: `src/routes/Home.jsx`, `src/styles/global.css`
**Problem**: Hero headline was generic h1 size. Identity line and robot chip weren't defined.
**Fix in this phase**: Yes — `shimeLandingHero__headline` with tight letter-spacing -0.055em, `shimeLandingHero__identity` as subtitle, `shimeLandingRobotChip` glassmorphism pill.
**Applied**.

### 8. Navigation/App Shell Polish
**Severity**: low
**Affected files**: `src/layout/Sidebar.jsx` (not modified this phase)
**Problem**: Brand chip is good; already has glassmorphism avatar header from phase37uin.
**Fix in this phase**: No — existing shell is already polished. No change made. Deferred to future phase if needed.

### 9. Copy Tone and Vietnamese Language
**Severity**: medium
**Affected files**: `src/routes/Home.jsx`, new `src/copy/productVoice.js`
**Problem**: Some copy was technical and not inviting. Product voice was informal/mixed.
**Fix in this phase**: Yes — `productVoice.js` defines canonical voice rules. Hero copy updated to be warmer and more direct.
**Applied**.

### 10. Empty/Loading/Error States
**Severity**: low
**Affected files**: Not start page scope.
**Problem**: Empty states exist in Library and StudyRoom.
**Fix in this phase**: No — out of scope. `productVoice.js` includes `EMPTY_STATE_COPY` for future use.

### 11. Accessibility and Reduced Motion
**Severity**: high
**Affected files**: `src/styles/global.css`, `src/components/brand/ShimeRobotPresence.jsx`
**Problem**: No formal `prefers-reduced-motion` handling for new animations. Robot decorative/non-decorative handling needed.
**Fix in this phase**: Yes — full `@media (prefers-reduced-motion: reduce)` block removes all new animations. `ShimeRobotPresence` supports `decorative` and `reducedMotion` props. `aria-hidden` for decorative, `role="img"` + `aria-label` for non-decorative.
**Applied**.

### 12. Performance Risks
**Severity**: medium
**Affected files**: `src/styles/global.css`
**Problem**: CSS animations must not cause CLS or layout recalculation.
**Fix in this phase**: Yes — all animations use `transform` and `opacity` exclusively. No `height`, `width`, `margin`, `top` animated. Robot glow uses `filter: blur()` which is composited.
**Applied**. See `docs/reports/big-update-10-performance-budget.md`.

### 13. Future UI Debt
**Severity**: low
**Notes**:
- App shell brand chip could add robot state sync in future (Codex decision)
- ShimeRobotPresence could connect to real companion state in a future Codex phase
- Language switch (ShimeLanguageProvider) already exists for i18n but productVoice.js is not yet wired globally
- Proof panels could link to specific sections (deferred)

---

## Safe Implementation Scope Summary

**In scope (done)**:
- `src/routes/Home.jsx` — premium redesign with robot chip, proof panels, improved CTA hierarchy
- `src/components/brand/ShimeRobotPresence.jsx` — new isolated robot identity component
- `src/uiMotion/motionTokens.js` — new motion token system (no runtime side effects)
- `src/copy/productVoice.js` — new copy system (no runtime side effects)
- `src/styles/global.css` — premium landing CSS + robot component CSS + reduced motion
- `tests/unit/ShimeRobotPresence.test.jsx` — unit tests
- `tests/unit/motionTokens.test.js` — unit tests
- `tests/unit/productVoice.test.js` — unit tests
- `scripts/validate-big-update-10-premium-ui.js` — validator
- `docs/reports/` — all required docs

**Not in scope (not modified)**:
- `src/routes/StudyRoom.jsx`
- `src/deviceBridge/`
- `src/companion/`
- `src/shimeIntelligence/`
- `src/quiz/`
- `src/learning/`
- `src/scheduler/`
- `src/data/`
- `src/storage/`
- `firmware/`
- `package.json`, `package-lock.json`

---

## No blocking intro animation: yes
## Reduced motion supported: yes
## No autoplay video: yes
## No cloud/backend/network added: yes
## No scheduler behavior changed: yes
## No real robot bridge: yes
## Safe capsule only: yes
