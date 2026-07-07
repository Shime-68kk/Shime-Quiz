import { runShimeEcosystemFusion, summarizeShimeEcosystemFusion, findSensitiveKeys } from '../../shimeIntelligence/index.js';

const BUCKET_LABELS = Object.freeze({
  none: 'không',
  very_low: 'rất thấp',
  low: 'thấp',
  medium: 'vừa',
  high: 'cao',
  very_high: 'rất cao',
  unknown: 'không rõ'
});

const ROBOT_LABELS = Object.freeze({
  neutral_presence: 'hiện diện trung lập',
  focus_ritual: 'nghi thức tập trung',
  review_due_nudge: 'nhắc ôn tập nhẹ',
  memory_risk_nudge: 'hỗ trợ nguy cơ quên',
  gentle_encourage: 'động viên nhẹ',
  recovery_praise: 'khen phục hồi',
  celebrate_stability_gain: 'mừng trí nhớ ổn định hơn',
  celebrate_session_complete: 'mừng hoàn thành buổi học',
  suggest_break: 'gợi ý nghỉ ngắn',
  reconnect_hint: 'gợi ý kiểm tra kết nối',
  calm_error: 'bình tĩnh khi lỗi',
  do_nothing: 'không can thiệp'
});

const TIMETABLE_LABELS = Object.freeze({
  no_nudge: 'không nhắc',
  tiny_review_now: 'ôn rất ngắn ngay',
  short_session_soon: 'buổi ngắn sớm',
  recovery_session_today: 'buổi phục hồi hôm nay',
  protect_rest: 'ưu tiên nghỉ',
  resume_habit: 'nối lại thói quen',
  plan_next_window: 'chọn khung tiếp theo',
  reduce_pressure: 'giảm áp lực',
  reconnect_before_study: 'kiểm tra kết nối trước khi học'
});

const TRANSPORT_LABELS = Object.freeze({
  wifi_websocket_lan: 'LAN nội bộ / WebSocket',
  ble_provisioning: 'BLE để ghép nối',
  ble_presence: 'BLE hiện diện nhỏ',
  softap_setup: 'SoftAP thiết lập',
  usb_serial_dev: 'USB Serial dev',
  app_local_only: 'chỉ trong app',
  no_transport_safe: 'không mở kết nối',
  future_native_bridge: 'cầu nối native tương lai'
});

function label(map, value) {
  return map[value] || value || 'không rõ';
}

function countByEvent(transcript = [], eventType) {
  return transcript.filter(entry => entry.eventType === eventType || entry.inputEventType === eventType).length;
}

function hasBlockedEntry(transcript = []) {
  return transcript.some(entry => entry.status === 'rejected' || entry.privacyStatus === 'đã chặn bởi lớp bảo mật' || entry.privacyStatus === 'blocked');
}

function transcriptToFsrsSignals(transcript = []) {
  const totalCount = transcript.length;
  const wrongCount = countByEvent(transcript, 'answer_wrong');
  const correctCount = countByEvent(transcript, 'answer_correct');
  const dueCount = countByEvent(transcript, 'review_due') > 0 ? 20 : Math.max(0, totalCount - correctCount);
  const bridgeErrors = countByEvent(transcript, 'bridge_error');
  const completed = countByEvent(transcript, 'session_complete') > 0;
  return {
    dueCount,
    overdueCount: dueCount >= 10 ? 2 : 0,
    retrievability: wrongCount >= 2 ? 0.32 : correctCount > wrongCount ? 0.82 : 0.58,
    stability: completed && correctCount > wrongCount ? 28 : wrongCount >= 2 ? 2 : 8,
    difficulty: wrongCount >= 2 ? 8 : 4,
    lapseCount: wrongCount,
    correctCount,
    wrongCount,
    totalCount,
    sessionPhase: completed ? 'complete' : 'review',
    transportHealth: bridgeErrors > 0 ? 'disconnected' : 'connected',
    completionQualityBucket: wrongCount >= 2 ? 'low' : correctCount > 0 ? 'high' : 'mixed'
  };
}

export function createShimeFusionInputFromTranscript(transcript = []) {
  const rows = Array.isArray(transcript) ? transcript : [];
  if (rows.length === 0) return null;
  const blocked = hasBlockedEntry(rows) || findSensitiveKeys(rows).length > 0;
  if (blocked) {
    return {
      fsrs: { dueCount: 0, retrievability: 0, stability: 0, difficulty: 0 },
      privacyStatus: 'blocked',
      companionIntent: 'calm_error',
      transportHealth: 'disabled',
      robotAvailability: 'available',
      robotProfile: { supportsDisplay: true, motionLocked: true },
      reasonCodes: ['sensitive_or_blocked_transcript']
    };
  }
  const signals = transcriptToFsrsSignals(rows);
  return {
    fsrs: signals,
    sessionPhase: signals.sessionPhase,
    companionIntent: rows.at(-1)?.companionIntent || 'focus_gently',
    transportHealth: signals.transportHealth,
    robotAvailability: 'available',
    robotProfile: { supportsDisplay: true, supportsLed: true, motionLocked: true },
    transport: { userConsentState: 'not_requested', payloadSizeBucket: 'tiny' },
    timetable: { preferredStudyWindowBucket: 'next_available' },
    safetyMode: 'motion_disabled',
    reasonCodes: ['shime_fusion_panel_input_redacted']
  };
}

export function createShimeFusionPanelSnapshot(result = {}) {
  const summary = summarizeShimeEcosystemFusion(result);
  const capsule = result.learningCapsule || {};
  return {
    memoryPressureLabel: label(BUCKET_LABELS, capsule.memoryPressureBucket || summary.memoryPressureBucket),
    forgettingRiskLabel: label(BUCKET_LABELS, capsule.forgettingRiskBucket || summary.forgettingRiskBucket),
    recoveryNeedLabel: label(BUCKET_LABELS, capsule.recoveryNeedBucket || summary.recoveryNeedBucket),
    duePressureLabel: label(BUCKET_LABELS, capsule.duePressureBucket),
    robotInterventionLabel: label(ROBOT_LABELS, summary.robotInterventionFamily),
    timetableRecommendationLabel: label(TIMETABLE_LABELS, summary.timetableRecommendation),
    transportRecommendationLabel: label(TRANSPORT_LABELS, summary.transportRecommendation),
    capsuleStatusLabel: capsule.privacyStatus === 'blocked' ? 'capsule đã chặn' : 'capsule an toàn',
    safetyStatusLabel: summary.safetyOutcome === 'allowed_dry_run' ? 'an toàn dry-run' : 'đã chặn',
    privacyStatusLabel: capsule.privacyStatus === 'blocked' ? 'đã chặn' : 'đã làm mờ/rút gọn',
    dryRunLabel: result.dryRunOnly === true && result.sendStatus === 'not_sent' ? 'dry-run / không gửi' : 'đã chặn',
    reasonLabels: [...new Set(result.reasonCodes || capsule.reasonCodes || ['không rõ'])].slice(0, 6),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

export function runShimeFusionPanelDryRun(input = {}, options = {}) {
  const source = Array.isArray(input) ? createShimeFusionInputFromTranscript(input) : input;
  if (!source || Object.keys(source).length === 0) {
    return {
      empty: true,
      message: 'Chưa có đủ tín hiệu để chạy khớp nối Shime. Hãy chạy kịch bản giả lập hoặc theo dõi thật trước.',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    };
  }
  const result = runShimeEcosystemFusion(source, options);
  return {
    empty: false,
    fusionResult: result,
    snapshot: createShimeFusionPanelSnapshot(result),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}
