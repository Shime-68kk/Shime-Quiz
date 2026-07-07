export const ROBOT_EXPRESSION_LABELS_VI = Object.freeze({
  neutral_presence: 'Hiện diện trung lập',
  focus_ritual: 'Nghi thức tập trung',
  review_due_nudge: 'Nhắc ôn tập nhẹ',
  memory_risk_nudge: 'Nhắc rủi ro quên',
  gentle_encourage: 'Khích lệ nhẹ',
  recovery_praise: 'Khen phục hồi',
  celebrate_stability_gain: 'Ăn mừng trí nhớ ổn định hơn',
  celebrate_session_complete: 'Ăn mừng hoàn thành phiên',
  suggest_break_soft: 'Gợi ý nghỉ nhẹ',
  reconnect_hint: 'Gợi ý kết nối lại',
  calm_error: 'Báo lỗi nhẹ',
  do_nothing: 'Không làm gì'
});

export const ROBOT_EXPRESSION_LABELS_EN = Object.freeze({
  neutral_presence: 'Neutral presence',
  focus_ritual: 'Focus ritual',
  review_due_nudge: 'Gentle review nudge',
  memory_risk_nudge: 'Memory risk nudge',
  gentle_encourage: 'Gentle encouragement',
  recovery_praise: 'Recovery praise',
  celebrate_stability_gain: 'Celebrate stability gain',
  celebrate_session_complete: 'Celebrate session complete',
  suggest_break_soft: 'Soft break suggestion',
  reconnect_hint: 'Reconnect hint',
  calm_error: 'Calm error',
  do_nothing: 'Do nothing'
});

function pick(map, value, fallback = 'Không rõ') {
  return map[value] || fallback;
}

export function getRobotExpressionFamilyLabel(value, locale = 'vi') {
  return pick(locale === 'en' ? ROBOT_EXPRESSION_LABELS_EN : ROBOT_EXPRESSION_LABELS_VI, value);
}

export function createRobotExpressionDisplayModel(plan = {}, options = {}) {
  const locale = options.locale || 'vi';
  return {
    expressionFamilyLabel: getRobotExpressionFamilyLabel(plan.expressionFamily, locale),
    displayExpressionLabel: plan.displayExpression && plan.displayExpression !== 'none' ? plan.displayExpression : 'không',
    ledPatternLabel: plan.ledPattern && plan.ledPattern !== 'none' ? plan.ledPattern : 'không',
    soundCueLabel: plan.soundCue && plan.soundCue !== 'none' ? plan.soundCue : 'không',
    motionPolicyLabel: plan.motionPolicy === 'locked' ? 'đã khóa chuyển động' : 'đã chặn',
    intensityLabel: plan.intensityBucket || 'low',
    safetyLabel: plan.safetyStatus === 'blocked' ? 'đã chặn' : 'an toàn dry-run',
    privacyLabel: plan.privacyStatus === 'blocked' ? 'đã chặn' : 'đã làm mờ/rút gọn',
    dryRunLabel: plan.dryRunOnly === true && plan.sendStatus === 'not_sent' ? 'dry-run / không gửi' : 'đã chặn',
    reasonLabels: [...(plan.reasonCodes || ['không rõ'])].slice(0, 6),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}
