# BIG-UPDATE-10 UI Deep Audit and Safety Plan

## 1. Executive Verdict

PASS.

The repository is sufficiently mapped for BIG-UPDATE-10 to proceed under strict UI-only boundaries. The safest implementation path is a presentational Start/Home redesign with isolated robot identity, copy, and motion primitives. Scheduler behavior, Safe Capsule behavior, storage, StudyRoom learning logic, import/export logic, and robot/device bridge code must remain untouched.

Important audit note: the working tree is currently not clean. The observed dirty state includes prior BIG-UPDATE-10 files and edits. This audit does not revert or normalize that state. Before any implementation review or commit, the team should run a baseline check and classify every modified or untracked file.

BIG-UPDATE-10 should not become an Overview rewrite. Overview/progress journal simplification is needed, but the safer product and architecture decision is to defer the main simplification to BIG-UPDATE-11.

## 2. Repository and Frontend Architecture Map

Repository root observed:

`/home/quang/Documents/quiz_beta/shimechamhoc-v2.0.0-rc1-project`

Branch observed:

`main`

Recent baseline commit observed:

`87b9e47e Audit architecture foundation before premium UI`

Frontend stack:

- React with Vite.
- React Router route shell.
- Global CSS and token CSS, not CSS modules or Tailwind.
- Vitest unit tests.
- Playwright smoke and Safe Capsule e2e tests.
- Local-first persistence through storage adapters and local state modules.

Primary architecture surfaces:

| Area | Files | Role | UI risk |
| --- | --- | --- | --- |
| React app shell | `src/App.jsx`, `src/layout/AppLayout.jsx` | App layout and route outlet | Medium |
| Navigation | `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx`, `src/routes/routeConfig.js` | Main nav and route metadata | Medium |
| Start/Home | `src/routes/Home.jsx` | Start page / first impression | Medium |
| Overview | `src/routes/Dashboard.jsx`, `src/dashboard/DashboardLearningDataContext.jsx` | Dashboard tabs and derived learning data | High |
| StudyRoom | `src/routes/StudyRoom.jsx`, `src/components/study/*`, `src/studyRoom/*` | Core study workflow | High |
| Shared UI | `src/components/Button.jsx`, `src/components/Card.jsx`, `src/components/Badge.jsx`, `src/components/PageHeader.jsx`, `src/components/ProgressBar.jsx` | Reusable UI primitives | Medium |
| Styling | `src/styles/global.css`, `src/design-system/tokens.css` | Global visual system | Medium to high blast radius |
| Scheduler | `src/scheduler/*`, `src/quiz/reviewSchedulerAdapter.js`, `src/state/reviewScheduleStorage.js` | SM2/FSRS scheduling | Forbidden |
| Safe Capsule / robot | `src/deviceBridge/*`, `src/companion/*`, `src/robotSensing/*` | Privacy and device bridge boundaries | Forbidden |
| Storage | `src/state/*`, `src/storage/*`, `src/data/learningDataStore.js` | Local persistence and derived state | Forbidden unless explicitly scoped |

## 3. Start/Home Render and Dependency Trace

Observed Start/Home surface:

`src/routes/Home.jsx`

Current dependency trace:

| Dependency | Classification | Notes |
| --- | --- | --- |
| `useNavigate` from `react-router-dom` | UI_WITH_LOGIC_CONTRACT | Route targets must stay valid. |
| `Button` | UI_ONLY with accessibility contract | Preserve button semantics, disabled/loading behavior, labels. |
| `Badge` | UI_ONLY | Safe for presentational use. |
| `Card` | UI_ONLY | Safe for presentational use. |
| `ShimeRobotPresence` | UI_ONLY if decorative | Must stay disconnected from robot bridge/device APIs. |
| Static import-format data | UI_ONLY | Copy/list presentation only. |

Observed Start/Home actions:

| User action | Current route target | Safety requirement |
| --- | --- | --- |
| Primary start CTA | `/dashboard` | Keep route valid. No hidden side effects. |
| Library CTA | `/library` | Keep route valid. |
| Sample quiz CTA | `/library` | Keep route valid. |
| Study room CTA | `/study-room` | Keep route valid. |

Observed Start/Home state and side effects:

- No local storage writes.
- No scheduler reads.
- No Safe Capsule generation.
- No robot bridge.
- No network call.
- No import/export mutation.
- No route payload passed into StudyRoom.

Conclusion: Start/Home is the safest primary UI surface for BIG-UPDATE-10, provided it remains presentational and route-only.

## 4. Start/Home UX Audit

| Issue | Severity | Affected files | Proposed design fix | Fixed in this phase | Deferred |
| --- | --- | --- | --- | --- | --- |
| Generic first impression does not immediately express local-first study companion identity | High | `src/routes/Home.jsx`, `src/styles/global.css` | Strong hero hierarchy with local-first promise, privacy cue, and one clear next action | Yes, if implementation remains UI-only | No |
| CTA hierarchy can become diluted when dashboard/library/study-room actions compete | Medium | `src/routes/Home.jsx` | One primary CTA, one secondary CTA, tertiary links visually quieter | Yes | No |
| Robot identity must not imply active hardware, camera, mic, or bridge | High | `src/routes/Home.jsx`, optional `src/components/brand/*` | Decorative robot presence with copy stating safe signal boundary only | Yes | No |
| Proof panels risk becoming technical if they mention too much implementation detail | Medium | `src/routes/Home.jsx` | Four plain user-facing proof panels: local-first, subject rooms, review timing, safe robot capsule | Yes | No |
| Mobile start page can feel like squeezed desktop if hero remains two-column too long | High | `src/styles/global.css` | Stack sections earlier, use touch-friendly buttons, avoid tiny side panels | Yes | No |
| Visual polish may create global CSS regressions | Medium | `src/styles/global.css` | Scope classes under a Start/Home namespace | Yes | No |
| Copy can become hype-heavy or too technical | Medium | `src/routes/Home.jsx`, copy helpers | Use calm Vietnamese product language with short sentences | Yes | No |
| Motion can become decorative rather than explanatory | Medium | `src/styles/global.css`, optional motion tokens | Use only short opacity/transform transitions and support reduced motion | Yes | No |

Recommended Start/Home design direction:

Calm robotic study companion.

Visual characteristics:

- Warm off-white/lavender page surface.
- Deep ink text.
- Soft glass cards.
- Emerald/teal robot glow accents.
- Compact robot face or companion chip.
- Premium CTA hierarchy.
- No childish mascot overload.
- No video, canvas, WebGL, or heavy animation package.

## 5. Overview and Progress Journal Audit

Overview route:

`src/routes/Dashboard.jsx`

Overview data provider:

`src/dashboard/DashboardLearningDataContext.jsx`

Overview child panels:

- `src/components/learning/DashboardTodayCard.jsx`
- `src/components/learning/TodayJourneyCard.jsx`
- `src/components/learning/StudyGoalCard.jsx`
- `src/components/analytics/HistoryAnalyticsPanel.jsx`
- `src/components/analytics/MasteryInsightsPanel.jsx`
- `src/components/study/ReviewSchedulePanel.jsx`
- `src/components/study/SmartPracticePanel.jsx`
- `src/components/study/StudyHistoryPanel.jsx`

Observed structure:

- Dashboard has two main tabs: `Hôm nay` and `Nhật ký tiến độ`.
- Today tab is more user-facing.
- Progress journal tab contains many analytic, evidence, schedule, mastery, and history details.
- Several panels expose raw prompts, answer details, scheduler-related notes, item counts, weights, or evidence counts.

Metric classification:

| Classification | Metrics / content | Recommendation |
| --- | --- | --- |
| KEEP_VISIBLE_BY_DEFAULT | Today next action, due review count, daily goal progress, study streak, recent progress trend, weak-area count, simple data-source status | Keep in normal Overview. |
| MOVE_TO_ADVANCED_DETAILS | Best session accuracy, flashcards reviewed, total scheduled cards, exact next due timestamp, item type counts, subject mini lists, weak/strong topic evidence, mastery evidence item count, mastery item count, exact correct rate details | Hide behind details/advanced panels. |
| MOVE_TO_DEVELOPER_PANEL | Mixed scheduler family notes, FSRS/SM2 evidence language, scheduler version/kind, validator/evidence output, Safe Capsule technical evidence | Move to dev or diagnostics surfaces. |
| HIDE_FROM_NORMAL_USER_BUT_KEEP_DATA | Raw prompts in default progress journal, user answer, correct answer, record IDs, raw item IDs, raw schedule IDs | Keep data intact but collapse behind explicit details, export, or dev view. |
| REQUIRES_FURTHER_PRODUCT_DECISION | Whether weak item prompts should appear by default; whether imported source name/date should be shown; how much "not AI/cloud" privacy language belongs in Overview | Decide in BIG-UPDATE-11. |

