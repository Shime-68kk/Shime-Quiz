# Device Bridge StudyRoom Integration Plan

Phase 5A is planning-only. It inspects `src/routes/StudyRoom.jsx` and proposes a future minimal Phase 5B patch without modifying StudyRoom or runtime learning logic.

## Current StudyRoom Flow Summary

Relevant source: `src/routes/StudyRoom.jsx`.

- Lines 30-80 define study-mode and item-selection helpers:
  - `getStudyMode(selection)`
  - `getSelectionLabel(selection)`
  - `getStudyItems(adapter, selection)`
- Lines 184-229 initialize `StudyRoom`, resolve `selection`, `studyMode`, `items`, `currentIndex`, answer state, draft state, completion state, and `currentItem`.
- Lines 230-257 compute the existing FSRS memory-rating bridge visibility. This is unrelated to Device Bridge and must not be reused as a transport/device integration point.
- Lines 294-349 reset or restore a study draft when `items`, `studyMode`, or the item-set fingerprint changes.
- Lines 351-379 save study draft state locally.
- Lines 401-419 update and check answers.
- Lines 437-447 reveal/cover flashcards.
- Lines 460-470 navigate previous/next.
- Lines 543-620 complete the session, create summary/history, update review schedule, update study-plan progress, clear draft, and show completion UI.
- Lines 646-668 handle the existing FSRS production memory-rating bridge. This touches review logs and must remain separate from Device Bridge.
- Lines 868-879 render `StudyItemRenderer` and pass answer/reveal actions.
- Lines 882-890 render `FsrsProductionMemoryRatingBridge` when its own scheduler gate allows it.

## Proposed Event Emission Points

Future Phase 5B should add a small adapter and call it from StudyRoom. The adapter should accept only redacted/coarse fields and call `deviceBridgeFacade.emitStudyEvent()`.

### `session_started`

- Closest block: session reset/restore effect at lines 294-349.
- Data already available: `studyMode`, `items.length`, `currentIndex`, `itemSetFingerprint`, `isDueReviewMode`, `isSmartPracticeMode`.
- Future factory: `createSessionStartedEvent` through adapter/facade `emitStudyEvent('session_started', input)`.
- Safe fields:
  - `sessionId`: ephemeral per StudyRoom mount or per `itemSetFingerprint`.
  - `progressCount`: `0` for a new session, or `currentIndex` after restored draft if restoration needs to be represented.
  - `totalCount`: `items.length`.
  - `bridgeStatus`: optional snapshot-derived coarse status.
  - `transportStatus`: optional snapshot-derived coarse status.
- Must not pass:
  - `selectionLabel`
  - `selection.subjectTitle`
  - `selection.topicTitle`
  - item ids
  - prompts
  - answers
  - source metadata
  - draft payload
- Risks:
  - The effect reruns when the fingerprint changes. Phase 5B should use a ref keyed by `itemSetFingerprint` to avoid duplicate session-start events.
  - Restored drafts may start at a non-zero index; the event should still remain coarse.

### `question_presented`

- Closest block: derived current item state at lines 220-228, plus navigation handlers at lines 460-470 and question-map click at lines 947-950.
- Recommended future attachment: a dedicated `useEffect` watching `currentItemId`, `currentIndex`, `items.length`, `completedAttempt`, and the session id, rather than adding emit calls into every navigation button/click path.
- Data already available: `currentIndex`, `currentItem.type`, `items.length`, `completedAttempt`.
- Future factory: `createQuestionPresentedEvent` through `emitStudyEvent('question_presented', input)`.
- Safe fields:
  - `sessionId`
  - `itemIndex`: `currentIndex`
  - `itemType`: `currentItem.type || 'unknown'`
  - `progressCount`: `currentIndex`
  - `totalCount`: `items.length`
- Must not pass:
  - `currentItem.prompt`
  - `currentItem.question`
  - `currentItem.front`
  - `currentItem.back`
  - `currentItem.choices`
  - `currentItem.correctAnswer`
  - `currentItem.answer`
  - `currentItem.acceptableAnswers`
  - `currentTopic.title`
  - item id
- Risks:
  - `currentItemId` is private library metadata; do not include it in payload.
  - A question-map click and next/previous buttons all change `currentIndex`; a single effect avoids duplicated emissions.

### `answer_correct`

- Closest block: `checkCurrentAnswer()` at lines 413-419.
- Data already available: `currentItem`, `currentItemState`, `currentItemId`, `currentIndex`, `items.length`, `completedAttempt`.
- Future factory: `createAnswerCorrectEvent` through `emitStudyEvent('answer_correct', input)`.
- Safe fields:
  - `sessionId`
  - `itemIndex`: `currentIndex`
  - `itemType`: `currentItem.type || 'unknown'`
  - `progressCount`: count of checked/revealed items after this action, or `currentIndex + 1` if Phase 5B keeps it simpler.
  - `totalCount`: `items.length`
  - `status`: optional, factory already defaults to `correct`.
- Must not pass:
  - selected choice id
  - typed answer
  - correct answer
  - acceptable answers
  - explanation
  - prompt/question/front/back
