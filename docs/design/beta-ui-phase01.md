# Beta UI Phase 01: Nâng cấp trải nghiệm người dùng & Cá nhân hóa giao diện

Tài liệu này tóm tắt tiến độ, các thay đổi thiết kế và quy trình triển khai cho phase giao diện mới (`beta-ui-phase01`) của dự án ShimeChamhoc v2.

---

## 1. Các vấn đề cốt lõi đã giải quyết

### 1.1 Tránh nhàm chán và buồn ngủ trên Bảng điều khiển (Dashboard)
- **Vấn đề:** Giao diện tab "Hôm nay" hiển thị dồn dập các thẻ thông tin có kích thước và màu sắc đều tăm tắp theo chiều dọc, dễ gây cảm giác đơn điệu và buồn ngủ cho người dùng học tập mỗi ngày.
- **Giải pháp:** Thiết kế lại bố cục tab "Hôm nay" thành một **Asymmetrical Grid (Lưới bất đối xứng)**:
  - Phía trên là **Today Highlight Card** chứa lời chào động theo giờ thực, ngọn lửa Streak động, và Vòng tiến trình SVG tròn bắt mắt.
  - Phía dưới chia thành 2 cột bất đối xứng (`1.2fr` và `0.8fr`): Cột bên trái hiển thị **Kế hoạch/Lộ trình học tập** hôm nay (nhấn mạnh bằng viền màu nổi bật ở cạnh trái), cột bên phải hiển thị bảng cấu hình **Mục tiêu học tập** và các thống kê liên quan.

### 1.2 Tùy biến Theme tự chọn (Theme Customization)
- **Giải pháp:** Thiết kế bộ chọn Theme hoàn toàn mới tích hợp trực tiếp trong màn hình **Cài đặt**:
  - Hỗ trợ 5 bảng màu được phối hài hòa nhằm kích thích tinh thần tự học:
    1. **Forest Calm (Mặc định)**: Màu xanh lục mộc mạc dịu nhẹ.
    2. **Forest Dark (Tối)**: Bản phối nền tối bảo vệ mắt khi học đêm.
    3. **Ocean Calm (Đại dương)**: Tông màu lam biển mát mẻ, cân bằng cảm xúc.
    4. **Sunset Warm (Hoàng hôn)**: Tông màu cam đất trầm ấm, gần gũi.
    5. **Lavender Field (Oải hương)**: Màu tím oải hương nhẹ nhàng, giảm stress.
  - Trạng thái theme được đồng bộ động qua CSS Variables (`data-theme`) và lưu trữ cục bộ (`localStorage`), không có độ trễ tải trang.

### 1.3 Cải thiện độ tương phản & Màu nút bấm trong Phòng học tập trung
- **Vấn đề:** Trùng lặp màu chữ và màu nút bấm ở thanh điều khiển stepper dưới cùng của Phòng học (`StudyRoom`), các nút bấm khi bị vô hiệu hóa (`disabled`) trông vẫn rất giống nút bấm hoạt động.
- **Giải pháp:** 
  - Tạo kiểu hiển thị rõ ràng cho trạng thái vô hiệu hóa: Nền đổi sang màu xám mờ (`var(--color-border)`), chữ chuyển thành xám nhạt (`var(--color-text-muted)`), bỏ hiệu ứng đổ bóng và vô hiệu hóa hoàn toàn con trỏ.
  - Tối ưu hóa màu tương phản cho các nút stepper: Nút "Câu trước" (phụ) dùng tông màu dịu của theme (`var(--color-primary-soft)`), nút "Câu tiếp theo" (chính) dùng tông màu đậm nổi bật (`var(--color-primary)` với màu chữ trắng/kem sáng rõ).
  - Phần hiển thị số thứ tự câu hỏi ở giữa được thiết kế dưới dạng nhãn tròn (pill badge) có màu nền tương phản cao.

