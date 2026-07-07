# Shime Expression Control Center Manual QA

## Checklist

1. Mở Settings.
2. Xác nhận language switch vẫn hiển thị.
3. Mở Companion Dev Panel.
4. Xác nhận Section D hiển thị.
5. Xác nhận expression preview không tự chạy.
6. Bấm `Chạy xem trước biểu cảm` khi chưa chạy Shime fusion.
7. Xác nhận thấy thông báo cần chạy khớp nối Shime trước.
8. Chạy `Chạy khớp nối Shime`.
9. Bấm `Chạy xem trước biểu cảm`.
10. Xác nhận thấy biểu cảm dự kiến, mặt/hiển thị, đèn, âm thanh, khóa chuyển động, trạng thái an toàn, trạng thái riêng tư, dry-run/không gửi và lý do chính.
11. Xác nhận thấy `Khả năng Robot Shime — xem trước`.
12. Xác nhận thấy `Bảng giả lập Robot Shime`.
13. Xác nhận không có nút gửi.
14. Xác nhận không có nút kết nối.
15. Xác nhận không có raw JSON.
16. Xác nhận không có nội dung học thô.
17. Xác nhận V2 section vẫn hoạt động.
18. Xác nhận StudyRoom và DeviceBridge không bị ảnh hưởng.

## PASS

PASS nếu tất cả chỉ là preview dry-run, không gửi, không kết nối, không mở motion, không lưu dữ liệu, không lộ dữ liệu thô.
