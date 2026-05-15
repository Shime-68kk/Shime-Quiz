# Phase 16D — Shime Study Identity / Product Principles

## 1. Phase statement

Phase 16D is docs/static-validator/CI only.

This phase:

- Defines Shime Quiz's product identity and core principles.
- Does not implement visual polish.
- Does not add UI/runtime changes.
- Does not add EduGen connector runtime.
- Does not add sync/cloud/account/auth.
- Does not change FSRS behavior.
- Does not add i18n/language system.
- Does not add dependencies.
- Does not modify `src/` files.
- Does not modify `tests/` files.
- Does not modify `e2e/` files.
- Does not change `package.json` or `package-lock.json`.
- Introduces no runtime changes of any kind.

Phase 16C established the storage surface inventory, large import risk register, EduGen bulk import risk
register, FSRS metadata safety requirements, backup/export/import safety requirements, IndexedDB migration
prerequisites, and event log prerequisites. Phase 16D builds on that foundation by defining Shime's product
soul — its identity, principles, naming system, visual direction, mascot rules, EduGen boundary, and roadmap
guardrails — before any visual polish or EduGen runtime work begins.

---

## 2. One-sentence product vision

English:

> Shime is a calm, private study room where your memory is yours to grow — quietly, transparently, and forever.

Vietnamese:

> Shime là một phòng học yên tĩnh và riêng tư, nơi trí nhớ của bạn được nuôi lớn chậm rãi, minh bạch và thuộc về bạn.

This vision must be the anchor for every future design decision. Calm, private, owned — in that order.

---

## 3. Identity statement

Shime is defined by eight core qualities:

1. **Calm** — No streak anxiety, no confetti spam, no leaderboards, no push-guilt notifications. The app
   does not shout.
2. **Learner-owned** — Every card, every schedule, every export belongs to the user. No vendor lock-in.
   Data can be backed up, exported, and restored in full at any time.
3. **Local-first** — Data lives on the learner's device. The app works fully offline. Sync is a future
   optional convenience, never a requirement.
4. **Explainable memory** — When a card returns, Shime can explain why in plain language. No black box.
   The algorithm is transparent and human-readable.
5. **Source-aware learning** — Cards remember where they came from. Notes, documents, drafts — source
   attribution is part of trust.
6. **Draft before trust** — AI-assisted creation (via EduGen, future optional) is always reviewed by the
   learner before entering their library. Nothing enters study without their hand on it.
7. **Vietnamese-friendly first** — The primary UX copy and button terminology is Vietnamese. English is
   secondary. This is not a translation layer — it is a product stance.
8. **Beautiful but quiet** — The visual design is soft, accessible, and reduced-motion aware. Beauty
   serves clarity, not distraction.

Shime is **not**:

- A Quizlet clone. Shime does not copy Quizlet's cloud-first defaults, social discovery, or AI feature spam.
- An Anki clone. Shime does not copy Anki's intimidating defaults, opaque algorithm UX, or ugly first run.
- A loud gamified app. Shime does not copy Duolingo's streak anxiety, guilt notifications, or dark patterns.
- An AI quiz generator. Shime does not auto-publish generated cards. EduGen is a draft tool, not a quiz
  factory.
- A cloud-first study service. Shime does not require an account, network, or server for core study.

---

## 4. Differentiation pillars

### Pillar 1 — Calm by default

**What it means:** The default experience has no noise. No confetti on every answer. No red warnings for
missing a day. No leaderboard. No streak counter unless the user actively wants it. The app breathes.

**What future phases may do:** Add optional ambient sound, optional session streaks (off by default), and
calm celebration animations after session completion — not after every card tap.

**What must be avoided:** Variable-reward dopamine traps, mandatory daily review guilt, "you're behind!"
copy, push notifications that frame absence as failure, and any animation that interrupts study flow.

---

### Pillar 2 — Owned by the learner

