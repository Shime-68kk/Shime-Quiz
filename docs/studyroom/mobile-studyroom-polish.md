# BIG-UPDATE-7 Mobile StudyRoom Polish

## Problem

On small screens, StudyRoom felt too narrow and vertically stretched. Long questions could dominate the viewport, answer options were larger than needed, and subject-space navigation needed a more mobile-native scroll feel.

## Responsive Decisions

The mobile width is widened deliberately so StudyRoom feels like a native mobile study surface instead of a narrow centered column.

- On screens up to 640px, StudyRoom uses more viewport width with reduced outer padding.
- The StudyRoom card body has tighter mobile padding so the quiz surface does not become a narrow centered column.
- Question text uses a smaller mobile `clamp()` range, controlled line height, normal letter spacing, and `overflow-wrap` so long prompts remain readable without horizontal overflow.
- Answer options keep a stable touch target while reducing excessive vertical padding and gaps.
- Touch-friendly answers remain large enough to tap while avoiding oversized vertical cards.
- Flashcards use a smaller mobile minimum height so the screen does not become an endless column.

## Subject Navigation

Subject spaces keep accessible previous/next buttons and use horizontal overflow with scroll snap. The active subject chip remains visually clear, labels wrap safely, and reduced-motion users avoid animated scroll behavior.

## Deferred

- No gesture library was added.
- Deep physics-based subject swiping is deferred.
- No scoring, SM2/FSRS scheduler behavior, history persistence, or Safe Capsule behavior changed.
