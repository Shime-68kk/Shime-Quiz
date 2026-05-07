# Phase 8C — Manual AI Output Import Hardening

Phase 8C improves the manual AI paste-back workflow. It does not add built-in AI quiz generation, API calls, API key handling, backend/auth/cloud sync, OCR, auto-import, or auto-save.

## Manual workflow boundary

1. Shime creates a prompt locally.
2. The user manually copies the prompt to an external AI tool.
3. The user manually copies the AI result back into Shime.
4. Shime checks basic formatting signals.
5. The existing text/Markdown parser creates a draft.
6. Existing import validation, advisory quality review, preview, and user-confirmed save still apply.

Shime cannot guarantee that external AI output is correct, complete, private, or source-grounded after the user pastes content into an external tool.

## Good Shime-friendly AI output

```text
Môn: Mạng máy tính
Chủ đề: Mô hình OSI

Câu hỏi: Tầng Application trong mô hình OSI có vai trò gì?
A. Cung cấp dịch vụ mạng cho ứng dụng
B. Định tuyến gói tin giữa các mạng
C. Kiểm soát truy cập đường truyền vật lý
D. Mã hóa tín hiệu điện
Đáp án: A
Giải thích: Theo nguồn, tầng Application cung cấp dịch vụ mạng cho ứng dụng.

Flashcard:
Mặt trước: TCP hoạt động ở tầng nào?
Mặt sau: Tầng Transport.

Câu hỏi ngắn: Tầng nào cung cấp dịch vụ mạng cho ứng dụng?
Đáp án: Application
```

## Bad output: JSON instead of Shime text

```json
{
  "questions": [
    { "question": "TCP ở tầng nào?", "answer": "Transport" }
  ]
}
```

Ask the external AI tool to return Shime-friendly text/Markdown with `Môn`, `Chủ đề`, `Câu hỏi`, `A/B/C/D`, `Đáp án`, `Flashcard`, and `Câu hỏi ngắn` instead of JSON.

## Bad output: extra commentary

```text
Dưới đây là bộ câu hỏi tôi tạo cho bạn:
...
Hy vọng bộ câu hỏi này hữu ích!
```

Ask the external AI tool to return only the quiz draft content, no introduction, no closing commentary, and no hidden notes.

## Bad output: missing answers

```text
Môn: Sinh học
Chủ đề: Tế bào

Câu hỏi: Ribosome có chức năng gì?
A. Tổng hợp protein
B. Tạo ATP
C. Lưu trữ DNA
D. Phân giải glucose
```

Ask the external AI tool to add `Đáp án:` for every question and keep answers source-grounded.

## How to ask the AI tool to fix output

Use a correction request like:

```text
Hãy trả lại đúng định dạng văn bản/Markdown của Shime.
Chỉ dùng Môn, Chủ đề, Câu hỏi, A/B/C/D, Đáp án, Giải thích, Flashcard, Mặt trước, Mặt sau, Câu hỏi ngắn.
Không trả JSON, không thêm lời bình, không bịa thêm thông tin ngoài nguồn.
```

## Limitations

- Phase 8C only checks basic formatting signals.
- It cannot prove whether AI hallucinated or misunderstood the source.
- It cannot guarantee privacy once the user sends content to an external AI tool.
- Existing import validation remains the hard blocking layer.
- Advisory quality review remains warning-only unless existing validation blocks the draft.
