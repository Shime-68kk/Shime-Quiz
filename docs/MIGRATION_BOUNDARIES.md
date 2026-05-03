# React v2 Migration Boundaries

Phase 1B is an app-shell foundation only. The React pages should stay focused on layout, navigation, and view composition until the legacy learning logic is migrated deliberately.

## Boundary rules

- Do not place quiz selection, scoring, mastery, spaced repetition, recommendation, analytics, or backup/restore algorithms directly inside route components.
- Keep route components thin. They should call future services/hooks and render state, not own learning rules.
- Preserve the existing data schema until a separate migration phase defines changes and compatibility handling.
- Treat the current vanilla modules as the source of truth until a service is explicitly migrated and covered by tests.

## Future integration points

- `quizEngineService`: quiz generation, answering, scoring, result summaries.
- `dataLibraryService`: imported datasets, active collection, metadata, validation.
- `learningAnalyticsService`: mastery, readiness, patterns, recommendations, session summaries.
- `importService`: JSON import, validation, backup/restore, legacy compatibility.

## Current status

The app shell provides routing, responsive layout, active navigation state, and placeholder pages only. No learning algorithms are migrated in Phase 1B.

## Phase 4M.1 dashboard data boundary

Dashboard cards should read shared learning inputs through `DashboardLearningDataProvider` / `useDashboardLearningData()` instead of reading localStorage independently. The provider centralizes current library data, study history, review schedule, recommendation feedback, goal state, mastery, due-review summary, weighted-practice selection, Recommendation Lite, and Study Plan Lite for one dashboard render cycle.

Keep future dashboard widgets read-only by default. If a widget needs to mutate local state, prefer updating the focused storage module and relying on its existing update event rather than adding another localStorage polling path.

Some older vanilla v1 modules still contain local helper functions such as `hashString` and `clamp`; those are intentionally left outside this React v2 dashboard pass to avoid risky cross-branch refactors.