High-risk Overview findings:

- `StudyHistoryPanel` can show `item.prompt`, `userAnswer`, and `correctAnswer` in an open details area.
- `ReviewSchedulePanel` can show due item prompts.
- `SmartPracticePanel` can show selected prompts and weight badges.
- `MasteryInsightsPanel` can show weak item prompt-level evidence.
- `MixedSchedulerDueNote` exposes FSRS beta scheduling language that is more technical than needed for normal learners.

Verdict: Overview needs simplification, but it should be a dedicated BIG-UPDATE-11 scope. BIG-UPDATE-10 should avoid editing Overview logic-heavy components except for very small, presentational copy or spacing changes that preserve props, callbacks, storage reads/writes, and navigation state exactly.

## 6. Logic and Privacy Boundary Map

Scheduler boundaries:

- SM2 remains the stable default.
- FSRS remains beta opt-in only.
- `fsrsCanBeDefault` must remain false.
- Do not change scheduler registry, readiness gate, scheduler adapters, review schedule storage, or StudyRoom selection semantics.

Safe Capsule boundaries:

- Safe Capsule checksum contract: `checksum32(capsuleId|sourceType|safeSummaryCode)`.
- Robot-facing payloads must remain coarse and allowlisted.
- No raw quiz prompts, answers, explanations, imported document text, study history, settings, credentials, SSIDs, BSSIDs, MACs, tokens, or secrets may be sent to robot-facing code.

Forbidden robot-facing raw content:

- `prompt`
- `question`
- `answer`
- `correctAnswer`
- `explanation`
- `userAnswer`
- `sourceMetadata`
- `settings`
- `studyHistory`
- `rawQuizPayload`
- `importedDocumentText`

Important event/action contracts:

| Surface | Contract | Risk |
| --- | --- | --- |
| Start/Home | Navigate only to valid routes; no storage/network/device side effects | Medium |
| Dashboard tabs | Preserve tab state and accessible tab semantics | Medium |
| Dashboard data provider | Preserve storage subscriptions and derived data functions | High |
| TodayJourneyCard | Preserve write order: mark active/complete then navigate | High |
| StudyGoalCard | Preserve save/clear goal behavior | High |
| StudyHistoryPanel | Preserve clear confirmation and selected history behavior | High |
| StudyRoom route state | Preserve `location.state.selection` contracts for due-review and smart-practice | High |
| Safe Capsule panels | Preserve validator/export/rehearsal behavior | High |

Privacy conclusion:

BIG-UPDATE-10 UI can mention Safe Capsule as a privacy concept, but must not instantiate a bridge, add transport, request permissions, or serialize raw learning content to robot code.

## 7. UI Change Safety Map