**What it means:** The learner's data is theirs. Backup, export, and import are first-class features, not
last resorts. The learner can leave Shime at any time with all their data intact.

**What future phases may do:** Add richer export formats (Anki-compatible, PDF summary), portable set
bundles, and optional sync with user-controlled endpoints.

**What must be avoided:** Cloud lock-in, partial exports, hidden delete flows, slow export processing that
discourages data portability, and any design that makes local-first feel like a missing cloud feature.

---

### Pillar 3 — Explainable memory

**What it means:** When a card appears, the learner can understand why: "Last seen 3 days ago — it's time
to see this one again." The scheduling algorithm (FSRS when active, interval-based otherwise) is presented
in plain language, not as a black box.

**What future phases may do:** Add "why this card now" microcopy per card, a Memory Map showing the
learner's full schedule visually, and a plain-language explanation of stability and retrievability.

**What must be avoided:** "The algorithm decided," opaque scheduling mystery, FSRS presented as magic, and
any copy that implies AI omniscience ("AI knows what you need to study").

---

### Pillar 4 — Draft before trust

**What it means:** No content enters the study library without explicit learner review. EduGen (future
optional) generates drafts. Drafts are clearly tagged as drafts. The learner approves, edits, or rejects
each card before it enters their library.

**What future phases may do:** Add a Draft Inbox / Draft Workshop UI, batch approval with per-card editing,
source attribution on each draft card, and quality confidence indicators that help the learner decide.

**What must be avoided:** Auto-publish of generated cards, "AI curated your deck," any flow that bypasses
learner review, and any claim that generated cards are correct or guaranteed.

---

### Pillar 5 — Source-aware learning

**What it means:** Cards know where they came from. A card created from a PDF keeps a reference to the
source document. A card created from a note keeps the note reference. This is the seed of the Source Library
concept.

**What future phases may do:** Add visible source tags per card, a Source Library view grouping cards by
origin, and source-based filtering in the study session.

**What must be avoided:** Orphaned cards with no origin, opaque import pipelines that strip metadata, and
any EduGen flow that does not preserve source attribution.

---

### Pillar 6 — Beautiful but quiet

**What it means:** The visual design is intentionally understated. Soft colors, generous whitespace,
accessible contrast, and reduced-motion respected. Beauty comes from restraint, not decoration.
Visual effects must serve the learner, not distract them.

**What future phases may do:** Add a calm color palette, subtle card transition animations, gentle empty
state illustrations, and ambient mascot presence — all with reduced-motion fallbacks.

**What must be avoided:** Loud confetti, flashy animations on every interaction, decorative elements that
slow interaction or harm accessibility, and any visual change that makes the app feel like a game.

---

### Pillar 7 — Honest copy

**What it means:** The app's language is truthful. It does not over-promise. It does not claim features
that are not implemented. It does not use "AI," "smart," or "guaranteed" without backing. The copy is warm,
direct, and honest about what Shime is and is not.

**What future phases may do:** Build a copy guide / tone-of-voice document, establish safe motif patterns,
and define per-component microcopy standards.

