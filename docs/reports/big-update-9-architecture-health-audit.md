# BIG-UPDATE-9 Architecture Health Audit

## Scope

This audit reviewed StudyRoom, scheduler integration, subject spaces, robot-safe summaries, mobile gesture handling, global CSS, validators, tests, CI risk, and git hygiene before any premium visual redesign.

Boundary commitments for this phase:

- SM2 remains default.
- FSRS remains beta opt-in.
- No real robot bridge was added.
- No cloud/backend/network was added.
- Raw question/answer must not cross robot-safe boundary.
- StudyRoom needs future decomposition.
- Mobile UI future polish should be done after foundation hardening.

## Preflight

- Branch: `main`
- `npm run build`: pass. Vite reported the existing large chunk warning.
- `npm run test:unit`: pass, 277 files and 3410 tests.
- `npm run test:e2e:smoke`: pass, 7 Chromium smoke tests.
- Untracked files: `tests/unit/StudyRoomGestureTuning.test.jsx`, `tests/unit/fsrsBetaSchedulerAdapter.test.js`, `tests/unit/fsrsReadinessGate.test.js`, `tests/unit/sm2SchedulerAdapter.test.js`.

Classification:

- `tests/unit/StudyRoomGestureTuning.test.jsx`: intended/leftover mobile gesture coverage, relevant to this audit, should be committed separately or with this hardening work.
- `tests/unit/fsrsBetaSchedulerAdapter.test.js`: intended/leftover FSRS beta adapter coverage, should be committed separately or with this hardening work.
- `tests/unit/fsrsReadinessGate.test.js`: intended/leftover FSRS readiness gate coverage, should be committed separately or with this hardening work.
- `tests/unit/sm2SchedulerAdapter.test.js`: intended/leftover SM2 stable adapter coverage, should be committed separately or with this hardening work.

## Findings

### 1. Route/component size and responsibility

- Severity: high
- Affected files: `src/routes/StudyRoom.jsx`
- Why it matters: The route is 1225 lines and owns selection, draft persistence, subject navigation, device bridge event emission, review schedule updates, FSRS bridge state, completion, touch gestures, mascot copy, and rendering. This raises regression risk for any UI phase.
- Suggested fix: Decompose after this hardening phase into a route shell, session state hook, persistence hook, scheduler bridge hook, subject-space container, and presentation components.
- Fixed in this phase: no
- Deferred phase: BIG-UPDATE-10 or a dedicated StudyRoom decomposition phase before broad UI redesign.

### 2. StudyRoom coupling

- Severity: medium
- Affected files: `src/routes/StudyRoom.jsx`, `src/components/study/StudyRoomSubjectSpaces.jsx`, `src/state/reviewScheduleStorage.js`, `src/deviceBridge/studyRoomBridgeAdapter.js`
- Why it matters: StudyRoom directly coordinates multiple services and side effects. Most side effects are already behind helper modules, but the route is still the integration point for many unrelated concerns.
- Suggested fix: Add explicit boundary hooks and keep route render logic thin. Keep device bridge payloads coarse and event-only.
- Fixed in this phase: no
- Deferred phase: BIG-UPDATE-10 architecture prep.

### 3. Scheduler integration boundaries

- Severity: low
- Affected files: `src/scheduler/schedulerRegistry.js`, `src/scheduler/sm2SchedulerAdapter.js`, `src/scheduler/fsrsBetaSchedulerAdapter.js`, `src/scheduler/fsrsReadinessGate.js`, `src/quiz/reviewSchedulerAdapter.js`
- Why it matters: Scheduler behavior is safety-critical. The current registry returns SM2 as default and only resolves FSRS beta when explicitly requested and readiness-gated.
- Suggested fix: Preserve explicit opt-in and add regression tests/validators for default behavior.
- Fixed in this phase: yes
- Deferred phase: none

### 4. Subject-space model boundaries

- Severity: low
- Affected files: `src/studyRoom/studySubjectSpaceModel.js`, `src/components/study/StudyRoomSubjectSpaces.jsx`
- Why it matters: Subject spaces expose derived counts and buckets. This is a good boundary, but presentation text and layout still live beside navigation controls.
- Suggested fix: Keep model pure; later split the panel into header, rail, and summary subcomponents if UI polish grows.
- Fixed in this phase: no
- Deferred phase: BIG-UPDATE-10 UI foundation.

### 5. Safe Capsule / robot-safe data boundary

