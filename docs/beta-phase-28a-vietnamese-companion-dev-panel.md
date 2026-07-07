# Báo cáo Việt hóa Giao diện Bảng Thử nghiệm Trợ lý Đồng hành (Companion Dev Panel)

Tài liệu này tổng hợp các thay đổi Việt hóa và tối ưu hóa trải nghiệm người dùng (UX) cho Bảng Thử nghiệm Trợ lý Đồng hành (Chế độ Dev) nhằm giúp người dùng không chuyên kỹ thuật dễ dàng hiểu và sử dụng một cách an toàn.

---

## 1. Các thuật ngữ kỹ thuật được chuẩn hóa tiếng Việt

| Tiếng Anh gốc | Tiếng Việt đã được chuẩn hóa | Giải thích/Mục đích |
| :--- | :--- | :--- |
| **Fake facade only** | Chỉ dùng dữ liệu giả lập | Làm rõ bảng thử nghiệm chạy trên mock data, không ảnh hưởng học tập thật. |
| **Dev-only** | Chỉ dành cho thử nghiệm | Tránh hiểu lầm đây là tính năng sản xuất chính thức. |
| **Live DeviceBridge observe-only** | Theo dõi Device Bridge thật — chỉ quan sát | Chỉ rõ chế độ thụ động, không gửi lệnh ra robot thật. |
| **redacted/coarse** | dữ liệu đã làm mờ/rút gọn | Khẳng định dữ liệu đã được lược bỏ thông tin nhạy cảm. |
| **Companion intent** | Ý định đồng hành / Ý định trợ lý | Thân thiện hóa ý định biểu cảm của trợ lý ảo. |
| **Planned command** | Lệnh dự kiến | Lệnh chuyển động chuẩn bị gửi ra (nhưng hiện tại bị chặn/chưa phát). |
| **Safety** | Trạng thái an toàn / An toàn | Kết quả kiểm duyệt hành vi trợ lý từ lớp SafetyGovernor. |
| **Transcript** | Nhật ký suy luận / Nhật ký theo dõi | Lịch sử quyết định của bộ não trợ lý ảo. |
| **Sensitive attack** | Kiểm tra chặn dữ liệu nhạy cảm | Tên kịch bản mô phỏng tấn công rò rỉ dữ liệu để kiểm thử bộ lọc bảo mật. |

---

## 2. Giải thích chi tiết về bảo mật và giới hạn tính năng (Privacy Banner)
Bảng cảnh báo màu cam nổi bật ở đầu Panel đã được biên dịch hoàn toàn sang Tiếng Việt với nội dung chi tiết:
*   Đây chỉ là công cụ thử nghiệm gỡ lỗi phát triển.
*   **Cam kết tuyệt đối bảo mật**: Không thu thập nội dung câu hỏi, đáp án, giải thích hay lịch sử học chi tiết của người học.
*   **Không truyền gửi**: Không gửi lệnh điều khiển ra robot/phần cứng thật, không sử dụng dịch vụ đám mây (cloud) hay AI ngoại vi.
*   **Không lưu trữ**: Không lưu dữ liệu trên thiết bị cục bộ, tự động làm sạch khi tải lại trang.

---

## 3. Cải tiến trạng thái khi vô hiệu hóa (Disabled State UX)
*   Khi bảng thử nghiệm ở trạng thái vô hiệu hóa (`disabled`), tất cả các nút kịch bản đều chuyển sang màu xám và không thể nhấn được.
*   Đồng thời hiển thị dòng thông báo nhắc nhở bằng tiếng Việt: `"⚠️ Hãy bật bảng thử nghiệm trước khi chạy kịch bản."` màu cam giúp người dùng biết cần kích hoạt bảng trước khi chọn kịch bản giả lập.

---

## 4. Việt hóa Mã Lý Do (Reason Codes Mapping)
Các mã lý do kỹ thuật trả về từ bộ điều hướng hành vi đã được bản địa hóa trực quan gần cột tương ứng:
*   `allowed_expression_only` → **chỉ cho phép biểu cảm an toàn**
*   `transport_unsafe` → **kết nối chưa an toàn**
*   `privacy_lock_failed` → **khóa riêng tư đã chặn**
*   `frustration_risk_high` → **nguy cơ nản cao**
*   `study_focus` → **đang tập trung học**
*   `session_start` → **bắt đầu phiên**
*   `none` → **không**

---

## 5. Danh sách các cột bảng gỡ lỗi (Safety Columns only)
Bảng hiển thị nhật ký suy luận chỉ hiển thị 9 cột thông tin thô an toàn, không hiển thị bất kỳ nội dung nhạy cảm hay câu hỏi gốc:
1.  **Bước**
2.  **Sự kiện**
3.  **Trạng thái**
4.  **Ý định**
5.  **Tông phản hồi**
6.  **An toàn**
7.  **Lệnh dự kiến**
8.  **Lý do**
9.  **Riêng tư**
