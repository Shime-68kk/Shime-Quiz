/**
 * src/edugen/edugenDraftImport.js
 *
 * Phase 16H — EduGen Draft Quality Review UX / Source-Aware Library Polish.
 *
 * Pure helper that converts reviewed EduGen draft items (produced by
 * `parseEdugenDraftJson` in src/edugen/edugenDraftParser.js) into a shape
 * the existing v2 library can accept, then merges them into a library raw
 * data object so the caller can pass the merged object to
 * `setLearningData()`.
 *
 * Identity boundary (per Phase 16D / 16F / 16G):
 *   • Shime is local-first. EduGen is an optional companion service.
 *   • This module performs NO document extraction, NO AI call, NO OCR.
 *   • This module performs NO network I/O at all.
 *   • This module performs NO storage write directly. It only returns a
 *     merged raw-data object. The caller (Settings.jsx) is responsible
 *     for persisting via the existing library import path.
 *   • Imported items are flashcards with sourceMetadata.reviewRequired = true.
 *   • Imported items are NEVER auto-enrolled into FSRS, NEVER alter the
 *     scheduler, and NEVER overwrite study progress for existing items.
 *
 * Public API:
 *   prepareEdugenDraftLibraryImport({ draftItems, currentRawData, summary, now })
 *     → {
 *         ok: boolean,
 *         mergedRawData: object | null,
 *         addedItems: array,
 *         duplicateItems: array,
 *         subjectId: string,
 *         topicId: string,
 *         error: string | null,
 *         summary: { addedCount, duplicateCount, totalProposed }
 *       }
 *
 * Bounded guardrails (Phase 16C large-import safety):
 *   • Imports only what the caller already validated via the Phase 16G
 *     parser; this helper does not loosen the parser caps.
 *   • Deduplicates by normalized question+answer against existing items
 *     in the library (so re-pasting the same draft cannot silently
 *     overwrite or double-insert).
 *   • Always assigns a fresh stable item id; never reuses or replaces
 *     an existing item id.
 */

const DEFAULT_SUBJECT_ID = 'edugen-drafts';
const DEFAULT_SUBJECT_TITLE = 'Bản nháp EduGen';
const DEFAULT_SUBJECT_DESCRIPTION =
  'Bản nháp EduGen cần xem lại — Shime không tự lưu, không tự kích hoạt xếp lịch ghi nhớ.';
const DEFAULT_TOPIC_ID = 'edugen-drafts-review';
const DEFAULT_TOPIC_TITLE = 'Bản nháp cần xem lại';
const DEFAULT_TOPIC_DESCRIPTION =
  'Thẻ EduGen do người dùng dán và xác nhận. Cần đọc lại trước khi dùng để học.';

const REVIEW_REQUIRED_TAG = 'bản-nháp-cần-xem-lại';
const SOURCE_TAG = 'nguồn:edugen';

const EDUGEN_DRAFT_SOURCE_TYPE = 'edugen-draft';
const EDUGEN_DRAFT_PROCESSOR = 'edugen';

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function dedupeKey(question, answer) {
  return `${cleanString(question).toLowerCase()}|${cleanString(answer).toLowerCase()}`;
}