- Risks:
  - `checkCurrentAnswer()` currently sets state and feedback only. Future emit must be non-fatal and must not block those state updates.
  - For non-scorable item types, `isDisplayOnlyAnswerCorrect()` returns `null`; do not emit correct/wrong in that case.

### `answer_wrong`

- Closest block: `checkCurrentAnswer()` at lines 413-419.
- Data already available: same as `answer_correct`.
- Future factory: `createAnswerWrongEvent` through `emitStudyEvent('answer_wrong', input)`.
- Safe fields:
  - `sessionId`
  - `itemIndex`: `currentIndex`
  - `itemType`: `currentItem.type || 'unknown'`
  - `progressCount`: count of checked/revealed items after this action, or `currentIndex + 1` if Phase 5B keeps it simpler.
  - `totalCount`: `items.length`
  - `status`: optional, factory already defaults to `wrong`.
- Must not pass:
  - user typed answer
  - selected choice
  - correct answer
  - acceptable answers
  - explanation
  - prompt/question/front/back
- Risks:
  - The existing auto-append FSRS Again log effect at lines 278-292 is scheduler-related. Device Bridge emission must not be added there.

### `review_due`

- Closest block: due-review item selection in `getStudyItems()` at lines 47-52 and `isDueReviewMode`/`items` derivation at lines 191-195.
- Recommended future attachment: same guarded session lifecycle effect used for `session_started`, only when `isDueReviewMode && items.length > 0`.
- Data already available: `isDueReviewMode`, `items.length`.
- Future factory: `createReviewDueEvent` through `emitStudyEvent('review_due', input)`.
- Safe fields:
  - `sessionId`
  - `dueCountBucket`: bucketed from `items.length`, for example `0`, `1_5`, `6_10`, `11_25`, `26_plus`.
  - `totalCount`: `items.length` only if Phase 5B confirms total count is acceptable for this event.
- Must not pass:
  - due item ids
  - exact schedule records
  - due dates
  - interval/ease/FSRS state
  - review history
- Risks:
  - Exact due count can reveal library size/activity. Prefer a bucket, not raw schedule records.
  - Do not read or modify review schedule for this event; use the already-selected `items.length`.

### `session_complete`

- Closest block: `finishSession()` at lines 543-620.
- Data already available: `summary` from `createStudyAttemptSummary()` at line 563, `items.length`, `completedAt`, `historyResult`, `reviewScheduleResult`.
- Recommended future attachment: after `summary` is created and before or after persistence messages are set. Emission must be non-fatal and must not affect `saveStudyHistoryRecord()`, `updateReviewScheduleFromHistoryRecord()`, or UI state updates.
- Future factory: `createSessionCompleteEvent` through `emitStudyEvent('session_complete', input)`.
- Safe fields:
  - `sessionId`
  - `progressCount`: coarse answered/complete count from `summary.answeredCount` if present.
  - `totalCount`: `summary.totalItems || items.length`
  - `scoreBucket`: bucketed from `summary.accuracy` or score.
  - `accuracyBucket`: bucketed from `summary.accuracy`.
- Must not pass:
  - `historyRecord`
  - per-item results
  - answers by item id
  - checked/revealed maps
  - schedule update result details beyond a coarse bridge status
  - item ids
  - timestamps if not needed
- Risks:
  - Completion currently performs local persistence and schedule updates. Device Bridge must not be placed inside a branch that changes those results.
  - Duplicate completion guard exists at line 559. Future emission should happen after that guard.

### `bridge_error`

- Closest block: future adapter, not StudyRoom business logic.
- Data already available: facade/factory failure reason and safe message from `emitStudyEvent()`.
- Future factory: `createBridgeErrorEvent` through adapter/facade `emitStudyEvent('bridge_error', input)`.
- Safe fields:
  - `sessionId`
  - `reasonCode`
  - `message`
  - `bridgeStatus`
  - `transportStatus`
- Must not pass:
  - raw failed payload
  - raw error object
  - stack trace
  - item data
  - user answer
  - source metadata
- Risks:
  - Avoid recursive error loops. If emitting `bridge_error` fails, the adapter should stop and return/log nothing further.
  - StudyRoom should not display bridge errors unless a future UI phase explicitly adds mock diagnostics.

## Safe Payload Mapping Table

| Event | StudyRoom source | Safe fields |
| --- | --- | --- |
| `session_started` | lines 294-349 session reset/restore effect | `sessionId`, `progressCount`, `totalCount`, optional `bridgeStatus`, `transportStatus` |
| `question_presented` | lines 220-228 derived current item, future effect on current item change | `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount` |
| `answer_correct` | lines 413-419 `checkCurrentAnswer()` | `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount`, optional `status` |
| `answer_wrong` | lines 413-419 `checkCurrentAnswer()` | `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount`, optional `status` |
| `review_due` | lines 191-195 due mode/items, lines 47-52 due item selector | `sessionId`, `dueCountBucket`, optional `totalCount` |
| `session_complete` | lines 543-620 `finishSession()` | `sessionId`, `progressCount`, `totalCount`, `scoreBucket`, `accuracyBucket` |
| `bridge_error` | future adapter failure wrapper | `sessionId`, `reasonCode`, `message`, `bridgeStatus`, `transportStatus` |

