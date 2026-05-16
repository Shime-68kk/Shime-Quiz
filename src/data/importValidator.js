import { z } from 'zod';
import { ITEM_TYPES, normalizeLearningData } from './learningDataAdapter.js';

const VALID_ITEM_TYPES = new Set(Object.values(ITEM_TYPES));
const MAX_SAMPLE_ITEMS = 5;

const V2ChoiceSchema = z.union([
  z.string(),
  z.object({
    id: z.string().optional(),
    text: z.string().optional(),
    label: z.string().optional(),
    value: z.string().optional()
  }).passthrough()
]);

const V2SubjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  courses: z.array(z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional()
  }).passthrough()).optional()
}).passthrough();

const V2TopicSchema = z.object({
  id: z.string().optional(),
  subjectId: z.string().optional(),
  courseId: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional()
}).passthrough();

// Phase 16H — declare optional `sourceMetadata` block on items so the
// schema acknowledges (and the passthrough preserves) source-aware
// attribution for items imported from EduGen drafts. Existing items
// without sourceMetadata continue to work unchanged.
const V2ItemSourceMetadataSchema = z.object({
  sourceType: z.string().optional(),
  sourceName: z.string().optional(),
  importedAt: z.string().optional(),
  processor: z.string().optional(),
  reviewRequired: z.boolean().optional()
}).passthrough();

const V2ItemSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  prompt: z.string().optional(),
  question: z.string().optional(),
  front: z.string().optional(),
  back: z.string().optional(),
  choices: z.array(V2ChoiceSchema).optional(),
  correctAnswer: z.string().optional(),
  answer: z.string().optional(),
  acceptableAnswers: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  sourceMetadata: V2ItemSourceMetadataSchema.optional()
}).passthrough();

const V2ImportSchema = z.object({
  subjects: z.array(V2SubjectSchema),
  topics: z.array(V2TopicSchema),
  items: z.array(V2ItemSchema)
}).passthrough();

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pushIssue(target, code, message, path) {
  target.push({ code, message, path });
}

function pathToString(path) {
  if (!Array.isArray(path) || !path.length) return '$';
  return path.reduce((parts, segment) => {
    if (typeof segment === 'number') return `${parts}[${segment}]`;
    return parts === '$' ? `${parts}.${segment}` : `${parts}.${segment}`;
  }, '$');
}

function formatZodExpected(issue) {
  if (issue.code === 'invalid_type') {
    return `kiểu dữ liệu không hợp lệ (cần ${issue.expected}, nhận ${issue.received}).`;
  }
  if (issue.code === 'invalid_union') {
    return 'kiểu dữ liệu không khớp với schema v2.';
  }
  return issue.message || 'dữ liệu không khớp với schema v2.';
}

function validateRuntimeSchema(data, errors) {
  const result = V2ImportSchema.safeParse(data);
  if (result.success) {
    return {
      ok: true,
      data: result.data,
      errors: []
    };
  }

  const schemaErrors = result.error.issues.map(issue => ({
    code: 'schema_invalid_type',
    message: `Schema v2 tại ${pathToString(issue.path)} có ${formatZodExpected(issue)}`,
    path: pathToString(issue.path)
  }));
  errors.push(...schemaErrors);

  return {
    ok: false,
    data,
    errors: schemaErrors
  };
}

