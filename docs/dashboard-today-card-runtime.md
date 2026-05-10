# Phase 12E — Dashboard Today Card Runtime

## 1. Purpose

Phase 12E adds a small Dashboard Today Card runtime improvement. The card gives the learner a clearer first study action on the Dashboard while preserving the existing Dashboard sections below it.

This phase implements the runtime Today Card planned in Phase 12D. It does not change Study Room learning logic, scoring, spaced-repetition, mastery, recommendation algorithms, storage schema, backup format, import/restore behavior, package version, or dependencies.

## 2. Baseline

The project is completed/merged through Phase 12D. Phase 12D documented the Dashboard Today Card UX plan, including primary CTA, progressive disclosure, empty-state, accessibility, mobile-first, data/source, and testing expectations.

Shime Quiz remains local-first and browser-local. Manual backup/export/import remains the portability model. There is no backend, cloud, account sync, automatic sync, hidden upload of study data, or account requirement.

## 3. Runtime behavior

Phase 12E adds a Dashboard Today Card near the top of the Dashboard. The card summarizes what the learner can do today using existing available app data such as current library count, due review summary, existing today plan data, existing smart-practice selection, and existing study history availability.

The card provides one primary CTA. Depending on available data, the CTA routes to existing destinations such as the Library for an empty library or the existing Study Room route for due review, smart practice, or general study. The implementation uses existing routes and route state patterns where available.

Existing Dashboard metrics remain available below the card. The current analytics, mastery, review schedule, study goal, daily journey, smart practice, study history, and summary cards are not removed.

Empty or fallback states are handled. When no library data is available, the card points the learner to the Library. When no due items or detailed history are available, it offers a safe short-study fallback instead of inventing unsupported recommendations.

The implementation does not change Study Room learning logic.

## 4. Safety boundaries

Phase 12E does not change scoring, SRT, mastery, recommendation algorithms, or Study Room behavior. It does not change storage schema, does not change backup format, and does not change import/restore behavior. It does not implement IndexedDB, does not implement localStorage migration, does not implement FSRS, does not implement cloud/account sync, does not implement automatic sync, does not implement encryption, does not implement QR transfer, does not implement transfer-code flow, does not implement WebRTC/session transfer, does not implement route-level code splitting, and does not implement unit test infrastructure.

No package dependencies are added and the package version is unchanged.

## 5. User-facing claim boundaries

Allowed claims after Phase 12E:

- Dashboard Today Card runtime exists.
- Dashboard now provides a clearer first study action.
- Today Card uses existing app data and routes.
- Existing Dashboard metrics remain available.
- The app remains local-first and browser-local.

Forbidden claims after Phase 12E:

- Recommendation algorithm changed.
- Study Room behavior changed.
- Scoring, SRT, or mastery changed.
- Personalized AI recommendations implemented.
- Cloud/account sync implemented.
- Automatic sync implemented.
- Encryption implemented.
- Guaranteed improved retention.
- Production accessibility, performance, security, or reliability certification.
- Release package, release tag, or GitHub Release created.

## 6. Recommended next phase

Recommended next phase: Phase 12F — Unit Test Foundation Plan.
