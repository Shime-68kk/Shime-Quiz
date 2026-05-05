import { ITEM_TYPES } from './learningDataAdapter.js';
import { validateLearningDataImport } from './importValidator.js';
import { hashString } from '../utils/hash.js';

const DEFAULT_SUBJECT_TITLE = 'Nội dung đã dán';
const DEFAULT_TOPIC_TITLE = 'Tổng quan';
const CHOICE_PATTERN = /^([A-Ha-h])(?:[.)]|\s+-)\s+(.+)$/u;
const SUBJECT_PATTERN = /^(?:môn|mon|subject)\s*:\s*(.+)$/iu;
const TOPIC_PATTERN = /^(?:chủ\s*đề|chu\s*de|topic)\s*:\s*(.+)$/iu;
const QUESTION_PATTERN = /^(?:câu\s*hỏi|cau\s*hoi|question)\s*:\s*(.+)$/iu;
const SHORT_QUESTION_PATTERN = /^(?:câu\s*hỏi\s*ngắn|cau\s*hoi\s*ngan|short\s*answer)\s*:\s*(.+)$/iu;
const ANSWER_PATTERN = /^(?:đáp\s*án|dap\s*an|answer|mặt\s*sau|mat\s*sau)\s*:\s*(.+)$/iu;
const EXPLANATION_PATTERN = /^(?:giải\s*thích|giai\s*thich|explanation)\s*:\s*(.+)$/iu;
const FRONT_PATTERN = /^(?:mặt\s*trước|mat\s*truoc|front)\s*:\s*(.+)$/iu;
const BACK_PATTERN = /^(?:mặt\s*sau|mat\s*sau|back)\s*:\s*(.+)$/iu;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function compactWhitespace(value) {
  return cleanString(value).replace(/\s+/g, ' ');
}

