/**
 * src/edugen/edugenDraftParser.js
 *
 * Phase 16G — EduGen Draft Review Import Flow (Scope B: manual draft paste).
 *
 * Pure parser/normalizer for EduGen-shaped draft JSON pasted by the user.
 *
 * Identity boundary (per Phase 16D / 16F / 16G):
 *   • Shime is local-first. EduGen is an optional companion service run by
 *     the user. EduGen is NOT bundled inside Shime Quiz.
 *   • This module performs NO document extraction, NO AI call, NO OCR.
 *   • This module performs NO network I/O at all.
 *   • This module performs NO storage write. It only parses/validates the
 *     pasted text and returns a draft preview shape.
 *   • Items produced here are DRAFTS that must be reviewed by the user
 *     before any explicit save. They are NEVER auto-imported into study,
 *     NEVER auto-enrolled into FSRS, and NEVER alter the scheduler.
 *
 * Public API:
 *   parseEdugenDraftJson(input, options): {
 *     ok, summary, items, invalid, error
 *   }
 *
 * Accepted input shapes (after JSON.parse):
 *   { "items": [ { "question": "...", "answer": "...", "source": "..." } ] }
 *   [ { "question": "...", "answer": "...", "source": "..." } ]
 *
 * Bounded guardrails (Phase 16C large-import safety):
 *   • Hard cap of MAX_DRAFT_ITEMS items per pasted draft.
 *   • Hard cap of MAX_FIELD_LENGTH chars per field.
 *   • Empty/whitespace-only question or answer is invalid.
 *   • Source name preserved only if it is a safe short string.
 *
 * Returned shape (review-required, never auto-saved):
 *   {
 *     ok: boolean,
 *     summary: { totalSubmitted, validCount, invalidCount,
 *                totalCharacters, truncated, sourceName, importedAt },
 *     items: [{ id, question, answer, sourceMetadata: {
 *       sourceType, sourceName, importedAt, processor, reviewRequired
 *     }}],
 *     invalid: [{ index, reason }],
 *     error: string | null
 *   }
 */

export const MAX_DRAFT_ITEMS = 50;
export const MAX_FIELD_LENGTH = 1000;
export const MAX_SOURCE_NAME_LENGTH = 120;

export const EDUGEN_DRAFT_PROCESSOR = 'edugen';
export const EDUGEN_DRAFT_SOURCE_TYPE = 'edugen-draft';

export const EDUGEN_DRAFT_ERROR_CODES = Object.freeze({
  EMPTY: 'empty_input',
  INVALID_JSON: 'invalid_json',
  UNSUPPORTED_SHAPE: 'unsupported_shape',
  TOO_MANY_ITEMS: 'too_many_items',
  NO_VALID_ITEMS: 'no_valid_items'
});

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Reject ASCII control characters (0x00-0x1F and 0x7F) except tab/LF/CR.
// Stray terminal escape sequences should never reach the draft preview UI.
function containsControlChar(text) {
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code === 0x09 || code === 0x0a || code === 0x0d) continue;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

function isSafeShortString(value, maxLength) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > maxLength) return false;
  if (containsControlChar(trimmed)) return false;
  return true;
}

function normalizeSourceName(rawSource, fallback) {
  const candidate = cleanString(rawSource);
  if (candidate && isSafeShortString(candidate, MAX_SOURCE_NAME_LENGTH)) {
    return candidate;
  }
  const fb = cleanString(fallback);
  if (fb && isSafeShortString(fb, MAX_SOURCE_NAME_LENGTH)) return fb;
  return '';
}

function safeNowIso(options) {
  if (options && typeof options.now === 'function') {
    try {
      const value = options.now();
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString();
      }
      if (typeof value === 'string' && value.trim()) return value.trim();
    } catch { /* fall through */ }
  }
  try {
    return new Date().toISOString();
  } catch {
    return '';
  }
}

function buildResult(ok, { items, invalid, summary, error }) {
  return {
    ok,
    summary,
    items: Array.isArray(items) ? items : [],
    invalid: Array.isArray(invalid) ? invalid : [],
    error: error || null
  };
}

function emptySummary({ sourceName = '', importedAt = '' } = {}) {
  return {
    totalSubmitted: 0,
    validCount: 0,
    invalidCount: 0,
    totalCharacters: 0,
    truncated: false,
    sourceName,
    importedAt
  };
}

function extractItemsArray(parsed) {
  if (Array.isArray(parsed)) return { items: parsed, shape: 'array' };
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
    return { items: parsed.items, shape: 'object' };
  }
  return { items: null, shape: 'unsupported' };
}

function safeId(index) {
  // Stable per-paste id; not a persistence key. The save flow assigns its
  // own ids when the user explicitly confirms.
  return `edugen-draft-${index + 1}`;
}

/**
 * Parse and validate an EduGen-shaped draft JSON string.
 *
 * Never throws. Never performs I/O. Returns a result shape that callers
 * can render directly in a review panel.
 *
 * @param {string} input
 * @param {object} [options]
 * @param {string} [options.sourceName] — optional fallback source label
 * @param {() => Date|string} [options.now] — injectable clock for tests
 */
