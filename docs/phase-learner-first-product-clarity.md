# Learner-First Product Clarity Phase

## Goal

Keep Shime's learning intelligence strong while making the default experience calm:
one useful action, a small amount of progress, and technical detail only on demand.

## Patterns adopted

- One primary `Study now` action and a visible due-today concept.
- Short, actionable sessions instead of a wall of analytics.
- Daily goals as optional motivation, not mandatory configuration.
- Progressive disclosure for detailed planning and advanced tools.
- Algorithm and protocol vocabulary translated into learner language.

## Architecture boundary

- `learnerTodayDecision.js` converts scheduler and recommendation data into one UI decision.
- React presentation does not inspect FSRS fields, scheduler kinds, or confidence buckets.
- `productSurface.js` keeps developer diagnostics out of production by default.
- Internal diagnostics remain available in development and explicit internal builds.

## UI changes

- Dashboard keeps one primary recommendation visible.
- Detailed journey and goal controls move behind `Tùy chỉnh nhịp học`.
- Empty metadata and zero-progress rings are not shown.
- Technical implementation copy is replaced by calm learner copy.
- Experimental scheduling moves under `Tùy chọn mở rộng`.
- Developer/robot protocol panels are hidden from normal production Settings.

## Safety and data boundaries

No scoring, scheduling, Study Room, storage schema, robot transport, or learning data
is changed by this phase. Existing advanced and developer tools remain mounted only
behind their intended visibility boundaries.
