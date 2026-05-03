import { ITEM_TYPES, normalizeLearningData } from './learningDataAdapter.js';

const VALID_ITEM_TYPES = new Set(Object.values(ITEM_TYPES));
const MAX_SAMPLE_ITEMS = 5;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pushIssue(target, code, message, path) {
  target.push({ code, message, path });
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
    if (!subject || typeof subject !== 'object') {
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
    if (!topic || typeof topic !== 'object') {
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

function validateItems(rawItems, subjectIds, topicIds, errors, warnings) {
  if (!Array.isArray(rawItems)) {
    pushIssue(errors, 'items_required', 'items phải là mảng.', 'items');
    return [];
  }

  rawItems.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
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
      const choices = asArray(item.choices).filter(choice => {
        if (typeof choice === 'string') return Boolean(cleanString(choice));
        return Boolean(cleanString(choice?.text ?? choice?.label ?? choice?.value));
      });
      if (!choices.length) {
        pushIssue(errors, 'multiple_choice_choices_required', `Item ${id || `#${index + 1}`} cần choices.`, `items[${index}].choices`);
      }
      if (!cleanString(item.correctAnswer)) {
        pushIssue(errors, 'multiple_choice_answer_required', `Item ${id || `#${index + 1}`} cần correctAnswer.`, `items[${index}].correctAnswer`);
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

  const subjects = validateSubjects(data.subjects, errors);
  addDuplicateWarnings(subjects, 'subjects', warnings);
  const subjectIds = new Set(subjects.map(subject => cleanString(subject?.id)).filter(Boolean));

  const topics = validateTopics(data.topics, subjectIds, errors, warnings);
  addDuplicateWarnings(topics, 'topics', warnings);
  const topicIds = new Set(topics.map(topic => cleanString(topic?.id)).filter(Boolean));

  const items = validateItems(data.items, subjectIds, topicIds, errors, warnings);
  addDuplicateWarnings(items, 'items', warnings);

  const summary = summarizePreview(data);

  return {
    ok: errors.length === 0,
    canImport: errors.length === 0,
    errors,
    warnings,
    summary,
    normalizedData: normalizeLearningData(data)
  };
}

export function parseLearningDataJson(text) {
  try {
    const rawData = JSON.parse(text);
    return {
      ok: true,
      rawData,
      validation: validateLearningDataImport(rawData)
    };
  } catch (error) {
    return {
      ok: false,
      rawData: null,
      validation: {
        ok: false,
        canImport: false,
        errors: [{
          code: 'json_parse_error',
          message: `Không đọc được JSON: ${error.message}`,
          path: '$'
        }],
        warnings: [],
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
        normalizedData: normalizeLearningData({})
      }
    };
  }
}
