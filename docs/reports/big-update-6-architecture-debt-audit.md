# BIG-UPDATE-6 Architecture Debt Audit

## 1. StudyRoom structure

- Severity: medium
- Affected files: `src/routes/StudyRoom.jsx`
- Finding: StudyRoom owns item selection, draft persistence, bridge events, answer checking, result persistence, mascot copy, and navigation in one route component.
- Proposed fix: extract session orchestration and UI panels incrementally.
- Phase status: partially fixed by extracting subject-space models and component; main StudyRoom route remains large.

## 2. Scheduler integration points

- Severity: medium
- Affected files: `src/state/reviewScheduleStorage.js`, `src/quiz/reviewSchedulerAdapter.js`, `src/scheduler/*`
- Finding: Stable schedule writes still flow through storage helpers; BIG-UPDATE-5 added a pluggable evidence layer but runtime StudyRoom scheduling still uses the legacy path.
- Proposed fix: keep SM2 default and add an explicit runtime scheduler boundary only after more evidence.
- Phase status: deferred.

## 3. Subject/category/deck modeling

- Severity: low
- Affected files: `src/data/learningDataAdapter.js`, `src/studyRoom/studySubjectSpaceModel.js`
- Finding: Subjects already exist in normalized v2 data; deck/category are not first-class but can be fallback signals.
- Proposed fix: use subject first, then topic/source/fallback grouping.
- Phase status: fixed in the subject-space model.

## 4. Local storage and backup/export implications

- Severity: medium
- Affected files: `src/state/v2BackupRestore.js`, `src/studyRoom/subjectSpaceBackupMetadata.js`
- Finding: No dedicated subject-space preference metadata existed.
- Proposed fix: add safe metadata helper; integrate into backup only in a later migration-safe phase.
- Phase status: model added, runtime backup integration deferred.

## 5. Notification/reminder readiness

- Severity: medium
- Affected files: `src/studyRoom/subjectForgettingAlertModel.js`, `src/studyRoom/studyNotificationPreferenceModel.js`
- Finding: No local subject forgetting alert model existed. No push backend should be added.
- Proposed fix: create local model only; defer browser permission.
- Phase status: fixed as model only.

## 6. Mobile UX limitations

- Severity: medium
- Affected files: `src/routes/StudyRoom.jsx`, `src/styles/global.css`
- Finding: StudyRoom had item swipe, not subject-space navigation.
- Proposed fix: add subject chips, accessible next/previous controls, and scroll-snap.
- Phase status: fixed without gesture physics.

## 7. Safe Capsule future robot integration

- Severity: high
- Affected files: `src/studyRoom/subjectRobotSafeSummary.js`
- Finding: Future robot handoff must not receive exact content or subject names.
- Proposed fix: expose only coarse subject-state buckets.
- Phase status: fixed as pure model; no real robot bridge enabled.

## 8. Test coverage gaps

- Severity: medium
- Affected files: `tests/unit/*`
- Finding: No tests covered subject-space grouping, forgetting alerts, subject navigation, robot-safe subject summary, or subject metadata restore.
- Proposed fix: add focused unit tests.
- Phase status: fixed.

## 9. High-risk coupling

- Severity: high
- Affected files: `src/routes/StudyRoom.jsx`
- Finding: Device bridge events, FSRS bridge, scheduler state, and study UI share the same route component.
- Proposed fix: split bridge event emitters and study flow controller after current feature stabilizes.
- Phase status: deferred.

## 10. Recommended next refactors

- Extract StudyRoom session state into `src/studyRoom/studySessionController.js`.
- Integrate subject-space metadata into backup after compatibility tests.
- Add optional local notification UI only after permission UX is designed.
- Keep robot subject summary as a separate export contract, not a runtime transport.
