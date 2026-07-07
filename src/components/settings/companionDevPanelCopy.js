const COPY = Object.freeze({
  vi: Object.freeze({
    title: 'Bảng thử nghiệm Trợ lý Đồng Hành — Chế độ Dev',
    eyebrow: 'Trợ lý Đồng Hành',
    fakeOnly: 'Chỉ dùng dữ liệu giả lập (Chỉ dành cho thử nghiệm)',
    fakeOnlyDescription: 'Bảng thử nghiệm này hoàn toàn không thu thập nội dung câu hỏi/đáp án/lời giải học tập, không gửi lệnh ra robot thật, không dùng AI ngoại vi/cloud, không lưu dữ liệu (no persistence) và không ảnh hưởng đến kết quả học. Chỉ xử lý tín hiệu dữ liệu đã làm mờ/rút gọn (đúng/sai, tiến độ, trạng thái kết nối).',
    fakeModeTitle: 'A. Kịch bản giả lập',
    fakeModeSub: 'Phát lại kịch bản mô phỏng thủ công. Các nút kịch bản sẽ bị vô hiệu hóa cho tới khi kích hoạt bảng thử nghiệm.',
    btnEnable: 'Kích hoạt bảng thử nghiệm',
    btnDisable: 'Vô hiệu hóa bảng thử nghiệm',
    btnClearLog: 'Xóa nhật ký suy luận',
    statusEnabled: 'Đã kích hoạt',
    statusDisabled: 'Đã vô hiệu hóa',
    warnEnableFirst: '⚠️ Hãy bật bảng thử nghiệm trước khi chạy kịch bản.',
    ignoredBeforeEnable: 'Kịch bản đã bị bỏ qua do bảng thử nghiệm chưa được bật.',
    metricObserved: 'Đã quan sát',
    metricAccepted: 'Chấp nhận',
    metricRejected: 'Từ chối',
    metricBlocked: 'Chặn nhạy cảm',
    metricIntent: 'Ý định đồng hành',
    metricCommand: 'Lệnh dự kiến',
    commandPreviewTitle: 'Lệnh dự kiến — chỉ xem trước',
    commandPreviewDescription: 'Các lệnh này chỉ là bản xem trước; không có nút gửi và không điều khiển robot thật.',
    companionSummaryTitle: 'Tóm tắt đồng hành',
    learningRhythmTitle: 'Nhịp học',
    metricSafety: 'An toàn',
    transcriptTitle: 'Nhật ký suy luận',
    emptyTranscript: 'Chưa có nhật ký suy luận. Vui lòng kích hoạt bảng thử nghiệm và chạy một kịch bản giả lập ở trên.',
    liveModeTitle: 'B. Theo dõi Device Bridge thật — chỉ quan sát',
    liveModeDescription: 'Theo dõi dữ liệu đã làm mờ/rút gọn trực tiếp từ cổng Device Bridge. Không can thiệp vào phòng học, không gửi lệnh ra robot thật, không dùng AI ngoại vi/cloud, không lưu dữ liệu.',
    btnEnableLive: 'Bật theo dõi thật',
    btnDisableLive: 'Tắt theo dõi thật',
    btnClearLive: 'Xóa nhật ký theo dõi',
    statusLiveEnabled: 'Đang theo dõi',
    statusLiveDisabled: 'Đang tắt theo dõi',
    statusSubscribed: 'Đã đăng ký nhận',
    statusNotSubscribed: 'Chưa đăng ký nhận',
    liveMetricObserved: 'Thật đã quan sát',
    liveMetricAccepted: 'Thật chấp nhận',
    liveMetricRejected: 'Thật từ chối',
    liveMetricBlocked: 'Thật chặn nhạy cảm',
    liveMetricLastEvent: 'Sự kiện thật cuối',
    liveMetricIntent: 'Ý định đồng hành',
    liveMetricCommand: 'Lệnh thật dự kiến',
    liveMetricSafety: 'Thật an toàn',
    liveTranscriptTitle: 'Nhật ký theo dõi',
    emptyLiveTranscript: 'Chưa có nhật ký theo dõi. Vui lòng bật theo dõi thật và thực hiện các buổi học trong Study Room.',
    unknown: 'không rõ'
  }),
  en: Object.freeze({
    title: 'Companion Brain Panel — Dev Mode',
    eyebrow: 'Companion',
    fakeOnly: 'Fake scenarios only (For simulation debugging)',
    fakeOnlyDescription: 'This simulation panel does not collect question contents/answers/explanations, does not send commands to a real robot, does not use external AI/cloud, does not persist data (no persistence), and does not affect study results. It only processes redacted/coarse signal data (correct/incorrect, progress, transport status).',
    fakeModeTitle: 'A. Fake scenario mode',
    fakeModeSub: 'Manual playback of simulated scenarios. Scenario buttons are disabled until the dev panel is enabled.',
    btnEnable: 'Enable dev panel',
    btnDisable: 'Disable dev panel',
    btnClearLog: 'Clear transcript',
    statusEnabled: 'enabled',
    statusDisabled: 'disabled',
    warnEnableFirst: '⚠️ Please enable the dev panel before running a scenario.',
    ignoredBeforeEnable: 'Scenario ignored because the dev panel is disabled.',
    metricObserved: 'Observed',
    metricAccepted: 'Accepted',
    metricRejected: 'Rejected',
    metricBlocked: 'Blocked sensitive',
    metricIntent: 'Last intent',
    metricCommand: 'Planned command',
    commandPreviewTitle: 'Planned commands — preview only',
    commandPreviewDescription: 'These commands are preview only; there is no send button and no real robot control.',
    companionSummaryTitle: 'Companion summary',
    learningRhythmTitle: 'Learning rhythm',
    metricSafety: 'Safety',
    transcriptTitle: 'Transcript summary',
    emptyTranscript: 'No dev transcript yet. Enable the panel and run a fake scenario.',
    liveModeTitle: 'B. Live DeviceBridge observe-only dev mode',
    liveModeDescription: 'Observes redacted DeviceBridge events only. No StudyRoom changes, no robot commands sent, no AI/cloud, no persistence, dev-only.',
    btnEnableLive: 'Enable live dev tap',
    btnDisableLive: 'Disable live dev tap',
    btnClearLive: 'Clear live transcript',
    statusLiveEnabled: 'live enabled',
    statusLiveDisabled: 'live disabled',
    statusSubscribed: 'subscribed',
    statusNotSubscribed: 'not subscribed',
    liveMetricObserved: 'Live observed',
    liveMetricAccepted: 'Live accepted',
    liveMetricRejected: 'Live rejected',
    liveMetricBlocked: 'Live blocked sensitive',
    liveMetricLastEvent: 'Last live event',
    liveMetricIntent: 'Live intent',
    liveMetricCommand: 'Live command',
    liveMetricSafety: 'Live safety',
    liveTranscriptTitle: 'Live transcript',
    emptyLiveTranscript: 'No live transcript yet. Enable live dev tap and emit DeviceBridge events.',
    unknown: 'unknown'
  })
});

