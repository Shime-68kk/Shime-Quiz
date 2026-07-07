# Shime-Quiz Beta Development Rules

## 0. Mục tiêu beta đầu tiên

Beta đầu tiên không nhằm tích hợp ESP32 thật.

Mục tiêu beta đầu tiên là tạo nền an toàn để sau này có thể mở rộng:

* Chuẩn hóa event schema.
* Tạo Device Bridge mock-only.
* Tách ranh giới logic và UI.
* Không phá local-first.
* Không gửi dữ liệu học tập nhạy cảm ra ngoài.
* Không thay đổi scheduler, scoring, import, backup hoặc storage hiện có nếu chưa có lý do rõ ràng.

## 1. Vai trò của từng bên

### Codex: Logic Owner

Codex chịu trách nhiệm:

* Learning logic.
* Device event schema.
* Mock DeviceBridge.
* Redaction/privacy policy.
* Unit tests.
* Storage/settings schema nếu cần.
* Documentation kỹ thuật.
* Không làm UI lớn nếu không được yêu cầu.

Codex không được:

* Tự sửa layout lớn.
* Tự đổi design system.
* Tự thêm ESP32, WebSocket, MQTT, BLE thật trong beta đầu.
* Tự đổi scheduler hoặc study scoring.
* Tự đổi import/backup schema nếu chưa có phase riêng.

### UI AI: UI Owner

UI AI chịu trách nhiệm:

* Giao diện Settings / Debug Panel / trạng thái mock device.
* Component hiển thị trạng thái bridge.
* Giao diện lỗi, cảnh báo, copywriting, UX flow.
* Không tự tạo logic device.
* Không tự tạo event schema riêng.

UI AI không được:

* Sửa `src/quiz/**`.
* Sửa `src/learning/**`.
* Sửa `src/state/**` trừ khi task cho phép rõ.
* Sửa `src/storage/**`.
* Sửa `src/data/**`.
* Gọi `localStorage` trực tiếp cho Device Bridge.
* Hardcode IP thiết bị, token, endpoint hoặc WebSocket URL.
* Tự gửi prompt/câu hỏi/đáp án ra device.

### User / Human Owner

Người dùng giữ quyền quyết định:

* Merge PR.
* Chọn phase tiếp theo.
* Cho phép mở real transport hay không.
* Cho phép động đến storage/settings hay không.
* Cho phép thay đổi StudyRoom hay không.

Không AI nào được tự quyết định vượt phase.

## 2. Nguyên tắc không xung đột

Mọi việc phải đi theo thứ tự:

1. Fix hoặc ghi nhận baseline test fail.
2. Codex tạo contract logic.
3. UI AI chỉ consume contract đã có.
4. Tích hợp UI với mock bridge.
5. Sau khi test pass mới xét transport thật.

Không được làm ngược thứ tự.

## 3. File ownership

### Codex được phép sở hữu trước

* `src/device/**` hoặc `src/deviceBridge/**`
* `tests/unit/device*.test.js`
* `docs/device-bridge-architecture.md`
* `docs/device-bridge-event-schema.md`
* `src/state/settingsStorage.js` chỉ khi có task riêng
* `src/routes/StudyRoom.jsx` chỉ được chạm ở điểm event emission nhỏ, sau khi đã có contract

### UI AI được phép sở hữu trước

* `src/components/**`
* `src/ui/**`
* `src/routes/Settings.jsx`
* `src/routes/Dashboard.jsx` chỉ phần hiển thị, không đổi logic dashboard
* CSS/module style liên quan UI
* Copy text / warning / empty state

### File cần khóa, không ai tự sửa khi chưa có task riêng

* `src/quiz/reviewSchedulerAdapter.js`
* `src/quiz/fsrsWrapper.js`
* `src/state/reviewScheduleStorage.js`
* `src/state/studyHistoryStorage.js`
* `src/state/v2BackupRestore.js`
* `src/data/importValidator.js`
* `src/data/learningDataAdapter.js`
* `src/storage/**`
* `src/routes/StudyRoom.jsx`

`StudyRoom.jsx` là file nhạy cảm. Chỉ sửa khi task yêu cầu rõ, diff nhỏ, có test, và không đổi hành vi học hiện tại.

## 4. Quy tắc contract-first

Codex phải tạo contract trước UI.

Contract tối thiểu gồm:

* Event types.
* Event payload shape.
* Redaction rules.
* Public API cho bridge.
* Mock transport behavior.
* Error behavior.
* Default-off behavior.

UI AI chỉ được dùng public API đã định nghĩa.

UI AI không được tự suy ra event mới nếu chưa được Codex thêm vào schema.

## 5. Quy tắc privacy

Device Bridge mặc định không gửi:

* Full prompt.
* Correct answer.
* Acceptable answers.
* Explanation.
* User typed answer.
* Imported document name/content.
* Backup payload.
* Full study history.
* Full settings.
* Source metadata nhạy cảm.

Payload mặc định chỉ được gồm:

* Event type.
* Session id tạm thời.
* Item index hoặc item id đã được policy cho phép.
* Item type.
* Progress count.
* Correct/wrong status.
* Coarse score/accuracy.
* Due count dạng tổng quát.

Debug payload chỉ được bật bằng explicit setting, không bao giờ bật mặc định.

## 6. Quy tắc local-first

Beta không được thêm:

* Account.
* Auth.
* Cloud sync.
* Mandatory backend.
* AI API call tự động.
* Background polling.
* Auto-connect device khi mở app.
* External network call mặc định.

Mọi kết nối device phải:

* Default off.
* User-initiated.
* Có trạng thái rõ ràng.
* Có disconnect.
* Có warning về quyền riêng tư.

## 7. Quy tắc phase

### Phase 0 — Safety Baseline

Chỉ được làm:

* Fix hoặc xác nhận test fail hiện tại.
* Chạy build/unit test.
* Ghi lại baseline.

Không được thêm feature mới nếu baseline chưa rõ.

Exit condition:

* `npm run build` pass.
* `npm run test:unit` pass hoặc failure được ghi rõ là known issue và không liên quan feature mới.

### Phase 1 — Docs + Schema

Codex làm:

* `docs/device-bridge-architecture.md`
* `docs/device-bridge-event-schema.md`
* Event list tối thiểu:

  * `session_started`
  * `question_presented`
  * `answer_correct`
  * `answer_wrong`
  * `review_due`
  * `session_complete`
  * `robot_command_requested`
  * `robot_command_acknowledged`

Không runtime network.

Exit condition:

* Docs rõ.
* Schema có unit tests hoặc snapshot tests nếu có code.
* Không đổi UI lớn.

### Phase 2 — Mock DeviceBridge

Codex làm:

* `src/deviceBridge/DeviceBridge.js`
* `src/deviceBridge/transports/MockTransport.js`
* `src/deviceBridge/deviceEventSchema.js`
* `src/deviceBridge/redactionPolicy.js`
* Unit tests.

Không sửa StudyRoom sâu.

Exit condition:

* Mock bridge chạy độc lập.
* Không network.
* Không localStorage bắt buộc.
* Unit tests pass.

### Phase 3 — UI Mock Integration

UI AI làm:

* Settings UI để bật/tắt mock bridge.
* Device status panel.
* Debug event viewer mock.
* Warning privacy.
* Empty states.

UI chỉ gọi API do Codex cung cấp.

Exit condition:

* UI không làm thay đổi study behavior.
* Bridge off thì app hoạt động y như cũ.
* Bridge mock on thì chỉ ghi/hiển thị event mock.

### Phase 4 — StudyRoom Event Emission

Codex làm điểm chèn nhỏ:

* Emit event khi session started.
* Emit event khi question presented.
* Emit event khi answer correct/wrong.
* Emit event khi session complete.

Không đổi scoring.
Không đổi scheduler.
Không đổi study history.
Không đổi review schedule.

Exit condition:

* Study flow cũ vẫn pass.
* Bridge lỗi không làm hỏng session.
* Nếu bridge off thì không có side-effect.

### Phase 5 — Real Transport Spike

Chỉ làm sau khi Phase 1-4 ổn.

Có thể thử:

* WebSocket LAN.
* HTTP LAN.

Chưa làm:

* MQTT production.
* BLE production.
* ESP32 firmware chính thức.
* Sync/backend.

Exit condition:

* Opt-in.
* Redacted payload.
* Manual connect.
* Clear disconnect.
* Transport failure không ảnh hưởng học tập.

## 8. Quy tắc PR

Mỗi PR chỉ có một mục tiêu.

Không PR nào được vừa sửa logic vừa sửa UI lớn.

PR template bắt buộc:

```text
Purpose:
Files changed:
Owner:
Forbidden areas touched? yes/no
Privacy impact:
Storage impact:
Network impact:
Tests run:
Screenshots if UI:
Rollback plan:
```

Nếu PR có network impact, mặc định không merge trong beta đầu.

## 9. Quy tắc giao việc cho Codex

Mỗi task cho Codex phải có:

```text
Task:
Allowed files:
Forbidden files:
Must preserve:
Expected tests:
Output:
Do not:
```

## 10. Quy tắc giao việc cho UI AI

Mỗi task cho UI AI phải có:

```text
Task:
Allowed files:
Forbidden files:
Available API:
Mock states:
Expected UI behavior:
Do not:
```

## 11. Stop conditions

Dừng phase ngay nếu có một trong các điều sau:

* Unit tests fail thêm so với baseline.
* Build fail.
* UI AI sửa logic core.
* Codex sửa UI lớn.
* Có network call mới mà chưa được duyệt.
* Có dữ liệu prompt/answer bị gửi ra bridge.
* Device bridge tự bật mặc định.
* StudyRoom behavior thay đổi ngoài ý muốn.
* Scheduler/review schedule thay đổi ngoài task.
* Backup/restore schema bị đổi khi chưa có phase riêng.

## 12. Merge order bắt buộc

1. Baseline test fix.
2. Docs architecture.
3. Event schema.
4. Mock DeviceBridge.
5. Redaction policy.
6. UI mock settings/debug panel.
7. StudyRoom event emission.
8. Optional real transport spike.

Không merge UI trước khi contract logic tồn tại.

Không merge transport thật trước khi mock bridge ổn.

## 13. Định nghĩa “an toàn để đi tiếp”

Một phase được coi là an toàn khi:

* Build pass.
* Unit test pass hoặc known failure không đổi.
* Không có network mặc định.
* Không auto-connect.
* Không gửi dữ liệu nhạy cảm.
* Có rollback đơn giản.
* Diff nhỏ, dễ review.
* Có test hoặc ít nhất docs rõ nếu chỉ là docs phase.

Nếu không đạt đủ điều kiện trên, không mở phase tiếp theo.
