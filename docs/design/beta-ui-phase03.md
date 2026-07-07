# Kế hoạch & Tiến độ Thiết kế Giao diện Beta - Phase 03
## Chủ đề: Thân thiện hóa người dùng cơ bản, tối giản hóa Xưởng nạp & Kệ sách Thư viện 3D vật lý (User-Centric Simplification, Physical Bookshelf & Clean Workshop)

Tài liệu này xác định các thông số kỹ thuật, quy trình thiết kế và tiến độ triển khai cho **Phase 03 (Beta UI Phase 03)**. Mục tiêu cốt lõi của giai đoạn này là loại bỏ sự cồng kềnh, giảm tải các thông tin kỹ thuật gây sao nhãng và mang đến giao diện trực quan, dễ tiếp cận hơn cho người dùng phổ thông, đồng thời tối ưu hóa kệ sách thành những cuốn sách vật lý 3D sống động.

---

## 1. Các Trụ cột Thiết kế trong Phase 03

### 1.1 Nhật ký Học tập Tập trung vào Hiệu quả (User-Centric Analytics)
Tránh việc hiển thị quá nhiều chỉ số kỹ thuật phức tạp ngay từ đầu khiến người dùng mới bối rối.
*   **Human-Friendly Feedback (Đánh giá tự nhiên):** Hiển thị một khung đánh giá hiệu quả học tập nổi bật bằng ngôn ngữ tự nhiên (ví dụ: "Xuất sắc! 🏆 Bạn đã hoàn thành phiên học với kết quả ấn tượng.") dựa trên tỷ lệ trả lời đúng.
*   **Collapsible Technical Specs (Thu gọn thông số kỹ thuật):** Đóng gói toàn bộ lưới chỉ số (Đúng, Sai, Chưa trả lời, Tỷ lệ đúng, Thẻ đã xem) và danh sách chi tiết các câu hỏi vào một khối rút gọn collapsible (`<details>` panel). Người dùng muốn xem chi tiết chỉ cần bấm để mở ra, giữ cho màn hình chính luôn sạch sẽ và tập trung.

### 1.2 Kệ sách Thư viện 3D Vật lý (Physical 3D Bookshelf)
Biến các card môn học đơn điệu thành những cuốn sách thực thụ đặt trên kệ.
*   **Thick Book Spine (Gáy sách 3D):** Sử dụng `border-left` dày `20px` với màu sắc đại diện cho từng môn học/theme, kết hợp gradient gáy sách (`::before`) để mô phỏng độ cong vật lý và phản xạ ánh sáng nổi khối của bìa sách da/vải.
*   **Paper Edge Simulator (Cạnh trang giấy):** Tạo giả lập các nếp trang giấy xếp chồng ở cạnh phải (`::after`) bằng repeating-linear-gradient màu giấy ngà (`#f0f0f0`/`#e5e5e5`).
*   **Physical Tilt Effect (Hiệu ứng kéo sách):** Khi di chuột qua (hover), cuốn sách sẽ nhô lên và hơi nghiêng nhẹ (`transform: translateY(-8px) rotate(1deg)`) tạo cảm giác kéo cuốn sách ra khỏi kệ.

### 1.3 Xưởng nạp Tài liệu Tối giản (Tabbed Workflow Selector)
Loại bỏ tình trạng xếp chồng 5 thẻ công cụ khổng lồ gây ngợp cho người dùng mới.
*   **Interactive Method Selector:** Cung cấp 4 thẻ tab lựa chọn nhanh ở đầu trang (⚡ Thử Quiz Mẫu, ✍️ Nhập Văn Bản, 📁 Tải Tệp Tin, 🤖 Trợ Lý AI Prompt).
*   **Dynamic Panel Mount:** Chỉ hiển thị bảng điều khiển tương ứng với phương thức được chọn, giúp giao diện gọn gàng hơn 75% và dẫn dắt người dùng mới từng bước một cách tự nhiên.

---

## 2. Quy trình Thực hiện (Tóm tắt nhanh)

1.  **Thiết kế cấu trúc dữ liệu đánh giá:** Thêm hàm phân loại kết quả và sinh câu chào thân thiện trong `StudyHistoryPanel.jsx`.
2.  **Gom cụm thông tin kỹ thuật:** Chuyển các khối thông số chi tiết của Nhật ký học tập vào thẻ togglable details.
3.  **Tái cấu trúc giao diện gáy sách:** Áp dụng các phong cách thiết kế 3D bìa sách, gáy sách và trang giấy cho lớp `.librarySubjectGrid > .card` trong `global.css`.
4.  **Phân luồng Xưởng nạp tài liệu:** Bổ sung state chọn phương thức nạp (`workshopMethod`) và cập nhật JSX trong `Library.jsx` để ẩn/hiện thông minh các tùy chọn.
5.  **Tối ưu hóa kiểu dáng các Tab nạp tài liệu:** Thêm CSS định dạng gờ chọn phương thức nạp trực quan, phản hồi nhạy bén trên cả PC và Mobile.
6.  **Tích hợp Chi tiết Môn học & Tra cứu Dữ liệu:** Thiết kế chế độ xem chi tiết cuốn sách khi click từ kệ sách, hiển thị bộ lọc chủ đề và danh sách câu hỏi kèm ô tìm kiếm từ khóa, tối ưu hóa màu sắc cho giao diện sáng/tối.
7.  **Tích hợp Robot Mascot Đồng hành & Nền tảng Thủy tinh lỏng (Liquid Glass)**: Phát triển component `StudyMascot` phản hồi động theo kết quả làm bài, tích hợp các bong bóng thoại động viên thông minh, làm mới giao diện Phòng học với hiệu ứng thủy tinh lỏng và các nút bấm nảy (bouncy buttons).

---

## 3. Tiến độ Thực hiện và Nhật ký Cập nhật (Progress Log)

- [x] **Nhật ký Học tập Thân thiện:** Hoàn thành rút gọn thông số kỹ thuật vào details và bổ sung các câu chào tự nhiên thân thiện ("Xuất sắc! 🏆", "Khá tốt! 🌱", "Cố gắng lên! 📚").
- [x] **Kệ sách 3D Vật lý:** Hoàn thành gáy sách nổi khối gân 3D, mô phỏng trang giấy và hiệu ứng nghiêng hover bouncy.
- [x] **Xưởng nạp Tối giản:** Hoàn thành 4 tab nạp thông minh giúp thu gọn không gian nạp 75%.
- [x] **Chi tiết Môn học & Tra cứu Dữ liệu:** Hoàn thành chế độ xem chi tiết cuốn sách, hiển thị bộ lọc chủ đề bên trái, thanh tra cứu câu hỏi/từ khóa, hiển thị trực quan đáp án đúng trắc nghiệm/tự luận/flashcard và hashtag.
- [x] **Độ tương phản và Responsive di động:** Tối ưu hóa bảng màu sắc nổi bật, độ tương phản của chữ rõ ràng, thanh tìm kiếm dễ chạm vuốt trên smartphone.
- [x] **Robot Mascot Đồng hành & Hiệu ứng Thủy tinh lỏng (Phase 37-uiG)**: Tích hợp Rô-bốt Shime blinks/cheers/comforts live trong Phòng học, thêm các hiệu ứng liquid glass và bouncy buttons tạo cảm giác cao cấp tương tự Duolingo & MochiMochi.