| File / area | Classification | Safe changes | Requires caution | Forbidden in BIG-UPDATE-10 |
| --- | --- | --- | --- | --- |
| `src/routes/Home.jsx` | SAFE_TO_RECOMPOSE_WITH_CONTRACT_PRESERVATION | Layout, copy, CTA hierarchy, static proof panels | Route labels and destination consistency | Storage writes, scheduler reads, network, robot bridge |
| `src/layout/AppLayout.jsx` | SAFE_TO_RESTYLE | Spacing, focus-visible polish | Focus mode shell behavior | Routing rewrite |
| `src/layout/Sidebar.jsx` | SAFE_TO_RESTYLE | Active state clarity, brand chip, hover/pressed states | NavLink active semantics | Route mutation |
| `src/layout/BottomNav.jsx` | SAFE_TO_RESTYLE | Touch rhythm, labels, active indicator | Mobile hit target behavior | Route mutation |
| `src/routes/routeConfig.js` | CAUTION | Label-only changes if tested | Route path, focus mode, element mapping | Scheduler/dev route changes |
| `src/styles/global.css` | SAFE_WITH_SCOPING | Namespaced homepage, nav, motion styles | Global selectors and cascade | Broad resets that affect StudyRoom |
| `src/design-system/tokens.css` | SAFE_TO_EXTEND | Add tokens only when compatible | Changing existing token meaning | One-note palette overwrite |
| `src/components/Button.jsx` | CAUTION | Minor class support only | Loading/disabled/accessibility contracts | Behavior rewrite |
| `src/components/Card.jsx` | CAUTION | Minor presentational variant only | Existing card consumers | API break |
| `src/components/Badge.jsx` | LOW_RISK | Tone styling | Existing tone names | API break |
| `src/routes/Dashboard.jsx` | HIGH_CAUTION | Small presentation-only grouping | Tab logic and data display semantics | Data/provider rewrite |
| `src/dashboard/DashboardLearningDataContext.jsx` | DO_NOT_REFACTOR | None for BIG-UPDATE-10 | All derived data | Any logic change |
| `src/components/learning/*` | HIGH_CAUTION | Copy/spacing only if contract preserved | Goal, plan, recommendation writes | Action order changes |
| `src/components/analytics/*` | HIGH_CAUTION | Future advanced details grouping | Raw prompt/evidence display semantics | Data computation changes |
| `src/components/study/*` | HIGH_CAUTION | Future details collapse | Study history and selection contracts | Storage or scheduler behavior changes |
| `src/routes/StudyRoom.jsx` | DO_NOT_TOUCH | None | Core study flow | Any behavior change |
| `src/scheduler/*` | FORBIDDEN | None | SM2/FSRS gates | Any change |
| `src/deviceBridge/*` | FORBIDDEN | None | Privacy boundary | Any bridge/transport/payload change |
| `src/companion/*` | FORBIDDEN | None | Robot bridge pipeline | Any runtime change |
| `src/state/*`, `src/storage/*` | FORBIDDEN | None | Local persistence | Any mutation |

## 8. Recommended No-Logic-Touch UI Architecture

Recommended BIG-UPDATE-10 architecture:

1. Keep Start/Home as the main implementation surface.
2. Extract only pure presentational pieces if needed:
   - Robot identity component.
   - Product voice constants.
   - Motion tokens.
   - Static proof panel data.
3. Keep all new components disconnected from:
   - local storage,
   - scheduler adapters,
   - Safe Capsule generation,
   - robot transports,
   - network APIs,
   - browser hardware APIs.
4. Use CSS-only motion with transform and opacity.
5. Use `@media (prefers-reduced-motion: reduce)` to disable nonessential motion.
6. Keep Home CTAs as plain route navigation.
7. Do not move Overview simplification into the Start/Home redesign batch.

Recommended file grouping:

| Purpose | Suggested files |
| --- | --- |
| Start/Home composition | `src/routes/Home.jsx` |
| Robot decorative identity | `src/components/brand/ShimeRobotPresence.jsx` |
| Motion tokens | `src/uiMotion/motionTokens.js` |
| Product voice/copy constants | `src/copy/productVoice.js` |
| Visual styles | `src/styles/global.css` with scoped classes |
| Documentation | `docs/reports/*` |
| Validation | `scripts/validate-big-update-10-premium-ui.js` |

This architecture keeps BIG-UPDATE-10 presentational and testable.

## 9. Design Foundation Findings

Current design foundation:

- Global CSS is the dominant styling mechanism.
- Token CSS exists and should be reused rather than bypassed.
- Shared components provide basic Button/Card/Badge/Header/Progress primitives.
- Navigation shell already separates focus StudyRoom mode from normal app shell.
- Existing mobile gesture and StudyRoom polish should not be disturbed by broad CSS changes.

Design risks:

- Global CSS can easily leak across Dashboard, StudyRoom, and settings panels.
- Existing pages contain many phase-specific classes; new styles must be namespaced.
- Some current user-facing copy still mixes learner-friendly language with technical evidence language.
- Existing Overview panels expose too much internal evidence for normal users.

Recommended visual foundation:

