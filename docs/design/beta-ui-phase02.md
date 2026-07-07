# Kế hoạch & Tiến độ Thiết kế Giao diện Beta - Phase 02
## Chủ đề: Modern Liquid Glassmorphism & Premium Mobile UX (Hiệu ứng thủy tinh lỏng, tương tác chạm vuốt cao cấp)

Tài liệu này xác định các thông số kỹ thuật, quy trình thiết kế và tiến độ triển khai cho **Phase 02 (Beta UI Phase 02)**. Mục tiêu cốt lõi của giai đoạn này là mang đến trải nghiệm thị giác cực kỳ hiện đại, thời thượng ("WOW" ngay từ cái nhìn đầu tiên) và tối ưu hóa sâu sắc tương tác chạm vuốt cho smartphone, sẵn sàng đóng gói ứng dụng di động (PWA/Capacitor/Cordova) trong tương lai.

---

## 1. Các Trụ cột Thiết kế trong Phase 02

### 1.1 Liquid Glassmorphic Surfaces (Bề mặt Thủy tinh lỏng)
Thay thế các bề mặt phẳng cứng bằng các lớp phủ kính trong suốt, bóng bẩy và phản chiếu ánh sáng tự nhiên.
*   **Backdrop Blur:** Sử dụng `backdrop-filter: blur(16px) saturate(120%)` cho tất cả các thành phần nổi như Card, Sidebar, BottomNav, và PageHeader.
*   **Liquid Border Reflection:** Viền của các card được thiết kế bằng dải màu gradient siêu mỏng (`1px`), mô phỏng sự khúc xạ ánh sáng trên cạnh thủy tinh. Ở chế độ tối, viền phản xạ ánh sáng neon huyền ảo; ở chế độ sáng, viền phản xạ màu ngọc trai trong suốt.
*   **Soft Ambient Glows:** Thay thế box-shadow thô bằng bóng đổ đa tầng (multi-layered shadows) và hiệu ứng ánh sáng dịu (glow) phát ra từ dưới các khối theo tông màu của từng theme.

### 1.2 Water-Droplet Touch Interactions (Hiệu ứng Chạm bóng nước & Đàn hồi)
Tạo cảm giác chân thực như đang tương tác với chất lỏng khi người dùng nhấn/chạm.
*   **Elastic Compression (Co giãn đàn hồi):** Khi click hoặc touch vào các nút điều hướng, các thẻ môn học, hoặc các câu trả lời trắc nghiệm, phần tử sẽ co lại nhẹ (`transform: scale(0.96)`) kèm theo hiệu ứng chuyển tiếp lò xo đàn hồi (`transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)`).
*   **Liquid Ripples:** Tương tác hover/focus trên các nút sẽ tạo ra hiệu ứng chuyển màu loang nước (fluid gradient shifting) mượt mà thay vì đổi màu đột ngột.

### 1.3 Mobile App Shell Optimization (Tối ưu hóa chạy App & Web Di động)
Chuẩn bị sẵn sàng hạ tầng để đóng gói ứng dụng di động chất lượng cao.
*   **Dynamic Viewport Heights:** Áp dụng `min-height: 100dvh` (Dynamic Viewport Height) cho toàn bộ khung ứng dụng để tránh hiện tượng thanh địa chỉ của Chrome/Safari di động đè lên giao diện khi vuốt.
*   **Strict Touch Target Sizes:** Tất cả các phần tử bấm được (Topic pills, Navigation items, buttons) phải đạt tối thiểu `44px` chiều cao để dễ dàng chạm bằng ngón cái.
*   **Manipulation Safeguards:** Tích hợp `touch-action: manipulation` và `user-select: none` cho tất cả các nút bấm để chặn hoàn toàn lỗi phóng to màn hình không mong muốn khi nhấp đúp (double-tap zoom delay).
*   **Safe Area Insets:** Đệm lề thông minh (`padding-bottom: env(safe-area-inset-bottom)`) cho BottomNav để tương thích tuyệt đối với thanh Home Indicator của iPhone X/11/12/13/14/15/16.

### 1.4 Theme Integration (Tích hợp Theme động sâu sắc)
Đảm bảo hiệu ứng thủy tinh lỏng đổi màu hài hòa và thông minh theo 5 theme đã cấu hình:
1.  **Forest Calm (Mặc định):** Kính màu mint lá cây nhạt, phản chiếu viền xanh ngọc.
2.  **Forest Dark (Tối học đêm):** Kính sẫm mờ ảo, viền phản quang ngọc lục bảo huyền bí.
3.  **Ocean Calm (Xanh biển):** Kính màu lam đại dương mát lạnh, viền lam ngọc.
4.  **Sunset Warm (Hoàng hôn):** Kính màu cam đất ấm áp, viền đồng.
5.  **Lavender Field (Oải hương):** Kính màu tím nhạt thư thái, viền thạch anh tím.

---

## 2. Quy trình Thực hiện (Tóm tắt nhanh)

1.  **Định nghĩa Token Glassmorphism:** Khai báo các biến CSS Custom Properties mới cho hiệu ứng kính trong `tokens.css`.
2.  **Tái cấu trúc Khung ứng dụng Mobile:** Điều chỉnh BottomNav và các thành phần chính để hỗ trợ Safe Area và `100dvh`.
3.  **Áp dụng CSS hiệu ứng Thủy tinh lỏng:** Thay thế các thuộc tính background/shadow/border tĩnh của Card, PageHeader, Sidebar, và BottomNav bằng các lớp thủy tinh lỏng.
4.  **Tích hợp Chuyển động Đàn hồi:** Thêm transition đàn hồi và scale cho tất cả các tương tác chạm của người dùng.
5.  **Kiểm tra và Đánh giá Hồi quy:** Chạy toàn bộ test suite để đảm bảo không phá vỡ logic nghiệp vụ.
