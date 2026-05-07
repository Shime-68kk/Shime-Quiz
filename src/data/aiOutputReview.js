const SUBJECT_SIGNAL = /(^|\n)\s*(?:môn|mon|subject)\s*:/iu;
const TOPIC_SIGNAL = /(^|\n)\s*(?:chủ\s*đề|chu\s*de|topic)\s*:/iu;
const MARKDOWN_SUBJECT_SIGNAL = /(^|\n)\s*#\s+[^#\n]+/u;
const MARKDOWN_TOPIC_SIGNAL = /(^|\n)\s*##\s+[^#\n]+/u;
const QUESTION_SIGNAL = /(^|\n)\s*(?:câu\s*hỏi|cau\s*hoi|question)\s*:/iu;
const SHORT_QUESTION_SIGNAL = /(^|\n)\s*(?:câu\s*hỏi\s*ngắn|cau\s*hoi\s*ngan|short\s*answer)\s*:/iu;
const FLASHCARD_SIGNAL = /(^|\n)\s*flashcard\s*:/iu;
const ANSWER_SIGNAL = /(^|\n)\s*(?:đáp\s*án|dap\s*an|answer|mặt\s*sau|mat\s*sau)\s*:/iu;
const CHOICE_LABEL_SIGNAL = /(^|\n)\s*[A-Ha-h][.)]\s+\S+/u;
const MARKDOWN_TABLE_SIGNAL = /(^|\n)\s*\|.+\|\s*(\n\s*\|?\s*:?-{2,}:?\s*\|)/u;
const JSON_LIKE_SIGNAL = /^\s*[\[{]/u;
const COMMENTARY_SIGNAL = /(?:^|\n)\s*(?:dưới đây|duoi day|sau đây|sure[,!]?|here (?:is|are)|tôi đã|toi da|mình đã|minh da|bạn có thể|ban co the|lưu ý|luu y)\b/iu;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createWarning(code, level, message, path = '') {
  return { code, level, message, path };
}

function hasSubjectSignal(text) {
  return SUBJECT_SIGNAL.test(text) || MARKDOWN_SUBJECT_SIGNAL.test(text);
}

function hasTopicSignal(text) {
  return TOPIC_SIGNAL.test(text) || MARKDOWN_TOPIC_SIGNAL.test(text);
}

function countFormatSignals(text) {
  const checks = [
    SUBJECT_SIGNAL,
    TOPIC_SIGNAL,
    MARKDOWN_SUBJECT_SIGNAL,
    MARKDOWN_TOPIC_SIGNAL,
    QUESTION_SIGNAL,
    SHORT_QUESTION_SIGNAL,
    FLASHCARD_SIGNAL,
    ANSWER_SIGNAL,
    CHOICE_LABEL_SIGNAL
  ];
  return checks.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function countChoiceLabels(text) {
  const labels = new Set();
  for (const match of text.matchAll(/(^|\n)\s*([A-Ha-h])[.)]\s+\S+/gu)) {
    labels.add(match[2].toUpperCase());
  }
  return labels.size;
}

function looksLikeQuizDraft(text) {
  return QUESTION_SIGNAL.test(text)
    || SHORT_QUESTION_SIGNAL.test(text)
    || FLASHCARD_SIGNAL.test(text)
    || CHOICE_LABEL_SIGNAL.test(text);
}

export function reviewManualAiOutputText(text) {
  const source = cleanString(text);
  const warnings = [];

  if (!source) {
    warnings.push(createWarning(
      'ai_output_empty',
      'error',
      'Chưa có nội dung kết quả AI để kiểm tra.'
    ));
    return getManualAiOutputReviewSummary({ warnings });
  }

  if (source.length < 80) {
    warnings.push(createWarning(
      'ai_output_too_short',
      'warning',
      'Kết quả AI khá ngắn. Hãy kiểm tra xem đã đủ câu hỏi, đáp án và ngữ cảnh trước khi import.'
    ));
  }

  if (JSON_LIKE_SIGNAL.test(source) || /"(?:subjects|topics|items|questions|choices|correctAnswer)"\s*:/u.test(source)) {
    warnings.push(createWarning(
      'ai_output_json_like',
      'warning',
      'Kết quả có vẻ là JSON. Luồng nhập văn bản/Markdown hoạt động tốt hơn khi AI trả về Môn, Chủ đề, Câu hỏi, A/B/C/D và Đáp án.'
    ));
  }

  if (COMMENTARY_SIGNAL.test(source)) {
    warnings.push(createWarning(
      'ai_output_has_extra_commentary',
      'warning',
      'Kết quả có thể có lời bình hoặc phần giải thích ngoài bản nháp. Hãy yêu cầu AI chỉ trả về nội dung quiz nếu phần này làm parser khó hiểu.'
    ));
  }

  if (!hasSubjectSignal(source)) {
    warnings.push(createWarning(
      'ai_output_missing_subject',
      'warning',
      'Chưa thấy Môn hoặc tiêu đề # rõ ràng. Hãy thêm môn học để bản nháp dễ phân loại.'
    ));
  }

  if (!hasTopicSignal(source)) {
    warnings.push(createWarning(
      'ai_output_missing_topic',
      'warning',
      'Chưa thấy Chủ đề hoặc tiêu đề ## rõ ràng. Hãy thêm chủ đề để bản nháp dễ tổ chức.'
    ));
  }

  if (looksLikeQuizDraft(source) && !ANSWER_SIGNAL.test(source)) {
    warnings.push(createWarning(
      'ai_output_missing_answer_markers',
      'warning',
      'Chưa thấy dòng Đáp án rõ ràng. Câu hỏi trắc nghiệm hoặc câu hỏi ngắn có thể không import đúng nếu thiếu đáp án.'
    ));
  }

  if (QUESTION_SIGNAL.test(source) && countChoiceLabels(source) < 2) {
    warnings.push(createWarning(
      'ai_output_missing_choice_labels',
      'warning',
      'Câu hỏi trắc nghiệm nên có nhãn lựa chọn A., B., C., D. rõ ràng. Hãy yêu cầu AI sửa lại nếu lựa chọn đang thiếu nhãn.'
    ));
  }

  if (MARKDOWN_TABLE_SIGNAL.test(source)) {
    warnings.push(createWarning(
      'ai_output_markdown_table',
      'warning',
      'Kết quả có bảng Markdown. Parser hiện ưu tiên câu hỏi/đáp án dạng dòng, nên bảng có thể cần chuyển thành câu hỏi rõ ràng.'
    ));
  }

  if (countFormatSignals(source) < 3) {
    warnings.push(createWarning(
      'ai_output_low_parse_signal',
      'warning',
      'Kết quả chưa có nhiều dấu hiệu định dạng Shime. Hãy yêu cầu AI dùng Môn, Chủ đề, Câu hỏi, A/B/C/D, Đáp án, Flashcard hoặc Câu hỏi ngắn.'
    ));
  }

  if (warnings.length) {
    warnings.push(createWarning(
      'ai_output_needs_manual_review',
      'info',
      'Đây chỉ là kiểm tra định dạng cơ bản. AI vẫn có thể sai nội dung, nên bạn cần tự kiểm chứng trước khi lưu.'
    ));
  }

  return getManualAiOutputReviewSummary({ warnings });
}

export function getManualAiOutputReviewSummary(review) {
  const warnings = Array.isArray(review?.warnings) ? review.warnings : [];
  return {
    warnings,
    summary: {
      warningCount: warnings.length,
      errorCount: warnings.filter(warning => warning.level === 'error').length,
      formatWarningCount: warnings.filter(warning => warning.level !== 'info').length,
      canProceed: true
    }
  };
}
