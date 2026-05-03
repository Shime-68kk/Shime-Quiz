import { ITEM_TYPES } from './learningDataAdapter.js';
import { validateLearningDataImport } from './importValidator.js';
import { hashString } from '../utils/hash.js';

const CHOICE_SPLIT_PATTERN = /\r?\n|\|/;
const TAG_SPLIT_PATTERN = /\r?\n|\||,|;/;
const DEFAULT_SUBJECT_TITLE = 'Chưa phân loại';
const DEFAULT_TOPIC_TITLE = 'Tổng quan';

const HEADER_ALIASES = new Map([
  ['id', 'id'],
  ['itemid', 'id'],
  ['questionid', 'id'],
  ['subject', 'subject'],
  ['subjectname', 'subject'],
  ['subjecttitle', 'subject'],
  ['subjectid', 'subjectId'],
  ['topic', 'topic'],
  ['chapter', 'topic'],
  ['topictitle', 'topic'],
  ['topicname', 'topic'],
  ['topicid', 'topicId'],
  ['type', 'type'],
  ['itemtype', 'type'],
  ['prompt', 'prompt'],
  ['question', 'prompt'],
  ['front', 'front'],
  ['back', 'back'],
  ['choices', 'choices'],
  ['options', 'choices'],
  ['answers', 'choices'],
  ['correctanswer', 'correctAnswer'],
  ['correct', 'correctAnswer'],
  ['answer', 'answer'],
  ['acceptableanswers', 'acceptableAnswers'],
  ['explanation', 'explanation'],
  ['tags', 'tags'],
  ['difficulty', 'difficulty'],
  ['source', 'source']
]);

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function compactWhitespace(value) {
  return cleanString(value).replace(/\s+/g, ' ');
}

function normalizeHeader(header) {
  const key = cleanString(header)
    .toLowerCase()
    .replace(/[\s_\-.]+/g, '')
    .replace(/[^a-z0-9]/g, '');
  return HEADER_ALIASES.get(key) || key;
}

function normalizeType(value) {
  const key = cleanString(value)
    .toLowerCase()
    .replace(/[\s\-]+/g, '_');

  if (['mcq', 'multiple_choice', 'multiplechoice', 'multiple_choices', 'trac_nghiem', 'trắc_nghiệm'].includes(key)) {
    return ITEM_TYPES.MULTIPLE_CHOICE;
  }
  if (['short', 'short_answer', 'shortanswer', 'text', 'tra_loi_ngan', 'trả_lời_ngắn'].includes(key)) {
    return ITEM_TYPES.SHORT_ANSWER;
  }
  if (['flashcard', 'flash_card', 'card', 'the_nho', 'thẻ_nhớ'].includes(key)) {
    return ITEM_TYPES.FLASHCARD;
  }

  return cleanString(value);
}

function slugify(value, fallback) {
  const source = compactWhitespace(value) || fallback;
  return source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || hashString(source);
}

function splitList(value, pattern) {
  const text = cleanString(value);
  if (!text) return [];

  if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('"[') && text.endsWith(']"'))) {
    try {
      const parsed = JSON.parse(text.replace(/^"|"$/g, ''));
      if (Array.isArray(parsed)) return parsed.map(compactWhitespace).filter(Boolean);
    } catch {
      // Fall back to delimiter parsing below.
    }
  }

  return text.split(pattern).map(compactWhitespace).filter(Boolean);
}

function parseCsvRows(text) {
  const rows = [];
  const warnings = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let line = 1;
  let fieldStartLine = 1;

  const source = String(text || '').replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
        if (char === '\n') line += 1;
      }
      continue;
    }

    if (char === '"' && field.length === 0) {
      inQuotes = true;
      fieldStartLine = line;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      fieldStartLine = line;
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      line += 1;
      fieldStartLine = line;
      continue;
    }

    if (char === '\r') {
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    warnings.push({
      code: 'csv_unclosed_quote',
      message: `CSV có dấu nháy chưa đóng bắt đầu ở dòng ${fieldStartLine}. Parser đã cố đọc phần còn lại của file.`,
      path: `line ${fieldStartLine}`
    });
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return { rows, warnings };
}

function rowToObject(headers, row, index, warnings) {
  const record = {};
  headers.forEach((header, columnIndex) => {
    if (!header) return;
    const value = cleanString(row[columnIndex] ?? '');
    if (value) record[header] = value;
  });

  if (row.length > headers.length) {
    warnings.push({
      code: 'csv_extra_columns',
      message: `Dòng ${index + 2} có nhiều cột hơn header; các cột dư được bỏ qua.`,
      path: `rows[${index}]`
    });
  }

  return record;
}