## Forbidden Data Table

| Data | Why forbidden |
| --- | --- |
| prompt/question/front/back | private learning content |
| choices/choice labels | can reveal the prompt and answer context |
| correctAnswer/answer/acceptableAnswers | answer leakage |
| user typed answer/selected choice id | private user response |
| explanation | private learning content |
| item id/topic id/subject id | exact private library metadata |
| subject/topic titles and selection label | source/library metadata |
| imported file names/source metadata | import privacy risk |
| draft payload | includes answer maps and item state |
| history records | full study history is forbidden by default |
| review schedule records/FSRS state | scheduler internals and learning history |
| backup/settings payloads | broad private local app data |
| raw error objects/stack traces | may contain private payload fragments |

## Direct Call vs Adapter Decision

Recommendation: use option B, a tiny intermediate helper such as `src/deviceBridge/studyRoomBridgeAdapter.js` in Phase 5B.

Reasons:

- Keeps `StudyRoom.jsx` from knowing factory names, bucketing rules, and error-loop prevention details.
- Keeps redaction/bucketing close to Device Bridge boundaries.
- Gives tests a small pure module to cover before touching the route.
- Allows future UI or settings work to swap the facade instance without embedding transport details in StudyRoom.

StudyRoom should call high-level adapter methods such as:

- `emitStudyRoomSessionStarted(context)`
- `emitStudyRoomQuestionPresented(context)`
- `emitStudyRoomAnswerChecked(context)`
- `emitStudyRoomReviewDue(context)`
- `emitStudyRoomSessionComplete(context)`

The adapter should call `deviceBridgeFacade.emitStudyEvent()` internally.

## Future Minimal Phase 5B Patch

Files to change:

- `src/deviceBridge/studyRoomBridgeAdapter.js`
- `tests/unit/deviceBridgeStudyRoomAdapter.test.js`
- `src/routes/StudyRoom.jsx`
- optionally `docs/beta-phase-5b-studyroom-integration.md`

Functions to add:

- `createStudyRoomBridgeAdapter({ facade })`
- `makeDeviceBridgeSessionId(seed)` or equivalent ephemeral session-id helper.
- `bucketDueCount(count)`
- `bucketAccuracy(value)`
- Adapter emit methods for the events listed above.

Conceptual StudyRoom blocks to touch:

- Import adapter near other imports.
- Add refs near lines 217-219:
  - facade/adapter ref
  - session id ref
  - emitted session fingerprint ref
  - emitted question key ref
- Session lifecycle effect around lines 294-349:
  - emit `session_started`
  - emit `review_due` when `isDueReviewMode`
- New guarded current-question effect near lines 351-379 or before handlers:
  - emit `question_presented` when current item changes.
- `checkCurrentAnswer()` lines 413-419:
  - compute correctness from `nextItemState`
  - emit `answer_correct` or `answer_wrong` only for boolean correctness.
- `finishSession()` lines 543-620:
  - after the duplicate guard and summary creation, emit `session_complete`.

Unit tests needed:

- Adapter creates safe inputs for every event.
- Adapter buckets due counts and accuracy without leaking exact schedule/history data.
- Adapter rejects or drops private fields.
- Adapter emits `bridge_error` once on facade failure and does not recurse.
- StudyRoom smoke/unit test can mock adapter and verify calls on answer check and completion without inspecting private payloads.

Integration test:

- Optional. A lightweight component-level test is enough for Phase 5B if existing StudyRoom tests can mock the adapter. Browser/e2e is not required unless UI behavior is added.

Rollback plan:

- Remove adapter import and call sites from `StudyRoom.jsx`.
- Remove `src/deviceBridge/studyRoomBridgeAdapter.js`.
- Remove adapter tests.
- Device Bridge facade, schema, redaction policy, and mock transport can remain because they are isolated and already tested.

## Failure Behavior

- Adapter calls must be best-effort.
- A failed Device Bridge emit must not change answer state, feedback, navigation, draft save, history save, review schedule update, FSRS logs, or completion state.
- Adapter should return safe failure objects for tests, but StudyRoom should not branch learning logic on those failures.
- If a `bridge_error` event fails, stop; do not retry recursively.

## Risk Assessment

- Highest risk: accidentally passing raw `currentItem`, `currentItemState`, `summary` details, or `historyRecord` into the facade. Mitigation: adapter accepts explicit scalar fields only.
- Medium risk: duplicate `session_started` or `question_presented` emissions from React effects. Mitigation: refs keyed by `itemSetFingerprint` and current item position.
- Medium risk: coupling with the existing FSRS memory-rating bridge. Mitigation: do not attach Device Bridge to lines 278-292 or 646-668.
- Low risk: mock facade failures. Mitigation: non-fatal adapter wrapper and existing facade safe failures.
