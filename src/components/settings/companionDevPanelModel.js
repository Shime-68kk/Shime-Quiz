import { createCompanionDevTap } from '../../companion/index.js';

export const COMPANION_PANEL_PRIVACY_LABELS = Object.freeze({
  redacted_coarse_only: 'dữ liệu đã làm mờ/rút gọn',
  blocked: 'đã chặn bởi lớp bảo mật',
  unknown: 'không rõ'
});

const FORBIDDEN_PANEL_KEYS = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload',
  'cameraFrames',
  'audioRecording',
  'biometricIdentity'
]);

const SCENARIOS = Object.freeze([
  Object.freeze({
    id: 'normal_session',
    label: 'Buổi học bình thường',
    description: 'Steady session with a correct response and completion.',
    invalid: false,
    events: Object.freeze([
      Object.freeze({ eventType: 'session_started', sessionId: 'panel_normal', payload: Object.freeze({ progressCount: 0, totalCount: 3, transportStatus: 'connected' }) }),
      Object.freeze({ eventType: 'question_presented', sessionId: 'panel_normal', payload: Object.freeze({ itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3 }) }),
      Object.freeze({ eventType: 'answer_correct', sessionId: 'panel_normal', payload: Object.freeze({ itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3, status: 'correct' }) }),
      Object.freeze({ eventType: 'session_complete', sessionId: 'panel_normal', payload: Object.freeze({ progressCount: 3, totalCount: 3, accuracyBucket: 'high' }) })
    ])
  }),
  Object.freeze({
    id: 'struggle_session',
    label: 'Người học gặp khó',
    description: 'Two coarse wrong-status events for encouragement planning.',
    invalid: false,
    events: Object.freeze([
      Object.freeze({ eventType: 'session_started', sessionId: 'panel_struggle', payload: Object.freeze({ progressCount: 0, totalCount: 4, transportStatus: 'connected' }) }),
      Object.freeze({ eventType: 'question_presented', sessionId: 'panel_struggle', payload: Object.freeze({ itemIndex: 1, itemType: 'short_answer', progressCount: 1, totalCount: 4 }) }),
      Object.freeze({ eventType: 'answer_wrong', sessionId: 'panel_struggle', payload: Object.freeze({ itemIndex: 1, itemType: 'short_answer', progressCount: 1, totalCount: 4, status: 'wrong' }) }),
      Object.freeze({ eventType: 'question_presented', sessionId: 'panel_struggle', payload: Object.freeze({ itemIndex: 2, itemType: 'short_answer', progressCount: 2, totalCount: 4 }) }),
      Object.freeze({ eventType: 'answer_wrong', sessionId: 'panel_struggle', payload: Object.freeze({ itemIndex: 2, itemType: 'short_answer', progressCount: 2, totalCount: 4, status: 'wrong' }) }),
      Object.freeze({ eventType: 'session_complete', sessionId: 'panel_struggle', payload: Object.freeze({ progressCount: 4, totalCount: 4, accuracyBucket: 'low', scoreBucket: 'low' }) })
    ])
  }),
  Object.freeze({
    id: 'review_due',
    label: 'Đến hạn ôn tập',
    description: 'Coarse due-count bucket followed by session start.',
    invalid: false,
    events: Object.freeze([
      Object.freeze({ eventType: 'review_due', sessionId: 'panel_review', payload: Object.freeze({ dueCountBucket: '20_plus', totalCount: 20 }) }),
      Object.freeze({ eventType: 'session_started', sessionId: 'panel_review', payload: Object.freeze({ progressCount: 0, totalCount: 5, transportStatus: 'connected' }) })
    ])
  }),
  Object.freeze({
    id: 'disconnected_error',
    label: 'Lỗi kết nối',
    description: 'Bridge error with transport status only.',
    invalid: false,
    events: Object.freeze([
      Object.freeze({ eventType: 'bridge_error', sessionId: 'panel_error', payload: Object.freeze({ reasonCode: 'transport_disconnected', transportStatus: 'disconnected' }) })
    ])
  }),
  Object.freeze({
    id: 'sensitive_attack',
    label: 'Kiểm tra dữ liệu nhạy cảm',
    description: 'Invalid fixture proving the privacy guard blocks unsafe keys.',
    invalid: true,
    events: Object.freeze([
      Object.freeze({ eventType: 'question_presented', sessionId: 'panel_attack', payload: Object.freeze({ question: 'private text' }) }),
      Object.freeze({ eventType: 'answer_correct', sessionId: 'panel_attack', payload: Object.freeze({ answer: 'private answer' }) }),
      Object.freeze({ eventType: 'answer_wrong', sessionId: 'panel_attack', payload: Object.freeze({ nested: Object.freeze({ correctAnswer: 'private answer' }) }) })
    ])
  })
]);

