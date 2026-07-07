/**
 * Shime Quiz - Bilingual UI Copy Proposal
 * Isolated copy inventory mapping for future Codex integration.
 * Defaults to Vietnamese ('vi'). English ('en') is available as a preview only.
 * Unknown locale falls back to 'vi'.
 */

export const SHIME_LOCALES = Object.freeze({
  VI: 'vi',
  EN: 'en'
});

export const SHIME_DEFAULT_LOCALE = SHIME_LOCALES.VI;

export const SHIME_TERMINOLOGY = Object.freeze({
  vi: {
    shimeRobot: 'Robot Shime',
    shimeQuiz: 'Shime Quiz',
    companionControlCenter: 'Trung tâm điều khiển Trợ lý Đồng Hành',
    deviceBridge: 'Cầu nối thiết bị',
    cognitiveEngineV2: 'Não đồng hành V2',
    dryRun: 'chạy thử khô',
    notSent: 'không gửi',
    redactedCoarseData: 'dữ liệu đã làm mờ/rút gọn',
    learningStateCapsule: 'capsule trạng thái học tập',
    memoryBrain: 'bộ não trí nhớ',
    transportBrain: 'bộ não kết nối',
    safetyGovernor: 'bộ điều phối an toàn',
    fsrsMemorySignal: 'tín hiệu trí nhớ FSRS'
  },
  en: {
    shimeRobot: 'Shime Robot',
    shimeQuiz: 'Shime Quiz',
    companionControlCenter: 'Companion Control Center',
    deviceBridge: 'Device Bridge',
    cognitiveEngineV2: 'Cognitive Engine V2',
    dryRun: 'dry-run',
    notSent: 'not sent',
    redactedCoarseData: 'redacted/coarse data',
    learningStateCapsule: 'Learning State Capsule',
    memoryBrain: 'Memory Brain',
    transportBrain: 'Transport Brain',
    safetyGovernor: 'Safety Governor',
    fsrsMemorySignal: 'FSRS memory signal'
  }
});

