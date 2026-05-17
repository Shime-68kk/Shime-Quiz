# Không có đám mây mặc định / Đồng bộ luôn tắt mặc định

Đây là văn bản niềm tin chính thức của Shime về dữ liệu người dùng.
Phiên bản tiếng Việt là nguồn gốc; phiên bản tiếng Anh là bản đồng hành.

---

## Mục đích

Tài liệu này nói rõ Shime đang làm gì với dữ liệu của bạn — và quan trọng hơn,
Shime **không** làm gì.

Shime cam kết không nói quá. Nếu một tính năng chưa có, Shime sẽ nói thẳng là
chưa có, thay vì dùng ngôn ngữ mơ hồ hoặc hứa hẹn tương lai không có cơ sở.

---

## Shime hiện tại là gì

Shime là ứng dụng học từ vựng hoạt động **cục bộ trên thiết bị của bạn**:

- không cần tài khoản.
- không có đăng nhập.
- không có máy chủ Shime.
- không có đám mây mặc định.
- đồng bộ luôn tắt mặc định — vì hiện tại chưa có đồng bộ.
- dữ liệu nằm trên thiết bị này và không đi đâu cả, trừ khi bạn tự xuất dữ liệu.

---

## Shime hiện tại không làm gì

Shime hiện tại **không** thực hiện bất kỳ điều nào sau:

- Không lưu dữ liệu của bạn lên đám mây.
- Không gửi dữ liệu đến máy chủ Shime (không có máy chủ nào tồn tại).
- Không tạo hoặc yêu cầu tài khoản người dùng.
- Không xác thực danh tính.
- Không đồng bộ dữ liệu giữa các thiết bị.
- Không đồng bộ lịch ôn tập.
- Không đồng bộ dữ liệu FSRS.
- Không tự động chuyển dữ liệu sang thiết bị khác.
- Không xóa localStorage.
- Không chuyển đổi backend lưu trữ trong môi trường production.

---

## Dữ liệu của bạn đang ở đâu

Toàn bộ dữ liệu Shime nằm trong **localStorage** trên trình duyệt của thiết bị
này. localStorage vẫn là nguồn dữ liệu sản xuất chính.

Điều này có nghĩa là:

- Nếu bạn xóa dữ liệu trình duyệt, dữ liệu Shime cũng sẽ bị xóa.
- Nếu bạn chuyển sang thiết bị khác, dữ liệu **không tự chuyển theo**.
- Nếu bạn dùng chế độ ẩn danh, dữ liệu sẽ mất khi đóng tab.

Shime không kiểm soát và không thể khôi phục dữ liệu đã mất do người dùng xóa
hoặc trình duyệt xóa.

---

## Sao lưu, xuất dữ liệu, nhập dữ liệu và khôi phục

Nguyên tắc cốt lõi: sao lưu không phải là đồng bộ. Đây là hai khái niệm khác
nhau và Shime không được phép nhầm lẫn chúng.

**Sao lưu (backup):**

- Bạn chủ động bấm "Sao lưu" và tải về tệp sao lưu.
- Tệp này nằm trên thiết bị bạn tải về.
- Shime không tự động sao lưu.

**Xuất dữ liệu (export):**

- Bạn tải xuống một tệp chứa dữ liệu (từ vựng, lịch sử học, cài đặt, v.v.).
- Tệp này là của bạn, nằm trên thiết bị bạn chọn.

**Nhập dữ liệu (import):**

- Bạn chủ động chọn tệp và nạp vào Shime.
- Dữ liệu từ tệp được ghi vào localStorage của thiết bị hiện tại.

**Khôi phục (restore):**

- khôi phục có thể ghi đè dữ liệu hiện tại. Đây là hành động không thể hoàn tác
  nếu bạn không có bản sao lưu trước đó.
- Shime sẽ cảnh báo trước khi khôi phục.

---

## Chuyển dữ liệu thủ công trước, đồng bộ sau nếu đủ an toàn

Nếu bạn cần dùng Shime trên nhiều thiết bị, cách duy nhất hiện tại là **chuyển
dữ liệu thủ công**:

1. Xuất dữ liệu trên thiết bị cũ.
2. Mang tệp sang thiết bị mới (USB, email, v.v.).
3. Nhập dữ liệu trên thiết bị mới.

