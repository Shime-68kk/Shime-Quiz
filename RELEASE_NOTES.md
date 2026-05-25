# Ghi chú phát hành — ShimeChamhoc v2.0.0-beta.1

## Trạng thái

**v2.0.0-beta.1** là bản beta ứng viên đã được AI kiểm tra (trạng thái hiện tại: `LIMITED_BETA_CANDIDATE`).

> **Ghi chú lịch sử (Phase 32D — 2026-05-25):** Phiên bản ban đầu của mục Trạng thái này
> ghi nhận kết luận ship từ Phase 30B (legacy wording: "AI-verified beta candidate / YES-SHIP"). Kết luận đó đã
> được thay thế bởi các đánh giá bằng chứng sau này (Phase 30C, Phase 31, Phase 32). Trạng
> thái hiện tại là `LIMITED_BETA_CANDIDATE`. `BETA_READY` chưa được phê duyệt. Đây là ghi
> chú lịch sử; không phản ánh trạng thái sẵn sàng hiện tại.
>
> `PHASE32D_RELEASE_NOTES_LEGACY_CLAIM_STATUS: CLEANED_OR_BOUNDED_AS_HISTORICAL_NOT_CURRENT`
> `PHASE32D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`

Bản này phù hợp để đưa cho người dùng nội bộ beta/staging thử nghiệm với phạm vi hạn chế, nhưng **chưa được chứng nhận QA thủ công trên thiết bị thật** và không nên mô tả là đã vượt qua smoke test thủ công đầy đủ. BETA_READY chưa được phê duyệt.

## Tóm tắt

ShimeChamhoc v2 là kiến trúc React/Vite mới cho học tập cục bộ theo nhiều môn học. Ứng dụng có thể nhập dữ liệu JSON/CSV, học trong Phòng học, lưu tiến trình cục bộ, tạo lịch ôn tập, xem thống kê cơ bản, và sao lưu/khôi phục dữ liệu v2 mà không cần tài khoản hoặc backend.

## Tính năng chính

- Giao diện React/Vite với các tuyến `/dashboard`, `/library`, `/study-room`.
- Bố cục responsive: sidebar trên desktop, thanh điều hướng dưới trên mobile, Phòng học tập trung.
- Hệ thiết kế nhẹ với thẻ, nút, badge, thanh tiến trình, trạng thái rỗng và thông báo.
- Mô hình dữ liệu v2 cho môn học, chủ đề và mục học.
- Nhập JSON/CSV có xem trước và kiểm tra lỗi trước khi nạp.
- Lưu thư viện học cục bộ bằng `localStorage`.
- Xuất thư viện và sao lưu/khôi phục dữ liệu học v2.
- Phòng học hỗ trợ trắc nghiệm, câu trả lời ngắn và flashcard.
- Khôi phục bản nháp phiên học sau khi tải lại.
- Tổng kết phiên học, lịch sử học, chi tiết lịch sử và thống kê cơ bản.
- Lịch ôn tập cục bộ, chế độ Ôn tập hôm nay và Luyện tập thông minh.
- Mức độ nắm vững cơ bản, Gợi ý hôm nay, phản hồi gợi ý, mục tiêu học tập và Hành trình hôm nay.
- Theo dõi tiến trình kế hoạch hôm nay.
- Sao lưu đầy đủ, sao lưu đã ẩn đáp án và sao lưu tiến trình.
- Cảnh báo bảo mật cục bộ về dữ liệu/đáp án trong trình duyệt và file sao lưu.

## Ghi chú dữ liệu và lưu trữ

Ứng dụng dùng các khóa `localStorage` phiên bản hóa:

- `shimeV2LibraryDataV1`
- `shimeV2StudyDraftV1`
- `shimeV2StudyHistoryV1`
- `shimeV2ReviewScheduleV1`
- `shimeV2RecommendationFeedbackV1`
- `shimeV2StudyGoalV1`
- `shimeV2StudyPlanProgressV1`

Lịch sử học mới đã được chuẩn hóa để giảm trùng lặp nội dung câu hỏi/đáp án. Các bản sao lưu hoặc lịch sử cũ có snapshot nhiều dữ liệu vẫn được hỗ trợ.

## Sao lưu và xuất dữ liệu

- **Sao lưu đầy đủ**: bao gồm thư viện, đáp án và trạng thái học cục bộ. Đây là chế độ khôi phục đầy đủ chính.
- **Sao lưu đã ẩn đáp án**: cố gắng loại bỏ các trường đáp án trực tiếp. Chế độ này giúp giảm rủi ro khi chia sẻ nhưng không phải mã hóa và không dùng để khôi phục đầy đủ đáp án.
- **Sao lưu tiến trình**: không bao gồm nội dung thư viện hoặc đáp án. Chỉ có ý nghĩa khi người dùng còn thư viện học tương ứng.

## Giới hạn bảo mật cục bộ

ShimeChamhoc v2 là ứng dụng tĩnh, local-first. Để chấm điểm offline, dữ liệu đáp án phải tồn tại phía trình duyệt. Dữ liệu học và đáp án có thể xuất hiện trong `localStorage`, bộ nhớ trình duyệt, file import, file sao lưu đầy đủ hoặc DevTools.

Không dùng chế độ tĩnh/offline này như một hệ thống chống gian lận tuyệt đối. Bảo vệ đáp án thật sự hoặc chấm điểm chống gian lận cần kiến trúc backend/server-side scoring trong tương lai.

## Ghi chú chuyển đổi từ v1

v2 là kiến trúc mới. Dữ liệu v1 không tự động chuyển sang v2 trừ khi có luồng import/restore v2 hỗ trợ rõ ràng. Người dùng nên giữ bản sao lưu v1 riêng khi thử nghiệm v2.

## Giới hạn còn lại

- Chưa được chứng nhận QA thủ công trên thiết bị thật.
- Smoke test staging thủ công đầy đủ trên trình duyệt thật vẫn chưa được xác nhận trong tài liệu này.
- Người dùng beta nên báo cáo lỗi UI, lỗi runtime, lỗi import/export và vấn đề layout mobile nếu gặp.
- PWA/offline cache chưa được chứng nhận production-grade; v2 hiện là static/local-first và không chủ động đăng ký service worker mới trong bản này.
- Không có tài khoản, đồng bộ cloud, backend, mã hóa, thông báo hoặc lịch.
- Các mô hình mastery, gợi ý, luyện tập thông minh và lịch ôn tập là heuristic cục bộ đơn giản, không phải AI/ML dự đoán chắc chắn.
- Sao lưu đầy đủ là JSON văn bản thuần và có thể chứa đáp án đúng.

## Trạng thái kiểm thử

Bản này là **AI-verified beta candidate** (trạng thái hiện tại: `LIMITED_BETA_CANDIDATE`; `BETA_READY` chưa được phê duyệt; xem ghi chú lịch sử ở phần Trạng thái). Các kiểm tra build và validator tự động phải chạy trước khi phát hành gói:

```bash
npm ci
npm run build
node scripts/validate-smoke-fixture.js
node scripts/validate-v2-release-hardening.js
node scripts/validate-exam-readiness.js
node scripts/validate-recommendation-feedback.js
node scripts/validate-weighted-selection.js
```

Trước khi phát hành rộng hơn, vẫn cần hoàn thành checklist QA thủ công trong `RELEASE_QA_V2.md` trên trình duyệt/thiết bị thật.
