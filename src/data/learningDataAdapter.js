import mockLearningData from './mockLearningData.js';

export const ITEM_TYPES = Object.freeze({
  MULTIPLE_CHOICE: 'multiple_choice',
  SHORT_ANSWER: 'short_answer',
  FLASHCARD: 'flashcard'
});

const VALID_ITEM_TYPES = new Set(Object.values(ITEM_TYPES));

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toOptionalString(value) {
  const cleaned = cleanString(value);
  return cleaned || undefined;
}

function normalizeChoices(choices) {
  return asArray(choices)
    .map((choice, index) => {
      if (typeof choice === 'string') {
        const text = cleanString(choice);
        return text ? { id: String(index + 1), text } : null;
      }

      if (!choice || typeof choice !== 'object') return null;

      const id = cleanString(choice.id) || String(index + 1);
      const text = cleanString(choice.text ?? choice.label ?? choice.value);
      return text ? { id, text } : null;
    })
    .filter(Boolean);
}

function normalizeSubject(subject) {
  if (!subject || typeof subject !== 'object') return null;

  const id = cleanString(subject.id);
  const title = cleanString(subject.title ?? subject.name);
  if (!id || !title) return null;

  return {
    id,
    title,
    description: toOptionalString(subject.description),
    courses: asArray(subject.courses).map(normalizeCourse).filter(Boolean)
  };
}

function normalizeCourse(course) {
  if (!course || typeof course !== 'object') return null;

  const id = cleanString(course.id);
  const title = cleanString(course.title ?? course.name);
  if (!id || !title) return null;

  return {
    id,
    title,
    description: toOptionalString(course.description)
  };
}

function normalizeTopic(topic, subjectIds) {
  if (!topic || typeof topic !== 'object') return null;

  const id = cleanString(topic.id);
  const subjectId = cleanString(topic.subjectId);
  const title = cleanString(topic.title ?? topic.name);
  if (!id || !subjectId || !title || !subjectIds.has(subjectId)) return null;

  return {
    id,
    subjectId,
    courseId: toOptionalString(topic.courseId),
    title,
    description: toOptionalString(topic.description)
  };
}

// Phase 16H — preserve optional source-aware metadata additively. Items
// without sourceMetadata continue to round-trip unchanged. Malformed
// metadata is dropped so existing imports/backups are never broken.
const EDUGEN_DRAFT_SOURCE_TYPE = 'edugen-draft';
const EDUGEN_DRAFT_PROCESSOR = 'edugen';

function normalizeSourceMetadata(rawMeta) {
  if (!rawMeta || typeof rawMeta !== 'object' || Array.isArray(rawMeta)) return undefined;
  const sourceType = cleanString(rawMeta.sourceType);
  if (sourceType !== EDUGEN_DRAFT_SOURCE_TYPE) return undefined;
  const processor = cleanString(rawMeta.processor);
  if (processor && processor !== EDUGEN_DRAFT_PROCESSOR) return undefined;
  const sourceName = typeof rawMeta.sourceName === 'string' ? rawMeta.sourceName.trim() : '';
  if (sourceName.length > 240) return undefined;
  const importedAt = typeof rawMeta.importedAt === 'string' ? rawMeta.importedAt.trim() : '';
  if (importedAt.length > 64) return undefined;
  if (rawMeta.reviewRequired !== true) return undefined;
  return {
    sourceType: EDUGEN_DRAFT_SOURCE_TYPE,
    sourceName,
    importedAt,
    processor: EDUGEN_DRAFT_PROCESSOR,
    reviewRequired: true
  };
}