function buildMappedLearningData(records, warnings) {
  const subjectsByKey = new Map();
  const topicsByKey = new Map();
  const items = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const subjectTitle = compactWhitespace(record.subject) || DEFAULT_SUBJECT_TITLE;
    const subjectId = compactWhitespace(record.subjectId) || `subject:${slugify(subjectTitle, 'subject')}`;
    const topicTitle = compactWhitespace(record.topic) || DEFAULT_TOPIC_TITLE;
    const topicId = compactWhitespace(record.topicId) || `topic:${slugify(`${subjectId}-${topicTitle}`, 'topic')}`;
    const type = normalizeType(record.type);
    const prompt = compactWhitespace(record.prompt || record.front);
    const answer = compactWhitespace(record.answer || record.back);
    const correctAnswer = compactWhitespace(record.correctAnswer || record.answer || record.back);
    const choices = splitList(record.choices, CHOICE_SPLIT_PATTERN);
    const itemId = compactWhitespace(record.id) || `item:${hashString(`${subjectId}|${topicId}|${type}|${prompt}|${correctAnswer || answer}|${rowNumber}`)}`;

    if (!subjectsByKey.has(subjectId)) {
      subjectsByKey.set(subjectId, {
        id: subjectId,
        title: subjectTitle,
        description: `Nạp từ CSV${record.source ? `: ${record.source}` : ''}`
      });
    }

    if (!topicsByKey.has(topicId)) {
      topicsByKey.set(topicId, {
        id: topicId,
        subjectId,
        title: topicTitle
      });
    }

    if (!record.subject) {
      warnings.push({
        code: 'csv_subject_defaulted',
        message: `Dòng ${rowNumber} thiếu subject; đã dùng "${DEFAULT_SUBJECT_TITLE}".`,
        path: `rows[${index}].subject`
      });
    }

    if (!record.topic) {
      warnings.push({
        code: 'csv_topic_defaulted',
        message: `Dòng ${rowNumber} thiếu topic; đã dùng "${DEFAULT_TOPIC_TITLE}".`,
        path: `rows[${index}].topic`
      });
    }

    const item = {
      id: itemId,
      type,
      subjectId,
      topicId,
      prompt,
      choices,
      correctAnswer,
      answer: answer || correctAnswer,
      explanation: compactWhitespace(record.explanation) || undefined,
      tags: splitList(record.tags, TAG_SPLIT_PATTERN),
      difficulty: compactWhitespace(record.difficulty) || undefined,
      source: compactWhitespace(record.source) || 'Nạp CSV'
    };

    if (record.acceptableAnswers) {
      item.acceptableAnswers = splitList(record.acceptableAnswers, TAG_SPLIT_PATTERN);
    }

    if (type === ITEM_TYPES.FLASHCARD) {
      item.front = compactWhitespace(record.front || record.prompt) || undefined;
      item.back = compactWhitespace(record.back || record.answer || record.correctAnswer) || undefined;
      if (!item.correctAnswer && item.back) item.correctAnswer = item.back;
      if (!item.answer && item.back) item.answer = item.back;
    }

    items.push(item);
  });

  return {
    version: 'v2-csv-import-preview',
    subjects: Array.from(subjectsByKey.values()),
    topics: Array.from(topicsByKey.values()),
    items
  };
}

export function parseCsvImport(text) {
  const errors = [];
  const warnings = [];
  const { rows, warnings: parseWarnings } = parseCsvRows(text);
  warnings.push(...parseWarnings);

  const nonEmptyRows = rows.filter(row => row.some(cell => cleanString(cell)));
  if (!nonEmptyRows.length) {
    return {
      ok: false,
      rawData: { subjects: [], topics: [], items: [] },
      rowsParsed: 0,
      headers: [],
      validation: {
        ok: false,
        canImport: false,
        errors: [{ code: 'csv_empty', message: 'CSV không có dữ liệu.', path: '$' }],
        warnings,
        summary: {
          subjectCount: 0,
          topicCount: 0,
          itemCount: 0,
          validSubjects: 0,
          validTopics: 0,
          validItems: 0,
          itemTypeCounts: {},
          sampleItems: []
        },
        normalizedData: { version: 'v2-csv-import-preview', subjects: [], topics: [], items: [] }
      }
    };
  }

  const originalHeaders = nonEmptyRows[0].map(cleanString);
  const headers = originalHeaders.map(normalizeHeader);

  if (!headers.some(Boolean)) {
    errors.push({ code: 'csv_headers_required', message: 'CSV cần dòng header.', path: 'headers' });
  }

  const seenHeaders = new Map();
  headers.forEach(header => {
    if (!header) return;
    seenHeaders.set(header, (seenHeaders.get(header) || 0) + 1);
  });
  seenHeaders.forEach((count, header) => {
    if (count > 1) {
      warnings.push({ code: 'csv_duplicate_header', message: `Header bị trùng sau khi normalize: ${header}.`, path: 'headers' });
    }
  });

  const records = nonEmptyRows.slice(1).map((row, index) => rowToObject(headers, row, index, warnings));
  if (!records.length) {
    errors.push({ code: 'csv_rows_required', message: 'CSV cần ít nhất một dòng dữ liệu sau header.', path: 'rows' });
  }

  const rawData = buildMappedLearningData(records, warnings);
  const validation = validateLearningDataImport(rawData);
  validation.errors = [...errors, ...validation.errors];
  validation.warnings = [...warnings, ...validation.warnings];
  validation.ok = validation.errors.length === 0;
  validation.canImport = validation.errors.length === 0;

  return {
    ok: validation.ok,
    rawData,
    rowsParsed: records.length,
    headers: originalHeaders,
    normalizedHeaders: headers,
    validation
  };
}
