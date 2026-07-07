# Beta Phase 5B StudyRoom Integration

Baseline time: 2026-06-26T23:42:24+07:00

## What Was Implemented

- Added `src/deviceBridge/studyRoomBridgeAdapter.js`.
  - Wraps the existing Device Bridge facade.
  - Exposes only StudyRoom-safe methods:
    - `sessionStarted`
    - `questionPresented`
    - `answerCorrect`
    - `answerWrong`
    - `reviewDue`
    - `sessionComplete`
    - `bridgeError`
    - `getSnapshot`
    - `getDebugEvents`
  - Does not expose raw `emitStudyEvent()`.
  - Accepts only coarse fields: `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount`, `status`, `scoreBucket`, `accuracyBucket`, `dueCountBucket`, `bridgeStatus`, `transportStatus`, `reasonCode`, `message`.
  - Rejects unknown or sensitive fields before calling the facade.
  - Defaults disabled unless explicitly enabled through options.
- Added `tests/unit/deviceBridgeStudyRoomAdapter.test.js`.
- Added minimal StudyRoom event emission through the adapter only.
- Added this Phase 5B integration note.

## Exact StudyRoom Attachment Points

Source file: `src/routes/StudyRoom.jsx`.

Changes made for Phase 5B:

- Added `createStudyRoomBridgeAdapter` import.
- Added helper functions:
  - `createDeviceBridgeSessionId()`
  - `getCountBucket()`
  - `getAccuracyBucket()`
  - `getCompletedProgressCount()`
- Added refs:
  - `deviceBridgeAdapterRef`
  - `deviceBridgeSessionIdRef`
  - `deviceBridgeSessionKeyRef`
  - `deviceBridgeQuestionKeyRef`
- Added `emitDeviceBridge(methodName, input)` safe wrapper that catches failures.
- Added `sessionStarted` emission in the session reset/restore effect.
- Added `reviewDue` emission in the same effect when due-review mode is active.
- Added guarded `questionPresented` emission when the current item changes.
- Added `answerCorrect` / `answerWrong` emission in `checkCurrentAnswer()` after computing display-only correctness.
- Added `sessionComplete` emission in `finishSession()` after summary creation and before history/schedule persistence.

## Safety Constraints Preserved

- Device Bridge remains disabled by default.
- StudyRoom does not enable or connect the bridge.
- No UI was added.
- No settings storage was added.
- No real transport was added.
- No localStorage usage was added.
- No network or hardware APIs were added.
- No scheduler, FSRS, review schedule, study history, study-plan, import, export, backup, learning-data, EduGen, or service logic was changed.
- Bridge failures are swallowed and do not affect StudyRoom state transitions.

## Data Not Passed

StudyRoom does not pass:

- raw `currentItem`
- prompt/question/front/back
- choices
- correct answers
- acceptable answers
- explanations
- user typed answers
- selected choice ids
- source metadata
- subject/topic titles
- item ids
- draft payloads
- history records
- review schedule records
- backup or settings payloads

## Commands Run

- `git status --short`
- `npx vitest run tests/unit/deviceBridgeStudyRoomAdapter.test.js`
- `npx vitest run tests/unit/deviceBridgeEventSchema.test.js tests/unit/deviceBridgeMockTransport.test.js tests/unit/deviceBridgeRuntime.test.js tests/unit/deviceBridgeRedactionPolicy.test.js tests/unit/deviceBridgeStudyEventFactories.test.js tests/unit/deviceBridgeFacade.test.js tests/unit/deviceBridgeUiContract.test.js tests/unit/deviceBridgeStudyRoomAdapter.test.js`
- `npm run build`
- `npm run test:unit`

## Test Results

- Adapter test: PASS, 1 file / 11 tests.
- Device Bridge suite: PASS, 8 files / 65 tests.
- Build: PASS. Vite reported the existing large chunk warning. The main JS chunk changed to `dist/assets/index-DXNayF7T.js` at 668.15 kB after StudyRoom imports the Device Bridge adapter path.
- Full unit suite: PASS, 77 files / 2795 tests.

## Risks And Follow-Up

- The main bundle grew because StudyRoom now imports the Device Bridge adapter path. A future optimization can lazy-load the adapter if needed, but that should be a separate reviewed change.
- The adapter is default disabled, so normal StudyRoom behavior remains unchanged. Future enabling must be explicit and should stay mock-only until a later approved phase.
- The current guarded question emission may emit during restored-session state transitions if a future phase enables the bridge before refining StudyRoom tests. Keep Phase 6 handoff focused on observability/tests before adding user controls.

## Recommendation

`SAFE_FOR_PHASE_6_HANDOFF`.
