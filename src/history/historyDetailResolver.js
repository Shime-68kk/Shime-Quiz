import { STUDY_STATUS_LABELS, STUDY_TYPE_LABELS } from '../study/studyAttemptSummary.js';

const STATUS_TONE = Object.freeze({
  correct: 'success',
  wrong: 'danger',
  unanswered: 'warning',
  reviewed_flashcard: 'info',
  unscored: 'neutral'
});

const MISSING_ITEM_MESSAGE = 'Mục học này không còn trong thư viện hiện tại.';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getChoiceLabel(choice, index) {
  if (typeof choice === 'string') return choice;
  return cleanString(choice?.text ?? choice?.label ?? choice?.value) || `Lựa chọn ${index + 1}`;
}

function getAnswerFromItem(item) {
  if (!item) return '';
  if (item.type === 'multiple_choice') {
    const expected = cleanString(item.correctAnswer ?? item.answer);
    const choices = asArray(item.choices);
    const matchIndex = choices.findIndex((choice, index) => {
      const id = cleanString(choice?.id) || String(index + 1);
      const label = getChoiceLabel(choice, index);
      return id.toLowerCase() === expected.toLowerCase() || label.toLowerCase() === expected.toLowerCase();
    });
    return matchIndex >= 0 ? getChoiceLabel(choices[matchIndex], matchIndex) : expected;
  }

  return cleanString(item.correctAnswer ?? item.answer ?? item.back);
}

function getItemMap(items = []) {
  return new Map(asArray(items).filter(item => item?.id).map(item => [String(item.id), item]));
}

function getMapLookup(mapLike, key) {
  if (!key || !mapLike) return null;
  if (typeof mapLike.get === 'function') return mapLike.get(key) || null;
  return mapLike[key] || null;
}

function resolveOneResult(result, index, itemMap, topicsById, subjectsById) {
  const itemId = cleanString(result?.itemId);
  const libraryItem = itemId ? itemMap.get(itemId) : null;
  const topicId = cleanString(result?.topicId || libraryItem?.topicId);
  const subjectId = cleanString(result?.subjectId || libraryItem?.subjectId);
  const topic = getMapLookup(topicsById, topicId);
  const subject = getMapLookup(subjectsById, subjectId);
  const prompt = cleanString(libraryItem?.prompt)
    || cleanString(result?.promptSnapshot)
    || cleanString(result?.prompt)
    || MISSING_ITEM_MESSAGE;
  const correctAnswer = getAnswerFromItem(libraryItem) || cleanString(result?.correctAnswer);
  const status = cleanString(result?.status) || 'unscored';
  const itemType = cleanString(result?.itemType || libraryItem?.type || 'unknown');

  return {
    index,
    itemId,
    itemType,
    typeLabel: STUDY_TYPE_LABELS[itemType] || 'Không rõ loại',
    prompt,
    choices: asArray(libraryItem?.choices || result?.choices).map(getChoiceLabel),
    userAnswer: cleanString(result?.userAnswer),
    correctAnswer,
    status,
    statusLabel: STUDY_STATUS_LABELS[status] || 'Không chấm điểm',
    statusTone: STATUS_TONE[status] || 'neutral',
    topicId,
    subjectId,
    topicLabel: topic?.title || topic?.name || topicId,
    subjectLabel: subject?.title || subject?.name || subjectId,
    itemMissing: Boolean(itemId && !libraryItem),
    missingMessage: MISSING_ITEM_MESSAGE
  };
}

export function resolveHistoryRecordDetails(record, { items = [], topicsById, subjectsById } = {}) {
  const itemMap = getItemMap(items);
  const itemResults = asArray(record?.itemResults);

  return itemResults.map((result, index) => resolveOneResult(result, index, itemMap, topicsById, subjectsById));
}

export function getMissingHistoryItemMessage() {
  return MISSING_ITEM_MESSAGE;
}
