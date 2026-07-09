# Subject Forgetting Alerts

`src/studyRoom/subjectForgettingAlertModel.js` defines local app-side forgetting alerts.

This phase does not request browser notification permission, does not register service worker push, and does not add a cloud/backend push path.

Alerts are derived from subject-space buckets:

- due soon
- overdue
- high forgetting pressure
- review queue spike
- long absence return

Example user-facing copy:

- `Môn Toán sắp đến hạn ôn`
- `Bạn có nhiều thẻ Vật lý đang quá hạn`
- `Nên ôn nhanh 10 phút để tránh quên`

Alerts contain `rawContentIncluded: false` and use only local derived state.
