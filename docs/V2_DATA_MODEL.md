# ShimeChamhoc v2 data model notes

Phase 3A introduces a small adapter-based learning data model for the React/Vite v2 branch. This is architecture groundwork only; it does not migrate the stable vanilla quiz engine.

## Current shape

The mock v2 data has four layers:

- **subject**: top-level learning area, such as Networking or Academic English.
- **course/module**: optional grouping inside a subject.
- **topic/chapter**: study unit inside a subject/course.
- **item/question**: learnable item attached to a subject and topic.

Supported item types:

- `multiple_choice`
- `short_answer`
- `flashcard`

Item fields supported by the adapter:

- `id`
- `type`
- `subjectId`
- `topicId`
- `prompt`
- `choices` for multiple choice
- `answer` / `correctAnswer`
- `explanation`
- `tags`
- `difficulty`
- `source`

## Adapter boundary

`src/data/learningDataAdapter.js` normalizes raw data and exposes selectors for pages:

- `getSubjects()`
- `getTopicsBySubject(subjectId)`
- `getItemsByTopic(topicId)`
- `getItemsBySubject(subjectId)`
- `getAllItems()`

The adapter filters invalid records and returns safe empty arrays for normal bad input. UI pages should consume selectors instead of owning data parsing or learning algorithms.

## Migration guidance

The current data in `src/data/mockLearningData.js` is mock/local only. Later phases should map the existing stable v1 quiz/import format into this v2 adapter shape through a dedicated import/data-library service.

Do not change the stable v1 data schema during this phase. Quiz engine, spaced repetition, analytics, and recommendations should remain separate service boundaries when they are migrated later.

## Phase 3B import preview

`src/data/importValidator.js` provides the browser-side JSON preview validator for the v2 mock library flow. It is intentionally separate from the adapter:

- the validator reports schema errors and warnings for users before import;
- the adapter normalizes only safe, usable records for UI selectors;
- Phase 3D persists successful imports to localStorage under `shimeV2LibraryDataV1`;
- persisted data stores normalized `subjects`, `topics`, `items`, plus metadata: `importedAt`, `sourceName`, `sourceType`, and `schemaVersion`;
- corrupted or invalid persisted data falls back safely to mock data instead of crashing;
- the old v1 textbook importer and quiz engine are not migrated in this phase.

Expected top-level JSON shape:

```json
{
  "subjects": [],
  "topics": [],
  "items": []
}
```

Validation rules include:

- `subjects` must be an array; each subject needs `id` and `title` or `name`.
- `topics` must be an array; each topic needs `id`, `subjectId`, and `title` or `name`.
- `items` must be an array; each item needs `id`, `type`, `subjectId`, `topicId`, and `prompt`/`question`/`front`.
- `multiple_choice` requires non-empty `choices` and `correctAnswer`.
- `short_answer` requires `answer`, `correctAnswer`, or `acceptableAnswers`.
- `flashcard` requires `front/back` or `prompt/answer`.
- Duplicate IDs and orphan subject/topic references are surfaced as warnings.
- Unknown item types are blocked as errors.

Only a small sample of parsed items is rendered in the preview so large files do not flood the UI.

## Phase 3C CSV import preview

The React v2 Library import preview accepts `.json` and `.csv` files. CSV is parsed locally in the browser and mapped into the same v2 adapter shape before validation. Nothing is uploaded.

Supported CSV columns include:

- `subject`
- `topic`
- `type`
- `prompt`
- `choices`
- `correctAnswer`
- `answer`
- `front`
- `back`
- `explanation`
- `tags`
- `difficulty`
- `source`

Type aliases are normalized before validation:

- `mcq`, `multiple choice`, `multiple_choice` -> `multiple_choice`
- `short`, `short_answer` -> `short_answer`
- `flashcard`, `card` -> `flashcard`

Multiple-choice `choices` may be separated with `|` or newlines. Tags may be separated with commas, semicolons, `|`, or newlines. If a CSV row does not provide explicit IDs, the parser generates deterministic IDs from the row content so the adapter can preview it safely.

The CSV parser is intentionally lightweight. It supports quoted values, commas inside quotes, and escaped quotes. Malformed rows produce validation warnings/errors instead of crashing the UI.


## Phase 3D local library persistence

The v2 library store lives in `src/data/learningDataStore.js`. It is intentionally limited to library data only. It does not persist v2 study history, spaced repetition, analytics, accounts, or sync state.

Storage key:

```text
shimeV2LibraryDataV1
```

Persisted payload shape:

```js
{
  schemaVersion: 'v2-library-data-v1',
  importedAt: 'ISO timestamp',
  sourceName: 'filename.json',
  sourceType: 'json' | 'csv' | 'manual',
  metadata: { schemaVersion, importedAt, sourceName, sourceType },
  data: { subjects, topics, items }
}
```

Load behavior:

