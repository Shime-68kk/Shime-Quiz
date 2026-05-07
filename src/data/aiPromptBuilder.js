const DEFAULT_OPTIONS = Object.freeze({
  multipleChoiceCount: 5,
  flashcardCount: 3,
  shortAnswerCount: 2,
  languageMode: 'keep_source'
});

const MAX_SOURCE_CHARACTERS = 12000;
const MIN_SOURCE_CHARACTERS = 20;

function clampCount(value, fallback) {
  const numericValue = Number.parseInt(value, 10);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.max(0, Math.min(20, numericValue));
}

export function normalizePromptSourceText(text, maxCharacters = MAX_SOURCE_CHARACTERS) {
  const normalized = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (normalized.length <= maxCharacters) {
    return {
      text: normalized,
      truncated: false,
      originalLength: normalized.length,
      usedLength: normalized.length
    };
  }

  const truncatedText = normalized.slice(0, maxCharacters).trim();
  return {
    text: truncatedText,
    truncated: true,
    originalLength: normalized.length,
    usedLength: truncatedText.length
  };
}

export function normalizeManualAiPromptOptions(options = {}) {
  return {
    multipleChoiceCount: clampCount(options.multipleChoiceCount, DEFAULT_OPTIONS.multipleChoiceCount),
    flashcardCount: clampCount(options.flashcardCount, DEFAULT_OPTIONS.flashcardCount),
    shortAnswerCount: clampCount(options.shortAnswerCount, DEFAULT_OPTIONS.shortAnswerCount),
    languageMode: options.languageMode === 'vi' ? 'vi' : 'keep_source'
  };
}

export function getManualAiPromptWarnings(options = {}) {
  const normalizedSource = normalizePromptSourceText(options.sourceText || '');
  const counts = normalizeManualAiPromptOptions(options);
  const warnings = [];

  if (!normalizedSource.text) {
    warnings.push({
      code: 'missing_source_text',
      message: 'Hãy nhập nội dung nguồn trước khi tạo prompt.'
    });
  } else if (normalizedSource.text.length < MIN_SOURCE_CHARACTERS) {
    warnings.push({
      code: 'short_source_text',
      message: 'Nội dung nguồn khá ngắn. AI có thể tạo câu hỏi kém chính xác.'
    });
  }

  if (normalizedSource.truncated) {
    warnings.push({
      code: 'source_truncated',
      message: 'Nội dung nguồn đã được rút gọn để prompt không quá dài.'
    });
  }

  if (counts.multipleChoiceCount + counts.flashcardCount + counts.shortAnswerCount === 0) {
    warnings.push({
      code: 'no_requested_items',
      message: 'Hãy chọn ít nhất một loại câu hỏi cần tạo.'
    });
  }

  return warnings;
}

function buildOutputRequirements(options) {
  const parts = [];
  if (options.multipleChoiceCount > 0) {
    parts.push(`- ${options.multipleChoiceCount} câu hỏi trắc nghiệm, mỗi câu có A/B/C/D, Đáp án và Giải thích.`);
  }
  if (options.flashcardCount > 0) {
    parts.push(`- ${options.flashcardCount} flashcard với Mặt trước và Mặt sau.`);
  }
  if (options.shortAnswerCount > 0) {
    parts.push(`- ${options.shortAnswerCount} câu hỏi ngắn với Đáp án.`);
  }
  return parts.join('\n');
}

export function buildManualAiQuizPrompt(options = {}) {
  const normalizedOptions = normalizeManualAiPromptOptions(options);
  const normalizedSource = normalizePromptSourceText(options.sourceText || '');
  const warnings = getManualAiPromptWarnings({ ...normalizedOptions, sourceText: options.sourceText });

  if (warnings.some(warning => warning.code === 'missing_source_text' || warning.code === 'no_requested_items')) {
    return {
      ok: false,
      prompt: '',
      warnings,
      metadata: {
        sourceCharacters: normalizedSource.usedLength,
        truncated: normalizedSource.truncated
      }
    };
  }

  const languageInstruction = normalizedOptions.languageMode === 'vi'
    ? 'Viết toàn bộ bản nháp bằng tiếng Việt tự nhiên.'
    : 'Giữ ngôn ngữ chính của nội dung nguồn. Nếu nguồn là tiếng Việt, hãy viết tiếng Việt.';

  const prompt = `Bạn là trợ lý tạo bản nháp quiz cho Shime Quiz.\n\nYêu cầu an toàn và độ chính xác:\n- Chỉ sử dụng nội dung nguồn được cung cấp bên dưới.\n- Không bịa thêm dữ kiện, số liệu, tên riêng hoặc khái niệm không có trong nguồn.\n- Nếu nguồn không đủ thông tin, hãy tạo ít câu hơn thay vì suy đoán.\n- Câu hỏi phải rõ ràng, ngắn gọn, không trùng lặp.\n- Tránh đáp án nhiễu vô lý; tránh lựa chọn trùng nội dung hoặc trùng nhãn.\n- Giải thích chỉ dựa trên nội dung nguồn.\n- ${languageInstruction}\n\nHãy trả về đúng định dạng văn bản/Markdown thân thiện với Shime, không trả JSON, không thêm lời bình ngoài bản nháp.\n\nĐịnh dạng cần dùng:\nMôn: <tên môn học phù hợp với nguồn>\nChủ đề: <tên chủ đề phù hợp với nguồn>\n\nCâu hỏi: <nội dung câu hỏi trắc nghiệm>\nA. <lựa chọn A>\nB. <lựa chọn B>\nC. <lựa chọn C>\nD. <lựa chọn D>\nĐáp án: <A/B/C/D hoặc nội dung đáp án đúng>\nGiải thích: <giải thích ngắn dựa trên nguồn>\n\nFlashcard:\nMặt trước: <câu hỏi/khái niệm>\nMặt sau: <câu trả lời ngắn>\n\nCâu hỏi ngắn: <câu hỏi>\nĐáp án: <đáp án ngắn>\n\nSố lượng mong muốn:\n${buildOutputRequirements(normalizedOptions)}\n\nNội dung nguồn:\n---\n${normalizedSource.text}\n---\n\nChỉ trả về bản nháp quiz theo định dạng trên.`;

  return {
    ok: true,
    prompt,
    warnings,
    metadata: {
      sourceCharacters: normalizedSource.usedLength,
      originalSourceCharacters: normalizedSource.originalLength,
      truncated: normalizedSource.truncated,
      ...normalizedOptions
    }
  };
}