- Surface: warm off-white/lavender.
- Text: deep ink.
- Accent: emerald/teal robot glow.
- Cards: subtle glass or elevated surfaces, not nested card stacks.
- Buttons: clear primary/secondary/tertiary hierarchy.
- Motion: short, responsive, and optional.
- Robot: subtle face/chip, not mascot-heavy.

## 10. Robot Identity Recommendations

Recommended robot identity scope:

- Decorative by default.
- Accessible label only when the robot visual communicates status.
- No hardware state.
- No camera/mic implication.
- No BLE/Wi-Fi/serial/WebSocket implication.
- No cloud implication.
- No raw quiz data implication.

Recommended states:

- `idle`
- `ready`
- `focus`
- `success`
- `warning`

Recommended implementation rules:

- CSS/SVG/component-based.
- No raster hero asset.
- No canvas/WebGL.
- No animation library.
- No autoplay media.
- No blocking intro.
- Eye glow and idle pulse only.
- Reduced motion disables pulse/shimmer while keeping visible state.

Safe copy examples:

- "Shime chỉ nhận tín hiệu an toàn, không nhận nội dung câu hỏi."
- "Dữ liệu học ở trên máy của bạn."
- "Robot đồng hành bằng trạng thái học đã được làm an toàn."

Unsafe implications to avoid:

- Robot can see the learner.
- Robot can hear the learner.
- Robot reads questions.
- Robot receives answers or explanations.
- Robot bridge is already active.
- Cloud sync or AI service is required.

## 11. Motion and Reduced-Motion Recommendations

Motion rules for BIG-UPDATE-10:

- Use transform and opacity only where practical.
- Keep durations in the 120ms to 240ms range.
- Do not delay user interaction.
- Do not add route-level transitions that affect tests.
- Do not add cinematic intro animation.
- Do not use parallax or large zoom near reading text.
- Support `prefers-reduced-motion`.

Recommended motion tokens:

| Token | Value |
| --- | --- |
| `durationFast` | `120` |
| `durationNormal` | `180` |
| `durationSlow` | `240` |
| `reducedMotionDuration` | `0` |
| `easingStandard` | Standard CSS easing |
| `easingEmphasized` | Slightly stronger entrance/press easing |

Recommended usage:

- Hero content: light opacity/translate entrance.
- Robot presence: subtle glow pulse.
- CTA hover/press: small transform or shadow shift.
- Cards: no stagger that blocks interaction.
- Panels: only if already mounted and accessible.

Reduced-motion requirement:

