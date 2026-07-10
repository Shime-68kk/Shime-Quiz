# BIG-UPDATE-11 Overview Metric Tiering

## Decision

BIG-UPDATE-11 keeps all existing learning data and calculations but changes what is visible by default. A learner sees a concise summary first; evidence-heavy panels require explicit disclosure.

## Default learner view

| Section | Visible signals |
|---|---|
| Hôm nay | Next recommended action, due review count, daily goal progress, continue CTA |
| Tiến độ gần đây | Recent accuracy, study streak, completed sessions, short recent trend |
| Cần chú ý | Weak-item count and a short review recommendation |
| Theo môn | Compact subject progress without raw prompts |

These values come from the existing `DashboardLearningDataContext`: `dueSummary`, `goalProgress`, `historyAnalytics`, `mastery`, `recommendation`, `subjects`, and `subjectsById`. BIG-UPDATE-11 adds no new learning calculation or persistence.

## Advanced details

Collapsed under **Thông tin nâng cao**:

- exact history analytics and best-session metrics;
- item totals and type breakdown;
- detailed mastery and topic evidence;
- weak-item prompt details;
- exact review schedule and due timestamps;
- smart-practice reasoning;
- study history records and session details;
- library subject/topic/item summaries.

## Developer diagnostics

Collapsed under **Chẩn đoán dành cho nhà phát triển**:

- exact data source and import timestamp;
- mixed scheduler evidence note when applicable;
- experimental scheduling context.

Normal learner cards do not show scheduler family names, scheduler versions, internal IDs, raw Safe Capsule evidence, or validation output.

## Raw-data policy

Raw prompts, `userAnswer`, `correctAnswer`, full item details, and raw history records are not deleted. They remain reachable only after:

1. opening **Thông tin nâng cao**;
2. choosing a history session;
3. opening **Xem thông số và nội dung câu hỏi**.

The final technical details disclosure is closed by default. No storage schema, payload, record, resolver, clear-history callback, or write order changed.

## Accessibility contract

- Advanced and Developer controls are buttons with `aria-expanded` and `aria-controls`.
- Hidden content uses the `hidden` attribute.
- Dashboard tabs use roving `tabIndex` and Left/Right/Home/End keyboard behavior.
- Heading order starts at the page H1, followed by section H2 headings.