const EVENT_LABELS = Object.freeze({
  vi: Object.freeze({
    session_started: 'bắt đầu buổi học',
    question_presented: 'hiển thị câu hỏi',
    answer_correct: 'trả lời đúng',
    answer_wrong: 'trả lời sai',
    review_due: 'đến hạn ôn tập',
    session_complete: 'hoàn tất buổi học',
    bridge_error: 'lỗi kết nối'
  }),
  en: Object.freeze({
    session_started: 'session started',
    question_presented: 'question presented',
    answer_correct: 'answer correct',
    answer_wrong: 'answer wrong',
    review_due: 'review due',
    session_complete: 'session complete',
    bridge_error: 'bridge error'
  })
});

const COMMAND_LABELS = Object.freeze({
  vi: Object.freeze({
    focus: 'nhắc tập trung',
    neutral: 'trung lập',
    encourage: 'động viên',
    celebrate: 'chúc mừng',
    session_complete: 'kết thúc buổi học',
    no_op: 'không thực hiện'
  }),
  en: Object.freeze({
    focus: 'focus cue',
    neutral: 'neutral',
    encourage: 'encourage',
    celebrate: 'celebrate',
    session_complete: 'session complete',
    no_op: 'no-op'
  })
});

const REASON_LABELS = Object.freeze({
  vi: Object.freeze({
    allowed_expression_only: 'chỉ cho phép biểu cảm an toàn',
    transport_unsafe: 'kết nối chưa an toàn',
    privacy_lock_failed: 'khóa riêng tư đã chặn',
    frustration_risk_high: 'nguy cơ nản cao',
    study_focus: 'đang tập trung học',
    session_start: 'bắt đầu phiên',
    forbidden_companion_key: 'dữ liệu nhạy cảm đã bị chặn',
    none: 'không'
  }),
  en: Object.freeze({
    allowed_expression_only: 'safe expression only',
    transport_unsafe: 'transport unsafe',
    privacy_lock_failed: 'privacy lock blocked',
    frustration_risk_high: 'high frustration risk',
    study_focus: 'study focus',
    session_start: 'session start',
    forbidden_companion_key: 'sensitive data blocked',
    none: 'none'
  })
});

const TABLE_HEADERS = Object.freeze({
  vi: Object.freeze({
    Step: 'Bước',
    Event: 'Sự kiện',
    Status: 'Trạng thái',
    Intent: 'Ý định',
    Tone: 'Tông phản hồi',
    Safety: 'An toàn',
    Command: 'Lệnh dự kiến',
    Reasons: 'Lý do',
    Privacy: 'Riêng tư'
  }),
  en: Object.freeze({
    Step: 'Step',
    Event: 'Event',
    Status: 'Status',
    Intent: 'Intent',
    Tone: 'Tone',
    Safety: 'Safety',
    Command: 'Planned Command',
    Reasons: 'Reasons',
    Privacy: 'Privacy'
  })
});

function normalizeLocale(locale) {
  return locale === 'en' ? 'en' : 'vi';
}

export function getCompanionPanelCopy(locale = 'vi') {
  return COPY[normalizeLocale(locale)];
}

export function getCompanionLabel(key, locale = 'vi') {
  const copy = getCompanionPanelCopy(locale);
  return copy[key] || copy.unknown;
}

export function getReasonCodeLabel(reasonCode, locale = 'vi') {
  const labels = REASON_LABELS[normalizeLocale(locale)];
  return labels[reasonCode] || reasonCode || labels.none;
}

export function getEventLabel(eventType, locale = 'vi') {
  const labels = EVENT_LABELS[normalizeLocale(locale)];
  return labels[eventType] || eventType || getCompanionPanelCopy(locale).unknown;
}

export function getCommandLabel(command, locale = 'vi') {
  const labels = COMMAND_LABELS[normalizeLocale(locale)];
  return labels[command] || command || labels.no_op;
}

export function getTableHeaderLabel(headerKey, locale = 'vi') {
  const headers = TABLE_HEADERS[normalizeLocale(locale)];
  return headers[headerKey] || headerKey;
}