### 1.4 Khắc phục triệt để độ tương phản chữ khi đổi Theme
- **Vấn đề:** 
  - Các biến CSS viết tắt (như `--text`, `--muted`, `--bg`, `--surface`) chưa được định nghĩa lại trong các khối theme khác nhau, khiến văn bản trên thẻ và tiêu đề ứng dụng giữ nguyên tông màu sáng, gây khó đọc hoặc chìm chữ khi đổi giao diện.
  - Các thành phần cốt lõi bao gồm thẻ mặc định `.card--default`, bảng điều khiển nổi bật `.dashboardTodayCard`, thanh điều hướng bên `.sidebar`, và thanh điều hướng di động `.bottomNav` bị đặt cứng màu nền dạng kem nhạt (`rgba(255, 250, 240, ...)`), dẫn đến việc khi bật chế độ Forest Dark, chữ màu trắng của theme sẽ hiển thị trên nền sáng gây mất tương phản nghiêm trọng.
  - Chữ của mục điều hướng đang hoạt động (`--phase37uih-nav-moss-strong`) bị đặt cứng màu xanh đậm của theme sáng, gây tương phản kém khi đổi theme.
- **Giải pháp:**
  - Khai báo lại đầy đủ các biến alias cho `[data-theme='dark']` và 3 theme mới (`ocean`, `sunset`, `lavender`).
  - Loại bỏ hoàn toàn các mã màu nền kem cứng và thay thế bằng `var(--surface)` thích ứng động cho `.pageHeader`, `.card`, `.card--default`, `.sidebar`, và `.bottomNav`.
  - Tối ưu hóa `.dashboardTodayCard` bằng dải màu gradient thích ứng động từ `var(--surface)` đến `var(--color-primary-soft)`.
  - Định nghĩa lại biến màu chữ mục điều hướng hoạt động `--phase37uih-nav-moss-strong` cho từng theme (ví dụ: `#17212d` cho Forest Dark để nổi bật trên nền pill xanh sáng, và `var(--color-primary-strong)` cho các theme khác).
  - Áp dụng quy tắc CSS tương phản tối đa (`!important`) cho thẻ tiêu đề `h1-h6` và mô tả để đảm bảo độ sắc nét cao nhất trên mọi nền màu.

### 1.5 Tối ưu hóa thao tác chạm vuốt (Touch Gestures) trên Smartphone
- **Giải pháp:** Tích hợp bộ xử lý cử chỉ chạm (`onTouchStart`, `onTouchMove`, `onTouchEnd`) ngay tại giao diện thẻ câu hỏi của Phòng học (`StudyRoom.jsx`):
  - Vuốt sang trái (Swipe Left): Tự động chuyển đến câu tiếp theo (tương tự nhấn nút "Câu tiếp theo").
  - Vuốt sang phải (Swipe Right): Quay lại câu trước đó.
  - Ngưỡng kích hoạt vuốt tối thiểu là `50px` để tránh xung đột với các tương tác cuộn dọc hoặc click thông thường trên điện thoại di động.

### 1.6 Đồng bộ hóa Theme & Tương phản tuyệt đối cho Phòng học, Thư viện & Bảng điều khiển
- **Vấn đề:** 
  * Khi đổi theme (nhất là Forest Dark), các thẻ lựa chọn đáp án trắc nghiệm, Flashcard, bản đồ lưới câu hỏi (`studyQuestionGrid`), vòng tiến trình ngày, và bảng preview Canvas vẫn giữ nền kem hoặc nền trắng cứng khiến chữ trắng của chế độ tối bị chìm nghỉm, gây đau mắt nghiêm trọng.
  * Bản điều khiển chính (Dashboard) bị bao quanh bởi một khung hiển thị single-surface preview pilot (`.phase37uiu-dynamic-canvas-single-surface-preview-pilot`) bị ghim cứng các mã màu kem nhạt/xanh lục nhạt của theme `moss-library` cũ. Điều này khiến tiêu đề và thẻ bên trong bị biến thành màu sáng trong khi chữ của Forest Dark chuyển sang màu trắng/sáng, gây ra hiện tượng không thể đọc được chữ.
  * Các thẻ thống kê (`.libraryStats span`) và nút chủ đề (`.topicPill`) trên trang Thư viện bị ghim cứng nền trắng mờ khiến văn bản màu sáng trong giao diện tối bị mất tương phản hoàn toàn.