export function parseEdugenDraftJson(input, options = {}) {
  const rawText = typeof input === 'string' ? input : '';
  const text = rawText.trim();

  if (!text) {
    return buildResult(false, {
      items: [],
      invalid: [],
      summary: emptySummary(),
      error: EDUGEN_DRAFT_ERROR_CODES.EMPTY
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return buildResult(false, {
      items: [],
      invalid: [],
      summary: emptySummary(),
      error: EDUGEN_DRAFT_ERROR_CODES.INVALID_JSON
    });
  }

  const { items: rawItems, shape } = extractItemsArray(parsed);
  if (!rawItems || shape === 'unsupported') {
    return buildResult(false, {
      items: [],
      invalid: [],
      summary: emptySummary(),
      error: EDUGEN_DRAFT_ERROR_CODES.UNSUPPORTED_SHAPE
    });
  }

  if (rawItems.length > MAX_DRAFT_ITEMS) {
    return buildResult(false, {
      items: [],
      invalid: [],
      summary: {
        ...emptySummary(),
        totalSubmitted: rawItems.length,
        truncated: true
      },
      error: EDUGEN_DRAFT_ERROR_CODES.TOO_MANY_ITEMS
    });
  }

  const importedAt = safeNowIso(options);
  const fallbackSourceName = cleanString(options.sourceName);

  const validItems = [];
  const invalidItems = [];
  let totalCharacters = 0;

  rawItems.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      invalidItems.push({ index, reason: 'invalid_item_shape' });
      return;
    }

    const question = cleanString(entry.question);
    const answer = cleanString(entry.answer);

    if (!question) {
      invalidItems.push({ index, reason: 'empty_question' });
      return;
    }
    if (!answer) {
      invalidItems.push({ index, reason: 'empty_answer' });
      return;
    }
    if (question.length > MAX_FIELD_LENGTH) {
      invalidItems.push({ index, reason: 'question_too_long' });
      return;
    }
    if (answer.length > MAX_FIELD_LENGTH) {
      invalidItems.push({ index, reason: 'answer_too_long' });
      return;
    }

    const sourceName = normalizeSourceName(entry.source, fallbackSourceName);

    validItems.push({
      id: safeId(index),
      question,
      answer,
      sourceMetadata: {
        sourceType: EDUGEN_DRAFT_SOURCE_TYPE,
        sourceName,
        importedAt,
        processor: EDUGEN_DRAFT_PROCESSOR,
        reviewRequired: true
      }
    });

    totalCharacters += question.length + answer.length;
  });

  const summary = {
    totalSubmitted: rawItems.length,
    validCount: validItems.length,
    invalidCount: invalidItems.length,
    totalCharacters,
    truncated: false,
    sourceName: fallbackSourceName,
    importedAt
  };

  if (validItems.length === 0) {
    return buildResult(false, {
      items: [],
      invalid: invalidItems,
      summary,
      error: EDUGEN_DRAFT_ERROR_CODES.NO_VALID_ITEMS
    });
  }

  return buildResult(true, {
    items: validItems,
    invalid: invalidItems,
    summary,
    error: null
  });
}

/**
 * Human-readable Vietnamese-first explanation for a parser error code.
 * The UI may use this directly. Each message is claim-safe (no AI/OCR/cloud
 * claims) and emphasizes that drafts must be reviewed before saving.
 */
export function describeEdugenDraftError(code) {
  switch (code) {
    case EDUGEN_DRAFT_ERROR_CODES.EMPTY:
      return 'Chưa có nội dung bản nháp. Hãy dán JSON xuất từ EduGen rồi thử lại.';
    case EDUGEN_DRAFT_ERROR_CODES.INVALID_JSON:
      return 'Nội dung không phải JSON hợp lệ. Hãy kiểm tra lại bản nháp xuất từ EduGen.';
    case EDUGEN_DRAFT_ERROR_CODES.UNSUPPORTED_SHAPE:
      return 'Định dạng bản nháp chưa được hỗ trợ. Cần một mảng "items" hoặc danh sách câu hỏi/đáp án.';
    case EDUGEN_DRAFT_ERROR_CODES.TOO_MANY_ITEMS:
      return `Bản nháp vượt quá giới hạn ${MAX_DRAFT_ITEMS} mục. Hãy chia nhỏ trước khi xem lại.`;
    case EDUGEN_DRAFT_ERROR_CODES.NO_VALID_ITEMS:
      return 'Không có câu hỏi/đáp án hợp lệ trong bản nháp. Hãy chỉnh lại trước khi xem lại.';
    default:
      return 'Không xử lý được bản nháp EduGen. Hãy thử lại.';
  }
}

/**
 * Human-readable Vietnamese-first reason for an invalid item entry.
 */
export function describeEdugenDraftInvalidReason(reason) {
  switch (reason) {
    case 'empty_question':
      return 'Thiếu câu hỏi.';
    case 'empty_answer':
      return 'Thiếu đáp án.';
    case 'question_too_long':
      return `Câu hỏi dài hơn ${MAX_FIELD_LENGTH} ký tự.`;
    case 'answer_too_long':
      return `Đáp án dài hơn ${MAX_FIELD_LENGTH} ký tự.`;
    case 'invalid_item_shape':
      return 'Mục không đúng định dạng câu hỏi/đáp án.';
    default:
      return 'Mục không hợp lệ.';
  }
}
