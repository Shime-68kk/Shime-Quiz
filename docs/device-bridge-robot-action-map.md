# Device Bridge Robot Action Map

Physical motion is allowed now: no.

| App event | Robot behavior | Safety limit | Rate-limit recommendation | Allowed payload fields | Forbidden payload fields |
| --- | --- | --- | --- | --- | --- |
| `session_started` | `neutral` / `focus` | Log/stub only | 1 per session | `sessionId`, `progressCount`, `totalCount` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |
| `question_presented` | `focus` | Log/stub only | 1 per item index | `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |
| `answer_correct` | `celebrate` | Log/stub only | max 1 per answer check | `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount`, `status` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |
| `answer_wrong` | `encourage` | Log/stub only | max 1 per answer check | `sessionId`, `itemIndex`, `itemType`, `progressCount`, `totalCount`, `status` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |
| `review_due` | `due_review` | Log/stub only | max 1 per session start | `sessionId`, `dueCountBucket`, `totalCount` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |
| `session_complete` | `session_complete` | Log/stub only | 1 per completion | `sessionId`, `progressCount`, `totalCount`, `scoreBucket`, `accuracyBucket` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |
| `bridge_error` | `error_signal` | Log/stub only | max 1 per status transition | `sessionId`, `reasonCode`, `transportStatus`, `message` | prompt, answer, explanation, userAnswer, sourceMetadata, settings, studyHistory, backupPayload |

Unknown events must map to `error_signal` or neutral fallback.