- valid persisted data loads on app start;
- missing storage falls back to mock data;
- corrupted JSON or invalid schema falls back to mock data and exposes a notice in the Library UI;
- localStorage write/quota errors keep the imported data in memory for the current session and show a warning.

Reset behavior clears only `shimeV2LibraryDataV1` and leaves unrelated v1/v2 app data untouched.


## Library export / backup

Phase 3E adds a v2 library-only export. The exported JSON keeps `subjects`, `topics`, and `items` at the top level so it can be re-imported through the existing JSON preview flow. The payload also includes metadata:

```json
{
  "schemaVersion": "v2-library-data-v1",
  "exportedAt": "2026-05-03T00:00:00.000Z",
  "appVersion": "2.0.0-rc1",
  "sourceSummary": {
    "sourceType": "json",
    "sourceName": "my-library.json",
    "importedAt": "2026-05-03T00:00:00.000Z",
    "subjectCount": 2,
    "topicCount": 4,
    "itemCount": 7
  },
  "subjects": [],
  "topics": [],
  "items": []
}
```

This is not a full learning-progress backup yet. It does not include v2 history, spaced repetition, accounts, or old v1 app data.

## V2 local backup/restore boundary

Phase 4O adds a v2-only backup format with `schemaVersion: "shime-v2-backup-v1"`. It is a local JSON download/restore flow, not backend sync. Phase 4R adds explicit export modes through `backupMode` metadata.

Export modes:

- `full`: includes library data from `shimeV2LibraryDataV1`, answer keys, study history, review schedule, recommendation feedback, study goal, and study plan progress. `includesAnswers` is `true`; this remains the full restore format.
- `redacted_library`: includes library structure and prompts but removes direct answer fields such as `correctAnswer`, `answer`, `acceptableAnswers`, flashcard `back`, and explanations where practical. `includesAnswers` is `false`; this mode is not restored as a full backup.
- `progress_only`: excludes library question content and answer keys, and includes only recognized local learning state. It requires the corresponding library to be useful and is not restored as a full backup in this phase.

Recognized learning-state sections:

- study history from `shimeV2StudyHistoryV1`
- review schedule from `shimeV2ReviewScheduleV1`
- recommendation feedback from `shimeV2RecommendationFeedbackV1`
- study goal from `shimeV2StudyGoalV1`
- study plan progress from `shimeV2StudyPlanProgressV1`

Study Room draft data is intentionally excluded. Drafts are lightweight in-progress UI state and can become stale when restored against a changed library or item set.

Restore validates the backup before writing and only writes recognized v2 keys for full backups. Unknown sections are ignored safely. Redacted and progress-only backups are blocked from full restore with a user-facing explanation. The stable v1 app, browser cache, service worker cache, unrelated localStorage keys, and account/telemetry data are not included.

## v2 local security boundary

The React/Vite v2 app is local-first and static/PWA-friendly. Offline rendering and local scoring require answer data to be available in the browser. This means answer keys can exist in browser memory, `localStorage`, imported JSON/CSV files, full backup exports, and browser DevTools. The local/static mode is not an anti-cheat system.

Known v2 localStorage keys and exposure boundaries:

- `shimeV2LibraryDataV1`: library subjects/topics/items; full imports can include `correctAnswer`, `answer`, `acceptableAnswers`, flashcard `back`, and explanations.
- `shimeV2StudyHistoryV1`: normalized history; new records avoid full answer snapshots, but older records may still contain legacy prompt/correct-answer snapshots.
- `shimeV2ReviewScheduleV1`: item IDs and scheduling metadata only; no full answer content.
- `shimeV2RecommendationFeedbackV1`: recommendation feedback records only; no answer content.
- `shimeV2StudyGoalV1`: local goal settings only; no answer content.
- `shimeV2StudyPlanProgressV1`: today-plan step progress only; no answer content.
- `shimeV2StudyDraftV1`: in-progress answers/reveal state only; can include user-entered answers but not full library content.

Full backup exports may include answer keys because they include the library. Redacted and progress-only export modes reduce sharing risk, but they are not encryption. True answer-key protection or anti-cheat scoring would require future backend/server-side scoring and access control.

## v2 history normalization note

New Study Room v2 history records are intentionally lightweight. They keep stable item identifiers, result status, user answer, subject/topic references, and a short `promptSnapshot` fallback. They no longer store a full correct-answer snapshot for newly completed sessions. History detail views resolve the current prompt, correct answer, topic, and subject labels from the active library data when available.

Older history records that already contain `prompt` or `correctAnswer` snapshots remain supported. If an item has been removed from the current library, the UI falls back to the lightweight snapshot and shows: `Mục học này không còn trong thư viện hiện tại.`

This reduces repeated text in localStorage and backup files without changing scoring, spaced repetition, mastery, weighted practice, or backup/restore compatibility.
