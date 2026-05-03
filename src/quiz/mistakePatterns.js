const MAX_INSIGHTS = 5;
const RECENT_WINDOW_DAYS = 21;

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInteger(value, fallback = 0) {
  return Math.max(0, Math.round(toSafeNumber(value, fallback)));
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function safeText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function getQuestionKey(question = {}) {
  return safeText(question.questionKey || question.questionId || normalizeText(question.questionText));
}

function getTopic(value = {}) {
  return safeText(value.topic || value.chapter || value.category || value.section || value.group || '');
}

function isRecent(value, windowDays = RECENT_WINDOW_DAYS) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return false;
  return Date.now() - time <= windowDays * 24 * 60 * 60 * 1000;
}

function createInsight({ id, type, priority, title, reason, action, actionLabel, secondaryAction, secondaryLabel, payload = {}, tone = 'info' }) {
  return {
    id,
    type,
    priority,
    title,
    reason,
    action,
    actionLabel,
    secondaryAction,
    secondaryLabel,
    payload,
    tone
  };
}

function collectNotebookStats(notebook = []) {
  const openItems = [];
  const topicCounts = new Map();
  const repeated = [];
  const recentMock = [];

  (Array.isArray(notebook) ? notebook : []).forEach(item => {
    if (!item || typeof item !== 'object') return;
    const status = item.status || 'open';
    if (status !== 'open') return;

    openItems.push(item);

    const topic = getTopic(item) || 'Tất cả câu hỏi';
    const topicBucket = topicCounts.get(topic) || {
      topic,
      count: 0,
      questionKeys: [],
      items: []
    };
    topicBucket.count += toSafeInteger(item.mistakeCount, 1);
    if (item.questionKey) topicBucket.questionKeys.push(item.questionKey);
    topicBucket.items.push(item);
    topicCounts.set(topic, topicBucket);

    if (toSafeInteger(item.mistakeCount, 1) >= 2) repeated.push(item);
    if (isRecent(item.lastUpdatedAt || item.createdAt) && String(item.sourceAttemptId || '').trim()) {
      recentMock.push(item);
    }
  });

  return {
    openItems,
    topTopics: [...topicCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    repeated: repeated.sort((a, b) => toSafeInteger(b.mistakeCount, 1) - toSafeInteger(a.mistakeCount, 1)).slice(0, 12),
    recentMock: recentMock.slice(0, 12)
  };
}

function collectHistoryStats(history = []) {
  const topicCounts = new Map();
  const repeatedQuestions = new Map();
  let unansweredCount = 0;
  const recentMockTopics = new Map();

  (Array.isArray(history) ? history : []).forEach(attempt => {
    const questions = Array.isArray(attempt?.details?.questions) ? attempt.details.questions : [];
    const isMock = attempt?.mode === 'mock_exam';
    const attemptIsRecent = isRecent(attempt?.createdAt, 30);

    questions.forEach(question => {
      if (!question) return;
      const wasMissed = question.isCorrect === false;
      const wasUnanswered = question.userAnswer == null || (Array.isArray(question.userAnswer) && !question.userAnswer.length);
      if (wasUnanswered) unansweredCount += 1;
      if (!wasMissed && !wasUnanswered) return;

      const topic = getTopic(question) || 'Tất cả câu hỏi';
      const topicBucket = topicCounts.get(topic) || { topic, count: 0, questionKeys: [] };
      topicBucket.count += 1;
      const key = getQuestionKey(question);
      if (key) topicBucket.questionKeys.push(key);
      topicCounts.set(topic, topicBucket);

      if (key) {
        const questionBucket = repeatedQuestions.get(key) || {
          questionKey: key,
          questionText: safeText(question.questionText, 'Câu hỏi chưa có nội dung'),
          topic,
          count: 0,
          sampleDetail: question
        };
        questionBucket.count += 1;
        repeatedQuestions.set(key, questionBucket);
      }

      if (isMock && attemptIsRecent) {
        const mockBucket = recentMockTopics.get(topic) || { topic, count: 0, questionKeys: [] };
        mockBucket.count += 1;
        if (key) mockBucket.questionKeys.push(key);
        recentMockTopics.set(topic, mockBucket);
      }
    });
  });

  return {
    topTopics: [...topicCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    repeatedQuestions: [...repeatedQuestions.values()].filter(item => item.count >= 2).sort((a, b) => b.count - a.count).slice(0, 12),
    unansweredCount,
    recentMockTopics: [...recentMockTopics.values()].sort((a, b) => b.count - a.count).slice(0, 5)
  };
}

function collectDueStillWrong(reviewSchedule = [], notebook = []) {
  const dueKeys = new Set(
    (Array.isArray(reviewSchedule) ? reviewSchedule : [])
      .filter(item => new Date(item?.dueAt).getTime() <= Date.now())
      .map(item => item?.questionKey)
      .filter(Boolean)
  );

  if (!dueKeys.size) return [];

  return (Array.isArray(notebook) ? notebook : [])
    .filter(item => (item?.status || 'open') === 'open' && dueKeys.has(item.questionKey))
    .slice(0, 20);
}

function collectLowMasteryMistakes(mastery, notebook = []) {
  const lowMasteryKeys = new Set(
    (Array.isArray(mastery?.questionMastery) ? mastery.questionMastery : [])
      .filter(item => toSafeInteger(item.masteryScore, 50) < 65)
      .map(item => item.questionKey)
      .filter(Boolean)
  );

  if (!lowMasteryKeys.size) return [];

  return (Array.isArray(notebook) ? notebook : [])
    .filter(item => (item?.status || 'open') === 'open' && lowMasteryKeys.has(item.questionKey))
    .slice(0, 20);
}

export function createMistakePatternInsights({ history = [], notebook = [], reviewSchedule = [], mastery = null } = {}) {
  const notebookStats = collectNotebookStats(notebook);
  const historyStats = collectHistoryStats(history);
  const dueStillWrong = collectDueStillWrong(reviewSchedule, notebook);
  const lowMasteryMistakes = collectLowMasteryMistakes(mastery, notebook);
  const insights = [];

  const topTopic = notebookStats.topTopics[0] || historyStats.topTopics[0];
  if (topTopic && topTopic.count >= 2) {
    insights.push(createInsight({
      id: `topic-${topTopic.topic}`,
      type: 'frequent_topic',
      priority: 90 + Math.min(10, topTopic.count),
      title: `Sai nhiều nhất ở ${topTopic.topic}`,
      reason: `Có ${topTopic.count} lỗi liên quan đến phần này trong lịch sử/sổ lỗi.`,
      action: 'practiceMistakeTopic',
      actionLabel: 'Luyện phần này',
      secondaryAction: 'openMistakeNotebook',
      secondaryLabel: 'Mở sổ lỗi',
      tone: 'warning',
      payload: {
        topic: topTopic.topic,
        questionKeys: topTopic.questionKeys || []
      }
    }));
  }

  const repeated = notebookStats.repeated.length ? notebookStats.repeated : historyStats.repeatedQuestions;
  if (repeated.length) {
    insights.push(createInsight({
      id: 'repeated-mistakes',
      type: 'repeated_questions',
      priority: 86 + Math.min(8, repeated.length),
      title: `${repeated.length} câu bị sai lặp lại`,
      reason: 'Các câu này xuất hiện sai nhiều lần, nên ôn lại theo nhóm nhỏ.',
      action: 'practiceRepeatedMistakes',
      actionLabel: 'Luyện câu sai lặp lại',
      secondaryAction: 'openMistakeNotebook',
      secondaryLabel: 'Mở sổ lỗi',
      tone: 'danger',
      payload: {
        questionKeys: repeated.map(item => item.questionKey).filter(Boolean)
      }
    }));
  }

  if (dueStillWrong.length) {
    insights.push(createInsight({
      id: 'due-still-wrong',
      type: 'due_still_wrong',
      priority: 84 + Math.min(8, dueStillWrong.length),
      title: `${dueStillWrong.length} câu vừa đến hạn ôn vừa còn sai`,
      reason: 'Đây là nhóm nên xử lý sớm vì vừa đến hạn ôn tập vừa còn trong sổ lỗi.',
      action: 'reviewDue',
      actionLabel: 'Ôn tập hôm nay',
      secondaryAction: 'practiceRepeatedMistakes',
      secondaryLabel: 'Luyện nhóm này',
      tone: 'warning',
      payload: {
        questionKeys: dueStillWrong.map(item => item.questionKey).filter(Boolean)
      }
    }));
  }

  if (lowMasteryMistakes.length) {
    insights.push(createInsight({
      id: 'low-mastery-overlap',
      type: 'low_mastery_overlap',
      priority: 80 + Math.min(8, lowMasteryMistakes.length),
      title: `${lowMasteryMistakes.length} lỗi trùng với vùng mastery thấp`,
      reason: 'Các câu này vừa có mastery thấp vừa còn đang mở trong sổ lỗi sai.',
      action: 'practiceRepeatedMistakes',
      actionLabel: 'Luyện nhóm này',
      secondaryAction: 'masteryBoost',
      secondaryLabel: 'Mastery Boost',
      tone: 'danger',
      payload: {
        questionKeys: lowMasteryMistakes.map(item => item.questionKey).filter(Boolean)
      }
    }));
  }

  const recentMockTopic = historyStats.recentMockTopics[0];
  if (recentMockTopic && recentMockTopic.count >= 2) {
    insights.push(createInsight({
      id: `recent-mock-${recentMockTopic.topic}`,
      type: 'recent_mock_topic',
      priority: 78 + Math.min(8, recentMockTopic.count),
      title: `Mock Exam gần đây yếu ở ${recentMockTopic.topic}`,
      reason: `Mock Exam gần đây ghi nhận ${recentMockTopic.count} lỗi/chưa trả lời ở phần này.`,
      action: 'practiceMistakeTopic',
      actionLabel: 'Luyện phần này',
      secondaryAction: 'mockExam',
      secondaryLabel: 'Làm mock exam',
      tone: 'info',
      payload: {
        topic: recentMockTopic.topic,
        questionKeys: recentMockTopic.questionKeys || []
      }
    }));
  }

  if (historyStats.unansweredCount >= 3) {
    insights.push(createInsight({
      id: 'unanswered-pattern',
      type: 'unanswered',
      priority: 58 + Math.min(10, historyStats.unansweredCount),
      title: `${historyStats.unansweredCount} lượt bỏ trống/chưa trả lời`,
      reason: 'Nếu thường bỏ trống, hãy luyện theo phiên ngắn hoặc giảm số câu mỗi lần.',
      action: 'quickReview',
      actionLabel: 'Quick Review',
      secondaryAction: 'openBuilder',
      secondaryLabel: 'Mở tạo đề',
      tone: 'info'
    }));
  }

  const seen = new Set();
  return insights
    .sort((a, b) => b.priority - a.priority)
    .filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_INSIGHTS);
}
