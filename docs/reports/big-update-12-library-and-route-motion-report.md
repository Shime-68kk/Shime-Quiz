# BIG-UPDATE-12 Library and Route Motion Report

## Library Product Changes

- Renamed the industrial `Xưởng nạp tài liệu` surface to `Thêm học liệu` / `Add study materials`.
- Established three primary methods: sample quiz, paste content, and file upload.
- Moved the manual external-tool question template to secondary visual priority.
- Removed emoji method icons and added one consistent inline SVG icon component.
- Reframed prompt-oriented copy as a manual question template; Shime does not imply built-in AI.
- Kept EduGen explicitly optional and separate.
- Moved backup/restore and schema information behind named disclosures.
- Kept critical local/privacy and preview-before-save information visible.
- Preserved sample, paste, file, EduGen, import, export, and backup callbacks.

Library interaction motion is limited to opacity, a 4px panel entry, a maximum 2px method hover lift, border/background transitions, and immediate press feedback. No continuous glow, particles, horizontal panel slide, timer, or delayed import action was added.

## Route Motion Boundary

- `AppLayout` keys only `.routeStage` by `location.pathname`.
- Sidebar and BottomNav remain outside the keyed stage.
- New route content mounts immediately and enters with opacity plus `translateY(4px)` over 180ms.
- Navigation has no timer, exit animation, full-screen overlay, or route-transition dependency.
- StudyRoom question changes keep the same pathname and therefore do not trigger top-level route motion.
- Reduced motion removes route and Library panel transforms/animations immediately.
- Existing scroll behavior is preserved.

## Manual Evidence

- 2 languages × 5 themes × 5 routes: 50 combinations reviewed.
- No blank route, framework overlay, console error, or horizontal overflow.
- Representative screenshots cover both languages, all themes, and all five routes.
- Library method hierarchy remains stable at desktop and mobile widths.
- Sidebar and BottomNav geometry remain stable during route changes.