function stripMarkdown(value) {
  return compactWhitespace(value)
    .replace(/^[-*+]\s+/, '')
    .replace(/^#+\s*/, '')
    .replace(/[*_`]+/g, '')
    .trim();
}

function slugify(value, fallback = 'draft') {
  const source = compactWhitespace(value) || fallback;
  return source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || hashString(source);
}

function createIssue(code, message, path = '') {
  return { code, message, path };
}

function ensureSubject(subjectsById, title) {
  const safeTitle = compactWhitespace(title) || DEFAULT_SUBJECT_TITLE;
  const id = `subject:${slugify(safeTitle, 'subject')}`;
  if (!subjectsById.has(id)) {
    subjectsById.set(id, {
      id,
      title: safeTitle,
      description: 'Tạo từ nội dung văn bản/Markdown người dùng dán vào.'
    });
  }
  return subjectsById.get(id);
}

function ensureTopic(topicsById, subjectId, title) {
  const safeTitle = compactWhitespace(title) || DEFAULT_TOPIC_TITLE;
  const id = `topic:${slugify(`${subjectId}:${safeTitle}`, 'topic')}`;
  if (!topicsById.has(id)) {
    topicsById.set(id, {
      id,
      subjectId,
      title: safeTitle,
      description: 'Tạo từ nội dung văn bản/Markdown người dùng dán vào.'
    });
  }
  return topicsById.get(id);
}

function makeItemId(subjectId, topicId, type, prompt, answer) {
  return `item:text:${hashString(`${subjectId}|${topicId}|${type}|${prompt}|${answer}`)}`;
}

function normalizeChoiceAnswer(answer, choices) {
  const safeAnswer = compactWhitespace(answer);
  if (!safeAnswer) return '';
  const label = safeAnswer.replace(/[.)]$/, '').toUpperCase();
  const matchedChoice = choices.find(choice => choice.id.toUpperCase() === label || choice.text.toLowerCase() === safeAnswer.toLowerCase());
  return matchedChoice?.id || safeAnswer;
}

function pushMultipleChoice({ items, subjectId, topicId, prompt, choices, answer, explanation, warnings, lineNumber }) {
  const safePrompt = compactWhitespace(prompt);
  const safeChoices = choices
    .map(choice => ({ id: cleanString(choice.id).toUpperCase(), text: compactWhitespace(choice.text) }))
    .filter(choice => choice.id && choice.text);
  const correctAnswer = normalizeChoiceAnswer(answer, safeChoices);

  if (!safePrompt || safeChoices.length < 2 || !correctAnswer) {
    warnings.push(createIssue(
      'text_mcq_incomplete',
      'Một câu trắc nghiệm chưa đủ câu hỏi, lựa chọn hoặc đáp án nên đã bị bỏ qua.',
      lineNumber ? `line ${lineNumber}` : ''
    ));
    return false;
  }

  items.push({
    id: makeItemId(subjectId, topicId, ITEM_TYPES.MULTIPLE_CHOICE, safePrompt, correctAnswer),
    type: ITEM_TYPES.MULTIPLE_CHOICE,
    subjectId,
    topicId,
    prompt: safePrompt,
    choices: safeChoices,
    correctAnswer,
    explanation: compactWhitespace(explanation),
    source: 'text-markdown-draft'
  });
  return true;
}

function pushShortAnswer({ items, subjectId, topicId, prompt, answer, explanation, warnings, lineNumber }) {
  const safePrompt = compactWhitespace(prompt);
  const safeAnswer = compactWhitespace(answer);
  if (!safePrompt || !safeAnswer) {
    warnings.push(createIssue(
      'text_short_answer_incomplete',
      'Một câu trả lời ngắn chưa đủ câu hỏi hoặc đáp án nên đã bị bỏ qua.',
      lineNumber ? `line ${lineNumber}` : ''
    ));
    return false;
  }

  items.push({
    id: makeItemId(subjectId, topicId, ITEM_TYPES.SHORT_ANSWER, safePrompt, safeAnswer),
    type: ITEM_TYPES.SHORT_ANSWER,
    subjectId,
    topicId,
    prompt: safePrompt,
    answer: safeAnswer,
    correctAnswer: safeAnswer,
    acceptableAnswers: [safeAnswer],
    explanation: compactWhitespace(explanation),
    source: 'text-markdown-draft'
  });
  return true;
}

function pushFlashcard({ items, subjectId, topicId, front, back, warnings, lineNumber }) {
  const safeFront = compactWhitespace(front);
  const safeBack = compactWhitespace(back);
  if (!safeFront || !safeBack) {
    warnings.push(createIssue(
      'text_flashcard_incomplete',
      'Một flashcard chưa đủ mặt trước hoặc mặt sau nên đã bị bỏ qua.',
      lineNumber ? `line ${lineNumber}` : ''
    ));
    return false;
  }

  items.push({
    id: makeItemId(subjectId, topicId, ITEM_TYPES.FLASHCARD, safeFront, safeBack),
    type: ITEM_TYPES.FLASHCARD,
    subjectId,
    topicId,
    prompt: safeFront,
    front: safeFront,
    back: safeBack,
    answer: safeBack,
    correctAnswer: safeBack,
    source: 'text-markdown-draft'
  });
  return true;
}

function factToShortAnswer(fact) {
  const text = stripMarkdown(fact).replace(/[.。]+$/, '');
  let match = text.match(/^(.+?)\s+là\s+(.+)$/iu);
  if (match) {
    return {
      prompt: `${compactWhitespace(match[1])} là gì?`,
      answer: compactWhitespace(match[2])
    };
  }

  match = text.match(/^(.+?)\s+hoạt\s*động\s+ở\s+(.+)$/iu);
  if (match) {
    return {
      prompt: `${compactWhitespace(match[1])} hoạt động ở đâu?`,
      answer: compactWhitespace(match[2])
    };
  }

  return null;
}

function emptyRawData() {
  return {
    version: 'v2-text-markdown-draft',
    subjects: [],
    topics: [],
    items: []
  };
}


function pruneUnusedContainers(subjects, topics, items) {
  const usedTopicIds = new Set(items.map(item => item.topicId).filter(Boolean));
  const prunedTopics = topics.filter(topic => usedTopicIds.has(topic.id));
  const usedSubjectIds = new Set([
    ...items.map(item => item.subjectId).filter(Boolean),
    ...prunedTopics.map(topic => topic.subjectId).filter(Boolean)
  ]);
  const prunedSubjects = subjects.filter(subject => usedSubjectIds.has(subject.id));
  return { subjects: prunedSubjects, topics: prunedTopics };
}

function withParserWarnings(validation, warnings) {
  const mergedWarnings = [...warnings, ...(validation.warnings || [])];
  return {
    ...validation,
    warnings: mergedWarnings
  };
}

export function parseTextQuizDraft(text) {
  const source = String(text || '').replace(/^\uFEFF/, '');
  const lines = source.split(/\r?\n/);
  const nonEmptyLines = lines.map((line, index) => ({ text: cleanString(line), index })).filter(line => line.text);
  const warnings = [];

  if (!nonEmptyLines.length) {
    const rawData = emptyRawData();
    const validation = validateLearningDataImport(rawData);
    validation.errors = [
      createIssue('text_import_empty', 'Không có nội dung để tạo bản nháp câu hỏi.', '$'),
      ...validation.errors
    ];
    validation.ok = false;
    validation.canImport = false;
    return {
      ok: false,
      rawData,
      linesParsed: 0,
      warnings,
      validation
    };
  }

  const subjectsById = new Map();
  const topicsById = new Map();
  const items = [];
  let currentSubjectTitle = DEFAULT_SUBJECT_TITLE;
  let currentTopicTitle = DEFAULT_TOPIC_TITLE;
  let pendingQuestion = null;
  let pendingChoices = [];
  let pendingAnswer = '';
  let pendingExplanation = '';
  let pendingQuestionLine = 0;
  let pendingShortQuestion = null;
  let pendingFlashcardFront = null;
  let pendingFlashcardLine = 0;
  let generatedFromFacts = 0;

  function updateContext(nextSubjectTitle = currentSubjectTitle, nextTopicTitle = currentTopicTitle) {
    currentSubjectTitle = compactWhitespace(nextSubjectTitle) || DEFAULT_SUBJECT_TITLE;
    currentTopicTitle = compactWhitespace(nextTopicTitle) || DEFAULT_TOPIC_TITLE;
  }

  function getCurrentContext() {
    const subjectRecord = ensureSubject(subjectsById, currentSubjectTitle);
    const topicRecord = ensureTopic(topicsById, subjectRecord.id, currentTopicTitle);
    return { subjectId: subjectRecord.id, topicId: topicRecord.id };
  }

  function flushPendingQuestion() {
    if (!pendingQuestion) return;
    const { subjectId, topicId } = getCurrentContext();
    if (pendingChoices.length) {
      pushMultipleChoice({
        items,
        subjectId,
        topicId,
        prompt: pendingQuestion,
        choices: pendingChoices,
        answer: pendingAnswer,
        explanation: pendingExplanation,
        warnings,
        lineNumber: pendingQuestionLine
      });
    } else if (pendingAnswer) {
      pushShortAnswer({
        items,
        subjectId,
        topicId,
        prompt: pendingQuestion,
        answer: pendingAnswer,
        explanation: pendingExplanation,
        warnings,
        lineNumber: pendingQuestionLine
      });
    } else {
      warnings.push(createIssue('text_question_without_answer', 'Một câu hỏi chưa có đáp án nên đã bị bỏ qua.', `line ${pendingQuestionLine}`));
    }
    pendingQuestion = null;
    pendingChoices = [];
    pendingAnswer = '';
    pendingExplanation = '';
    pendingQuestionLine = 0;
  }

  function flushPendingFlashcard() {
    if (!pendingFlashcardFront) return;
    warnings.push(createIssue('text_flashcard_without_back', 'Một flashcard chưa có mặt sau nên đã bị bỏ qua.', `line ${pendingFlashcardLine}`));
    pendingFlashcardFront = null;
    pendingFlashcardLine = 0;
  }

  nonEmptyLines.forEach(({ text: originalLine, index }) => {
    const line = cleanString(originalLine);
    const lineNumber = index + 1;
    const h1 = line.match(/^#\s+(.+)$/u);
    const h2 = line.match(/^##\s+(.+)$/u);
    const subject = line.match(SUBJECT_PATTERN);
    const topic = line.match(TOPIC_PATTERN);
    const shortQuestion = line.match(SHORT_QUESTION_PATTERN);
    const question = line.match(QUESTION_PATTERN);
    const choice = line.match(CHOICE_PATTERN);
    const answer = line.match(ANSWER_PATTERN);
    const explanation = line.match(EXPLANATION_PATTERN);
    const front = line.match(FRONT_PATTERN);
    const back = line.match(BACK_PATTERN);

    if (h1 && !h2) {
      flushPendingQuestion();
      flushPendingFlashcard();
      updateContext(stripMarkdown(h1[1]), DEFAULT_TOPIC_TITLE);
      return;
    }

    if (h2) {
      flushPendingQuestion();
      flushPendingFlashcard();
      updateContext(currentSubjectTitle, stripMarkdown(h2[1]));
      return;
    }

    if (subject) {
      flushPendingQuestion();
      flushPendingFlashcard();
      updateContext(subject[1], currentTopicTitle);
      return;
    }

    if (topic) {
      flushPendingQuestion();
      flushPendingFlashcard();
      updateContext(currentSubjectTitle, topic[1]);
      return;
    }

    if (/^flashcard\s*:?$/iu.test(line)) {
      flushPendingQuestion();
      flushPendingFlashcard();
      return;
    }

    if (shortQuestion) {
      flushPendingQuestion();
      flushPendingFlashcard();
      pendingShortQuestion = stripMarkdown(shortQuestion[1]);
      pendingQuestionLine = lineNumber;
      return;
    }

    if (question) {
      flushPendingQuestion();
      flushPendingFlashcard();
      pendingQuestion = stripMarkdown(question[1]);
      pendingChoices = [];
      pendingAnswer = '';
      pendingExplanation = '';
      pendingQuestionLine = lineNumber;
      pendingShortQuestion = null;
      return;
    }

    if (front) {
      flushPendingQuestion();
      flushPendingFlashcard();
      pendingFlashcardFront = stripMarkdown(front[1]);
      pendingFlashcardLine = lineNumber;
      return;
    }

    if (back && pendingFlashcardFront) {
      const { subjectId, topicId } = getCurrentContext();
      pushFlashcard({
        items,
        subjectId,
        topicId,
        front: pendingFlashcardFront,
        back: stripMarkdown(back[1]),
        warnings,
        lineNumber: pendingFlashcardLine
      });
      pendingFlashcardFront = null;
      pendingFlashcardLine = 0;
      return;
    }

    if (choice && pendingQuestion) {
      pendingChoices.push({ id: choice[1].toUpperCase(), text: stripMarkdown(choice[2]) });
      return;
    }

    if (answer) {
      if (pendingShortQuestion) {
        const { subjectId, topicId } = getCurrentContext();
        pushShortAnswer({
          items,
          subjectId,
          topicId,
          prompt: pendingShortQuestion,
          answer: stripMarkdown(answer[1]),
          warnings,
          lineNumber: pendingQuestionLine || lineNumber
        });
        pendingShortQuestion = null;
        pendingQuestionLine = 0;
        return;
      }
      if (pendingQuestion) {
        pendingAnswer = stripMarkdown(answer[1]);
        return;
      }
    }

    if (explanation && pendingQuestion) {
      pendingExplanation = stripMarkdown(explanation[1]);
      return;
    }

    if (/^[-*+]\s+/.test(line)) {
      const factDraft = factToShortAnswer(line);
      if (factDraft) {
        flushPendingQuestion();
        flushPendingFlashcard();
        const { subjectId, topicId } = getCurrentContext();
        pushShortAnswer({
          items,
          subjectId,
          topicId,
          prompt: factDraft.prompt,
          answer: factDraft.answer,
          warnings,
          lineNumber
        });
        generatedFromFacts += 1;
      } else {
        warnings.push(createIssue(
          'text_bullet_unstructured',
          'Một gạch đầu dòng chưa đủ rõ để tạo câu hỏi tự động. Hãy viết theo mẫu Câu hỏi / Đáp án nếu muốn import.',
          `line ${lineNumber}`
        ));
      }
    }
  });

  flushPendingQuestion();
  flushPendingFlashcard();

  if (generatedFromFacts) {
    warnings.push(createIssue(
      'text_fact_draft_review_required',
      'Một số câu hỏi được tạo từ gạch đầu dòng chỉ là bản nháp. Hãy xem lại trước khi lưu.',
      'items'
    ));
  }

  const prunedContainers = pruneUnusedContainers(
    Array.from(subjectsById.values()),
    Array.from(topicsById.values()),
    items
  );

  const rawData = {
    version: 'v2-text-markdown-draft',
    subjects: prunedContainers.subjects,
    topics: prunedContainers.topics,
    items
  };

  if (!items.length) {
    warnings.push(createIssue(
      'text_no_clear_questions',
      'Không tìm thấy câu hỏi rõ ràng. Hãy thêm dòng Câu hỏi / Đáp án hoặc dùng mẫu trắc nghiệm A, B, C, D.',
      'items'
    ));
  }

  const validation = withParserWarnings(validateLearningDataImport(rawData), warnings);
  return {
    ok: validation.ok,
    rawData,
    linesParsed: nonEmptyLines.length,
    warnings,
    validation
  };
}
