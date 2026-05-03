import { getRecommendationFeedbackSummary, loadRecommendationFeedback } from './recommendationFeedback.js';

const MAX_RECOMMENDATIONS = 3;

function toSafeInteger(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function hasLearningSignal(question) {
  return Boolean(question && (
    question.attempts > 0 ||
    question.wrongCount > 0 ||
    question.correctStreak > 0 ||
    question.isDue === true ||
    question.lastAnsweredAt ||
    question.lastReviewedAt
  ));
}

function findWeakTopic(mastery, topics = []) {
  const topicMastery = Array.isArray(mastery?.weakestTopics) ? mastery.weakestTopics : [];
  const topicList = Array.isArray(topics) ? topics : [];

  const matched = topicMastery
    .filter(topic => topic && topic.topic && topic.topic !== 'Tất cả câu hỏi')
    .filter(topic => toSafeInteger(topic.weakCount, 0) > 0 || toSafeInteger(topic.masteryScore, 100) < 65)
    .map(topic => {
      const builderTopic = topicList.find(item => item.label === topic.topic);
      return {
        ...topic,
        topicKey: builderTopic?.key || '',
        topicLabel: topic.topic
      };
    })
    .filter(topic => topic.topicKey);

  return matched[0] || null;
}

function getLowMasteryCount(mastery) {
  const items = Array.isArray(mastery?.questionMastery) ? mastery.questionMastery : [];
  return items.filter(item => hasLearningSignal(item) && toSafeInteger(item.masteryScore, 50) < 65).length;
}

function getRecentWrongCount(analytics) {
  const weakQuestions = Array.isArray(analytics?.weakQuestions) ? analytics.weakQuestions : [];
  return weakQuestions.reduce((sum, item) => sum + toSafeInteger(item.wrongCount, 0), 0);
}

function createRecommendation({ id, priority, title, reason, action, actionLabel, secondaryAction, secondaryLabel, tone = 'info', payload = {} }) {
  return {
    id,
    priority,
    title,
    reason,
    action,
    actionLabel,
    secondaryAction,
    secondaryLabel,
    tone,
    payload
  };
}

function applyRecommendationFeedback(recommendations, feedbackItems, { dueReviewCount = 0 } = {}) {
  const summary = getRecommendationFeedbackSummary(feedbackItems);
  const adjusted = [];

  recommendations.forEach(recommendation => {
    const type = recommendation.id || recommendation.action;
    const feedback = summary.get(type);
    const mustKeepDueReview = type === 'reviewDue' && dueReviewCount >= 5;

    if (feedback?.hiddenToday && !mustKeepDueReview) return;

    adjusted.push({
      ...recommendation,
      priority: recommendation.priority + (feedback?.priorityAdjustment || 0),
      feedbackType: type
    });
  });

  if (adjusted.length) return adjusted;

  return [createRecommendation({
    id: 'openBuilderFallback',
    priority: 1,
    title: 'Chọn bài học phù hợp',
    reason: 'Các gợi ý chính đã được ẩn hôm nay. Bạn vẫn có thể tạo đề theo nhu cầu hiện tại.',
    action: 'openBuilder',
    actionLabel: 'Mở tạo đề',
    tone: 'info'
  })];
}

function createGoalRecommendation(studyPlan) {
  if (!studyPlan?.hasGoal) return null;

  const goal = studyPlan.goal;
  const focusLabels = {
    balanced: 'cân bằng',
    weakFirst: 'ưu tiên vùng yếu',
    dueFirst: 'ưu tiên câu cần ôn',
    selectedTopics: 'theo chương/chủ đề'
  };

  return createRecommendation({
    id: 'studyGoalToday',
    priority: studyPlan.dueReviewCount > 0 ? 96 : 74,
    title: 'Theo mục tiêu học tập hôm nay',
    reason: `${studyPlan.recommendedReason} Còn ${Math.max(0, studyPlan.daysRemaining)} ngày · mục tiêu ${goal.dailyQuestionTarget} câu/ngày · ${focusLabels[goal.focusMode] || focusLabels.balanced}.`,
    action: 'startGoalToday',
    actionLabel: 'Bắt đầu hôm nay',
    secondaryAction: 'editStudyGoal',
    secondaryLabel: 'Sửa mục tiêu',
    tone: studyPlan.isPastDue ? 'warning' : 'success',
    payload: { focusMode: goal.focusMode, selectedTopics: goal.selectedTopics || [] }
  });
}

export function createDailyRecommendations({ analytics, topics = [], feedback = loadRecommendationFeedback(), studyPlan = null } = {}) {
  const stats = analytics || {};
  const mastery = stats.mastery || {};
  const recommendations = [];
  const totalAttempts = toSafeInteger(stats.totalAttempts, 0);
  const dueReviewCount = toSafeInteger(stats.dueReviewCount, 0);
  const lowMasteryCount = getLowMasteryCount(mastery);
  const recentWrongCount = getRecentWrongCount(stats);
  const weakTopic = findWeakTopic(mastery, topics);
  const studyStreak = toSafeInteger(stats.studyStreak, 0);
  const openMistakeCount = toSafeInteger(stats.openMistakeCount, 0);
  const mistakePatternCount = Array.isArray(stats.mistakePatterns) ? stats.mistakePatterns.length : 0;
  const goalRecommendation = createGoalRecommendation(studyPlan);
  if (goalRecommendation) recommendations.push(goalRecommendation);

  if (!totalAttempts) {
    recommendations.push(createRecommendation({
      id: 'firstQuiz',
      priority: 95,
      title: 'Bắt đầu bài đầu tiên',
      reason: 'Chưa có lịch sử học, hãy bắt đầu bài đầu tiên để tạo dữ liệu gợi ý.',
      action: 'startFirstQuiz',
      actionLabel: 'Bắt đầu học',
      secondaryAction: 'openBuilder',
      secondaryLabel: 'Mở tạo đề',
      tone: 'success'
    }));
  }

  if (dueReviewCount > 0) {
    recommendations.push(createRecommendation({
      id: 'reviewDue',
      priority: 100,
      title: 'Ôn tập hôm nay',
      reason: `Có ${dueReviewCount} câu đến hạn ôn.`,
      action: 'reviewDue',
      actionLabel: 'Ôn tập ngay',
      secondaryAction: 'quickReview',
      secondaryLabel: 'Quick Review',
      tone: 'warning'
    }));
  }

  if (lowMasteryCount > 0) {
    recommendations.push(createRecommendation({
      id: 'weakMastery',
      priority: 84,
      title: 'Củng cố mastery yếu',
      reason: `Có ${lowMasteryCount} câu mastery thấp cần luyện thêm.`,
      action: 'practiceWeakMastery',
      actionLabel: 'Luyện mastery yếu',
      secondaryAction: 'masteryBoost',
      secondaryLabel: 'Mastery Boost',
      tone: 'danger'
    }));
  } else if (recentWrongCount > 0) {
    recommendations.push(createRecommendation({
      id: 'recentWrong',
      priority: 78,
      title: 'Luyện câu thường sai',
      reason: `Bạn có ${recentWrongCount} lượt sai trong lịch sử gần đây.`,
      action: 'practiceWeak',
      actionLabel: 'Luyện top câu yếu',
      secondaryAction: 'quickReview',
      secondaryLabel: 'Quick Review',
      tone: 'warning'
    }));
  }


  if (openMistakeCount >= 3) {
    recommendations.push(createRecommendation({
      id: 'mistakeNotebook',
      priority: openMistakeCount >= 8 ? 86 : 70,
      title: 'Xem lại sổ lỗi sai',
      reason: `Bạn có ${openMistakeCount} lỗi sai đang mở trong sổ lỗi.`,
      action: 'practiceMistakeNotebook',
      actionLabel: 'Luyện sổ lỗi',
      secondaryAction: 'openMistakeNotebook',
      secondaryLabel: 'Mở sổ lỗi',
      tone: 'warning'
    }));
  }

  if (mistakePatternCount > 0) {
    recommendations.push(createRecommendation({
      id: 'mistakePatterns',
      priority: mistakePatternCount >= 3 ? 82 : 68,
      title: 'Xem mẫu lỗi sai',
      reason: `Phát hiện ${mistakePatternCount} mẫu lỗi sai có thể luyện theo nhóm.`,
      action: 'openMistakePatterns',
      actionLabel: 'Xem mẫu lỗi',
      secondaryAction: 'practiceRepeatedMistakes',
      secondaryLabel: 'Luyện lỗi lặp lại',
      tone: 'warning'
    }));
  }

  if (weakTopic) {
    recommendations.push(createRecommendation({
      id: 'deepDiveWeakTopic',
      priority: 72,
      title: `Đào sâu ${weakTopic.topicLabel}`,
      reason: `${weakTopic.topicLabel} có mastery thấp nhất (${toSafeInteger(weakTopic.masteryScore, 0)}%).`,
      action: 'deepDiveTopic',
      actionLabel: 'Deep Dive chủ đề này',
      secondaryAction: 'masteryBoost',
      secondaryLabel: 'Mastery Boost',
      tone: 'info',
      payload: {
        topicKey: weakTopic.topicKey,
        topicLabel: weakTopic.topicLabel
      }
    }));
  }

  if (totalAttempts > 0) {
    recommendations.push(createRecommendation({
      id: 'quickReview',
      priority: studyStreak > 0 ? 58 : 52,
      title: studyStreak > 0 ? 'Giữ nhịp học hôm nay' : 'Ôn nhanh 15–20 câu',
      reason: studyStreak > 0
        ? `Bạn đang có chuỗi ${studyStreak} ngày. Một phiên ngắn giúp duy trì nhịp học.`
        : 'Một phiên Quick Review giúp củng cố câu cần ôn, câu từng sai và câu chưa làm.',
      action: 'quickReview',
      actionLabel: 'Bắt đầu Quick Review',
      tone: 'success'
    }));
  }

  if (!recommendations.length) {
    recommendations.push(createRecommendation({
      id: 'openBuilder',
      priority: 10,
      title: 'Chọn bài học phù hợp',
      reason: 'Chưa có đủ dữ liệu gợi ý. Bạn có thể tạo đề theo chương hoặc số câu mong muốn.',
      action: 'openBuilder',
      actionLabel: 'Mở tạo đề',
      tone: 'info'
    }));
  }

  const seen = new Set();
  return applyRecommendationFeedback(recommendations, feedback, { dueReviewCount })
    .sort((a, b) => b.priority - a.priority)
    .filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_RECOMMENDATIONS);
}