Đây không phải đồng bộ. Đây là chuyển dữ liệu thủ công. Nếu bạn chỉnh sửa
trên cả hai thiết bị sau khi chuyển, hai bản dữ liệu sẽ **phân kỳ** và Shime
không thể tự động hợp nhất chúng.

Shime đang thiết kế một trải nghiệm chuyển dữ liệu thủ công tốt hơn (Phase 20A–20D).
Tính năng này chưa ra mắt và chưa có lịch cụ thể.

---

## Nếu sau này có đồng bộ, đồng bộ phải là tùy chọn

Shime chưa có đồng bộ. Nếu đồng bộ được xem xét trong tương lai, các quy tắc
bắt buộc sau **phải** được đáp ứng trước khi triển khai:

- Đồng bộ phải là tùy chọn, không bao giờ bật mặc định.
- Người dùng phải chủ động bật đồng bộ.
- Trước khi đồng bộ gộp dữ liệu, phải có bản sao lưu có thể khôi phục.
- Người dùng phải được cảnh báo rõ ràng nếu có xung đột.
- Sao lưu và khôi phục phải tiếp tục hoạt động độc lập, không bị ảnh hưởng bởi
  đồng bộ.

Không có gì ở trên được áp dụng hôm nay vì đồng bộ chưa tồn tại.

---

## Xung đột dữ liệu và vì sao không được hứa "không có xung đột"

Nếu bạn dùng Shime trên nhiều thiết bị và chỉnh sửa dữ liệu trên cả hai, xung
đột sẽ xảy ra. Đây là thực tế kỹ thuật, không phải lỗi thiết kế.

Shime không hứa không có xung đột vì:

- Bất kỳ hệ thống đồng bộ nào cũng có thể tạo ra xung đột.
- Hứa "không có xung đột" là nói dối hoặc che giấu vấn đề.
- Xung đột ẩn (không thông báo cho người dùng) có thể gây mất dữ liệu im lặng.

Shime không hứa chống mất dữ liệu tuyệt đối. Mất dữ liệu có thể xảy ra nếu:

- Bạn xóa localStorage thủ công.
- Trình duyệt xóa dữ liệu site.
- Bạn khôi phục mà không có bản sao lưu trước đó.
- Bạn chỉnh sửa trên hai thiết bị và gộp sai.

Cách bảo vệ tốt nhất hiện tại là **sao lưu thường xuyên**.

Shime không hứa mã hóa đầu cuối. Shime không hứa zero-knowledge. Những tính năng
này chưa được xây dựng và Shime sẽ không dùng những ngôn ngữ đó nếu chúng chưa
tồn tại thực sự.

---

## FSRS, lịch ôn tập và dữ liệu trí nhớ

FSRS (Free Spaced Repetition Scheduler) là thuật toán lên lịch ôn tập dựa trên
lý thuyết quên lãng. Shime đang phát triển hỗ trợ FSRS nhưng tính năng này chưa
công khai cho người dùng.

Quy tắc bắt buộc cho dữ liệu FSRS và lịch ôn tập:

- FSRS không được đồng bộ âm thầm. Đồng bộ âm thầm có thể làm sai lịch ôn tập
  của bạn mà bạn không hay biết, gây hại cho quá trình ghi nhớ.
- lịch ôn tập không được gộp âm thầm giữa các thiết bị.
- trước khi gộp dữ liệu phải có bản sao lưu có thể khôi phục — quy tắc này áp
  dụng cho tất cả các nhóm dữ liệu, kể cả FSRS.
- Nếu có xung đột lịch ôn tập, người dùng phải được thông báo và chọn.
- Đồng bộ FSRS chỉ được xem xét sau khi FSRS đã được công khai và ổn định trong
  môi trường thực.

---

## Những câu Shime được phép nói

Đây là những tuyên bố trung thực và có thể bảo vệ được:

- "Ưu tiên cục bộ mặc định" (local-first by default)
- "Không cần tài khoản"
- "Không cần đăng nhập"
- "Không có đồng bộ đám mây hôm nay"
- "Không có máy chủ Shime hôm nay"
- "Dữ liệu ở trên thiết bị này, trừ khi bạn tự xuất"
- "Sao lưu và khôi phục là hành động thủ công do người dùng kiểm soát"
- "Chuyển dữ liệu thủ công phải có trước đồng bộ"
- "đồng bộ luôn tắt mặc định — vì hiện tại chưa có đồng bộ"
- "Đồng bộ tùy chọn chưa được triển khai"
- "Mô hình xung đột đã được thiết kế (chưa triển khai)"
- "Backup-before-merge là bất biến tương lai"

