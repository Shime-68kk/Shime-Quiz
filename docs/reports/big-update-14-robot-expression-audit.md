# BIG-UPDATE-14 Robot Expression Audit

## 1. Executive Verdict

**PASS to proceed.** The requested expression system can be implemented as presentation-only work. Existing correctness, progression, persistence, scheduler, Safe Capsule, device bridge, and sensing code do not need to change.

## 2. Current Robot Component Map

- `ShimeRobotFace.jsx` owns canonical face and hardware-eye geometry.
- `ShimeRobotPresence.jsx` owns container size, glow, state classes, and accessibility.
- `ShimeBrandMark.jsx` composes the compact canonical face.
- `ShimeArrivalGreeting.jsx` composes the large Home arrival presence.
- `StudyRoom.jsx` contains a small `StudyMascot` presentation wrapper.

Severity: medium. The canonical base is sound, but StudyRoom presentation is still route-local. Fix: extract a coarse-state-only study companion. Fixed in this phase: yes.

## 3. Current Home Robot

The Home arrival uses the canonical large hardware-eye face. The visual is clearer than the prior generic mark, but it becomes fully static after the one-shot arrival and the smaller companion placement lacks a visible idle signal.

Severity: high. Affected: `Home.jsx`, `ShimeArrivalGreeting.jsx`, `global.css`. Fix: retain the large face, add a CSS-only idle blink and restrained medium/large float after arrival. Fixed in this phase: yes.

## 4. Current Arrival Behavior

The arrival guard writes `shime.ui.arrival.v1` to `sessionStorage`. This suppresses the greeting after a hard refresh, contrary to the revised contract. Theme/language rerenders do not currently remount Home, and SPA navigation remounts Home.

Severity: high. Affected: `arrivalSession.js`, Home arrival tests and validator. Fix: use module-scoped per-document memory only. A new document replays; an SPA return in the same document does not. Fixed in this phase: yes.

## 5. Current StudyRoom Robot

StudyRoom places a `sm` presence above the question surface and changes broad state styling with the message. It is visually subordinate and does not express correct/incorrect outcomes through face geometry or pose.

Severity: high. Affected: `StudyRoom.jsx`, `global.css`. Fix: use a dedicated `md` study companion adjacent to feedback with attentive, correct, incorrect, revealed, and complete presentation states. Fixed in this phase: yes.

## 6. Existing Answer Feedback State

StudyRoom already derives `mascotReaction` from the existing post-evaluation values: `currentItemState.checked`, `objectiveCorrect`, `revealed`, and `completedAttempt`. The companion message is localized. This is the correct boundary: robot presentation receives a coarse reaction after evaluation, not question or answer content.

Severity: low. Affected: `StudyRoom.jsx`. Fix: preserve derivation exactly and map the coarse reaction to visual expression only. Fixed in this phase: yes.

## 7. Current Eye Geometry

The canonical hardware eye scales from 5.5px at `xs` to 19px at `lg`, with a 38% radius and explicit gaps. Dot eyes remain a fallback. Geometry is centralized and suitable for theme-aware expressions.

Severity: low. Affected: `ShimeRobotFace.jsx`. Fix: preserve metrics; add expression classes that alter eye transform and radius without replacing hardware identity. Fixed in this phase: yes.

## 8. Existing Motion Rules

Arrival uses one-shot transform/opacity keyframes. Historical idle keyframes exist but are not connected. No JS random loop or `requestAnimationFrame` animation is used.

Severity: medium. Affected: `global.css`, robot components. Fix: deterministic CSS blink phases at 5-8 seconds, restrained float at 3.8-5.5 seconds for medium/large only, and one-shot correct/incorrect response animations. Fixed in this phase: yes.

## 9. Theme Token Readiness

Five themes exist, but robot styling currently relies on broad companion roles. Ocean, Sunset, and Lavender do not have a complete independent robot surface/eye/message palette, so correctness styling risks overpowering theme identity.

Severity: high. Affected: `tokens.css`, theme contract tests. Fix: define `--robot-shell`, `--robot-shell-elevated`, `--robot-shell-border`, `--robot-eye`, `--robot-eye-soft`, `--robot-glow`, `--robot-shadow`, and `--robot-message-surface` for every theme. Fixed in this phase: yes.

## 10. Reduced Motion

A global reduced-motion block disables existing arrival animation. It does not yet enumerate the new blink, float, nod, shake, or gaze treatments.

Severity: high. Affected: `global.css`, robot component tests. Fix: disable every robot animation and transition while retaining static expression geometry and localized copy. Fixed in this phase: yes.

## 11. Duplication Risks

The principal risk is duplicating reaction mapping or drawing separate robot faces in Home and StudyRoom. A second risk is correctness colors becoming robot identity colors.

Severity: high. Fix: keep one canonical face, one presence wrapper, one coarse StudyRoom expression adapter, and theme-owned robot colors. Fixed in this phase: yes.

## 12. Logic Boundaries

Locked modules include correctness calculation, scoring, progression, persistence, review writes, SM2, FSRS, scheduler registry/readiness, imports/exports, Safe Capsule checksum, device transport, sensors, and route destinations. No raw prompt, answer, explanation, or imported text may enter robot-facing presentation props.

Severity: critical. Enforcement: tests and validator scan touched robot-facing files and verify `fsrsCanBeDefault` remains false. Fixed in this phase: yes.

## 13. Safe Implementation Plan

1. Extend semantic theme roles and canonical robot presentation props.
2. Add deterministic CSS-only idle and one-shot feedback motion with reduced-motion overrides.
3. replace the storage-backed arrival guard with per-document module memory.
4. Extract a StudyRoom companion that accepts only coarse expression and localized message.
5. Add focused tests, validator, documentation, and browser evidence across themes and motion modes.

No dependency, network API, hardware API, media asset, or data schema is required.

## 14. PASS / NOT PASS to Proceed

**PASS.** The architecture already exposes the required presentation boundary. Proceed with the scoped implementation above; do not alter the locked logic paths.