**What must be avoided:** Overclaim creep ("AI scheduled this for you," "mastery assured," "cloud sync
ready," "built-in OCR"), misleading feature descriptions, and dark patterns in onboarding or upgrade flows.

---

### Pillar 8 — Mistakes are signals

**What it means:** A wrong answer is information, not a failure. The app treats mistakes as learning
opportunities. "You've seen this card 4 times and rated it Again — it may need a different framing" is
more useful than "You failed this card."

**What future phases may do:** Add per-card review history summary, gentle "often missed" tagging,
and optional study notes on hard cards.

**What must be avoided:** Red failure screens, "You failed," countdown timers on recall, competitive
ranking of accuracy, and any framing that makes a wrong answer feel shameful.

---

## 5. Lessons from major quiz apps

| App / category | Strength to learn | What to avoid | Shime-style adaptation |
|---|---|---|---|
| Quizlet | Frictionless deck creation; multiple study modes from one source | Ads, social bloat, AI feature spam, cloud lock-in | Make creation effortless inside Study Room, but keep mode menu minimal and source-attributed |
| Anki | FSRS rigor, extensibility, learner ownership | Opaque algorithm UX, intimidating defaults, ugly first run | Keep the algorithm, replace the mystery — "why this card now" copy, gentle defaults, calm UI |
| Duolingo | Habit loop, micro-feedback, daily structure | Streak anxiety, guilt notifications, dark patterns, leaderboards | "Today's Path" (small, finite, satisfying); celebrate completion, never punish absence |
| Kahoot | Communal energy, quick play | Pressure, noise, ranking, ephemeral learning | Optional "play with a friend" via portable bundles; never the default; never a leaderboard |
| Brainscape | Confidence-based rating | Rigid mandatory confidence UI | Offer self-rating as an optional lens on top of FSRS, with calm language |
| RemNote / Mochi | Linking ideas, spaced repetition over notes | Markdown-only entry barrier, power-user UI debt | Source-aware cards and concept grouping inside sets, without forcing graph-thinking |
| Notion-like workflows | Beautiful structure, flexible canvas | Blank-canvas paralysis, sync dependency | Opinionated templates (Study Room, Memory Garden, Source Library) that feel inviting |
| Modern AI learning assistants | Speed of drafting, summarization | Hallucination, overclaim, "AI learns for you" framing, cloud dependence | EduGen as Draft Workshop — drafts you review, with full source attribution |

**Core principle:** Borrow patterns (habit loop, FSRS, confidence rating, deck modes, mastery sensation).
Refuse aesthetics (loud, addictive, anxious, opaque, extractive).

---

## 6. Naming system

The following names define Shime's vocabulary for future phases.

### Approved for future phases

| English name | Vietnamese equivalent | Status |
|---|---|---|
| Study Room | Phòng học | **Approved** — already in use |
| Today's Path | Lộ trình hôm nay | **Approved** — candidate for Phase 16E |
| Memory Garden | Vườn trí nhớ | **Approved** — candidate for Phase 17A visual layer |
| Draft Workshop | Xưởng bản nháp | **Approved** — EduGen brand name |
| Source Library | Thư viện nguồn | **Approved** — candidate for Phase 17A |
| Adaptive Review | Ôn tập thích ứng | **Approved** — describes FSRS-based sessions |
| Gentle Review | Ôn tập nhẹ nhàng | **Approved** — re-entry / recovery mode name |

### Exploratory only (not yet committed)

| English name | Vietnamese equivalent | Status |
|---|---|---|
| Memory Compass | La bàn trí nhớ | **Exploratory** — concept for Memory Map feature |

### Usage rules

- **Study Room** is the current active session area. It is the primary learner space.
- **Today's Path** replaces "12 cards due!" framing. The number is finite, knowable, and small.
- **Memory Garden** is a future visualization layer for the learner's growing card landscape.
- **Draft Workshop** is the EduGen identity boundary. Never call EduGen "AI generator."
- **Source Library** is a future view for grouping cards by their origin document or source.
- **Adaptive Review** is used when FSRS scheduling is active. Not "AI Review" or "Smart Review."
- **Gentle Review** is used for recovery sessions after absence. Not "You're behind review."
- No name should imply a cloud service, an AI agent, or a gamified reward system.

---

## 7. Visual polish principles

Visual design for Shime follows these rules:

**Foundational direction:**
- Calm, soft, accessible.
- Reduced-motion respected — all animations must have a `prefers-reduced-motion` fallback.
- Subtle transitions, not flashy ones.
- No confetti-heavy gamification after individual card ratings.
- No punishment, shame, or failure screens.
- No loud streak pressure or urgency design.
- Mascot presence is ambient only — never intrusive.

**Core motion principle:**

> motion is breath, not bounce

Every animation should feel like breathing — slow, intentional, grounded. Nothing should bounce,
pop, or demand attention. Motion exists to orient the learner, not to excite them.

**Color and space:**
- Generous whitespace.
- Accessible color contrast (WCAG AA minimum).
- Dark mode and light mode considered equally.
- Learner-chosen color themes (future phase) should be calm palette options — not neon or harsh primaries.

**What visual polish is not:**
- Not gamification.
- Not a brand refresh that makes Shime look like a game.
- Not animation for its own sake.
- Not mascot takeover of study surfaces.
- Not decorative elements that slow interaction.

Visual polish follows identity. Phase 16D defines the identity. Phase 16E implements the first polish wins.

---

## 8. Mascot / sheep rules

Shime's mascot (the sheep) is an ambient character. The following rules define its behavior:

**Allowed:**
- Appear in empty states (library empty, first session not yet started).
- Appear in session summary — gentle, quiet presence.
- Appear in gentle re-entry copy after absence ("Welcome back. Here are three easy ones to ease in.").
- Ambient illustration in corners or card backgrounds — never blocking content.
- Static or very subtle animation (breathing, blinking) with reduced-motion fallback to static.

**Forbidden:**
- Never interrupts a question or appears during active card review.
- Never shames — no "Sheep is sad you didn't study."
- Never pushes streak anxiety — no "Don't break your streak!" from the mascot.
- No notification spam — the mascot does not send push notifications.
- No childish takeover of serious study surfaces (settings, import, backup).
- No intrusive animations that trigger without user action.
- No mascot dialogue that makes claims ("I chose this card for you," "AI picked this one").

The mascot is a companion, not a coach. It observes. It does not instruct, push, or judge.

---

## 9. EduGen identity boundary

EduGen is Shime's future optional companion for AI-assisted card drafting. It is defined as:

**Draft Workshop** (Vietnamese: *Xưởng bản nháp*)

**What EduGen is:**
- A future optional companion service, not bundled in Shime.
- A tool that accepts user-provided documents and returns drafted flashcard candidates.
- A draft generator — all output is drafts until the learner approves each card.
- Source-attributed — every draft card knows which document and section it came from.

**What EduGen is not:**
- Not a built-in feature. EduGen requires a future connector implementation.
- Not an AI tutor. EduGen does not teach, advise, or schedule.
- Not an AI quiz generator. EduGen generates drafts, not finished questions.
- Not guaranteed correct. Draft cards require human review.
- Not cloud-dependent for core study. EduGen is an optional add-on.

**Rules for EduGen framing in all future phases:**
- Always call EduGen output "drafts," never "cards" until approved.
- Source attribution is part of every draft ("source: page 4 of notes.pdf").
- No auto-publish. Nothing enters the library without explicit learner action.
- No claim that EduGen is built-in, bundled, or available until the connector runtime is implemented.
- No claim that generated questions are guaranteed correct, accurate, or complete.

**Claim boundaries (all claims below are false and must not appear):**
- Do not assert that any built-in AI quiz generation has been implemented.
- Do not assert that any built-in OCR has been implemented.
- Do not assert that EduGen has been bundled or included.
- Do not assert that cloud storage or cloud sync has been deployed.
- Do not assert that sync capability has been released.

---

## 10. FSRS / adaptive memory identity

Active FSRS scheduling remains experimental, double-gated, default OFF, and internal/test-controlled.
No public rollout has occurred. The following rules define how adaptive memory is framed:

**Framing rules:**
- Present adaptive memory as **explainable**, not mysterious.
- Use plain language: "This card returned because you last saw it 3 days ago."
- Frame scheduling as emotionally safe: missing a day is acceptable, not shameful.
- Never use "AI scheduled this" wording. Use "Adaptive Review" or "scheduled for today."
- Future microcopy: "why this card now" — a small, calm explanation per card.

**Identity rules:**
- Active FSRS is presented as a learner tool, not an AI agent.
- The algorithm is described in human terms (stability, retrievability) when surfaced.
- No copy that makes FSRS sound like a mysterious oracle.
- FSRS is not described as "smart" or "intelligent" — it is described as "adaptive" or "tuned to your
  memory."

**Current state:**
- Active FSRS remains double-gated (fsrsExperimentalEnabled + fsrsActiveSchedulingEnabled).
- Default OFF in production.
- Internal/test-controlled activation only.
- No public rollout claim is permitted.
- Phase 16E and 16F proceed without activating FSRS for general users.

---

## 11. Local-first trust identity

Local-first ownership is a product strength, not a limitation.

**Core principles:**
- Local ownership is the primary trust model. The learner's data is on their device.
- Backup, export, and import are trust features — visible, reliable, and first-class.
- Sync later is an optional convenience, never a requirement.
- No account is required for any core study flow.

**How to frame local-first:**
- "Your data is yours" — not "We don't have cloud yet."
- "Works offline, always" — not "No internet needed."
- "Export anytime" — not "We don't offer cloud storage."
- Backup and restore are presented as safety features, not workarounds.

**What local-first does not mean:**
- It does not mean no future sync. Sync may come as an optional feature.
- It does not mean the app is limited. Local-first is a design stance.
- It does not mean cloud is bad. It means cloud is never forced.

**Future sync requirements (from Phase 16B ADR):**
- Sync must be opt-in. The learner configures their own endpoint.
- No automatic sync on startup, session completion, or settings change.
- Conflict resolution must be surfaced, never auto-applied.
- Backup/export remains the primary portability primitive even when sync exists.

---

## 12. Roadmap effect

Phase 16D formally updates the roadmap:

```
16A: Vietnamese-First UX Copy / Button Terminology Alignment — merged
16B: Hybrid Local-First Architecture / Optional Sync Direction — merged
16C: Storage / Large Import Safety / EduGen Bulk Import Risk Audit — merged
16D: Shime Study Identity / Product Principles — this phase
16E: Visual Polish Quick Wins — runtime UI polish, no learning logic changes
16F: EduGen Connector Plan / Draft Workshop Architecture — docs/static-validator/CI only
16G: EduGen Connector Runtime — optional connector, draft-only, no AI/OCR overclaim
17A: Bigger Memory Garden / Source Library / Study Story visual polish
```

**Roadmap rules:**

1. **Visual polish follows identity.** Phase 16E (Visual Polish Quick Wins) must not begin until Phase 16D
   is merged. Identity first, aesthetics second.
2. **EduGen runtime follows storage/large-import safety and connector planning.** Phase 16G (EduGen
   Connector Runtime) must not begin until Phase 16F (Connector Plan) is merged and Phase 16C safety
   requirements are verified.
3. **High-risk storage/sync runtime is separate from visual polish and EduGen.** IndexedDB migration,
   SyncAdapter runtime, and EventLog runtime are independent tracks that do not block or unblock Phase 16E.
4. **FSRS rollout is its own track.** Broadening FSRS to general users is not part of Phase 16E, 16F, or 16G.
   It has its own readiness gate from Phase 15 foundation work.
5. **Identity docs must precede product-facing copy changes.** Any future copy change or microcopy update
   must align with the principles in this document.

---

## 13. Product copy guardrails

### Safe motifs (approved for future phases)

- `"Yours."` — Affirms ownership, privacy, and local-first trust.
- `"Quietly."` — Affirms calm, non-intrusive design.
- `"Drafts you trust."` — Affirms EduGen's draft-before-trust model.
- `"It's time to see this again."` — Calm, non-urgent recall prompt.
- `"Six cards waiting for you."` — Finite, knowable, non-pressuring queue.
- `"Welcome back."` — Gentle re-entry, no absence punishment.
- `"This one returned today."` — Explainable memory in plain language.
- `"Take your time."` — Emotionally safe study posture.

### Forbidden motifs (must not appear in any phase)

- `"AI scheduled this for you."` — Implies opaque AI agency over the learner.
- `"Your AI tutor."` — Overclaims EduGen and FSRS capabilities.
- `"Streak!"` — Gamification anxiety trigger.
- `"You're behind!"` — Shame/guilt copy, directly against Pillar 8.
- `"Mastery guaranteed."` — Overclaims learning outcomes; learning outcomes are never guaranteed.
- `"Cloud sync ready."` — False claim; no cloud sync has been implemented.
- `"Built-in OCR."` — False claim; no OCR feature has been implemented.
- `"EduGen is included."` — False claim; EduGen has not been bundled or shipped.
- `"AI Quiz Generator."` — Misframes EduGen; Draft Workshop is the correct framing.
- `"Don't break your streak!"` — Streak anxiety, against Pillar 1 and mascot rules.
- `"Smart scheduling."` — Implies opaque AI; use "Adaptive Review" instead.
- `"AI knows what you need."` — Overclaims FSRS and EduGen.
- `"Correct answers guaranteed."` — False claim about EduGen draft quality.

---

## 14. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Identity drift into generic quiz app | Medium | High | Anchor every phase decision to this document; use validator to guard required terms |
| EduGen perceived as AI generator | High | High | Consistently use "Draft Workshop" name; forbid "AI quiz generator" copy; enforce draft-before-trust |
| Visual polish becoming distraction | Medium | Medium | Identity gates polish (Phase 16E after 16D); visual polish validator checks for no learning logic changes |
| Mascot misuse | Low | Medium | Mascot rules in this doc; future Phase 16E includes mascot scope guard |
| Local-first feeling like missing cloud | Medium | High | Frame local-first positively; avoid "no cloud yet" language; backup/export as visible trust features |
| FSRS seeming mysterious | Medium | High | "Why this card now" microcopy; Explainable Memory pillar enforced in all FSRS-adjacent copy |
| Overclaim creep | High | High | Forbidden motifs list maintained here; validator checks forbidden claim patterns |
| Accessibility regressions from animation | Medium | High | "motion is breath, not bounce" principle; reduced-motion mandatory in Phase 16E |
| Roadmap delay | Medium | Low | Roadmap in this doc provides explicit ordering; each phase is gated on previous |
| Vietnamese-first copy delaying future i18n | Low | Medium | Vietnamese-first is a product stance, not a technical i18n choice; future i18n is additive, not a rewrite |

---

## 15. Phase 16E readiness

Phase 16E — Visual Polish Quick Wins — may begin after Phase 16D is merged.

**Phase 16E candidate scope:**
- Study Room subtle transitions (card reveal, rating fade).
- "Today's Path" naming and copy in the Dashboard / study queue header.
- Session summary micro-feedback (calm end-of-session screen, quiet count display).
- Empty state improvements (Library, Dashboard first-run).
- Gentle mascot static/ambient copy placement.
- Reduced-motion audit and `prefers-reduced-motion` enforcement across existing animations.
- Layout safety and whitespace improvement in Study Room and Dashboard.
- No learning logic changes in Phase 16E.
- No FSRS activation in Phase 16E.
- No EduGen connector in Phase 16E.
- No sync/cloud changes in Phase 16E.
- No new dependencies in Phase 16E without a separate dependency review.

**Phase 16E must not:**
- Activate active FSRS for general users.
- Implement EduGen connector runtime.
- Implement sync or cloud features.
- Break accessibility (keyboard navigation, screen reader compatibility).
- Introduce animations that lack reduced-motion fallbacks.
- Add learning logic, scheduling changes, or algorithm modifications.
- Contradict the visual polish principles in Section 7 of this document.

Phase 16E is the first opportunity to make Shime's identity felt — not just documented.