export const SHIME_UI_COPY = Object.freeze({
  vi: {
    // Navigation
    navDashboard: 'Bảng điều khiển',
    navLibrary: 'Thư viện sách',
    navStudyRoom: 'Phòng học',
    navSettings: 'Cài đặt',

    // Settings General
    settingsTitle: 'Thiết lập ứng dụng',
    settingsTheme: 'Chủ đề giao diện',
    settingsLanguage: 'Ngôn ngữ hiển thị',
    settingsFsrs: 'Thuật toán học tập FSRS',
    previewOnlyNote: 'Lưu ý: Đây chỉ là bản xem trước chế độ ngôn ngữ, lựa chọn chưa được lưu trữ.',

    // Device Bridge
    bridgeTitle: 'Kết nối thiết bị đồng hành',
    bridgeStatusLabel: 'Trạng thái cầu nối',
    bridgeTransportLabel: 'Cổng kết nối',
    bridgePrivacyLabel: 'Chế độ bảo mật',
    bridgeEventCountLabel: 'Số lượng sự kiện',
    bridgeLastEventLabel: 'Sự kiện cuối',
    bridgeEnabled: 'Đã kích hoạt',
    bridgeDisabled: 'Đã vô hiệu hóa',
    bridgeConnected: 'Đã kết nối (Thiết bị Mock)',
    bridgeDisconnected: 'Chưa kết nối',
    bridgeError: 'Lỗi cổng kết nối',
    bridgeBtnEnable: 'Kích hoạt cổng',
    bridgeBtnDisable: 'Vô hiệu hóa cổng',
    bridgeBtnConnect: 'Kết nối thiết bị Mock',
    bridgeBtnDisconnect: 'Ngắt kết nối',
    bridgeBtnClearLog: 'Xóa nhật ký',
    bridgeEmptyLog: '[Chưa có sự kiện] Nhấn "Kết nối thiết bị Mock" để xem nhật ký sự kiện.',
    bridgeLogTitle: 'Nhật ký sự kiện thiết bị (Debug Log)',
    bridgePrivacyWarning: '⚠️ Cam kết bảo mật dữ liệu học tập: Cầu nối mặc định chỉ chia sẻ thông tin tiến độ và trạng thái đúng/sai dạng rút gọn. Không gửi câu hỏi, đáp án hoặc lịch sử học chi tiết.',

    // Companion Control Center
    companionTitle: 'Bảng não bộ Trợ lý Đồng Hành',
    companionSub: 'Chỉ dành cho thử nghiệm gỡ lỗi mô phỏng.',
    companionBtnEnable: 'Kích hoạt trợ lý',
    companionBtnDisable: 'Vô hiệu hóa trợ lý',
    companionBtnClearLog: 'Xóa nhật ký suy luận',
    companionMetricObserved: 'Đã quan sát',
    companionMetricAccepted: 'Đã chấp nhận',
    companionMetricRejected: 'Đã từ chối',
    companionMetricBlocked: 'Chặn nhạy cảm',
    companionLastIntent: 'Ý định trợ lý',
    companionPlannedCommand: 'Lệnh dự kiến',
    companionSafety: 'Trạng thái an toàn',
    companionEmptyLog: 'Chưa có nhật ký suy luận. Vui lòng kích hoạt bảng thử nghiệm và chạy một kịch bản giả lập.',

    // Table Headers
    tableStep: 'Bước',
    tableEvent: 'Sự kiện',
    tableStatus: 'Trạng thái',
    tableIntent: 'Ý định',
    tableTone: 'Tông phản hồi',
    tableSafety: 'An toàn',
    tableCommand: 'Lệnh dự kiến',
    tableReasons: 'Lý do',
    tablePrivacy: 'Riêng tư',

    // Scenarios
    scenarioNormal: 'Buổi học bình thường',
    scenarioStruggle: 'Người học gặp khó',
    scenarioReview: 'Đến hạn ôn tập',
    scenarioError: 'Lỗi kết nối',
    scenarioSensitive: 'Kiểm tra dữ liệu nhạy cảm',

    // Reason Codes mapping
    reason_allowed_expression_only: 'chỉ cho phép biểu cảm an toàn',
    reason_transport_unsafe: 'kết nối chưa an toàn',
    reason_privacy_lock_failed: 'khóa riêng tư đã chặn',
    reason_frustration_risk_high: 'nguy cơ nản cao',
    reason_study_focus: 'đang tập trung học',
    reason_session_start: 'bắt đầu phiên',
    reason_none: 'không'
  },
  en: {
    // Navigation
    navDashboard: 'Dashboard',
    navLibrary: 'Library',
    navStudyRoom: 'Study Room',
    navSettings: 'Settings',

    // Settings General
    settingsTitle: 'App Settings',
    settingsTheme: 'Interface Theme',
    settingsLanguage: 'Display Language',
    settingsFsrs: 'FSRS Learning Scheduler',
    previewOnlyNote: 'Note: This is a language preview only, choices are not persisted.',

    // Device Bridge
    bridgeTitle: 'Companion Device Connection',
    bridgeStatusLabel: 'Bridge Status',
    bridgeTransportLabel: 'Transport Type',
    bridgePrivacyLabel: 'Privacy Mode',
    bridgeEventCountLabel: 'Event Count',
    bridgeLastEventLabel: 'Last Event',
    bridgeEnabled: 'Enabled',
    bridgeDisabled: 'Disabled',
    bridgeConnected: 'Connected (Mock Device)',
    bridgeDisconnected: 'Disconnected',
    bridgeError: 'Bridge Connection Error',
    bridgeBtnEnable: 'Enable Bridge',
    bridgeBtnDisable: 'Disable Bridge',
    bridgeBtnConnect: 'Connect Mock Device',
    bridgeBtnDisconnect: 'Disconnect',
    bridgeBtnClearLog: 'Clear Log',
    bridgeEmptyLog: '[No events] Press "Connect Mock Device" to view event logs.',
    bridgeLogTitle: 'Device Event Debug Log',
    bridgePrivacyWarning: '⚠️ Data Privacy Commitment: The bridge only transmits coarse/redacted progress and correct/incorrect status by default. It never sends prompts, answers, or full study history.',

    // Companion Control Center
    companionTitle: 'Companion Brain Dev Panel',
    companionSub: 'For simulation debugging and testing only.',
    companionBtnEnable: 'Enable Companion',
    companionBtnDisable: 'Disable Companion',
    companionBtnClearLog: 'Clear Inference Log',
    companionMetricObserved: 'Observed',
    companionMetricAccepted: 'Accepted',
    companionMetricRejected: 'Rejected',
    companionMetricBlocked: 'Sensitive Blocked',
    companionLastIntent: 'Companion Intent',
    companionPlannedCommand: 'Planned Command',
    companionSafety: 'Safety Status',
    companionEmptyLog: 'No inference logs yet. Enable the panel and run a fake scenario.',

    // Table Headers
    tableStep: 'Step',
    tableEvent: 'Event',
    tableStatus: 'Status',
    tableIntent: 'Intent',
    tableTone: 'Tone',
    tableSafety: 'Safety',
    tableCommand: 'Planned Command',
    tableReasons: 'Reasons',
    tablePrivacy: 'Privacy',

    // Scenarios
    scenarioNormal: 'Normal session',
    scenarioStruggle: 'Struggle session',
    scenarioReview: 'Review due',
    scenarioError: 'Disconnected/error',
    scenarioSensitive: 'Sensitive attack',

    // Reason Codes mapping
    reason_allowed_expression_only: 'allowed expression only',
    reason_transport_unsafe: 'transport unsafe',
    reason_privacy_lock_failed: 'privacy lock failed',
    reason_frustration_risk_high: 'frustration risk high',
    reason_study_focus: 'study focus',
    reason_session_start: 'session start',
    reason_none: 'none'
  }
});

/**
 * Safe copy accessor function
 * Falls back to Vietnamese ('vi') if key or language is missing
 * @param {string} key - Copy key
 * @param {string} locale - Target locale ('vi' or 'en')
 * @returns {string} Translated string
 */
export function getUiString(key, locale = SHIME_DEFAULT_LOCALE) {
  const targetLocale = (locale === SHIME_LOCALES.EN) ? SHIME_LOCALES.EN : SHIME_LOCALES.VI;
  
  // Try retrieving from UI copy first
  if (SHIME_UI_COPY[targetLocale] && SHIME_UI_COPY[targetLocale][key]) {
    return SHIME_UI_COPY[targetLocale][key];
  }

  // Fallback to terminology
  if (SHIME_TERMINOLOGY[targetLocale] && SHIME_TERMINOLOGY[targetLocale][key]) {
    return SHIME_TERMINOLOGY[targetLocale][key];
  }

  // Fallback to Vietnamese UI copy
  if (SHIME_UI_COPY[SHIME_DEFAULT_LOCALE][key]) {
    return SHIME_UI_COPY[SHIME_DEFAULT_LOCALE][key];
  }

  // Fallback to Vietnamese terminology
  if (SHIME_TERMINOLOGY[SHIME_DEFAULT_LOCALE][key]) {
    return SHIME_TERMINOLOGY[SHIME_DEFAULT_LOCALE][key];
  }

  return key; // return key string literal as last resort fallback
}
