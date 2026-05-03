let analyticsPanelInitialized = false;

function appendText(parent, text, className, tagName = 'div') {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function appendButton(parent, text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  parent.appendChild(button);
  return button;
}

function createMetric(label, value, hint = '') {
  const card = document.createElement('article');
  card.className = 'analyticsMetric';
  appendText(card, String(value), 'analyticsMetricValue');
  appendText(card, label, 'analyticsMetricLabel');
  if (hint) appendText(card, hint, 'muted analyticsMetricHint');
  return card;
}

function createTrend(trend) {
  const wrap = document.createElement('section');
  wrap.className = 'analyticsBlock';
  appendText(wrap, 'Xu hướng điểm gần đây', 'analyticsBlockTitle');

  if (!Array.isArray(trend) || !trend.length) {
    appendText(wrap, 'Chưa đủ dữ liệu để hiển thị xu hướng.', 'muted analyticsEmpty');
    return wrap;
  }

  const bars = document.createElement('div');
  bars.className = 'analyticsTrend';

  trend.forEach(point => {
    const bar = document.createElement('span');
    const percentage = Math.max(0, Math.min(100, Number(point.percentage) || 0));
    bar.className = 'analyticsTrendBar';
    bar.style.setProperty('--bar-height', `${Math.max(8, percentage)}%`);
    bar.title = `${percentage}%`;
    bar.setAttribute('aria-label', `${percentage}%`);
    bars.appendChild(bar);
  });

  wrap.appendChild(bars);
  return wrap;
}



function createReadinessRing(score) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const ring = document.createElement('div');
  ring.className = 'examReadinessRing';
  ring.setAttribute('role', 'img');
  ring.setAttribute('aria-label', `Ước tính mức sẵn sàng ${Math.round(pct)}%`);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 96 96');
  svg.setAttribute('aria-hidden', 'true');

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bg.setAttribute('class', 'examReadinessTrack');
  bg.setAttribute('cx', '48');
  bg.setAttribute('cy', '48');
  bg.setAttribute('r', String(radius));

  const progress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  progress.setAttribute('class', 'examReadinessProgress');
  progress.setAttribute('cx', '48');
  progress.setAttribute('cy', '48');
  progress.setAttribute('r', String(radius));
  progress.style.strokeDasharray = String(circumference);
  progress.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);

  svg.append(bg, progress);

  const center = document.createElement('div');
  center.className = 'examReadinessCenter';
  appendText(center, `${Math.round(pct)}%`, 'examReadinessScore');
  appendText(center, 'sẵn sàng', 'examReadinessSubtext');

  ring.append(svg, center);
  return ring;
}

function createExamReadinessCard(readiness, onRecommendationAction) {
  const card = document.createElement('section');
  card.className = `examReadinessCard is-${readiness?.level || 'unknown'}`;
  appendText(card, 'Exam Readiness', 'analyticsBlockTitle');

  if (!readiness) {
    appendText(card, 'Chưa đủ dữ liệu để ước tính chính xác. Hãy làm một bài quiz hoặc Quick Review để bắt đầu.', 'muted analyticsEmpty');
    return card;
  }

  const body = document.createElement('div');
  body.className = 'examReadinessBody';
  body.appendChild(createReadinessRing(readiness.score));

  const copy = document.createElement('div');
  copy.className = 'examReadinessCopy';
  appendText(copy, readiness.title || 'Ước tính mức sẵn sàng', 'examReadinessEyebrow');
  appendText(copy, readiness.levelLabel || 'Đang cập nhật', 'examReadinessLevel');
  appendText(
    copy,
    readiness.hasEnoughData
      ? 'Không phải dự đoán điểm thi; đây là chỉ báo dựa trên dữ liệu học cục bộ.'
      : 'Chưa đủ dữ liệu để ước tính chính xác. Hãy làm thêm vài bài để chỉ số ổn định hơn.',
    'muted examReadinessNote'
  );
  body.appendChild(copy);
  card.appendChild(body);

  const factors = Array.isArray(readiness.factors) ? readiness.factors : [];
  if (factors.length) {
    const list = document.createElement('ul');
    list.className = 'examReadinessFactors';
    factors.slice(0, 3).forEach(factor => {
      const item = document.createElement('li');
      item.textContent = factor;
      list.appendChild(item);
    });
    card.appendChild(list);
  }

  const actions = document.createElement('div');
  actions.className = 'examReadinessActions';
  if (readiness.primaryAction?.action) {
    appendButton(actions, readiness.primaryAction.label || 'Bắt đầu', 'btn small ok', () => {
      onRecommendationAction?.(readiness.primaryAction.action, { id: 'examReadiness', payload: readiness });
    });
  }
  if (readiness.secondaryAction?.action) {
    appendButton(actions, readiness.secondaryAction.label || 'Mở tạo đề', 'btn small secondary', () => {
      onRecommendationAction?.(readiness.secondaryAction.action, { id: 'examReadiness', payload: readiness });
    });
  }
  card.appendChild(actions);

  return card;
}

