# BIG-UPDATE-6 StudyRoom Subject Spaces

StudyRoom is evolving from one mixed room into subject-aware study spaces.

The app should not mix all subjects blindly. `src/studyRoom/studySubjectSpaceModel.js` converts local library items and local review schedule records into subject spaces with due count, overdue count, forgetting pressure, workload, focus recommendation, scheduler summary, and safe robot summary bucket.

The UI in `src/routes/StudyRoom.jsx` now renders `StudyRoomSubjectSpaces` above the active item. It provides subject chips, previous/next subject controls, and mobile-friendly scroll-snap. The existing scoring, SM2/FSRS behavior, history writes, and review schedule writes are unchanged.

This phase is local-first and adds no cloud, backend, AI/API, push service, or real device bridge.