function cloneEvent(event) {
  return {
    eventType: event.eventType,
    sessionId: event.sessionId,
    payload: { ...event.payload }
  };
}

function findScenario(scenarioId) {
  return SCENARIOS.find(scenario => scenario.id === scenarioId) || SCENARIOS[0];
}

export function createInitialCompanionPanelState() {
  return {
    enabled: false,
    selectedScenarioId: 'normal_session',
    observedCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    blockedSensitiveCount: 0,
    lastCompanionIntent: null,
    lastRobotCommand: null,
    lastSafetyOutcome: null,
    transcript: [],
    ignoredBeforeEnable: false,
    fakeOnly: true,
    noExternalSend: true,
    noPersistence: true
  };
}

export function createInitialLiveTapPanelState() {
  return {
    mode: 'live_devicebridge_observe_only',
    enabled: false,
    subscribed: false,
    observedCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    blockedSensitiveCount: 0,
    lastInputEventType: null,
    lastCompanionIntent: null,
    lastRobotCommand: null,
    lastSafetyOutcome: null,
    transcript: [],
    observeOnly: true,
    noExternalSend: true,
    noPersistence: true,
    safe: true
  };
}

export function getCompanionDemoScenarios() {
  return SCENARIOS.map(({ id, label, description, invalid, events }) => ({
    id,
    label,
    description,
    invalid,
    eventTypes: events.map(event => event.eventType)
  }));
}

export function getForbiddenCompanionPanelKeys() {
  return [...FORBIDDEN_PANEL_KEYS];
}

export function findForbiddenCompanionPanelKeys(value, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findForbiddenCompanionPanelKeys(entry, `${path}[${index}]`, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_PANEL_KEYS.includes(key)) found.push({ key, path: nextPath });
    findForbiddenCompanionPanelKeys(entry, nextPath, found);
  });
  return found;
}

export function formatPrivacyStatus(entry = {}) {
  return COMPANION_PANEL_PRIVACY_LABELS[entry.privacyStatus] || COMPANION_PANEL_PRIVACY_LABELS.unknown;
}

export function formatCompanionDecisionForDisplay(entry = {}) {
  return {
    step: entry.step ?? 0,
    eventType: entry.inputEventType || entry.eventType || 'unknown',
    status: entry.accepted ? 'accepted' : 'rejected',
    companionIntent: entry.companionIntent || 'none',
    tone: entry.tone || 'quiet',
    safetyOutcome: entry.safetyOutcome || 'unknown',
    robotCommand: entry.robotCommand || 'neutral',
    reasonCodes: Array.isArray(entry.reasonCodes) ? [...entry.reasonCodes] : [],
    privacyStatus: formatPrivacyStatus(entry)
  };
}

export function formatLiveTapTranscriptEntry(entry = {}) {
  return formatCompanionDecisionForDisplay(entry);
}