---

## Những câu Shime không được phép nói

Đây là những tuyên bố **bị cấm** vì chúng mô tả tính năng không tồn tại hoặc
hứa hẹn điều Shime chưa làm được:

- "Đồng bộ đã có" (sync exists)
- "Đồng bộ đám mây đã có" (cloud sync exists)
- "Tài khoản / xác thực / backend đã có"
- "Shime lưu dữ liệu của bạn trên đám mây"
- "Mã hóa đầu cuối" (encrypted end-to-end)
- "Zero-knowledge"
- "Đồng bộ hoạt động ngay" (sync just works)
- "Không có xung đột" (no conflicts)
- "Đảm bảo không mất dữ liệu" (data-loss prevention is guaranteed)
- "Đồng bộ FSRS đã có" (FSRS sync is available)
- "Lịch ôn tập tự đồng bộ" (review schedules sync automatically)
- "Đồng bộ production đã sẵn sàng"
- "IndexedDB storage production đã tồn tại"
- "Backup/export nhận biết adapter"
- "Restore nhận biết adapter"

Những câu trên chỉ được xuất hiện trong mục "Những câu Shime không được phép
nói" này — không được dùng ở chỗ khác trong tài liệu người dùng hay giao diện.

---

## Tiêu chí trước khi bất kỳ đồng bộ nào được triển khai

Shime chỉ được xem xét triển khai đồng bộ nếu **tất cả** các điều kiện sau đều
được đáp ứng. Thiếu một điều là không đủ điều kiện:

1. Chuyển dữ liệu thủ công (Phase 20A–20D) đã ra mắt và trải qua ít nhất một
   chu kỳ beta thực sự mà không có mất dữ liệu im lặng, ghi đè bất ngờ, hoặc
   nhiều phiếu hỗ trợ.
2. ADR mô hình xung đột Phase 19C đã được hợp nhất và validator đang hoạt động.
3. Bản sao lưu niềm tin Phase 19D (tài liệu này) đã được hợp nhất bằng tiếng
   Việt và tiếng Anh.
4. Backup-before-merge là bất biến static-validator, không phải quy ước code.
5. StorageAdapter có adapter thực (không chỉ test) cho mục tiêu đồng bộ, với
   driver no-op vẫn là đường lui.
6. Thiết kế event-log / manifest / journal từ Phase 17D/17E/17F đã được nâng cấp
   từ prototype thử nghiệm lên hợp đồng runtime.
7. FSRS public opt-in đã ra mắt theo cổng Phase 19A. Đồng bộ FSRS đến sau, không
   đến trước.
8. Kịch bản rollback đã được tài liệu hóa và luyện tập: tắt đồng bộ, khôi phục
   từ bản sao lưu cục bộ tốt nhất, đối chiếu mục tiêu đồng bộ.
9. Phụ lục "câu được phép và không được phép nói" đã được tuân thủ trong README,
   landing, marketing, và giao diện sản phẩm bằng cả tiếng Việt và tiếng Anh.
10. Năng lực hỗ trợ của team đã được xác nhận đủ để xử lý ticket "đồng bộ không
    hoạt động" mà không làm xấu trải nghiệm học của người dùng không đồng bộ.

Riêng với đồng bộ đám mây (Option D), thêm các tiêu chí sau (hiện tại chưa gần
đạt được):

11. Năng lực vận hành backend được tài trợ nhiều quý.
12. Tư thế pháp lý/quyền riêng tư đã được tài liệu hóa và xem xét.
13. Đã có track record Option B và/hoặc Option C trong production ít nhất một
    chu kỳ beta đầy đủ.

---

## Ghi chú cho người dùng

Shime tin vào sự trung thực hơn là tính năng. Nếu một tính năng chưa tồn tại,
Shime sẽ nói thẳng. Nếu một hứa hẹn chưa được đảm bảo, Shime sẽ không hứa.

Hiện tại: dữ liệu của bạn ở trên thiết bị này. Hãy sao lưu thường xuyên.
Nếu bạn cần chuyển dữ liệu sang thiết bị khác, xuất và nhập thủ công là cách
duy nhất hiện tại.

Shime sẽ thông báo khi có tính năng chuyển dữ liệu tốt hơn.
