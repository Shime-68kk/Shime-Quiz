# Screenshot Capture Guide / Hướng dẫn chụp ảnh demo

Tài liệu này hướng dẫn cách chụp ảnh màn hình và chuẩn bị tài sản demo cho Shime.

**Lưu ý quan trọng:** Ảnh demo thực chưa được tạo trong Phase 16I. Tài liệu này là hướng dẫn văn bản để chụp ảnh trong tương lai. README không nhận là đã có ảnh demo cho đến khi file ảnh thật được thêm vào và review.

---

## Nguyên tắc chụp ảnh demo

- Chỉ dùng dữ liệu mẫu/demo — không dùng dữ liệu học thật hoặc thông tin cá nhân.
- Không chụp khi có thông tin học thật, tên thật, hoặc nội dung nhạy cảm trên màn hình.
- Không làm giả kết quả — ảnh phải phản ánh trung thực hành vi thực tế của app.
- Không claim AI/OCR built-in, cloud sync, hay EduGen bundled trong ảnh hoặc caption.

---

## Viewport được khuyến nghị

| Loại màn hình | Kích thước |
|---------------|------------|
| Desktop (chính) | 1280 × 800 px |
| Desktop rộng | 1440 × 900 px |
| Mobile | 390 × 844 px (iPhone 14 Pro) |
| Mobile nhỏ | 375 × 667 px (iPhone SE) |

---

## Chuẩn bị trước khi chụp

1. Chạy app local: `npm run dev`
2. Mở DevTools → Device Toolbar (F12 → Ctrl+Shift+M) để giả lập kích thước.
3. Load quiz mẫu: Thư viện → **Dùng quiz mẫu** → Xác nhận lưu.
4. Hoàn thành một phiên học ngắn để có dữ liệu tiến độ trên Dashboard.
5. Đảm bảo không có tên cá nhân, email, hay nội dung nhạy cảm hiển thị.
6. Dùng chế độ ẩn danh (Incognito) để có trạng thái sạch nếu cần.

---

## Màn hình cần chụp

### 1. Home / Trang chủ

**URL:** `/`

**Nội dung cần thấy:**
- Tiêu đề và mô tả ngắn về Shime
- Nút điều hướng (Mở Tổng quan, Mở Thư viện, Dùng quiz mẫu)
- Card "Bắt đầu nhanh"
- Thông tin về EduGen và local-first boundary

**Chú ý:** Không chụp khi có thông báo lỗi hoặc state không hợp lệ.

---

### 2. Dashboard / Tổng quan

**URL:** `/dashboard`

**Hai trạng thái nên chụp:**

a) **Trạng thái chưa có dữ liệu** (first-run):
   - Hiển thị callout "Bắt đầu học" hoặc hướng dẫn đến Thư viện
   - Không có dữ liệu tiến độ

b) **Trạng thái có dữ liệu** (sau khi học):
   - Thẻ "Today Card" với gợi ý học hôm nay
   - Số liệu tiến độ cục bộ

**Chú ý:** Chỉ dùng dữ liệu mẫu; không hiển thị tên người dùng thật.

---

### 3. Thư viện / Library

**URL:** `/library`

**Các trạng thái nên chụp:**

a) **Trạng thái trống** (empty-state onboarding):
   - Hướng dẫn onboarding
   - Nút "Dùng quiz mẫu"
   - Các lựa chọn import

b) **Trạng thái có quiz mẫu**:
   - Danh sách quiz đã lưu
   - Chip loại (trắc nghiệm, flashcard, v.v.)

c) **Trạng thái với EduGen source label** (nếu có dữ liệu EduGen):
   - Chip "Bản nháp cần xem lại"
   - Chip "Nguồn: EduGen"

---

### 4. Phòng học / Study Room

**URL:** `/study-room`

**Nội dung nên thấy:**
- Câu hỏi trắc nghiệm hoặc flashcard
- Nút trả lời
- Tiến trình phiên học

**Chú ý:** Dùng nội dung từ quiz mẫu; không dùng quiz có nội dung thật.