export function summarizeCompanionTranscript(transcript = []) {
  const entries = transcript.map(formatCompanionDecisionForDisplay);
  const blockedSensitiveCount = entries.filter(entry => entry.privacyStatus === COMPANION_PANEL_PRIVACY_LABELS.blocked).length;
  return {
    transcript: entries,
    transcriptCount: entries.length,
    acceptedCount: entries.filter(entry => entry.status === 'accepted').length,
    rejectedCount: entries.filter(entry => entry.status === 'rejected').length,
    blockedSensitiveCount,
    lastCompanionIntent: entries.at(-1)?.companionIntent || null,
    lastRobotCommand: entries.at(-1)?.robotCommand || null,
    lastSafetyOutcome: entries.at(-1)?.safetyOutcome || null
  };
}

export function summarizeLiveTapSnapshot(snapshot = {}, transcript = []) {
  const summary = summarizeCompanionTranscript(transcript);
  const liveState = {
    ...createInitialLiveTapPanelState(),
    enabled: snapshot.runtimeEnabled === true || snapshot.enabled === true,
    subscribed: snapshot.subscribed === true,
    observedCount: Number.isFinite(snapshot.observedEventCount) ? snapshot.observedEventCount : 0,
    acceptedCount: Number.isFinite(snapshot.acceptedEventCount) ? snapshot.acceptedEventCount : summary.acceptedCount,
    rejectedCount: Number.isFinite(snapshot.rejectedEventCount) ? snapshot.rejectedEventCount : summary.rejectedCount,
    blockedSensitiveCount: summary.blockedSensitiveCount,
    lastInputEventType: snapshot.lastInputEventType || summary.transcript.at(-1)?.eventType || null,
    lastCompanionIntent: snapshot.lastCompanionIntent || summary.lastCompanionIntent,
    lastRobotCommand: snapshot.lastRobotCommand || summary.lastRobotCommand,
    lastSafetyOutcome: snapshot.lastSafetyOutcome || summary.lastSafetyOutcome,
    transcript: summary.transcript,
    safe: true
  };
  return {
    ...liveState,
    safe: isLiveTapSafeSnapshot(liveState)
  };
}

export function isLiveTapSafeSnapshot(snapshot = {}) {
  if (snapshot.observeOnly !== true) return false;
  if (snapshot.noExternalSend !== true) return false;
  if (snapshot.noPersistence !== true) return false;
  return findForbiddenCompanionPanelKeys(snapshot.transcript || []).length === 0;
}

export function runCompanionPanelScenario(scenarioId, options = {}) {
  const scenario = findScenario(scenarioId);
  const enabled = options.enabled === true;
  const initialState = createInitialCompanionPanelState();

  if (!enabled) {
    return {
      ...initialState,
      selectedScenarioId: scenario.id,
      ignoredBeforeEnable: true,
      scenario: { id: scenario.id, label: scenario.label, invalid: scenario.invalid }
    };
  }

  const tap = createCompanionDevTap({ maxTranscriptEntries: 100 });
  tap.enable();
  scenario.events.forEach(event => tap.observeDeviceBridgeEvent(cloneEvent(event)));
  const snapshot = tap.getSnapshot();
  const summary = summarizeCompanionTranscript(tap.getTranscript());

  return {
    enabled: true,
    selectedScenarioId: scenario.id,
    observedCount: snapshot.observedEventCount,
    acceptedCount: snapshot.acceptedEventCount,
    rejectedCount: snapshot.rejectedEventCount,
    blockedSensitiveCount: summary.blockedSensitiveCount,
    lastCompanionIntent: snapshot.lastCompanionIntent,
    lastRobotCommand: snapshot.lastRobotCommand,
    lastSafetyOutcome: snapshot.lastSafetyOutcome,
    transcript: summary.transcript,
    ignoredBeforeEnable: false,
    fakeOnly: true,
    noExternalSend: true,
    noPersistence: true,
    scenario: { id: scenario.id, label: scenario.label, invalid: scenario.invalid }
  };
}