function normalizeItem(item, subjectIds, topicIds) {
  if (!item || typeof item !== 'object') return null;

  const id = cleanString(item.id);
  const type = cleanString(item.type);
  const subjectId = cleanString(item.subjectId);
  const topicId = cleanString(item.topicId);
  const prompt = cleanString(item.prompt ?? item.question ?? item.front);

  if (!id || !VALID_ITEM_TYPES.has(type) || !subjectIds.has(subjectId) || !topicIds.has(topicId) || !prompt) {
    return null;
  }

  const choices = normalizeChoices(item.choices);
  const acceptableAnswers = asArray(item.acceptableAnswers).map(cleanString).filter(Boolean);
  const correctAnswer = cleanString(item.correctAnswer ?? item.answer ?? item.back) || acceptableAnswers[0] || '';

  if (type === ITEM_TYPES.MULTIPLE_CHOICE && (!choices.length || !correctAnswer)) return null;
  if ((type === ITEM_TYPES.SHORT_ANSWER || type === ITEM_TYPES.FLASHCARD) && !correctAnswer) return null;

  const sourceMetadata = normalizeSourceMetadata(item.sourceMetadata);

  const normalized = {
    id,
    type,
    subjectId,
    topicId,
    prompt,
    choices: type === ITEM_TYPES.MULTIPLE_CHOICE ? choices : [],
    correctAnswer,
    answer: correctAnswer,
    acceptableAnswers: type === ITEM_TYPES.SHORT_ANSWER ? acceptableAnswers : [],
    explanation: toOptionalString(item.explanation),
    tags: asArray(item.tags).map(cleanString).filter(Boolean),
    difficulty: toOptionalString(item.difficulty),
    source: toOptionalString(item.source)
  };

  if (sourceMetadata) {
    normalized.sourceMetadata = sourceMetadata;
  }

  return normalized;
}

export function normalizeLearningData(rawData = mockLearningData) {
  const source = rawData && typeof rawData === 'object' ? rawData : {};
  const subjects = asArray(source.subjects).map(normalizeSubject).filter(Boolean);
  const subjectIds = new Set(subjects.map(subject => subject.id));
  const topics = asArray(source.topics).map(topic => normalizeTopic(topic, subjectIds)).filter(Boolean);
  const topicIds = new Set(topics.map(topic => topic.id));
  const items = asArray(source.items).map(item => normalizeItem(item, subjectIds, topicIds)).filter(Boolean);

  return {
    version: cleanString(source.version) || 'v2-normalized',
    subjects,
    topics,
    items
  };
}

export function createLearningDataAdapter(rawData = mockLearningData) {
  const data = normalizeLearningData(rawData);

  function getSubjects() {
    return data.subjects;
  }

  function getTopicsBySubject(subjectId) {
    const id = cleanString(subjectId);
    if (!id) return [];
    return data.topics.filter(topic => topic.subjectId === id);
  }

  function getItemsByTopic(topicId) {
    const id = cleanString(topicId);
    if (!id) return [];
    return data.items.filter(item => item.topicId === id);
  }

  function getItemsBySubject(subjectId) {
    const id = cleanString(subjectId);
    if (!id) return [];
    return data.items.filter(item => item.subjectId === id);
  }

  function getAllItems() {
    return data.items;
  }

  return {
    data,
    getSubjects,
    getTopicsBySubject,
    getItemsByTopic,
    getItemsBySubject,
    getAllItems
  };
}

export function getSubjects(rawData = mockLearningData) {
  return createLearningDataAdapter(rawData).getSubjects();
}

export function getTopicsBySubject(subjectId, rawData = mockLearningData) {
  return createLearningDataAdapter(rawData).getTopicsBySubject(subjectId);
}

export function getItemsByTopic(topicId, rawData = mockLearningData) {
  return createLearningDataAdapter(rawData).getItemsByTopic(topicId);
}

export function getItemsBySubject(subjectId, rawData = mockLearningData) {
  return createLearningDataAdapter(rawData).getItemsBySubject(subjectId);
}

export function getAllItems(rawData = mockLearningData) {
  return createLearningDataAdapter(rawData).getAllItems();
}

export function summarizeLearningData(rawData = mockLearningData) {
  const adapter = createLearningDataAdapter(rawData);
  const items = adapter.getAllItems();
  const itemTypeCounts = items.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, {});

  return {
    subjectCount: adapter.getSubjects().length,
    topicCount: adapter.data.topics.length,
    itemCount: items.length,
    itemTypeCounts
  };
}

export const mockLearningDataAdapter = createLearningDataAdapter(mockLearningData);