function createMasteryMeter(score) {
  const meter = document.createElement('div');
  meter.className = 'analyticsMasteryMeter';
  meter.setAttribute('aria-label', `Mức độ thành thạo ${score}%`);
  const fill = document.createElement('span');
  fill.style.width = `${Math.max(4, Math.max(0, Math.min(100, Number(score) || 0)))}%`;
  meter.appendChild(fill);
  return meter;
}

function createMasteryTopics(mastery) {
  const wrap = document.createElement('section');
  wrap.className = 'analyticsBlock';
  appendText(wrap, 'Mastery theo chủ đề', 'analyticsBlockTitle');

  const topics = mastery?.weakestTopics;
  if (!Array.isArray(topics) || !topics.length) {
    appendText(wrap, 'Chưa đủ dữ liệu hoặc chưa có chapter/category để tính mastery theo chủ đề.', 'muted analyticsEmpty');
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'analyticsWeakList';

  topics.slice(0, 6).forEach(topic => {
    const item = document.createElement('article');
    item.className = 'analyticsWeakItem analyticsMasteryItem';
    appendText(item, topic.topic || 'Tất cả câu hỏi', 'analyticsWeakTitle');
    appendText(item, `${topic.masteryScore}% mastery · ${topic.questionCount} câu · ${topic.weakCount} câu yếu`, 'muted analyticsWeakMeta');
    item.appendChild(createMasteryMeter(topic.masteryScore));
    list.appendChild(item);
  });

  wrap.appendChild(list);
  return wrap;
}

function createMasteryQuestions(title, questions, emptyText) {
  const wrap = document.createElement('section');
  wrap.className = 'analyticsBlock';
  appendText(wrap, title, 'analyticsBlockTitle');

  if (!Array.isArray(questions) || !questions.length) {
    appendText(wrap, emptyText, 'muted analyticsEmpty');
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'analyticsWeakList';

  questions.slice(0, 6).forEach(question => {
    const item = document.createElement('article');
    item.className = 'analyticsWeakItem analyticsMasteryItem';
    appendText(item, question.questionText || 'Câu hỏi chưa có trong dữ liệu hiện tại', 'analyticsWeakTitle');
    appendText(
      item,
      `${question.masteryScore}% · ${question.label || 'Mastery'} · sai ${question.wrongCount || 0} lần · streak ${question.correctStreak || 0}`,
      'muted analyticsWeakMeta'
    );
    item.appendChild(createMasteryMeter(question.masteryScore));
    list.appendChild(item);
  });

  wrap.appendChild(list);
  return wrap;
}

function createWeakTopics(topics) {
  const wrap = document.createElement('section');
  wrap.className = 'analyticsBlock';
  appendText(wrap, 'Khu vực yếu', 'analyticsBlockTitle');

  if (!Array.isArray(topics) || !topics.length) {
    appendText(wrap, 'Chưa có chapter/category đủ rõ để nhóm khu vực yếu.', 'muted analyticsEmpty');
    return wrap;
  }

  const maxWrong = Math.max(1, ...topics.map(topic => Number(topic.wrongCount) || 0));
  const list = document.createElement('div');
  list.className = 'analyticsWeakList';

  topics.forEach(topic => {
    const row = document.createElement('article');
    row.className = 'analyticsWeakItem';
    appendText(row, topic.topic, 'analyticsWeakTitle');
    appendText(row, `${topic.wrongCount} lần sai · ${topic.questionCount} câu`, 'muted analyticsWeakMeta');

    const meter = document.createElement('div');
    meter.className = 'analyticsMiniMeter';
    const fill = document.createElement('span');
    fill.style.width = `${Math.max(6, Math.round((topic.wrongCount / maxWrong) * 100))}%`;
    meter.appendChild(fill);
    row.appendChild(meter);
    list.appendChild(row);
  });

  wrap.appendChild(list);
  return wrap;
}

function createWeakQuestions(questions) {
  const wrap = document.createElement('section');
  wrap.className = 'analyticsBlock';
  appendText(wrap, 'Câu hay sai', 'analyticsBlockTitle');

  if (!Array.isArray(questions) || !questions.length) {
    appendText(wrap, 'Chưa có câu sai lặp lại. Hãy làm thêm quiz để có gợi ý.', 'muted analyticsEmpty');
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'analyticsWeakList';

  questions.forEach(question => {
    const item = document.createElement('article');
    item.className = 'analyticsWeakItem';
    appendText(item, question.questionText || 'Câu hỏi không có nội dung', 'analyticsWeakTitle');
    appendText(item, `${question.wrongCount} lần sai`, 'muted analyticsWeakMeta');
    list.appendChild(item);
  });

  wrap.appendChild(list);
  return wrap;
}

function createMistakePatternBlock(patterns, onMistakePatternAction) {
  const wrap = document.createElement('section');
  wrap.className = 'analyticsBlock mistakePatternBlock';
  appendText(wrap, 'Mẫu lỗi sai', 'analyticsBlockTitle');

  if (!Array.isArray(patterns) || !patterns.length) {
    appendText(wrap, 'Chưa đủ dữ liệu để phát hiện mẫu lỗi sai. Hãy thêm câu sai vào sổ lỗi hoặc làm thêm Mock Exam.', 'muted analyticsEmpty');
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'mistakePatternList';

  patterns.slice(0, 5).forEach(pattern => {
    const item = document.createElement('article');
    item.className = `mistakePatternItem is-${pattern.tone || 'info'}`;
    appendText(item, pattern.title || 'Mẫu lỗi sai', 'mistakePatternTitle');
    appendText(item, pattern.reason || 'Dựa trên sổ lỗi và lịch sử làm bài.', 'muted mistakePatternReason');

    const actions = document.createElement('div');
    actions.className = 'mistakePatternActions';
    if (pattern.action) {
      appendButton(actions, pattern.actionLabel || 'Luyện ngay', 'btn tiny secondary', () => {
        onMistakePatternAction?.(pattern.action, pattern);
      });
    }
    if (pattern.secondaryAction) {
      appendButton(actions, pattern.secondaryLabel || 'Xem thêm', 'btn tiny ghost', () => {
        onMistakePatternAction?.(pattern.secondaryAction, pattern);
      });
    }
    item.appendChild(actions);
    list.appendChild(item);
  });

  wrap.appendChild(list);
  return wrap;
}


function createRecommendationCard(recommendation, onRecommendationAction, onRecommendationFeedback) {
  const card = document.createElement('article');
  card.className = `dailyRecommendationItem is-${recommendation.tone || 'info'}`;

  appendText(card, recommendation.title || 'Gợi ý học hôm nay', 'dailyRecommendationTitle');
  appendText(card, recommendation.reason || 'Dựa trên dữ liệu học cục bộ của bạn.', 'muted dailyRecommendationReason');

  const actions = document.createElement('div');
  actions.className = 'dailyRecommendationActions';
  const primary = appendButton(actions, recommendation.actionLabel || 'Bắt đầu', 'btn small ok', () => {
    onRecommendationAction?.(recommendation.action, recommendation);
  });
  primary.disabled = !recommendation.action;

  if (recommendation.secondaryAction && recommendation.secondaryLabel) {
    appendButton(actions, recommendation.secondaryLabel, 'btn small secondary', () => {
      onRecommendationAction?.(recommendation.secondaryAction, recommendation);
    });
  }

  card.appendChild(actions);

  const feedback = document.createElement('div');
  feedback.className = 'dailyRecommendationFeedback';
  appendButton(feedback, 'Hữu ích', 'btn tiny ghost', () => onRecommendationFeedback?.(recommendation, 'helpful'));
  appendButton(feedback, 'Không phù hợp', 'btn tiny ghost', () => onRecommendationFeedback?.(recommendation, 'not_relevant'));
  appendButton(feedback, 'Ẩn hôm nay', 'btn tiny ghost', () => onRecommendationFeedback?.(recommendation, 'hidden_today'));
  card.appendChild(feedback);

  return card;
}

function createRecommendationBlock(recommendations, onRecommendationAction, onRecommendationFeedback) {
  const wrap = document.createElement('section');
  wrap.className = 'dailyRecommendationBlock';
  appendText(wrap, 'Hôm nay nên học gì?', 'analyticsBlockTitle');

  if (!Array.isArray(recommendations) || !recommendations.length) {
    appendText(wrap, 'Chưa có đủ dữ liệu gợi ý. Hãy làm một bài quiz hoặc tạo đề tùy chỉnh để bắt đầu.', 'muted analyticsEmpty');
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'dailyRecommendationList';
  recommendations.forEach(recommendation => {
    list.appendChild(createRecommendationCard(recommendation, onRecommendationAction, onRecommendationFeedback));
  });
  wrap.appendChild(list);
  return wrap;
}

function renderEmpty(container, recommendations, onRecommendationAction, onRecommendationFeedback) {
  container.replaceChildren();
  container.appendChild(createRecommendationBlock(recommendations, onRecommendationAction, onRecommendationFeedback));
  container.appendChild(createExamReadinessCard(null, onRecommendationAction));
  appendText(container, 'Thống kê sẽ tổng hợp điểm số, chuỗi học và câu yếu sau khi bạn hoàn thành bài quiz đầu tiên.', 'muted analyticsEmpty');
}

export function initAnalyticsPanel({ computeAnalytics, computeRecommendations, onPracticeWeak, onPracticeWeakMastery, onReviewDue, onPracticeMistakeNotebook, onMistakePatternAction, onRecommendationAction, onRecommendationFeedback } = {}) {
  if (analyticsPanelInitialized) return { refresh: () => {} };
  analyticsPanelInitialized = true;

  const panel = document.getElementById('analyticsPanel');
  const content = document.getElementById('analyticsContent');
  const toggleButton = document.getElementById('btnToggleAnalytics');
  let isOpen = false;
  let cachedAnalytics = null;

  function getAnalytics({ force = false } = {}) {
    if (!cachedAnalytics || force) cachedAnalytics = computeAnalytics?.() || null;
    return cachedAnalytics;
  }


  function handleRecommendationFeedback(recommendation, feedback) {
    const didChangeVisibility = feedback === 'hidden_today';
    onRecommendationFeedback?.(recommendation, feedback);
    cachedAnalytics = null;
    if (didChangeVisibility) render();
  }

  function render() {
    if (!content) return;

    const analytics = getAnalytics();
    const recommendations = computeRecommendations?.(analytics) || [];
    if (!analytics || analytics.totalAttempts === 0) {
      renderEmpty(content, recommendations, onRecommendationAction, handleRecommendationFeedback);
      return;
    }

    const fragment = document.createDocumentFragment();
    fragment.appendChild(createRecommendationBlock(recommendations, onRecommendationAction, handleRecommendationFeedback));
    fragment.appendChild(createExamReadinessCard(analytics.examReadiness, onRecommendationAction));

    const metrics = document.createElement('div');
    metrics.className = 'analyticsGrid';
    metrics.appendChild(createMetric('Lượt làm bài', analytics.totalAttempts));
    metrics.appendChild(createMetric('Câu đã làm', analytics.totalQuestionsAnswered));
    metrics.appendChild(createMetric('Điểm TB', `${analytics.averageScore}%`));
    metrics.appendChild(createMetric('Tốt nhất', `${analytics.bestScore}%`));
    metrics.appendChild(createMetric('Câu sai', analytics.totalWrongQuestions));
    metrics.appendChild(createMetric('Đã lưu', analytics.bookmarkCount || 0));
    metrics.appendChild(createMetric('Sổ lỗi mở', analytics.openMistakeCount || 0));
    metrics.appendChild(createMetric('Mastery TB', `${analytics.mastery?.overallMastery || 0}%`, 'Tính từ lịch sử, streak và lịch ôn tập'));
    metrics.appendChild(createMetric('Câu yếu mastery', analytics.mastery?.weakCount || 0));
    metrics.appendChild(createMetric('Chuỗi hiện tại', `${analytics.studyStreak} ngày`, 'Tính các ngày liên tiếp có học, bao gồm hôm nay'));
    fragment.appendChild(metrics);

    fragment.appendChild(createTrend(analytics.recentTrend));
    fragment.appendChild(createMasteryTopics(analytics.mastery));
    fragment.appendChild(createMasteryQuestions('Câu mastery yếu nhất', analytics.mastery?.weakestQuestions, 'Chưa có câu yếu theo mastery. Hãy làm thêm quiz để có dữ liệu.'));
    fragment.appendChild(createMasteryQuestions('Câu mastery tốt nhất', analytics.mastery?.strongestQuestions, 'Chưa có câu đủ vững để hiển thị.'));
    fragment.appendChild(createWeakTopics(analytics.weakTopics));
    fragment.appendChild(createWeakQuestions(analytics.weakQuestions));
    fragment.appendChild(createMistakePatternBlock(analytics.mistakePatterns, onMistakePatternAction));

    const actions = document.createElement('div');
    actions.className = 'analyticsActions';
    appendText(actions, 'Dựa trên các câu sai nhiều nhất', 'muted analyticsActionHint');
    const masteryButton = appendButton(actions, 'Luyện mastery yếu', 'btn small ok', () => onPracticeWeakMastery?.(analytics.mastery?.weakestQuestions));
    masteryButton.disabled = !analytics.mastery?.canPracticeWeakMastery;
    const practiceButton = appendButton(actions, 'Luyện top câu yếu', 'btn small secondary', () => onPracticeWeak?.(analytics.weakQuestions));
    practiceButton.disabled = !analytics.canPracticeWeak;
    appendButton(actions, analytics.dueReviewCount > 0 ? `Ôn tập hôm nay (${analytics.dueReviewCount})` : 'Chưa có câu cần ôn', 'btn small secondary', () => onReviewDue?.()).disabled = analytics.dueReviewCount <= 0;
    appendButton(actions, analytics.openMistakeCount > 0 ? `Luyện sổ lỗi (${analytics.openMistakeCount})` : 'Chưa có lỗi mở', 'btn small secondary', () => onPracticeMistakeNotebook?.()).disabled = (analytics.openMistakeCount || 0) <= 0;
    fragment.appendChild(actions);

    content.replaceChildren(fragment);
  }

  toggleButton?.addEventListener('click', () => {
    isOpen = !isOpen;
    if (panel) panel.classList.toggle('is-open', isOpen);
    if (content) content.hidden = !isOpen;
    toggleButton.textContent = isOpen ? 'Ẩn' : 'Mở';
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      render();
      requestAnimationFrame(() => content?.focus({ preventScroll: true }));
    }
  });

  function refresh() {
    cachedAnalytics = null;
    if (isOpen) render();
  }

  if (content) {
    content.hidden = true;
    content.tabIndex = -1;
  }
  toggleButton?.setAttribute('aria-expanded', 'false');

  return { refresh };
}
