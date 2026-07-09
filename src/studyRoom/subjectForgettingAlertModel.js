function safeLabel(value) {
  const label = typeof value === 'string' && value.trim() ? value.trim() : 'môn học này';
  return label.slice(0, 80);
}

function severityFor(space) {
  if (space?.forgettingPressureBucket === 'urgent' || Number(space?.overdueCount) >= 5) return 'urgent';
  if (space?.forgettingPressureBucket === 'high' || Number(space?.overdueCount) > 0) return 'warning';
  if (Number(space?.dueCount) > 0 || space?.forgettingPressureBucket === 'medium') return 'info';
  return '';
}

function triggerFor(space) {
  if (space?.forgettingPressureBucket === 'urgent') return 'forgetting_pressure_high';
  if (Number(space?.overdueCount) > 0) return 'overdue';
  if (Number(space?.dueCount) >= 8) return 'review_queue_spike';
  if (Number(space?.dueCount) > 0) return 'due_soon';
  if (space?.forgettingPressureBucket === 'high') return 'long_absence_return';
  return '';
}

export function createSubjectForgettingAlert(space = {}, options = {}) {
  const severity = severityFor(space);
  const triggerReason = triggerFor(space);
  if (!severity || !triggerReason) return null;

  const subjectId = String(space.subjectId || 'general').trim() || 'general';
  const label = safeLabel(space.subjectLabel);
  const overdueCount = Math.max(0, Number(space.overdueCount) || 0);
  const dueCount = Math.max(0, Number(space.dueCount) || 0);
  const title = overdueCount > 0
    ? `Bạn có nhiều thẻ ${label} đang quá hạn`
    : `${label} sắp đến hạn ôn`;
  const body = severity === 'urgent'
    ? `Nên ôn nhanh 10 phút để tránh quên.`
    : dueCount >= 8
      ? `Hàng đợi ôn của ${label} đang tăng nhanh.`
      : `Ôn nhanh ${label} hôm nay sẽ giữ nhịp học ổn định.`;

  return {
    alertId: `subject-alert:${subjectId}:${triggerReason}`,
    subjectId,
    severity,
    triggerReason,
    userFacingTitle: title,
    userFacingBody: body,
    recommendedAction: severity === 'urgent' ? 'rescue_review' : severity === 'warning' ? 'quick_review' : 'normal_session',
    canNotifyOnDevice: options.localDeviceNotificationsEnabled === true && options.quietNow !== true,
    notificationTimingBucket: severity === 'urgent' ? 'now' : severity === 'warning' ? 'today' : 'tomorrow',
    robotSafeSignalBucket: severity === 'urgent' ? 'subject_signal_urgent' : severity === 'warning' ? 'subject_signal_warning' : 'subject_signal_info',
    rawContentIncluded: false
  };
}

export function createSubjectForgettingAlerts(subjectSpaces = [], options = {}) {
  return (Array.isArray(subjectSpaces) ? subjectSpaces : [])
    .map(space => createSubjectForgettingAlert(space, options))
    .filter(Boolean);
}