function countBy(values, getKey) {
  return values.reduce((counts, value) => {
    const key = getKey(value);
    if (!key) return counts;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function addDuplicateWarnings(records, label, warnings) {
  const ids = records.map(record => cleanString(record?.id)).filter(Boolean);
  const counts = countBy(ids, id => id);

  Object.entries(counts).forEach(([id, count]) => {
    if (count > 1) {
      pushIssue(warnings, 'duplicate_id', `${label} có id trùng: ${id}.`, `${label}.${id}`);
    }
  });
}

function validateSubjects(rawSubjects, errors) {
  if (!Array.isArray(rawSubjects)) {
    pushIssue(errors, 'subjects_required', 'subjects phải là mảng.', 'subjects');
    return [];
  }

  rawSubjects.forEach((subject, index) => {
    if (!subject || typeof subject !== 'object' || Array.isArray(subject)) {
      pushIssue(errors, 'subject_invalid', `Subject #${index + 1} phải là object.`, `subjects[${index}]`);
      return;
    }

    if (!cleanString(subject.id)) {
      pushIssue(errors, 'subject_id_required', `Subject #${index + 1} thiếu id.`, `subjects[${index}].id`);
    }

    if (!cleanString(subject.title ?? subject.name)) {
      pushIssue(errors, 'subject_title_required', `Subject #${index + 1} thiếu title/name.`, `subjects[${index}].title`);
    }
  });

  return rawSubjects;
}

function validateTopics(rawTopics, subjectIds, errors, warnings) {
  if (!Array.isArray(rawTopics)) {
    pushIssue(errors, 'topics_required', 'topics phải là mảng.', 'topics');
    return [];
  }

  rawTopics.forEach((topic, index) => {
    if (!topic || typeof topic !== 'object' || Array.isArray(topic)) {
      pushIssue(errors, 'topic_invalid', `Topic #${index + 1} phải là object.`, `topics[${index}]`);
      return;
    }

    const id = cleanString(topic.id);
    const subjectId = cleanString(topic.subjectId);
    if (!id) pushIssue(errors, 'topic_id_required', `Topic #${index + 1} thiếu id.`, `topics[${index}].id`);
    if (!subjectId) pushIssue(errors, 'topic_subject_required', `Topic #${index + 1} thiếu subjectId.`, `topics[${index}].subjectId`);
    if (!cleanString(topic.title ?? topic.name)) {
      pushIssue(errors, 'topic_title_required', `Topic #${index + 1} thiếu title/name.`, `topics[${index}].title`);
    }
    if (subjectId && !subjectIds.has(subjectId)) {
      pushIssue(warnings, 'orphan_topic', `Topic ${id || `#${index + 1}`} tham chiếu subjectId không tồn tại: ${subjectId}.`, `topics[${index}].subjectId`);
    }
  });

  return rawTopics;
}

function hasShortAnswerValue(item) {
  return Boolean(cleanString(item.answer ?? item.correctAnswer)) || asArray(item.acceptableAnswers).some(cleanString);
}

function getChoiceText(choice) {
  if (typeof choice === 'string') return cleanString(choice);
  if (!choice || typeof choice !== 'object' || Array.isArray(choice)) return '';
  return cleanString(choice.text ?? choice.label ?? choice.value);
}

function getChoiceId(choice, index) {
  if (typeof choice === 'string') return String(index + 1);
  if (!choice || typeof choice !== 'object' || Array.isArray(choice)) return String(index + 1);
  return cleanString(choice.id) || String(index + 1);
}

function getValidChoicesWithIdentity(choices) {
  return asArray(choices)
    .map((choice, index) => {
      const text = getChoiceText(choice);
      if (!text) return null;
      return { id: getChoiceId(choice, index), text };
    })
    .filter(Boolean);
}

function validateItems(rawItems, subjectIds, topicIds, errors, warnings) {
  if (!Array.isArray(rawItems)) {
    pushIssue(errors, 'items_required', 'items phải là mảng.', 'items');
    return [];
  }

  rawItems.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(errors, 'item_invalid', `Item #${index + 1} phải là object.`, `items[${index}]`);
      return;
    }

    const id = cleanString(item.id);
    const type = cleanString(item.type);
    const subjectId = cleanString(item.subjectId);
    const topicId = cleanString(item.topicId);
    const prompt = cleanString(item.prompt ?? item.question ?? item.front);

    if (!id) pushIssue(errors, 'item_id_required', `Item #${index + 1} thiếu id.`, `items[${index}].id`);
    if (!type) {
      pushIssue(errors, 'item_type_required', `Item ${id || `#${index + 1}`} thiếu type.`, `items[${index}].type`);
    } else if (!VALID_ITEM_TYPES.has(type)) {
      pushIssue(errors, 'item_type_unknown', `Item ${id || `#${index + 1}`} có type chưa hỗ trợ: ${type}.`, `items[${index}].type`);
    }
    if (!prompt) pushIssue(errors, 'item_prompt_required', `Item ${id || `#${index + 1}`} thiếu prompt/question/front.`, `items[${index}].prompt`);
    if (!subjectId) pushIssue(errors, 'item_subject_required', `Item ${id || `#${index + 1}`} thiếu subjectId.`, `items[${index}].subjectId`);
    if (!topicId) pushIssue(errors, 'item_topic_required', `Item ${id || `#${index + 1}`} thiếu topicId.`, `items[${index}].topicId`);

    if (subjectId && !subjectIds.has(subjectId)) {
      pushIssue(warnings, 'orphan_item_subject', `Item ${id || `#${index + 1}`} tham chiếu subjectId không tồn tại: ${subjectId}.`, `items[${index}].subjectId`);
    }
    if (topicId && !topicIds.has(topicId)) {
      pushIssue(warnings, 'orphan_item_topic', `Item ${id || `#${index + 1}`} tham chiếu topicId không tồn tại: ${topicId}.`, `items[${index}].topicId`);
    }

    if (type === ITEM_TYPES.MULTIPLE_CHOICE) {
      const rawChoices = asArray(item.choices);
      const choices = getValidChoicesWithIdentity(item.choices);
      const malformedChoiceCount = rawChoices.length - choices.length;
      if (!choices.length) {
        pushIssue(errors, 'multiple_choice_choices_required', `Item ${id || `#${index + 1}`} cần choices.`, `items[${index}].choices`);
      }
      if (malformedChoiceCount > 0) {
        pushIssue(warnings, 'multiple_choice_choices_malformed', `Item ${id || `#${index + 1}`} có ${malformedChoiceCount} lựa chọn rỗng hoặc không hợp lệ đã bị bỏ qua.`, `items[${index}].choices`);
      }
      const correctAnswer = cleanString(item.correctAnswer);
      if (!correctAnswer) {
        pushIssue(errors, 'multiple_choice_answer_required', `Item ${id || `#${index + 1}`} cần correctAnswer.`, `items[${index}].correctAnswer`);
      } else if (choices.length && !choices.some(choice => choice.id === correctAnswer || choice.text === correctAnswer)) {
        pushIssue(errors, 'multiple_choice_answer_mismatch', `Item ${id || `#${index + 1}`} có correctAnswer không khớp id hoặc nội dung của choices.`, `items[${index}].correctAnswer`);
      }
    }

    if (type === ITEM_TYPES.SHORT_ANSWER && !hasShortAnswerValue(item)) {
      pushIssue(errors, 'short_answer_answer_required', `Item ${id || `#${index + 1}`} cần answer/correctAnswer hoặc acceptableAnswers.`, `items[${index}].answer`);
    }

    if (type === ITEM_TYPES.FLASHCARD) {
      const hasFrontBack = Boolean(cleanString(item.front) && cleanString(item.back));
      const hasPromptAnswer = Boolean(prompt && cleanString(item.answer ?? item.correctAnswer ?? item.back));
      if (!hasFrontBack && !hasPromptAnswer) {
        pushIssue(errors, 'flashcard_content_required', `Item ${id || `#${index + 1}`} cần front/back hoặc prompt/answer.`, `items[${index}]`);
      }
    }
  });

  return rawItems;
}

function summarizePreview(rawData) {
  const normalized = normalizeLearningData(rawData);
  const itemTypeCounts = normalized.items.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, {});

  return {
    subjectCount: asArray(rawData?.subjects).length,
    topicCount: asArray(rawData?.topics).length,
    itemCount: asArray(rawData?.items).length,
    validSubjects: normalized.subjects.length,
    validTopics: normalized.topics.length,
    validItems: normalized.items.length,
    itemTypeCounts,
    sampleItems: normalized.items.slice(0, MAX_SAMPLE_ITEMS)
  };
}

export function validateLearningDataImport(rawData) {
  const errors = [];
  const warnings = [];
  const data = rawData && typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {};

  if (data !== rawData) {
    pushIssue(errors, 'root_object_required', 'File JSON phải là object chứa subjects, topics và items.', '$');
  }

  const schemaResult = validateRuntimeSchema(data, errors);

  const subjects = validateSubjects(data.subjects, errors);
  addDuplicateWarnings(subjects, 'subjects', warnings);
  const subjectIds = new Set(subjects.map(subject => cleanString(subject?.id)).filter(Boolean));

  const topics = validateTopics(data.topics, subjectIds, errors, warnings);
  addDuplicateWarnings(topics, 'topics', warnings);
  const topicIds = new Set(topics.map(topic => cleanString(topic?.id)).filter(Boolean));

  const items = validateItems(data.items, subjectIds, topicIds, errors, warnings);
  addDuplicateWarnings(items, 'items', warnings);

  const summary = summarizePreview(data);
  const normalizedData = normalizeLearningData(data);

  if (!errors.length && summary.validItems === 0) {
    pushIssue(errors, 'import_no_valid_items', 'Không có mục học hợp lệ để nạp.', 'items');
  }

  return {
    ok: errors.length === 0,
    canImport: errors.length === 0,
    errors,
    warnings,
    rejectedItems: errors
      .filter(error => typeof error.path === 'string' && error.path.includes('items['))
      .map(error => ({ code: error.code, message: error.message, path: error.path })),
    summary,
    normalizedData,
    schema: {
      ok: schemaResult.ok,
      errors: schemaResult.errors
    }
  };
}

export function parseLearningDataJson(text) {
  try {
    const rawData = JSON.parse(text);
    const validation = validateLearningDataImport(rawData);
    return {
      ok: validation.ok,
      rawData,
      validation,
      warnings: validation.warnings,
      errors: validation.errors
    };
  } catch (error) {
    const validation = {
      ok: false,
      canImport: false,
      errors: [{
        code: 'json_parse_error',
        message: `Không đọc được JSON: ${error.message}`,
        path: '$'
      }],
      warnings: [],
      rejectedItems: [],
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
      normalizedData: normalizeLearningData({}),
      schema: {
        ok: false,
        errors: [{
          code: 'json_parse_error',
          message: `Không đọc được JSON: ${error.message}`,
          path: '$'
        }]
      }
    };

    return {
      ok: false,
      rawData: null,
      validation,
      warnings: [],
      errors: validation.errors
    };
  }
}
