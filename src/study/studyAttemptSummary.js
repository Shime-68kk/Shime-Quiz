import { normalizeAnswerText } from '../utils/text.js';
const MAX_REVIEW_ITEMS = 25;

export const STUDY_STATUS = {
  CORRECT: 'correct',
  WRONG: 'wrong',
  UNANSWERED: 'unanswered',
  REVIEWED: 'reviewed_flashcard',
  UNSCORED: 'unscored'
};

export const STUDY_STATUS_LABELS = {
  [STUDY_STATUS.CORRECT]: 'Đúng',
  [STUDY_STATUS.WRONG]: 'Sai',
  [STUDY_STATUS.UNANSWERED]: 'Chưa trả lời',
  [STUDY_STATUS.REVIEWED]: 'Thẻ đã xem',
  [STUDY_STATUS.UNSCORED]: 'Không chấm điểm'
};

export const STUDY_TYPE_LABELS = {
  multiple_choice: 'Trắc nghiệm',
  short_answer: 'Trả lời ngắn',
  flashcard: 'Thẻ ghi nhớ'
};


function getChoiceText(choice) {
  if (typeof choice === 'string') return choice;
  return choice?.text ?? choice?.label ?? choice?.value ?? '';
}

function getChoiceId(choice, index) {
  return String(choice?.id ?? index + 1);
}

function getChoices(item) {
  return Array.isArray(item?.choices) ? item.choices : [];
}

function getAcceptableAnswers(item) {
  const answers = Array.isArray(item?.acceptableAnswers) ? item.acceptableAnswers : [];
  return [item?.correctAnswer, item?.answer, ...answers]
    .map(answer => String(answer ?? '').trim())
    .filter(Boolean)
    .filter((answer, index, all) => all.findIndex(candidate => normalizeAnswerText(candidate) === normalizeAnswerText(answer)) === index);
}

function findSelectedChoice(item, selectedAnswer) {
  const selected = String(selectedAnswer ?? '');
  if (!selected) return null;
  return getChoices(item).find((choice, index) => getChoiceId(choice, index) === selected) || null;
}

function findCorrectChoice(item) {
  const expected = normalizeAnswerText(item?.correctAnswer);
  if (!expected) return null;
  return getChoices(item).find((choice, index) => {
    return normalizeAnswerText(getChoiceId(choice, index)) === expected || normalizeAnswerText(getChoiceText(choice)) === expected;
  }) || null;
}

function isSelectedChoiceCorrect(item, selectedAnswer) {
  const selectedChoice = findSelectedChoice(item, selectedAnswer);
  const correctChoice = findCorrectChoice(item);
  if (!selectedChoice || !correctChoice) return false;
  return selectedChoice === correctChoice;
}

function scoreMultipleChoice(item, state) {
  const selectedAnswer = state.answersByItemId[item.id] || '';
  const choices = getChoices(item);
  const selectedChoice = findSelectedChoice(item, selectedAnswer);
  const correctChoice = findCorrectChoice(item);

  if (!choices.length || !item.correctAnswer || !correctChoice) {
    return {
      status: STUDY_STATUS.UNSCORED,
      answered: Boolean(selectedAnswer),
      userAnswer: selectedChoice ? getChoiceText(selectedChoice) : selectedAnswer,
      correctAnswer: item.correctAnswer || '',
      canScore: false
    };
  }

  if (!selectedAnswer) {
    return {
      status: STUDY_STATUS.UNANSWERED,
      answered: false,
      userAnswer: '',
      correctAnswer: getChoiceText(correctChoice),
      canScore: true
    };
  }

  const correct = isSelectedChoiceCorrect(item, selectedAnswer);
  return {
    status: correct ? STUDY_STATUS.CORRECT : STUDY_STATUS.WRONG,
    answered: true,
    userAnswer: selectedChoice ? getChoiceText(selectedChoice) : selectedAnswer,
    correctAnswer: getChoiceText(correctChoice),
    canScore: true
  };
}

function scoreShortAnswer(item, state) {
  const response = String(state.answersByItemId[item.id] || '');
  const normalizedResponse = normalizeAnswerText(response);
  const acceptableAnswers = getAcceptableAnswers(item);

  if (!acceptableAnswers.length) {
    return {
      status: STUDY_STATUS.UNSCORED,
      answered: Boolean(normalizedResponse),
      userAnswer: response,
      correctAnswer: '',
      canScore: false
    };
  }

  if (!normalizedResponse) {
    return {
      status: STUDY_STATUS.UNANSWERED,
      answered: false,
      userAnswer: '',
      correctAnswer: acceptableAnswers[0] || '',
      canScore: true
    };
  }

  const correct = acceptableAnswers.some(answer => normalizeAnswerText(answer) === normalizedResponse);
  return {
    status: correct ? STUDY_STATUS.CORRECT : STUDY_STATUS.WRONG,
    answered: true,
    userAnswer: response,
    correctAnswer: acceptableAnswers[0] || '',
    canScore: true
  };
}