function nowIso(options) {
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

function makeItemId(importedAt, index) {
  // Stable per-import id. Index breaks ties when multiple items share
  // the same importedAt timestamp. Uses no library lookups so the id is
  // deterministic given the inputs.
  const tsPart = (importedAt || '').replace(/[^0-9]/g, '').slice(0, 14) || '0';
  return `edugen-draft-${tsPart}-${String(index + 1).padStart(2, '0')}`;
}

function buildExistingItemIndex(items) {
  const byKey = new Map();
  const byId = new Set();
  for (const item of asArray(items)) {
    if (!isPlainObject(item)) continue;
    if (cleanString(item.id)) byId.add(cleanString(item.id));
    const prompt = cleanString(item.prompt ?? item.question ?? item.front);
    const answer = cleanString(item.correctAnswer ?? item.answer ?? item.back);
    if (prompt && answer) {
      byKey.set(dedupeKey(prompt, answer), cleanString(item.id) || '');
    }
  }
  return { byKey, byId };
}

function ensureSubject(subjects, options) {
  const targetId = cleanString(options.subjectId) || DEFAULT_SUBJECT_ID;
  for (const subject of asArray(subjects)) {
    if (isPlainObject(subject) && cleanString(subject.id) === targetId) {
      return { subjects, subjectId: targetId, created: false };
    }
  }
  const nextSubjects = [
    ...asArray(subjects),
    {
      id: targetId,
      title: cleanString(options.subjectTitle) || DEFAULT_SUBJECT_TITLE,
      description: cleanString(options.subjectDescription) || DEFAULT_SUBJECT_DESCRIPTION
    }
  ];
  return { subjects: nextSubjects, subjectId: targetId, created: true };
}

function ensureTopic(topics, subjectId, options) {
  const targetId = cleanString(options.topicId) || DEFAULT_TOPIC_ID;
  for (const topic of asArray(topics)) {
    if (isPlainObject(topic) && cleanString(topic.id) === targetId && cleanString(topic.subjectId) === subjectId) {
      return { topics, topicId: targetId, created: false };
    }
  }
  const nextTopics = [
    ...asArray(topics),
    {
      id: targetId,
      subjectId,
      title: cleanString(options.topicTitle) || DEFAULT_TOPIC_TITLE,
      description: cleanString(options.topicDescription) || DEFAULT_TOPIC_DESCRIPTION
    }
  ];
  return { topics: nextTopics, topicId: targetId, created: true };
}

function normalizeSourceMetadata(draftItem, summary, importedAt) {
  const draftMeta = isPlainObject(draftItem.sourceMetadata) ? draftItem.sourceMetadata : null;
  const sourceName = cleanString(draftMeta?.sourceName) || cleanString(summary?.sourceName);
  return {
    sourceType: EDUGEN_DRAFT_SOURCE_TYPE,
    sourceName,
    importedAt: cleanString(draftMeta?.importedAt) || importedAt,
    processor: EDUGEN_DRAFT_PROCESSOR,
    reviewRequired: true
  };
}

function buildLibraryItem(draftItem, { subjectId, topicId, summary, importedAt, index }) {
  const question = cleanString(draftItem.question);
  const answer = cleanString(draftItem.answer);
  if (!question || !answer) return null;

  const sourceMetadata = normalizeSourceMetadata(draftItem, summary, importedAt);

  return {
    id: makeItemId(importedAt, index),
    type: 'flashcard',
    subjectId,
    topicId,
    prompt: question,
    answer,
    correctAnswer: answer,
    back: answer,
    front: question,
    tags: [REVIEW_REQUIRED_TAG, SOURCE_TAG],
    source: sourceMetadata.sourceName || 'EduGen draft',
    sourceMetadata
  };
}

function emptyResult(error) {
  return {
    ok: false,
    mergedRawData: null,
    addedItems: [],
    duplicateItems: [],
    subjectId: '',
    topicId: '',
    error: error || 'unknown',
    summary: { addedCount: 0, duplicateCount: 0, totalProposed: 0 }
  };
}

/**
 * Validate that incoming sourceMetadata is shaped safely. Unknown keys are
 * dropped, oversized strings are rejected (returns false). Existing items
 * with malformed metadata can safely keep no metadata.
 *
 * Exported so callers (e.g. library polish chips) can decide whether to
 * render a "Bản nháp cần xem lại" badge.
 */
export function isSafeEdugenSourceMetadata(value) {
  if (!isPlainObject(value)) return false;
  const sourceType = cleanString(value.sourceType);
  if (sourceType !== EDUGEN_DRAFT_SOURCE_TYPE) return false;
  if (value.reviewRequired !== true) return false;
  const processor = cleanString(value.processor);
  if (processor && processor !== EDUGEN_DRAFT_PROCESSOR) return false;
  const sourceName = typeof value.sourceName === 'string' ? value.sourceName : '';
  if (sourceName.length > 240) return false;
  const importedAt = typeof value.importedAt === 'string' ? value.importedAt : '';
  if (importedAt.length > 64) return false;
  return true;
}

/**
 * Prepare a library import payload from reviewed EduGen draft items.
 *
 * @param {object} input
 * @param {Array}  input.draftItems    — items[] from parseEdugenDraftJson
 * @param {object} input.currentRawData — current library raw data
 * @param {object} [input.summary]     — summary from parseEdugenDraftJson
 * @param {string} [input.subjectId]
 * @param {string} [input.subjectTitle]
 * @param {string} [input.topicId]
 * @param {string} [input.topicTitle]
 * @param {() => Date|string} [input.now]
 *
 * @returns {object} bounded result; see file header.
 */
export function prepareEdugenDraftLibraryImport(input = {}) {
  const {
    draftItems,
    currentRawData,
    summary,
    subjectId,
    subjectTitle,
    topicId,
    topicTitle
  } = input || {};

  if (!Array.isArray(draftItems) || draftItems.length === 0) {
    return emptyResult('empty_draft');
  }

  const baseRaw = isPlainObject(currentRawData) ? currentRawData : {};
  const importedAt = nowIso(input);
  const existing = buildExistingItemIndex(baseRaw.items);

  const subjectResult = ensureSubject(baseRaw.subjects, {
    subjectId,
    subjectTitle
  });
  const topicResult = ensureTopic(baseRaw.topics, subjectResult.subjectId, {
    topicId,
    topicTitle
  });

  const addedItems = [];
  const duplicateItems = [];
  const seenInBatch = new Set();

  draftItems.forEach((entry, index) => {
    if (!isPlainObject(entry)) return;
    const question = cleanString(entry.question);
    const answer = cleanString(entry.answer);
    if (!question || !answer) return;

    const key = dedupeKey(question, answer);
    if (existing.byKey.has(key) || seenInBatch.has(key)) {
      duplicateItems.push({
        index,
        question,
        answer,
        existingItemId: existing.byKey.get(key) || ''
      });
      return;
    }

    const libraryItem = buildLibraryItem(entry, {
      subjectId: subjectResult.subjectId,
      topicId: topicResult.topicId,
      summary,
      importedAt,
      index
    });
    if (!libraryItem) return;

    addedItems.push(libraryItem);
    seenInBatch.add(key);
  });

  if (addedItems.length === 0) {
    return {
      ok: false,
      mergedRawData: null,
      addedItems: [],
      duplicateItems,
      subjectId: subjectResult.subjectId,
      topicId: topicResult.topicId,
      error: duplicateItems.length ? 'all_duplicates' : 'no_valid_items',
      summary: {
        addedCount: 0,
        duplicateCount: duplicateItems.length,
        totalProposed: draftItems.length
      }
    };
  }

  const mergedRawData = {
    ...baseRaw,
    subjects: subjectResult.subjects,
    topics: topicResult.topics,
    items: [...asArray(baseRaw.items), ...addedItems]
  };

  return {
    ok: true,
    mergedRawData,
    addedItems,
    duplicateItems,
    subjectId: subjectResult.subjectId,
    topicId: topicResult.topicId,
    error: null,
    summary: {
      addedCount: addedItems.length,
      duplicateCount: duplicateItems.length,
      totalProposed: draftItems.length
    }
  };
}

export {
  DEFAULT_SUBJECT_ID as EDUGEN_DRAFT_LIBRARY_SUBJECT_ID,
  DEFAULT_SUBJECT_TITLE as EDUGEN_DRAFT_LIBRARY_SUBJECT_TITLE,
  DEFAULT_TOPIC_ID as EDUGEN_DRAFT_LIBRARY_TOPIC_ID,
  DEFAULT_TOPIC_TITLE as EDUGEN_DRAFT_LIBRARY_TOPIC_TITLE,
  REVIEW_REQUIRED_TAG as EDUGEN_DRAFT_REVIEW_REQUIRED_TAG,
  SOURCE_TAG as EDUGEN_DRAFT_SOURCE_TAG
};
