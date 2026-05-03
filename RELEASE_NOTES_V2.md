# Release Notes - ShimeChamhoc v2.0.0-rc1

## Status

v2.0.0-rc1 is a release candidate for the React/Vite local-first learning app. It is intended for final manual smoke testing before a wider beta.

## Summary

ShimeChamhoc v2 introduces a new React/Vite architecture for multi-subject learning. The app remains static and local-first: users can import JSON/CSV learning data, study locally, track lightweight progress, and export or restore v2 learning data without a backend account.

## Major features

- React/Vite app shell with `/dashboard`, `/library`, and `/study-room` routes.
- Responsive desktop sidebar, mobile bottom navigation, and focus-mode Study Room.
- Lightweight design system with tokens, cards, buttons, badges, progress bars, empty states, and notification primitives.
- v2 learning data model for subjects, topics, and items.
- JSON and CSV import preview with validation before applying data.
- Local library persistence in `localStorage`.
- Library export as re-importable JSON.
- Study Room rendering for multiple-choice, short-answer, and flashcard items.
- Local study draft restore/reset.
- Local attempt completion and Vietnamese result summary.
- v2 study history with normalized item results and detail view.
- Basic analytics, local spaced repetition schedule, due review mode, Smart Practice mode, and basic mastery insights.
- Recommendation Lite, recommendation feedback, Study Goal Lite, Today Journey, plan progress tracking, and local backup/restore.
- Full, redacted, and progress-only backup export modes.
- Local security disclosure explaining plaintext storage and answer-key exposure limits.
- v2 release QA checklist in `RELEASE_QA_V2.md`.

## Data and storage notes

v2 uses versioned localStorage keys for local-only learning data:

- `shimeV2LibraryDataV1`
- `shimeV2StudyDraftV1`
- `shimeV2StudyHistoryV1`
- `shimeV2ReviewScheduleV1`
- `shimeV2RecommendationFeedbackV1`
- `shimeV2StudyGoalV1`
- `shimeV2StudyPlanProgressV1`

History records are normalized for new sessions to reduce repeated prompt and answer snapshots. Older restored records with snapshot-heavy data remain supported.

## Backup and export modes

- **Sao lưu đầy đủ**: includes library content, answer keys, and local learning state. This is the only backup mode that supports full restore in this release candidate.
- **Sao lưu đã ẩn đáp án**: removes direct answer fields where practical. This reduces sharing risk but is not encryption and cannot be fully restored as an answer-key backup.
- **Sao lưu tiến trình**: excludes library content and answer keys. It is useful only with the matching library and is not restored as a full backup in this release candidate.

## Local security limitation

ShimeChamhoc v2 is a static local-first app. Offline scoring requires answer data to exist in the browser. Full backups are plaintext JSON and may contain questions, correct answers, explanations, and study history. Redacted and progress-only exports reduce sharing risk but do not provide cryptographic protection. True answer-key protection or anti-cheat scoring would require future backend/server-side scoring.

## Migration note from v1

v2 is a new React/Vite architecture. It does not automatically migrate all stable v1 quiz data or learning progress unless an explicit v2 import/restore path supports that data. Keep v1 backups separately before testing v2.

## Known limitations

- v2 is local-only and browser-specific; there is no account sync.
- Redacted and progress-only backups are export-only guardrails in this release candidate and are blocked from full restore with Vietnamese explanations.
- Study Room special modes are route-state based; direct reload may return to the default Study Room view.
- The mastery, recommendation, weighted practice, and spaced repetition models are simple local heuristics, not AI/ML predictors.
- Full answer protection is not possible in a static offline app without a backend.

## Smoke test status

Release QA documentation is available in `RELEASE_QA_V2.md`. Before shipping v2.0.0-rc1, run:

```bash
npm run build
```

Then complete the manual smoke checklist in `RELEASE_QA_V2.md`.
