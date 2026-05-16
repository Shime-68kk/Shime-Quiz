# Demo Quickstart / Hướng dẫn thử nhanh Shime

Tài liệu này hướng dẫn người dùng lần đầu thử Shime trong khoảng 5 phút — không cần tài khoản, không cần cài thêm gì.

---

## Bạn cần gì?

- Trình duyệt web (Chrome, Firefox, Edge, hoặc Safari đều được).
- App Shime đang chạy local hoặc được deploy sẵn.
- Không cần tài khoản.
- Không cần kết nối internet (trừ khi cần tải app lần đầu).

---

## Bước 1 — Mở ứng dụng

Nếu chạy local:

```bash
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là `http://localhost:5173`).

Nếu đã deploy: mở địa chỉ đã được chia sẻ.

---

## Bước 2 — Thử quiz mẫu trong Thư viện

1. Vào **Thư viện** (Library) từ menu điều hướng.
2. Nhấn nút **Dùng quiz mẫu** để tải một bộ quiz demo cục bộ vào luồng xem trước.
3. Màn hình xem trước hiển thị — bạn có thể xem nội dung trước khi lưu.
4. Xem qua bảng kiểm tra chất lượng nếu có.
5. Nhấn **Xác nhận lưu** (hoặc nút tương đương) để lưu quiz mẫu vào thư viện.

**Lưu ý:** Shime không tự lưu khi chưa được xác nhận. Demo mẫu không gọi AI/API và không yêu cầu EduGen.

---

## Bước 3 — Vào Phòng học

1. Từ Thư viện, chọn bộ quiz vừa lưu.
2. Nhấn **Vào Phòng học** (hoặc điều hướng đến Phòng học).
3. Trả lời các câu hỏi trắc nghiệm, câu ngắn hoặc flashcard tùy loại.
4. Hoàn thành phiên học.

---

## Bước 4 — Xem Tổng quan

1. Vào **Tổng quan** (Dashboard) từ menu.
2. Bạn sẽ thấy tiến độ học cục bộ, gợi ý hôm nay và các thống kê cơ bản.

---

## Bước 5 — Thử nhập nội dung học của bạn

Shime hỗ trợ nhập từ nhiều nguồn:

| Định dạng | Cách nhập |
|-----------|-----------|
| JSON | Import file JSON từ Thư viện |
| CSV | Import file CSV từ Thư viện |
| Text/Markdown | Dán trực tiếp vào ô nhập |
| File .txt/.md | Chọn file từ thiết bị |
| EduGen (PDF/DOCX) | Cần dịch vụ EduGen riêng đã cấu hình |

Mọi định dạng đều qua bước xem trước và xác nhận trước khi lưu.

---

## Tùy chọn nâng cao — Xưởng bản nháp EduGen

Nếu bạn có dịch vụ EduGen đang chạy và đã cấu hình `VITE_FILE_PROCESSOR_URL`:

1. Vào **Settings** (Cài đặt).
2. Tìm phần **EduGen Draft Workshop**.
3. Dán JSON bản nháp EduGen vào ô.
4. Xem trước và kiểm tra chất lượng bản nháp.
5. Nhấn **Xác nhận lưu bản nháp** để lưu vào thư viện.

**Lưu ý quan trọng:**
- EduGen không được tích hợp sẵn trong Shime.
- Shime không tự gọi AI/OCR.
- Kết quả từ EduGen chỉ là bản nháp, cần xem lại trước khi lưu.
- Không đảm bảo nội dung tạo ra luôn đúng.

---

## Sao lưu dữ liệu học của bạn

Dữ liệu nằm trong trình duyệt. Để bảo toàn dữ liệu:

1. Vào phần **Sao lưu / Khôi phục** trong Thư viện hoặc Settings.
2. Nhấn **Tạo bản sao lưu** để tải file sao lưu về máy.
3. Khi cần khôi phục, dùng **Khôi phục từ bản sao lưu** để nhập lại.

---

## Câu hỏi thường gặp

**Dữ liệu của tôi ở đâu?**
Dữ liệu lưu trong localStorage của trình duyệt, không gửi lên server.

**Tôi có thể dùng trên điện thoại không?**
Có, app chạy trong trình duyệt di động. Trải nghiệm mobile đang được cải thiện.

**App có yêu cầu kết nối internet không?**
Sau khi load lần đầu, các tính năng cốt lõi hoạt động offline. Chỉ EduGen Draft Workshop mới cần kết nối đến dịch vụ EduGen nếu được cấu hình.

**AI có tự tạo câu hỏi không?**
Không. Shime không có built-in AI generation và không gọi external AI/API. Workflow AI là thủ công hoàn toàn (copy prompt → dùng công cụ AI bên ngoài → dán kết quả về Shime để xem lại).

---

*Hướng dẫn này là văn bản hướng dẫn. Ảnh demo thực chưa được tạo — xem [`docs/screenshot-capture-guide.md`](screenshot-capture-guide.md) để biết cách chụp ảnh demo.*
