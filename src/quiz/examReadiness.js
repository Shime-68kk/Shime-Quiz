const MIN_DATA_ATTEMPTS = 2;
const MIN_ANSWERED_QUESTIONS = 10;

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInteger(value, fallback = 0) {
  return Math.max(0, Math.round(toSafeNumber(value, fallback)));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  const safeValues = (Array.isArray(values) ? values : [])
    .map(value => toSafeNumber(value, NaN))
    .filter(Number.isFinite);

  if (!safeValues.length) return 0;
  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
}

function getLevel(score) {
  if (score < 40) return { key: 'needsWork', label: 'Cần củng cố' };
  if (score < 70) return { key: 'improving', label: 'Đang tiến bộ' };
  if (score < 85) return { key: 'nearReady', label: 'Gần sẵn sàng' };
  return { key: 'highReady', label: 'Sẵn sàng cao' };
}

function getRecentScores(history = []) {
  return (Array.isArray(history) ? history : [])
    .slice()
    .sort((a, b) => new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime())
    .slice(-5)
    .map(item => clamp(toSafeInteger(item?.percentage, 0)));
}


function getRecentMockScores(history = []) {
  return (Array.isArray(history) ? history : [])
    .filter(item => item?.mode === 'mock_exam')
    .slice()
    .sort((a, b) => new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime())
    .slice(-3)
    .map(item => clamp(toSafeInteger(item?.percentage, 0)));
}

function blendRecentScoreComponent(recentScores, mockScores, fallbackAverage = 0) {
  const recentAverage = recentScores.length ? average(recentScores) : toSafeNumber(fallbackAverage, 0);
  const trendDelta = computeTrendDelta(recentScores);
  const base = clamp(Math.round(recentAverage + clamp(trendDelta, -10, 10) * 0.6));
  if (!mockScores.length) return { component: base, recentAverage, trendDelta, mockAverage: null };

  const mockAverage = average(mockScores);
  const component = clamp(Math.round(base * 0.65 + mockAverage * 0.35));
  return { component, recentAverage, trendDelta, mockAverage: Math.round(mockAverage) };
}

function computeTrendDelta(scores) {
  if (!Array.isArray(scores) || scores.length < 2) return 0;
  const split = Math.max(1, Math.floor(scores.length / 2));
  const older = average(scores.slice(0, split));
  const newer = average(scores.slice(split));
  return Math.round(newer - older);
}

function getTopicCount(mastery) {
  return Array.isArray(mastery?.topicMastery) ? mastery.topicMastery.length : 0;
}

function getWeakTopicCount(mastery) {
  const topics = Array.isArray(mastery?.topicMastery) ? mastery.topicMastery : [];
  return topics.filter(topic => toSafeInteger(topic?.masteryScore, 100) < 65 || toSafeInteger(topic?.weakCount, 0) > 0).length;
}

function getWeakestTopic(mastery) {
  const topics = Array.isArray(mastery?.weakestTopics) ? mastery.weakestTopics : [];
  return topics.find(topic => topic && topic.topic && topic.topic !== 'Tất cả câu hỏi') || topics[0] || null;
}

function computeDueComponent(dueReviewCount, reviewSchedule = []) {
  const totalReviewItems = Array.isArray(reviewSchedule) ? reviewSchedule.length : 0;
  if (!totalReviewItems && dueReviewCount <= 0) return 85;

  const ratio = totalReviewItems ? dueReviewCount / Math.max(1, totalReviewItems) : Math.min(1, dueReviewCount / 20);
  return clamp(Math.round(100 - ratio * 75 - Math.min(20, dueReviewCount * 2)), 10, 100);
}

function computeWeakTopicComponent(mastery) {
  const topicCount = getTopicCount(mastery);
  const weakTopicCount = getWeakTopicCount(mastery);
  if (!topicCount) return 75;

  return clamp(Math.round(100 - (weakTopicCount / topicCount) * 80), 10, 100);
}

function computeGoalComponent(studyPlan, studyStreak = 0) {
  if (studyPlan?.hasGoal) {
    const progress = clamp(toSafeInteger(studyPlan.progressPercent, 0));
    const pastDuePenalty = studyPlan.isPastDue ? 20 : 0;
    return clamp(progress + Math.min(18, toSafeInteger(studyStreak, 0) * 4) - pastDuePenalty, 0, 100);
  }

  return clamp(50 + Math.min(25, toSafeInteger(studyStreak, 0) * 5), 0, 100);
}

function getPrimaryAction({ dueReviewCount, weakMasteryCount, score, hasEnoughData }) {
  if (dueReviewCount > 0) {
    return { action: 'reviewDue', label: 'Ôn tập hôm nay' };
  }

  if (!hasEnoughData) {
    return { action: 'quickReview', label: 'Làm Quick Review' };
  }

  if (weakMasteryCount > 0 || score < 70) {
    return { action: 'practiceWeakMastery', label: 'Luyện phần yếu' };
  }

  return { action: 'mockExam', label: 'Làm mock exam' };
}

