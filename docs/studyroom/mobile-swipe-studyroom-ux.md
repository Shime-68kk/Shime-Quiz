# Mobile Swipe StudyRoom UX

BIG-UPDATE-6 adds subject-space navigation that is mobile-friendly without introducing fragile gesture physics.

Implemented now:

- horizontal scroll-snap subject chips
- accessible previous/next subject controls
- model-level swipe intent support in `src/studyRoom/studyRoomSubjectNavigationModel.js`
- reduced-motion-safe model output

Deferred:

- deeper touch gesture physics
- animated panel transitions
- persisted per-subject UI preferences

The existing item-level StudyRoom swipe remains unchanged.