- Severity: medium
- Affected files: `src/studyRoom/subjectRobotSafeSummary.js`, `src/deviceBridge/studyRoomBridgeAdapter.js`, `src/deviceBridge/studyRoomSafeCapsuleAdapter.js`, `tests/unit/subjectRobotSafeSummary.test.js`
- Why it matters: Robot-facing and capsule-facing summaries must never include raw prompt, answer, explanation, user answer, document text, RF identifiers, or credentials.
- Suggested fix: Keep adapter allowlists narrow and maintain tests that reject raw content fields.
- Fixed in this phase: yes
- Deferred phase: none

### 6. Mobile gesture/layout boundaries

- Severity: medium
- Affected files: `src/studyRoom/mobileGestureIntentModel.js`, `src/studyRoom/studyRoomSwipeGesture.js`, `src/routes/StudyRoom.jsx`, `src/styles/global.css`
- Why it matters: Mobile gesture tuning can easily block vertical scroll or create accidental horizontal navigation. Current model preserves vertical scroll unless horizontal intent is clear.
- Suggested fix: Keep `touch-action: pan-y`, proximity snapping, no `preventDefault`, and tests around vertical scroll priority.
- Fixed in this phase: yes
- Deferred phase: BIG-UPDATE-10 visual polish after foundation hardening.

### 7. CSS/global style health

- Severity: high
- Affected files: `src/styles/global.css`, `src/design-system/tokens.css`, `src/styles/phase34b-leader-ui-effects.css`
- Why it matters: `global.css` is 6123 lines and contains base styles, route styles, phase-specific pilots, mobile behavior, mascot styles, and broad `!important` overrides. This is the highest-risk UI foundation area.
- Suggested fix: Move route-specific and pilot-specific styles to component-level CSS or scoped modules over time; keep reset, tokens, layout shell, and accessibility globals global.
- Fixed in this phase: no
- Deferred phase: BIG-UPDATE-10 UI foundation extraction.

### 8. Design token/component reuse

- Severity: medium
- Affected files: `src/components/Button.jsx`, `src/components/Card.jsx`, `src/components/Badge.jsx`, `src/components/ProgressBar.jsx`, `src/design-system/tokens.css`, `src/styles/global.css`
- Why it matters: There is a component layer, but many cards/chips/buttons still receive bespoke global selectors and phase-specific overrides.
- Suggested fix: Add a small design-system layer for chips, segmented controls, panels, rails, and status callouts before premium UI redesign.
- Fixed in this phase: no
- Deferred phase: BIG-UPDATE-10 design-system layer.

### 9. Test coverage health

- Severity: low
- Affected files: `tests/unit`, `e2e/smoke.spec.js`
- Why it matters: Unit coverage is broad and smoke coverage exercises routes, import, StudyRoom, backup, and keyboard focus. Static boundary tests exist for several safety features.
- Suggested fix: Add targeted architecture boundary tests for SM2 default, FSRS beta gate, robot-safe summaries, mobile gesture priority, and app-facing forbidden APIs.
- Fixed in this phase: yes
- Deferred phase: none

### 10. Validators/scripts health

- Severity: medium
- Affected files: `scripts/validate-big-update-*.js`, `package.json`
- Why it matters: Validators exist per phase, but architecture claims depend on docs and selected source scans. A BIG-UPDATE-9 validator is needed to make the boundary durable.
- Suggested fix: Add a validator for required reports, required boundary language, and app-facing forbidden API checks.
- Fixed in this phase: yes
- Deferred phase: none

### 11. CI stability risks

- Severity: medium
- Affected files: `package.json`, `vite.config.js`, `playwright.config.js`
- Why it matters: Build passes, but Vite reports the existing large JS chunk warning. Full unit suite is large but currently stable. E2E smoke passed.
- Suggested fix: Consider route-level dynamic import and manual chunks after architecture decomposition, not during this hardening phase.
- Fixed in this phase: no
- Deferred phase: performance/code-splitting phase after route decomposition.

### 12. Git hygiene risks

- Severity: medium
- Affected files: untracked tests under `tests/unit`
- Why it matters: Untracked test files can be lost or accidentally omitted from review. They are relevant to current boundaries but appear to be from earlier phases.
- Suggested fix: Commit them intentionally in a separate commit or include them with this hardening phase after review.
- Fixed in this phase: no
- Deferred phase: immediate git hygiene cleanup before the next large UI phase.
