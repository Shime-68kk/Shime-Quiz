# Backup / Restore Manual Regression Smoke

## Purpose of Phase 9F

Phase 9F documents the manual backup / restore regression smoke checklist for the current release candidate. It is a documentation, static-validator, and CI-registration phase only. It does not change backup/restore behavior, local storage schema, runtime app behavior, E2E logic, package version, dependencies, release tags, GitHub Releases, or release packages.

## Current baseline

- The project is completed/merged through Phase 9E.
- The import regression smoke checklist exists in [`docs/import-regression-smoke.md`](import-regression-smoke.md).
- The release tag has not been created.
- The GitHub release has not been published.
- The release package has not been published.
- Shime remains a local-first quiz study app.

## Manual smoke prerequisites

Before testing backup/restore manually:

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Build the app:

   ```bash
   npm run build
   ```

3. Start a browser-testable app session using one of:

   ```bash
   npm run dev
   npm run preview
   ```

4. Use a browser with a controlled local test state. A clean local test state is useful when validating empty-state behavior; a known seeded state is useful when validating backup/restore preservation.
5. Ensure at least one saved quiz or Library item exists before export.
6. Where possible, create some study progress/history before export so restoration can be checked beyond quiz content alone.
7. Do not rely on backend, account, auth, or cloud sync behavior. Backup/restore remains local-first.

## Backup/restore checklist

Use this checklist for a manual smoke run:

1. Create or import a quiz.
2. Save the quiz to Library.
3. Optionally complete study items to generate study history or progress.
4. Export backup.
5. Verify that a backup file/download exists.
6. Clear or change local state in a controlled way.
7. Restore backup.
8. Verify Library data is restored.
9. Verify quiz content is restored.
10. Verify study history/progress is restored where applicable.
11. Verify review schedule is restored where applicable.
12. Verify recommendation feedback is restored where applicable.
13. Verify study goal or plan progress is restored where applicable.
14. Verify malformed or bad backup data is blocked or reported.
15. Confirm no backend/cloud sync is required.
16. Confirm no account/auth backup is required.

## Detailed smoke steps

### 1. Prepare a known state

- Start from a controlled browser profile or a known seeded localStorage state.
- Use a safe demo/import path, such as JSON/CSV import or **Dùng quiz mẫu**, to create at least one Library quiz.
- Save only after the normal preview/review/confirm-save flow.
- Optionally study a few items so study history/progress, review schedule, recommendation feedback, and study goal/plan progress can be checked where applicable.

### 2. Export backup

- Use the existing app backup/export surface.
- Confirm the export action produces a backup file/download.
- Keep the exported file in a known local folder for the restore step.
- Record browser, OS, timestamp, and the rough contents expected to be restored.

### 3. Change or clear local state safely

- Use a controlled method such as a fresh browser profile, a test-only localStorage clear, or adding/removing a known test item.
- Do not run destructive cleanup against unrelated browser profiles or real user data.
- Confirm the app state differs from the exported backup before restore.

### 4. Restore backup

- Use the existing app backup/restore surface.
- Select the exported backup file.
- Confirm restore completes without crash.
- Verify Library data is restored.
- Verify quiz content is restored.
- Verify study history/progress is restored where applicable.
- Verify review schedule is restored where applicable.
- Verify recommendation feedback is restored where applicable.
- Verify study goal or plan progress is restored where applicable.

### 5. Malformed or bad backup

- Try a clearly invalid backup file or malformed JSON payload through the existing restore surface.
- Verify malformed or bad backup content is blocked or reported.
- Verify the restore path does not silently accept invalid data.
- Verify restore does not silently corrupt local data.
- If existing UI shows an error, record the user-visible error/reporting.

## Expected behavior

- Backup/restore remains local-first.
- No backend/cloud sync is required.
- No account/auth is required for backup or restore.
- Restore should not silently corrupt local data.
- Malformed or bad backups should not be accepted silently.
- User-visible error/reporting should appear for invalid backup where applicable.
- Backup/restore should preserve the state categories that are included in the current backup format, and manual claims should only mention categories actually checked during the run.

## Failure classification

Classify failures before requesting changes:

- App bug.
- Backup serialization bug.
- Restore/deserialization bug.
- Storage/schema issue.
- Fixture/data issue.
- Browser/environment issue.
- Timeout/flakiness.

## Evidence rules

- Do not claim manual backup/restore regression passed unless an actual tester/user run passes.
- Do not claim all state categories are preserved unless each was actually checked.
- Do not claim backend/cloud sync exists.
- Do not claim account/auth backup exists.
- Do not claim production/security certification.
- Record exact OS, browser, app URL, backup file source, state categories checked, and pass/fail notes.

## Claims control

Safe claims after Phase 9F:

- Backup/restore regression smoke checklist exists.
- Backup/restore manual test surfaces are documented.

Do not claim:

- Manual backup/restore regression passed without actual run evidence.
- All state categories are preserved unless each was checked.
- Do not claim backend/cloud sync.
- Do not claim account/auth backup.
- Do not claim production/security certification.
- Do not claim release tag created.
- Do not claim GitHub release published.
- Do not claim release package published.
- Do not claim built-in AI generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR.
- Do not claim EduGen bundled into Shime.


## Phase 9G Study Room / Dashboard regression smoke reference

The next optional hardening guide is [`docs/study-dashboard-regression-smoke.md`](study-dashboard-regression-smoke.md). It covers saved quiz setup, Library-to-Study-Room flow, answer handling, study progress/history, review schedule/SRT, Dashboard progress checks, recommendations, study goal/plan progress, and evidence rules.

## Recommended next step

Recommended next phase after this, if continuing hardening: **Phase 9G — Study Room / Dashboard Learning Flow Smoke**. Alternatively, stop and decide whether to proceed to the actual release tag/publish flow.
