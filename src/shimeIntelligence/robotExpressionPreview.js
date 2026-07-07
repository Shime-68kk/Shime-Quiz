const FAMILY_LABELS = Object.freeze({
  neutral_presence: 'Hiện diện trung lập',
  focus_ritual: 'Nghi thức tập trung',
  review_due_nudge: 'Nhắc ôn tập nhẹ',
  memory_risk_nudge: 'Hỗ trợ nguy cơ quên',
  gentle_encourage: 'Động viên nhẹ',
  recovery_praise: 'Khen phục hồi',
  celebrate_stability_gain: 'Mừng trí nhớ ổn định hơn',
  celebrate_session_complete: 'Mừng hoàn thành buổi học',
  suggest_break_soft: 'Gợi ý nghỉ nhẹ',
  reconnect_hint: 'Gợi ý kiểm tra kết nối',
  calm_error: 'Bình tĩnh khi lỗi',
  do_nothing: 'Không can thiệp'
});

function label(value, fallback = 'không') {
  return value && value !== 'none' ? value : fallback;
}

export function createRobotExpressionPreviewRow(plan = {}, options = {}) {
  return {
    scenarioId: options.scenarioId || plan.scenarioId || 'expression_preview',
    expressionFamily: plan.expressionFamily || 'neutral_presence',
    expressionFamilyLabel: FAMILY_LABELS[plan.expressionFamily] || plan.expressionFamily || 'Không rõ',
    displayExpressionLabel: label(plan.displayExpression),
    ledPatternLabel: label(plan.ledPattern),
    soundCueLabel: label(plan.soundCue),
    motionPolicyLabel: plan.motionPolicy === 'locked' ? 'motion locked' : 'blocked',
    intensityLabel: plan.intensityBucket || 'low',
    safetyLabel: plan.safetyStatus === 'blocked' ? 'đã chặn' : 'an toàn dry-run',
    privacyLabel: plan.privacyStatus === 'blocked' ? 'đã chặn' : 'đã làm mờ/rút gọn',
    dryRunLabel: plan.dryRunOnly === true && plan.sendStatus === 'not_sent' ? 'dry-run / không gửi' : 'blocked',
    reasonLabels: [...(plan.reasonCodes || ['không rõ'])].slice(0, 6)
  };
}

export function createRobotExpressionPreview(plans = []) {
  return (Array.isArray(plans) ? plans : []).map((plan, index) => createRobotExpressionPreviewRow(plan, { scenarioId: plan.scenarioId || `expression_${String(index + 1).padStart(3, '0')}` }));
}
