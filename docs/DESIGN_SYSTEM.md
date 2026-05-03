# ShimeChamhoc v2 Design System Foundation

Phase 2A introduces a lightweight CSS-first design system for the React/Vite shell. It is intentionally small and should stay separate from learning algorithms while the v2 migration is in progress.

## Tokens

Design tokens live in `src/design-system/tokens.css` and define:

- color roles for primary, secondary, success, warning, danger, info, surfaces, text, and borders
- spacing scale from `--space-1` to `--space-16`
- radius scale from `--radius-sm` to `--radius-2xl` plus `--radius-pill`
- shadow scale from `--shadow-xs` to `--shadow-lg`
- typography scale and line-height tokens
- small z-index scale for navigation, overlays, and future toasts

The light theme is active by default. A dark theme token block is prepared behind `[data-theme='dark']`, but adaptive theme switching is intentionally not implemented yet.

## Core components

Core reusable components live in `src/components/`:

- `Button` for primary, secondary, ghost, and danger actions with sm/md/lg sizes and simple loading state
- `Card` for default, elevated, and interactive content surfaces
- `ProgressBar` with accessible progress semantics
- `Badge` for neutral, success, warning, danger, and info labels
- `EmptyState` for calm placeholder states
- `Toast` as a presentational notification primitive for future wiring

## Boundaries

These components are UI primitives only. They should not own quiz logic, spaced repetition, recommendations, analytics, storage, or import behavior. Future phases should connect real data through services documented in `docs/MIGRATION_BOUNDARIES.md`.
