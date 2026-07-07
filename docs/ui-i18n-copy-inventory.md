# UI Translation & Copy Inventory for Shime Quiz

This document lists major UI sections of Shime Quiz along with their Vietnamese and English copies.

---

## 1. Global Navigation & Sidebar
*   **Key**: `navDashboard`
    *   **VI**: Bảng điều khiển
    *   **EN**: Dashboard
*   **Key**: `navLibrary`
    *   **VI**: Thư viện sách
    *   **EN**: Library
*   **Key**: `navStudyRoom`
    *   **VI**: Phòng học
    *   **EN**: Study Room
*   **Key**: `navSettings`
    *   **VI**: Cài đặt
    *   **EN**: Settings

---

## 2. General Settings Panel
*   **Key**: `settingsTitle`
    *   **VI**: Thiết lập ứng dụng
    *   **EN**: App Settings
*   **Key**: `settingsTheme`
    *   **VI**: Chủ đề giao diện
    *   **EN**: Interface Theme
*   **Key**: `settingsLanguage`
    *   **VI**: Ngôn ngữ hiển thị
    *   **EN**: Display Language
*   **Key**: `settingsFsrs`
    *   **VI**: Thuật toán học tập FSRS
    *   **EN**: FSRS Learning Scheduler
*   **Key**: `previewOnlyNote`
    *   **VI**: Lưu ý: Đây chỉ là bản xem trước chế độ ngôn ngữ, lựa chọn chưa được lưu trữ.
    *   **EN**: Note: This is a language preview only, choices are not persisted.

---

## 3. Device Bridge Panel
*   **Key**: `bridgeTitle`
    *   **VI**: Kết nối thiết bị đồng hành
    *   **EN**: Companion Device Connection
*   **Key**: `bridgeStatusLabel`
    *   **VI**: Trạng thái cầu nối
    *   **EN**: Bridge Status
*   **Key**: `bridgeTransportLabel`
    *   **VI**: Cổng kết nối
    *   **EN**: Transport Type
*   **Key**: `bridgePrivacyLabel`
    *   **VI**: Chế độ bảo mật
    *   **EN**: Privacy Mode
*   **Key**: `bridgeEventCountLabel`
    *   **VI**: Số lượng sự kiện
    *   **EN**: Event Count
*   **Key**: `bridgeLastEventLabel`
    *   **VI**: Sự kiện cuối
    *   **EN**: Last Event
*   **Key**: `bridgeEnabled`
    *   **VI**: Đã kích hoạt
    *   **EN**: Enabled
*   **Key**: `bridgeDisabled`
    *   **VI**: Đã vô hiệu hóa
    *   **EN**: Disabled
*   **Key**: `bridgeConnected`
    *   **VI**: Đã kết nối (Thiết bị Mock)
    *   **EN**: Connected (Mock Device)
*   **Key**: `bridgeDisconnected`
    *   **VI**: Chưa kết nối
    *   **EN**: Disconnected
*   **Key**: `bridgeError`
    *   **VI**: Lỗi cổng kết nối
    *   **EN**: Bridge Connection Error
*   **Key**: `bridgeBtnEnable`
    *   **VI**: Kích hoạt cổng
    *   **EN**: Enable Bridge
*   **Key**: `bridgeBtnDisable`
    *   **VI**: Vô hiệu hóa cổng
    *   **EN**: Disable Bridge
*   **Key**: `bridgeBtnConnect`
    *   **VI**: Kết nối thiết bị Mock
    *   **EN**: Connect Mock Device
*   **Key**: `bridgeBtnDisconnect`
    *   **VI**: Ngắt kết nối
    *   **EN**: Disconnect
*   **Key**: `bridgeBtnClearLog`
    *   **VI**: Xóa nhật ký
    *   **EN**: Clear Log
*   **Key**: `bridgeEmptyLog`
    *   **VI**: [Chưa có sự kiện] Nhấn "Kết nối thiết bị Mock" để xem nhật ký sự kiện.
    *   **EN**: [No events] Press "Connect Mock Device" to view event logs.
*   **Key**: `bridgeLogTitle`
    *   **VI**: Nhật ký sự kiện thiết bị (Debug Log)
    *   **EN**: Device Event Debug Log
*   **Key**: `bridgePrivacyWarning`
    *   **VI**: ⚠️ Cam kết bảo mật dữ liệu học tập: Cầu nối mặc định chỉ chia sẻ thông tin tiến độ và trạng thái đúng/sai dạng rút gọn. Không gửi câu hỏi, đáp án hoặc lịch sử học chi tiết.
    *   **EN**: ⚠️ Data Privacy Commitment: The bridge only transmits coarse/redacted progress and correct/incorrect status by default. It never sends prompts, answers, or full study history.