function scoreFlashcard(item, state) {
  const revealed = Boolean(state.flashcardRevealedByItemId[item.id]);
  const answer = item.answer || item.correctAnswer || '';

  if (!answer) {
    return {
      status: STUDY_STATUS.UNSCORED,
      answered: revealed,
      reviewed: revealed,
      userAnswer: revealed ? 'Đã lật thẻ' : '',
      correctAnswer: '',
      canScore: false
    };
  }

  return {
    status: revealed ? STUDY_STATUS.REVIEWED : STUDY_STATUS.UNANSWERED,
    answered: revealed,
    reviewed: revealed,
    userAnswer: revealed ? 'Đã lật thẻ' : '',
    correctAnswer: answer,
    canScore: false
  };
}

function scoreItem(item, state) {
  if (!item?.id || !item?.type) {
    return {
      status: STUDY_STATUS.UNSCORED,
      answered: false,
      userAnswer: '',
      correctAnswer: '',
      canScore: false
    };
  }

  if (item.type === 'multiple_choice') return scoreMultipleChoice(item, state);
  if (item.type === 'short_answer') return scoreShortAnswer(item, state);
  if (item.type === 'flashcard') return scoreFlashcard(item, state);

  return {
    status: STUDY_STATUS.UNSCORED,
    answered: false,
    userAnswer: '',
    correctAnswer: '',
    canScore: false
  };
}

export function getIncompleteStudyItemCount(items = [], state = {}) {
  return items.reduce((count, item) => {
    const itemId = item?.id;
    if (!itemId) return count + 1;

    if (item.type === 'multiple_choice' || item.type === 'short_answer') {
      const hasAnswer = Boolean(String(state.answersByItemId?.[itemId] || '').trim());
      const checked = Boolean(state.checkedByItemId?.[itemId]);
      return hasAnswer && checked ? count : count + 1;
    }

    if (item.type === 'flashcard') {
      return state.flashcardRevealedByItemId?.[itemId] ? count : count + 1;
    }

    return count + 1;
  }, 0);
}

export function createStudyAttemptSummary(items = [], state = {}) {
  const safeState = {
    answersByItemId: state.answersByItemId || {},
    checkedByItemId: state.checkedByItemId || {},
    flashcardRevealedByItemId: state.flashcardRevealedByItemId || {}
  };

  const details = items.map((item, index) => {
    const scored = scoreItem(item, safeState);
    return {
      id: String(item?.id || `item-${index}`),
      index,
      prompt: item?.prompt || 'Item này chưa có prompt hợp lệ.',
      type: item?.type || 'unknown',
      topicId: item?.topicId || '',
      subjectId: item?.subjectId || '',
      typeLabel: STUDY_TYPE_LABELS[item?.type] || 'Không rõ loại',
      status: scored.status,
      statusLabel: STUDY_STATUS_LABELS[scored.status],
      userAnswer: scored.userAnswer || '',
      correctAnswer: scored.correctAnswer || '',
      explanation: item?.explanation || '',
      canScore: Boolean(scored.canScore),
      answered: Boolean(scored.answered),
      reviewed: Boolean(scored.reviewed)
    };
  });

  const correctCount = details.filter(detail => detail.status === STUDY_STATUS.CORRECT).length;
  const wrongCount = details.filter(detail => detail.status === STUDY_STATUS.WRONG).length;
  const unansweredCount = details.filter(detail => detail.status === STUDY_STATUS.UNANSWERED).length;
  const unscoredCount = details.filter(detail => detail.status === STUDY_STATUS.UNSCORED).length;
  const flashcardReviewedCount = details.filter(detail => detail.status === STUDY_STATUS.REVIEWED).length;
  const answeredCount = details.filter(detail => detail.answered).length;
  const scoredTotal = correctCount + wrongCount;
  const accuracy = scoredTotal ? Math.round((correctCount / scoredTotal) * 100) : 0;

  return {
    totalItems: details.length,
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount,
    unscoredCount,
    flashcardReviewedCount,
    scoredTotal,
    accuracy,
    details,
    visibleDetails: details.slice(0, MAX_REVIEW_ITEMS),
    hiddenDetailCount: Math.max(0, details.length - MAX_REVIEW_ITEMS)
  };
}
