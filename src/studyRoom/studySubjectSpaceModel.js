const FALLBACK_SUBJECT_ID = 'general';
const FALLBACK_SUBJECT_LABEL = 'Tổng quan';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toTime(value) {
  const time = new Date(value || '').getTime();
  return Number.isFinite(time) ? time : null;
}

function bucketUpdatedAt(now) {
  const date = new Date(now || Date.now());
  if (Number.isNaN(date.getTime())) return 'unknown';
  return date.toISOString().slice(0, 10);
}

function getSubjectMaps(subjects = [], topics = []) {
  const subjectById = new Map();
  for (const subject of asArray(subjects)) {
    const id = cleanString(subject?.id);
    if (!id) continue;
    subjectById.set(id, cleanString(subject?.title ?? subject?.name) || id);
  }
  const topicById = new Map();
  for (const topic of asArray(topics)) {
    const id = cleanString(topic?.id);
    if (!id) continue;
    topicById.set(id, {
      subjectId: cleanString(topic?.subjectId),
      title: cleanString(topic?.title ?? topic?.name)
    });
  }
  return { subjectById, topicById };
}

function resolveSubjectForItem(item, { subjectById, topicById, sourceType }) {
  const explicitSubjectId = cleanString(item?.subjectId);
  if (explicitSubjectId && subjectById.has(explicitSubjectId)) {
    return { subjectId: explicitSubjectId, subjectLabel: subjectById.get(explicitSubjectId), sourceType: sourceType || 'library' };
  }
  const topic = topicById.get(cleanString(item?.topicId));
  if (topic?.subjectId && subjectById.has(topic.subjectId)) {
    return { subjectId: topic.subjectId, subjectLabel: subjectById.get(topic.subjectId), sourceType: sourceType || 'topic' };
  }
  const deck = cleanString(item?.deck ?? item?.category);
  if (deck) return { subjectId: `deck:${deck.toLowerCase()}`, subjectLabel: deck, sourceType: 'deck' };
  const source = cleanString(item?.source);
  if (source) return { subjectId: `source:${source.toLowerCase()}`, subjectLabel: source, sourceType: 'source' };
  return { subjectId: FALLBACK_SUBJECT_ID, subjectLabel: FALLBACK_SUBJECT_LABEL, sourceType: sourceType || 'general' };
}

function pressureBucket({ dueCount, overdueCount, cardCount }) {
  if (overdueCount >= 8 || (cardCount > 0 && overdueCount / cardCount >= 0.45)) return 'urgent';
  if (overdueCount >= 3 || dueCount >= 10) return 'high';
  if (overdueCount >= 1 || dueCount >= 4) return 'medium';
  if (dueCount >= 1) return 'low';
  return 'none';
}

function workloadBucket(cardCount) {
  if (cardCount <= 0) return 'none';
  if (cardCount <= 5) return 'light';
  if (cardCount <= 20) return 'normal';
  if (cardCount <= 50) return 'heavy';
  return 'overloaded';
}

function focusRecommendation(pressure, workload) {
  if (pressure === 'urgent') return 'rescue_review';
  if (pressure === 'high' || workload === 'overloaded') return 'deep_focus';
  if (pressure === 'medium') return 'normal_session';
  if (pressure === 'low') return 'quick_review';
  return 'skip_today';
}

function robotBucket(pressure) {
  if (pressure === 'urgent') return 'subject_pressure_urgent';
  if (pressure === 'high') return 'subject_pressure_high';
  if (pressure === 'medium') return 'subject_pressure_medium';
  if (pressure === 'low') return 'subject_pressure_low';
  return 'subject_pressure_none';
}

export function createStudySubjectSpaces(input = {}) {
  const nowTime = toTime(input.now) ?? Date.now();
  const { subjectById, topicById } = getSubjectMaps(input.subjects, input.topics);
  const scheduleByItemId = new Map(asArray(input.scheduleRecords).map(record => [cleanString(record?.itemId), record]));
  const groups = new Map();

  for (const item of asArray(input.items)) {
    const itemId = cleanString(item?.id);
    if (!itemId) continue;
    const subject = resolveSubjectForItem(item, {
      subjectById,
      topicById,
      sourceType: input.sourceType
    });
    if (!groups.has(subject.subjectId)) {
      groups.set(subject.subjectId, {
        ...subject,
        cardCount: 0,
        dueCount: 0,
        overdueCount: 0,
        newCount: 0,
        reviewCount: 0,
        schedulerKinds: new Map()
      });
    }
    const group = groups.get(subject.subjectId);
    group.cardCount += 1;
    const schedule = scheduleByItemId.get(itemId);
    if (!schedule) {
      group.newCount += 1;
      continue;
    }
    group.reviewCount += 1;
    const dueTime = toTime(schedule.dueAt);
    if (dueTime !== null && dueTime <= nowTime) {
      group.dueCount += 1;
      if (dueTime < nowTime - 24 * 60 * 60 * 1000) group.overdueCount += 1;
    }
    const kind = cleanString(schedule.schedulerKind) || 'sm2-heuristic';
    group.schedulerKinds.set(kind, (group.schedulerKinds.get(kind) || 0) + 1);
  }

  return Array.from(groups.values())
    .map(group => {
      const forgettingPressureBucket = pressureBucket(group);
      const workload = workloadBucket(group.cardCount);
      return {
        subjectId: group.subjectId,
        subjectLabel: group.subjectLabel,
        sourceType: group.sourceType,
        cardCount: group.cardCount,
        dueCount: group.dueCount,
        overdueCount: group.overdueCount,
        newCount: group.newCount,
        reviewCount: group.reviewCount,
        forgettingPressureBucket,
        workloadBucket: workload,
        focusRecommendation: focusRecommendation(forgettingPressureBucket, workload),
        schedulerSummary: Object.fromEntries(group.schedulerKinds),
        safeRobotSummaryBucket: robotBucket(forgettingPressureBucket),
        updatedAtBucket: bucketUpdatedAt(input.now)
      };
    })
    .sort((left, right) => {
      if (right.overdueCount !== left.overdueCount) return right.overdueCount - left.overdueCount;
      if (right.dueCount !== left.dueCount) return right.dueCount - left.dueCount;
      return left.subjectLabel.localeCompare(right.subjectLabel, 'vi');
    });
}