---

## 4. Companion Control Center (Dev Panel)
*   **Key**: `companionTitle`
    *   **VI**: Bảng não bộ Trợ lý Đồng Hành
    *   **EN**: Companion Brain Dev Panel
*   **Key**: `companionSub`
    *   **VI**: Chỉ dành cho thử nghiệm gỡ lỗi mô phỏng.
    *   **EN**: For simulation debugging and testing only.
*   **Key**: `companionBtnEnable`
    *   **VI**: Kích hoạt trợ lý
    *   **EN**: Enable Companion
*   **Key**: `companionBtnDisable`
    *   **VI**: Vô hiệu hóa trợ lý
    *   **EN**: Disable Companion
*   **Key**: `companionBtnClearLog`
    *   **VI**: Xóa nhật ký suy luận
    *   **EN**: Clear Inference Log
*   **Key**: `companionMetricObserved`
    *   **VI**: Đã quan sát
    *   **EN**: Observed
*   **Key**: `companionMetricAccepted`
    *   **VI**: Đã chấp nhận
    *   **EN**: Accepted
*   **Key**: `companionMetricRejected`
    *   **VI**: Đã từ chối
    *   **EN**: Rejected
*   **Key**: `companionMetricBlocked`
    *   **VI**: Chặn nhạy cảm
    *   **EN**: Sensitive Blocked
*   **Key**: `companionLastIntent`
    *   **VI**: Ý định trợ lý
    *   **EN**: Companion Intent
*   **Key**: `companionPlannedCommand`
    *   **VI**: Lệnh dự kiến
    *   **EN**: Planned Command
*   **Key**: `companionSafety`
    *   **VI**: Trạng thái an toàn
    *   **EN**: Safety Status
*   **Key**: `companionEmptyLog`
    *   **VI**: Chưa có nhật ký suy luận. Vui lòng kích hoạt bảng thử nghiệm và chạy một kịch bản giả lập.
    *   **EN**: No inference logs yet. Enable the panel and run a fake scenario.

---

## 5. Table Headers for Log/Transcript lists
*   **Key**: `tableStep` | **VI**: Bước | **EN**: Step
*   **Key**: `tableEvent` | **VI**: Sự kiện | **EN**: Event
*   **Key**: `tableStatus` | **VI**: Trạng thái | **EN**: Status
*   **Key**: `tableIntent` | **VI**: Ý định | **EN**: Intent
*   **Key**: `tableTone` | **VI**: Tông phản hồi | **EN**: Tone
*   **Key**: `tableSafety` | **VI**: An toàn | **EN**: Safety
*   **Key**: `tableCommand` | **VI**: Lệnh dự kiến | **EN**: Planned Command
*   **Key**: `tableReasons` | **VI**: Lý do | **EN**: Reasons
*   **Key**: `tablePrivacy` | **VI**: Riêng tư | **EN**: Privacy

---

## 6. Fake Scenario Selectors
*   **Key**: `scenarioNormal`
    *   **VI**: Buổi học bình thường
    *   **EN**: Normal session
*   **Key**: `scenarioStruggle`
    *   **VI**: Người học gặp khó
    *   **EN**: Struggle session
*   **Key**: `scenarioReview`
    *   **VI**: Đến hạn ôn tập
    *   **EN**: Review due
*   **Key**: `scenarioError`
    *   **VI**: Lỗi kết nối
    *   **EN**: Disconnected/error
*   **Key**: `scenarioSensitive`
    *   **VI**: Kiểm tra dữ liệu nhạy cảm
    *   **EN**: Sensitive attack

---

## 7. Safety Reason Codes Localizations
*   **Key**: `reason_allowed_expression_only` | **VI**: chỉ cho phép biểu cảm an toàn | **EN**: allowed expression only
*   **Key**: `reason_transport_unsafe` | **VI**: kết nối chưa an toàn | **EN**: transport unsafe
*   **Key**: `reason_privacy_lock_failed` | **VI**: khóa riêng tư đã chặn | **EN**: privacy lock failed
*   **Key**: `reason_frustration_risk_high` | **VI**: nguy cơ nản cao | **EN**: frustration risk high
*   **Key**: `reason_study_focus` | **VI**: đang tập trung học | **EN**: study focus
*   **Key**: `reason_session_start` | **VI**: bắt đầu phiên | **EN**: session start
*   **Key**: `reason_none` | **VI**: không | **EN**: none