All nonessential animation should be disabled or reduced to immediate state changes under:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
```

## 12. Test and Validation Matrix

Preflight commands:

```bash
git status --short
git branch --show-current
npm run build
npm run test:unit
npm run test:e2e:smoke
```

Dependency and diff checks:

```bash
npm ls --depth=0
git diff --name-status
git diff -- package.json package-lock.json
```

Build:

```bash
npm run build
```

Full unit tests:

```bash
npm run test:unit
```

Smoke e2e:

```bash
npm run test:e2e:smoke
```

Architecture and phase validators:

```bash
npm run validate:architecture-foundation
npm run validate:premium-ui
```

Scheduler safety checks:

```bash
npm run test:scheduler-lab
npx vitest run tests/unit/schedulerAdapterContract.test.js tests/unit/schedulerRegistry.test.js tests/unit/sm2SchedulerAdapter.test.js tests/unit/fsrsBetaSchedulerAdapter.test.js tests/unit/fsrsReadinessGate.test.js
```

Safe Capsule safety checks:

```bash
npm run test:e2e:safe-capsule
npm run test:e2e:safe-capsule-rehearsal
npm run test:e2e:safe-capsule-export
npm run test:e2e:safe-capsule-e2e-verify
npx vitest run tests/unit/safeLearningCapsule.test.js tests/unit/studyRoomSafeCapsuleAdapter.test.js tests/unit/safeCapsuleExportVaultModel.test.js tests/unit/safeCapsuleRehearsalLabModel.test.js tests/unit/safeCapsuleEndToEndVerificationModel.test.js
```

Import/export safety checks:

```bash
npm run validate:import
npx vitest run tests/unit/edugenDraftReviewImportFlow.test.jsx tests/unit/storageQuotaBackupBeforeImport.test.jsx tests/unit/createSafeCapsuleMockImportPackageScript.test.js
```

Homepage and copy checks:

```bash
npx vitest run tests/unit/vietnameseFirstUxCopyAlignment.test.js tests/unit/visualPolishQuickWins.test.jsx
```

If robot/motion/copy files are implemented:

```bash
npx vitest run tests/unit/ShimeRobotPresence.test.jsx tests/unit/motionTokens.test.js tests/unit/productVoice.test.js
```

Mobile and StudyRoom regression checks:

```bash
npx vitest run tests/unit/StudyRoomMobileLayout.test.jsx tests/unit/StudyRoomGestureTuning.test.jsx
```

No lint or typecheck script was observed in `package.json`; do not invent those gates unless the project adds them intentionally.

## 13. Proposed Implementation Batches

Batch 0: Baseline lock.

- Run `git status --short`.
- Classify all modified/untracked files.
- Confirm no unrelated dirty files are mixed into BIG-UPDATE-10.
- Do not commit until the phase report and validation are complete.

Batch 1: Start/Home redesign only.

- Recompose `src/routes/Home.jsx`.
- Keep route-only callbacks.
- Add premium local-first hero, proof panels, and CTA hierarchy.
- Do not read or write learning data.

Batch 2: Robot identity component.

- Add isolated decorative robot presence component if not already present.
- Add tests for decorative/accessibility states.
- Keep it disconnected from robot bridge and device APIs.

Batch 3: Motion and reduced motion.

- Add motion tokens if useful.
- Apply only transform/opacity motion.
- Add reduced-motion CSS and tests.

Batch 4: UX writing.

- Add product voice constants and guide if useful.
- Polish Vietnamese copy.
- Avoid cloud/AI/API claims except privacy clarification.
- Do not imply an active robot bridge.

Batch 5: App shell polish.

- Only minor nav active/hover/focus polish.
- Do not rewrite routing.
- Do not alter StudyRoom focus mode.

Batch 6: Validation and report.

- Run validator, build, unit tests, targeted tests, smoke e2e.
- Write final report.
- Provide PASS / NOT PASS recommendation.

Batch deferred to BIG-UPDATE-11:

- Overview simplification.
- Progress journal advanced/details redesign.
- Dashboard technical metric relocation.

## 14. Files Safe to Modify

Safe with normal review:

- `src/routes/Home.jsx`
- `src/components/brand/ShimeRobotPresence.jsx`
- `src/uiMotion/motionTokens.js`
- `src/copy/productVoice.js`
- `tests/unit/ShimeRobotPresence.test.jsx`
- `tests/unit/motionTokens.test.js`
- `tests/unit/productVoice.test.js`
- `docs/reports/big-update-10-premium-ui-design-audit.md`
- `docs/reports/big-update-10-ux-writing-guide.md`
- `docs/reports/big-update-10-performance-budget.md`
- `docs/reports/big-update-10-premium-ui-final-report.md`
- `scripts/validate-big-update-10-premium-ui.js`

Safe with scoped CSS caution:

- `src/styles/global.css`
- `src/design-system/tokens.css`

Safe only for minor visual polish:

- `src/layout/AppLayout.jsx`
- `src/layout/Sidebar.jsx`
- `src/layout/BottomNav.jsx`
- `src/components/Button.jsx`
- `src/components/Card.jsx`
- `src/components/Badge.jsx`
- `src/components/PageHeader.jsx`

## 15. Files Requiring Extreme Caution

Extreme caution:

- `src/routes/Dashboard.jsx`
- `src/dashboard/DashboardLearningDataContext.jsx`
- `src/components/learning/DashboardTodayCard.jsx`
- `src/components/learning/TodayJourneyCard.jsx`
- `src/components/learning/StudyGoalCard.jsx`
- `src/components/analytics/HistoryAnalyticsPanel.jsx`
- `src/components/analytics/MasteryInsightsPanel.jsx`
- `src/components/study/ReviewSchedulePanel.jsx`
- `src/components/study/SmartPracticePanel.jsx`
- `src/components/study/StudyHistoryPanel.jsx`
- `src/routes/StudyRoom.jsx`
- `src/routes/routeConfig.js`

Reason:

These files carry navigation, storage, derived learning data, StudyRoom route state, user history, schedule state, or progress logic. They can be restyled only with strict prop/callback preservation and targeted tests.

## 16. Files Forbidden for BIG-UPDATE-10

Forbidden unless the phase is explicitly re-scoped:

- `src/scheduler/*`
- `src/quiz/reviewSchedulerAdapter.js`
- `src/state/reviewScheduleStorage.js`
- `src/state/settingsStorage.js`
- `src/deviceBridge/*`
- `src/companion/*`
- `src/robotSensing/*`
- `src/shimeIntelligence/*`
- `src/state/*`
- `src/storage/*`
- `src/data/importValidator.js`
- `src/data/csvImportParser.js`
- `src/data/textQuizParser.js`
- `src/data/quizParser.js`
- `src/data/libraryExport.js`
- `src/data/learningDataStore.js`
- `src/data/learningDataAdapter.js`

Forbidden API additions:

- `fetch(`
- `XMLHttpRequest`
- `WebSocket`
- `navigator.serial`
- `navigator.bluetooth`
- `getUserMedia`
- `MediaRecorder`
- `Notification.requestPermission`
- `serviceWorker.register`

Forbidden dependency additions:

- `framer-motion`
- `gsap`
- `three`
- `matter-js`
- `lottie`

## 17. Open Risks and Unknowns

Open risks:

- The current worktree is dirty and includes prior BIG-UPDATE-10 implementation files. This must be classified before any commit.
- Global CSS has high blast radius. A Start/Home visual change can accidentally affect Dashboard, StudyRoom, or settings panels.
- Overview contains user-facing technical and raw-content details. This is a product problem but should not be solved casually inside BIG-UPDATE-10.
- Some dashboard panels combine display and write behavior. Visual simplification must not disturb storage writes or recommendation feedback.
- The repository has no observed lint/typecheck scripts, so validation depends on build, unit, targeted, and e2e tests.

Unknowns:

- Whether the final product owner wants Overview simplification to happen before or after the premium Start/Home launch.
- Whether prompt-level weak item details should remain visible to normal learners by default.
- Whether dashboard technical evidence should become an "Advanced" mode or a true developer-only panel.

## 18. Antigravity UI Recommendations After Implementation

Antigravity should treat BIG-UPDATE-10 as a premium Start/Home and identity phase, not an analytics/dashboard refactor.

Recommendations:

- Keep the Start/Home redesign presentational.
- Keep robot identity decorative and disconnected from hardware or bridge APIs.
- Keep copy calm, Vietnamese-first, and privacy-accurate.
- Keep motion short, interruptible, and reduced-motion safe.
- Keep all scheduler and Safe Capsule behavior untouched.
- Run full validation after implementation.
- Include screenshots or manual viewport notes for mobile and desktop review if available.
- Document Overview simplification as a follow-up recommendation, not as a hidden logic refactor.

Antigravity should explicitly report whether:

- Start/Home was redesigned.
- Robot presence was added.
- Reduced motion is supported.
- No cloud/backend/network was added.
- No robot bridge was added.
- No scheduler behavior changed.
- No raw question/answer content is sent to robot-facing code.

## 19. Overview Simplification Verdict

Verdict: defer to BIG-UPDATE-11.

Reason:

The Overview/progress journal does need simplification. It currently exposes too many technical, evidence, scheduler, raw prompt, and detailed history metrics for normal users. However, the relevant files are tightly connected to dashboard data providers, storage-backed study history, recommendation feedback, review schedule state, and StudyRoom route selection.

BIG-UPDATE-10 should mention this problem and may avoid adding more Overview complexity, but the actual simplification should be handled as a dedicated BIG-UPDATE-11 with its own audit, tests, and product decision matrix.

Recommended BIG-UPDATE-11 scope:

- Keep key metrics visible.
- Move technical/evidence/scheduler details into advanced or dev panels.
- Collapse raw prompt/answer history by default.
- Keep all data; delete nothing.
- Preserve storage and StudyRoom selection contracts.

## 20. Final PASS / NOT PASS Decision

PASS — The repository is sufficiently mapped and BIG-UPDATE-10 can proceed under the documented safety boundaries.