---

### 5. Settings — EduGen Draft Workshop

**URL:** `/settings`

**Nội dung nên thấy:**
- Panel "EduGen Draft Workshop"
- Ô nhập bản nháp EduGen
- Badge cảnh báo "Cần dịch vụ riêng đã cấu hình"

**Chú ý quan trọng khi viết caption:**
- Ghi rõ EduGen là dịch vụ bên ngoài, không tích hợp sẵn.
- Không claim Shime có built-in AI generation hoặc OCR.

---

### 6. Luồng EduGen Draft Review (nếu có EduGen)

**Điều kiện:** Chỉ chụp nếu có dịch vụ EduGen đang chạy và dữ liệu mẫu hợp lệ.

**Các bước để chụp:**

a) Mở Settings → EduGen Draft Workshop → dán JSON bản nháp mẫu.
b) Chụp màn hình xem trước bản nháp.
c) Chụp panel kiểm tra chất lượng.
d) Chụp nút "Xác nhận lưu bản nháp".
e) Chụp Thư viện sau khi import — chip "Bản nháp cần xem lại" và "Nguồn: EduGen".

**Ví dụ JSON bản nháp mẫu hợp lệ:**

```json
{
  "items": [
    {
      "type": "multiple_choice",
      "question": "Câu hỏi mẫu về lịch sử?",
      "choices": [
        { "id": "a", "text": "Đáp án A" },
        { "id": "b", "text": "Đáp án B" },
        { "id": "c", "text": "Đáp án C" },
        { "id": "d", "text": "Đáp án D" }
      ],
      "correctAnswer": "a",
      "explanation": "Giải thích ngắn gọn."
    }
  ]
}
```

---

## Công cụ chụp màn hình

**Trên Linux/Ubuntu:**
- `gnome-screenshot` hoặc phím `Print Screen`
- Flameshot: `flameshot gui`
- Scrot: `scrot -s screenshot.png` (chọn vùng)

**Trên macOS:**
- `Cmd+Shift+4` (chọn vùng)
- `Cmd+Shift+5` (tùy chọn nâng cao)

**Trên Windows:**
- `Win+Shift+S` (Snipping Tool)
- `PrtScn` rồi dán vào Paint

**Từ DevTools Chrome/Firefox:**
- Bật DevTools → thiết lập kích thước thiết bị → `Cmd+Shift+P` → "Capture screenshot"

---

## Quy trình sau khi chụp

1. Kiểm tra ảnh: không có tên thật, không có thông tin nhạy cảm, UI không bị lỗi.
2. Lưu vào thư mục `docs/assets/screenshots/` (cần tạo thư mục này khi có ảnh thật).
3. Đặt tên file mô tả: `home-desktop-1280x800.png`, `library-empty-state.png`, v.v.
4. Cập nhật README với link đến ảnh khi đã có file thật.
5. Cập nhật [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) với kết quả capture.

---

## Claim guardrails cho caption ảnh demo

**Không được viết trong caption:**
- "Shime tự tạo câu hỏi bằng AI"
- "EduGen tích hợp sẵn trong Shime"
- "Đồng bộ dữ liệu lên cloud"
- "OCR tài liệu"
- "Câu hỏi được đảm bảo chính xác"
- "FSRS đang hoạt động cho mọi người dùng"

**Nên viết trong caption:**
- "Dùng quiz mẫu để thử nhanh, không cần tài khoản"
- "EduGen là dịch vụ tùy chọn, chạy riêng — cần cấu hình `VITE_FILE_PROCESSOR_URL`"
- "Dữ liệu học nằm trong trình duyệt, không gửi lên server"
- "Kết quả từ EduGen chỉ là bản nháp, cần xem lại trước khi lưu"

---

## Lịch sử tài liệu này

Tài liệu được tạo trong Phase 16I (Public README / Landing / Screenshots Polish + Demo Quickstart Refresh). Không có ảnh demo thực nào được tạo bởi Phase 16I.
