const DEFAULT_SUBJECT_TITLES = new Set([
  'nội dung đã dán',
  'nội dung import',
  'nội dung văn bản',
  'tài liệu đã nhập'
]);

const DEFAULT_TOPIC_TITLES = new Set([
  'tổng quan',
  'chung',
  'nội dung chính'
]);

const VAGUE_TITLES = new Set([
  'khác',
  'chưa phân loại',
  'không rõ',
  'untitled',
  'general'
]);

const SHORT_QUESTION_LENGTH = 12;
const LONG_QUESTION_LENGTH = 320;
const SHORT_ANSWER_LENGTH = 2;
const MIN_DRAFT_ITEM_COUNT = 3;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeComparableText(value) {
  return cleanString(value).replace(/\s+/g, ' ').toLowerCase();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function createWarning({ code, level = 'warning', message, itemId, itemIndex, path }) {
  return {
    code,
    level,
    message,
    ...(itemId ? { itemId } : {}),
    ...(Number.isInteger(itemIndex) ? { itemIndex } : {}),
    ...(path ? { path } : {})
  };
}

function getSubjectTitle(subject) {
  return cleanString(subject?.title ?? subject?.name);
}

function getTopicTitle(topic) {
  return cleanString(topic?.title ?? topic?.name);
}

function getItemPrompt(item) {
  return cleanString(item?.prompt ?? item?.question ?? item?.front);
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

function getValidChoices(choices) {
  return asArray(choices)
    .map((choice, index) => {
      const text = getChoiceText(choice);
      if (!text) return null;
      return { id: getChoiceId(choice, index), text };
    })
    .filter(Boolean);
}

function answerMatchesChoice(correctAnswer, choices) {
  const normalizedAnswer = normalizeComparableText(correctAnswer);
  if (!normalizedAnswer) return false;
  return choices.some(choice => (
    normalizeComparableText(choice.id) === normalizedAnswer
    || normalizeComparableText(choice.text) === normalizedAnswer
  ));
}

function isDefaultSubject(subject) {
  const title = normalizeComparableText(getSubjectTitle(subject));
  return DEFAULT_SUBJECT_TITLES.has(title);
}

function isDefaultTopic(topic) {
  const title = normalizeComparableText(getTopicTitle(topic));
  return DEFAULT_TOPIC_TITLES.has(title);
}

function isVagueTitle(value) {
  return VAGUE_TITLES.has(normalizeComparableText(value));
}

function buildContext(draft) {
  const subjects = asArray(draft?.subjects);
  const topics = asArray(draft?.topics);
  return {
    subjects,
    topics,
    subjectById: new Map(subjects.map(subject => [cleanString(subject?.id), subject]).filter(([id]) => id)),
    topicById: new Map(topics.map(topic => [cleanString(topic?.id), topic]).filter(([id]) => id))
  };
}

export function reviewQuizItemQuality(item, context = {}) {
  const warnings = [];
  const itemId = cleanString(item?.id);
  const itemIndex = Number.isInteger(context.itemIndex) ? context.itemIndex : undefined;
  const pathPrefix = Number.isInteger(itemIndex) ? `items[${itemIndex}]` : 'items[]';
  const type = cleanString(item?.type);
  const prompt = getItemPrompt(item);

  if (!prompt) {
    warnings.push(createWarning({
      code: 'short_question',
      level: 'error',
      message: 'Câu hỏi chưa có nội dung rõ ràng.',
      itemId,
      itemIndex,
      path: `${pathPrefix}.prompt`
    }));
  } else if (prompt.length < SHORT_QUESTION_LENGTH) {
    warnings.push(createWarning({
      code: 'short_question',
      message: 'Câu hỏi hơi ngắn. Hãy kiểm tra xem người học có đủ ngữ cảnh không.',
      itemId,
      itemIndex,
      path: `${pathPrefix}.prompt`
    }));
  } else if (prompt.length > LONG_QUESTION_LENGTH) {
    warnings.push(createWarning({
      code: 'long_question',
      message: 'Câu hỏi khá dài. Hãy cân nhắc tách thành câu ngắn hơn trước khi lưu.',
      itemId,
      itemIndex,
      path: `${pathPrefix}.prompt`
    }));
  }

  if (type === 'multiple_choice') {
    const choices = getValidChoices(item?.choices);
    if (!choices.length) {
      warnings.push(createWarning({
        code: 'missing_choices',
        level: 'error',
        message: 'Câu trắc nghiệm chưa có lựa chọn hợp lệ.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.choices`
      }));
    } else if (choices.length < 2) {
      warnings.push(createWarning({
        code: 'too_few_choices',
        level: 'error',
        message: 'Câu trắc nghiệm cần ít nhất 2 lựa chọn để có ý nghĩa.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.choices`
      }));
    }

    const choiceTextCounts = choices.reduce((counts, choice) => {
      const text = normalizeComparableText(choice.text);
      if (!text) return counts;
      counts.set(text, (counts.get(text) || 0) + 1);
      return counts;
    }, new Map());

    if ([...choiceTextCounts.values()].some(count => count > 1)) {
      warnings.push(createWarning({
        code: 'duplicate_choices',
        message: 'Một số lựa chọn trắc nghiệm bị trùng nội dung.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.choices`
      }));
    }

    const correctAnswer = cleanString(item?.correctAnswer ?? item?.answer);
    if (!correctAnswer) {
      warnings.push(createWarning({
        code: 'missing_answer',
        level: 'error',
        message: 'Câu trắc nghiệm chưa có đáp án đúng.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.correctAnswer`
      }));
    } else if (choices.length && !answerMatchesChoice(correctAnswer, choices)) {
      warnings.push(createWarning({
        code: 'answer_not_in_choices',
        level: 'error',
        message: 'Đáp án đúng không khớp với lựa chọn nào trong câu trắc nghiệm.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.correctAnswer`
      }));
    }

    if (!cleanString(item?.explanation)) {
      warnings.push(createWarning({
        code: 'missing_explanation',
        level: 'info',
        message: 'Câu trắc nghiệm chưa có giải thích. Bạn vẫn có thể lưu nếu nội dung phù hợp.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.explanation`
      }));
    }
  }

  if (type === 'flashcard') {
    const front = cleanString(item?.front ?? item?.prompt ?? item?.question);
    const back = cleanString(item?.back ?? item?.answer ?? item?.correctAnswer);
    if (!front || front.length < SHORT_QUESTION_LENGTH) {
      warnings.push(createWarning({
        code: 'flashcard_missing_front',
        level: front ? 'warning' : 'error',
        message: front ? 'Mặt trước flashcard hơi ngắn.' : 'Flashcard thiếu mặt trước.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.front`
      }));
    }
    if (!back || back.length < SHORT_ANSWER_LENGTH) {
      warnings.push(createWarning({
        code: 'flashcard_missing_back',
        level: back ? 'warning' : 'error',
        message: back ? 'Mặt sau flashcard hơi ngắn.' : 'Flashcard thiếu mặt sau.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.back`
      }));
    }
  }

  if (type === 'short_answer') {
    const answers = [item?.answer, item?.correctAnswer, ...asArray(item?.acceptableAnswers)]
      .map(cleanString)
      .filter(Boolean);
    if (!answers.length) {
      warnings.push(createWarning({
        code: 'short_answer_missing_answer',
        level: 'error',
        message: 'Câu hỏi ngắn chưa có đáp án.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.answer`
      }));
    } else if (answers.every(answer => answer.length < SHORT_ANSWER_LENGTH)) {
      warnings.push(createWarning({
        code: 'short_answer_missing_answer',
        message: 'Đáp án câu hỏi ngắn quá ngắn. Hãy kiểm tra lại trước khi lưu.',
        itemId,
        itemIndex,
        path: `${pathPrefix}.answer`
      }));
    }
  }

  return warnings;
}

export function reviewQuizDraftQuality(draft) {
  const warnings = [];
  const data = draft && typeof draft === 'object' && !Array.isArray(draft) ? draft : {};
  const { subjects, topics, subjectById, topicById } = buildContext(data);
  const items = asArray(data.items);

  if (!items.length) {
    warnings.push(createWarning({
      code: 'draft_empty',
      level: 'error',
      message: 'Bản nháp chưa có mục học nào để xem lại.',
      path: 'items'
    }));
  } else if (items.length < MIN_DRAFT_ITEM_COUNT) {
    warnings.push(createWarning({
      code: 'very_few_items',
      level: 'info',
      message: 'Bản nháp có rất ít mục học. Hãy kiểm tra xem đã đủ nội dung cần học chưa.',
      path: 'items'
    }));
  }

  subjects.forEach((subject, index) => {
    const title = getSubjectTitle(subject);
    if (!title) {
      warnings.push(createWarning({
        code: 'missing_subject',
        level: 'warning',
        message: 'Một môn học trong bản nháp chưa có tên rõ ràng.',
        path: `subjects[${index}].title`
      }));
    } else if (isDefaultSubject(subject)) {
      warnings.push(createWarning({
        code: 'default_subject',
        level: 'info',
        message: 'Bản nháp đang dùng tên môn mặc định. Hãy đổi lại nếu cần rõ nghĩa hơn.',
        path: `subjects[${index}].title`
      }));
    } else if (isVagueTitle(title)) {
      warnings.push(createWarning({
        code: 'missing_subject',
        level: 'warning',
        message: 'Tên môn học còn mơ hồ. Hãy kiểm tra lại trước khi lưu.',
        path: `subjects[${index}].title`
      }));
    }
  });

  topics.forEach((topic, index) => {
    const title = getTopicTitle(topic);
    if (!title) {
      warnings.push(createWarning({
        code: 'missing_topic',
        level: 'warning',
        message: 'Một chủ đề trong bản nháp chưa có tên rõ ràng.',
        path: `topics[${index}].title`
      }));
    } else if (isDefaultTopic(topic)) {
      warnings.push(createWarning({
        code: 'default_topic',
        level: 'info',
        message: 'Bản nháp đang dùng chủ đề mặc định. Hãy đổi lại nếu cần rõ nghĩa hơn.',
        path: `topics[${index}].title`
      }));
    } else if (isVagueTitle(title)) {
      warnings.push(createWarning({
        code: 'missing_topic',
        level: 'warning',
        message: 'Tên chủ đề còn mơ hồ. Hãy kiểm tra lại trước khi lưu.',
        path: `topics[${index}].title`
      }));
    }
  });

  items.forEach((item, index) => {
    const itemWarnings = reviewQuizItemQuality(item, { itemIndex: index });
    warnings.push(...itemWarnings);

    const subjectId = cleanString(item?.subjectId);
    const topicId = cleanString(item?.topicId);
    if (!subjectId || !subjectById.has(subjectId)) {
      warnings.push(createWarning({
        code: 'missing_subject',
        level: 'warning',
        message: 'Mục học chưa gắn với môn học rõ ràng.',
        itemId: cleanString(item?.id),
        itemIndex: index,
        path: `items[${index}].subjectId`
      }));
    }
    if (!topicId || !topicById.has(topicId)) {
      warnings.push(createWarning({
        code: 'missing_topic',
        level: 'warning',
        message: 'Mục học chưa gắn với chủ đề rõ ràng.',
        itemId: cleanString(item?.id),
        itemIndex: index,
        path: `items[${index}].topicId`
      }));
    }
  });

  return {
    warnings,
    summary: getQualitySummary({ warnings, itemCount: items.length })
  };
}

export function getQualitySummary(review) {
  const warnings = asArray(review?.warnings);
  const errorCount = warnings.filter(warning => warning.level === 'error').length;
  const warningCount = warnings.filter(warning => warning.level === 'warning').length;
  const infoCount = warnings.filter(warning => warning.level === 'info').length;
  const itemWarningCount = new Set(warnings
    .filter(warning => warning.itemId || Number.isInteger(warning.itemIndex))
    .map(warning => warning.itemId || `index:${warning.itemIndex}`)).size;

  return {
    warningCount: warnings.length,
    errorCount,
    advisoryWarningCount: warningCount,
    infoCount,
    itemWarningCount,
    canProceed: errorCount === 0,
    itemCount: Number.isFinite(review?.itemCount) ? review.itemCount : undefined
  };
}