function getFactors({ mastery, recentScores, dueReviewCount, weakTopicCount, weakestTopic, trendDelta, studyPlan, score, hasEnoughData, mockAverage }) {
  const factors = [];

  if (!hasEnoughData) {
    factors.push('Chưa đủ dữ liệu để ước tính chính xác. Hãy làm thêm vài bài để kết quả ổn định hơn.');
  }

  if (dueReviewCount > 0) {
    factors.push(`Điểm bị kéo xuống vì còn ${dueReviewCount} câu đến hạn ôn.`);
  } else if (hasEnoughData) {
    factors.push('Không có nhiều câu quá hạn ôn, đây là tín hiệu tốt.');
  }

  if (weakestTopic && toSafeInteger(weakestTopic.masteryScore, 100) < 70) {
    factors.push(`${weakestTopic.topic || 'Một chủ đề'} đang yếu nhất (${toSafeInteger(weakestTopic.masteryScore, 0)}%).`);
  } else if (weakTopicCount > 0) {
    factors.push(`Còn ${weakTopicCount} chủ đề cần củng cố.`);
  }

  if (mockAverage != null) {
    factors.push(`Mock exam gần đây trung bình khoảng ${mockAverage}%, được tính như tín hiệu exam-like.`);
  }

  if (recentScores.length) {
    const recentAverage = Math.round(average(recentScores));
    if (trendDelta >= 5) factors.push(`Điểm gần đây đang tăng, trung bình khoảng ${recentAverage}%.`);
    else if (trendDelta <= -5) factors.push(`Điểm gần đây đang giảm nhẹ, trung bình khoảng ${recentAverage}%.`);
    else factors.push(`Điểm gần đây ổn định, trung bình khoảng ${recentAverage}%.`);
  }

  if (studyPlan?.hasGoal) {
    factors.push(`Tiến độ mục tiêu học tập khoảng ${toSafeInteger(studyPlan.progressPercent, 0)}%.`);
  }

  if (!factors.length) {
    factors.push(score >= 70 ? 'Các tín hiệu học tập hiện khá ổn định.' : 'Hãy bắt đầu với một phiên ôn ngắn để tạo dữ liệu đánh giá.');
  }

  return factors.slice(0, 3);
}

export function createExamReadiness({ analytics = {}, history = [], reviewSchedule = [], studyPlan = null } = {}) {
  const mastery = analytics?.mastery || {};
  const totalAttempts = toSafeInteger(analytics?.totalAttempts, Array.isArray(history) ? history.length : 0);
  const totalQuestionsAnswered = toSafeInteger(analytics?.totalQuestionsAnswered, 0);
  const dueReviewCount = toSafeInteger(analytics?.dueReviewCount, 0);
  const weakMasteryCount = toSafeInteger(mastery?.weakCount, 0);
  const studyStreak = toSafeInteger(analytics?.studyStreak, 0);
  const recentScores = getRecentScores(history.length ? history : []);
  const mockScores = getRecentMockScores(history.length ? history : []);
  const scoreBlend = blendRecentScoreComponent(recentScores, mockScores, analytics?.averageScore);
  const recentAverage = scoreBlend.recentAverage;
  const trendDelta = scoreBlend.trendDelta;
  const masteryAverage = clamp(toSafeInteger(mastery?.overallMastery, 0));
  const dueComponent = computeDueComponent(dueReviewCount, reviewSchedule);
  const weakTopicComponent = computeWeakTopicComponent(mastery);
  const goalComponent = computeGoalComponent(studyPlan, studyStreak);
  const recentScoreComponent = scoreBlend.component;

  const rawScore = (
    masteryAverage * 0.40 +
    recentScoreComponent * 0.25 +
    dueComponent * 0.15 +
    weakTopicComponent * 0.10 +
    goalComponent * 0.10
  );
  const score = clamp(Math.round(rawScore));
  const level = getLevel(score);
  const hasEnoughData = totalAttempts >= MIN_DATA_ATTEMPTS || totalQuestionsAnswered >= MIN_ANSWERED_QUESTIONS || toSafeInteger(mastery?.answeredQuestionCount, 0) >= MIN_DATA_ATTEMPTS;
  const weakestTopic = getWeakestTopic(mastery);
  const weakTopicCount = getWeakTopicCount(mastery);
  const primaryAction = getPrimaryAction({ dueReviewCount, weakMasteryCount, score, hasEnoughData });

  return {
    score,
    level: level.key,
    levelLabel: level.label,
    title: 'Ước tính mức sẵn sàng',
    hasEnoughData,
    components: {
      masteryAverage,
      recentScore: Math.round(recentScoreComponent),
      dueReadiness: dueComponent,
      weakTopicReadiness: weakTopicComponent,
      goalConsistency: goalComponent
    },
    factors: getFactors({
      mastery,
      recentScores,
      dueReviewCount,
      weakTopicCount,
      weakestTopic,
      trendDelta,
      studyPlan,
      score,
      hasEnoughData,
      mockAverage: scoreBlend.mockAverage
    }),
    primaryAction,
    secondaryAction: { action: 'openBuilder', label: 'Mở tạo đề' }
  };
}
