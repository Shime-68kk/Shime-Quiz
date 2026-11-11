# Phase 2 — Performance & Modular Architecture

## Outcome

Shime Quiz now loads product surfaces on demand instead of shipping every page,
advanced setting, and developer harness in one startup file.

## Before and after

| Boundary | Before | After | Change |
| --- | ---: | ---: | ---: |
| Startup JavaScript | 1,015.01 kB | 388.39 kB | -61.7% |
| Settings route | 222.75 kB | 14.28 kB | -93.6% |
| Largest initial chunk warning | Present | Removed | Pass |

Sizes are Vite minified build output before gzip. Shared and route chunks are
cached independently after first use.

## Architecture

- Every product route has one reusable loader shared by `React.lazy` and intent
  preloading.
- Desktop and mobile navigation preload a destination on pointer or keyboard
  focus, shortly before navigation.
- The app shell remains visible while a route loads and exposes an accessible
  `role=status` message.
- Motion-sensitive users get a non-animated loading indicator.
- Advanced Settings panels load only after their disclosure is opened.
- Developer Settings panels remain gated and are not requested by the default
  production learner surface.

## Safety boundaries

This phase does not change quiz content, persistence formats, scoring, review
scheduling, robot communication, import confirmation, or learner progress.
It changes only module delivery and loading presentation.

## Verification

- Route architecture unit coverage protects lazy imports, preload reuse,
  accessible fallback behavior, and deferred Settings content.
- Production browser checks cover direct route entry and navigation across
  Dashboard, Library, Settings, and Study Room.
- Opening Advanced Settings was verified to load and render all existing panels.