- **Giải pháp:**
  * Chuyển đổi toàn bộ lưới câu hỏi `studyQuestionGrid` và các nút câu hỏi trong `StudyRoom.jsx` từ mã màu RGB sang các biến CSS theme như `var(--color-primary-soft)`, `var(--surface)`, `var(--color-success-soft)`, và `var(--color-danger-soft)`.
  * Thay thế màu nền kem cứng và màu viền của khung vòng tròn tiến trình ngày `dashboardTodayRingContainer` thành `var(--color-primary-soft)` và `var(--border)`.
  * Thiết kế lại các biến thành phần `Phase 37-uiF` (Modern Answer Surface) sử dụng `var(--surface)` làm nền động cho các thẻ câu hỏi `.studyItemCard`, các đáp án lựa chọn `.choiceOption`, `.choiceOption--correct`, `.choiceOption--wrong`, `.flashcard`, và `.flashcard--revealed` giúp loại bỏ hoàn toàn các mảng trắng chói lòa trong giao diện tối.
  * **Giải quyết dứt điểm khung Dashboard ở giữa:** Thay thế toàn bộ các biến ghim cứng của preview pilot bằng các biến CSS động của theme (`var(--surface)`, `var(--bg)`, `var(--border)`, `var(--color-primary-soft)`...). Giờ đây, khung Dashboard ở giữa và toàn bộ thẻ con bên trong sẽ tự động thích ứng với theme của ứng dụng: chuyển sang nền tối cực kỳ dịu mắt và sang trọng ở Forest Dark, và giữ dải màu tương ứng ở các theme khác.
  * **Khắc phục triệt để hiển thị Thư viện:** Chuyển nền của các nhãn `.libraryStats span` và `.topicPill` sang `var(--surface-strong)` cùng màu chữ `var(--color-text)`, đồng thời cập nhật trạng thái hover của topic pill sang màu mềm mại `var(--color-primary-soft)`. Điều này khôi phục độ tương phản xuất sắc và khả năng hiển thị rõ nét trên smartphone và PC.


---

## 2. Quy trình thực hiện nhanh (Tóm tắt)

1. **Khảo sát hệ thống màu:** Nghiên cứu tệp `tokens.css` để định nghĩa lại 3 theme mới (`ocean`, `sunset`, `lavender`) kế thừa đầy đủ các token thiết kế (primary, secondary, success, background, surface...).
2. **Xây dựng bộ chọn giao diện:** Viết mới component `ThemeSettingsPanel.jsx` hiển thị lưới các bảng màu trực quan kèm mô tả chi tiết, đồng bộ trạng thái theme thời gian thực qua `localStorage`.
3. **Phá vỡ tính đơn điệu:** Điều chỉnh CSS Grid của bảng điều khiển để hiển thị hai thẻ tiến trình học tập song song nhau thay vì xếp chồng dọc tẻ nhạt.
4. **Chuẩn hóa nút điều hướng:** Sửa lại các thuộc tính CSS của nút bấm `disabled` và stepper trong `global.css` để đảm bảo độ tương phản đáp ứng các tiêu chuẩn tiếp cận giao diện (Accessibility).
5. **Đồng bộ hóa các thành phần giao diện động:** Rà soát và loại bỏ các dải gradient trắng cứng, màu nền kem cũ trong Phòng học, Thư viện và Bảng điều khiển bằng các biến CSS dynamic.
6. **Đảm bảo tính toàn vẹn:** Chạy thử nghiệm hồi quy (unit testing) để đảm bảo không phá vỡ logic tính toán FSRS hay lưu trữ cục bộ.

