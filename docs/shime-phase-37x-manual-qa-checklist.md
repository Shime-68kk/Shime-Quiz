# Phase 37X Manual QA Checklist

## Checklist

1. Mở Settings.
2. Xác nhận language switch vẫn hiển thị.
3. Mở Companion Dev Panel.
4. Xác nhận Section D hiển thị: `D. Hệ sinh thái Shime — chạy thử khớp nối`.
5. Xác nhận Section D không tự chạy khi mở trang.
6. Bấm `Chạy khớp nối Shime` khi chưa có tín hiệu và xác nhận empty state.
7. Chạy kịch bản giả lập bình thường, rồi chạy Shime fusion.
8. Chạy kịch bản người học gặp khó, rồi chạy Shime fusion.
9. Chạy kịch bản dữ liệu nhạy cảm và xác nhận bị chặn/trung hòa.
10. Nếu có live observe-only transcript, chạy Shime fusion và xác nhận vẫn label-only.
11. Xác nhận expression preview chỉ dry-run.
12. Xác nhận không có nút gửi.
13. Xác nhận không hiển thị raw JSON.
14. Xác nhận không có nội dung thô hoặc dữ liệu nhạy cảm.
15. Bấm `Xóa kết quả khớp nối` và xác nhận kết quả biến mất.
16. Nhấn F5 và xác nhận trạng thái trong bộ nhớ reset.
17. Xác nhận V2 section vẫn hoạt động.
18. Xác nhận StudyRoom không bị ảnh hưởng.
19. Xác nhận DeviceBridge không bị ảnh hưởng.

## PASS

PASS nếu Section D và expression evidence đều dry-run, label-only, không gửi, không mở kết nối, không mở motion, không đổi lịch, không lộ dữ liệu nhạy cảm.

## FAIL

FAIL nếu có send button, motion unlock, raw content, storage/network/AI, schedule mutation, notification/calendar mutation, hoặc thay đổi StudyRoom/DeviceBridge/firmware.
