import { createDefaultCompanionContext, collectForbiddenCompanionKeys } from './companionContextSchema.js';
import { reduceLearningSignal } from './learningSignalReducer.js';
import { reduceRobotPresenceSignal } from './robotPresenceSignalReducer.js';
import { createCompanionDecision } from './companionPolicyEngine.js';
import { governCompanionDecision } from './safetyGovernor.js';
import { planRobotIntent } from './robotIntentPlanner.js';
import { createCompanionRobotCommandEnvelope } from './companionRobotProtocolAdapter.js';
import { createCompanionTranscriptEntry } from './companionTranscriptBuilder.js';
import { createCompanionSimulationReport } from './companionSimulationReport.js';

function makeRejected(state, event, issues, step) {
  const companionContext = createDefaultCompanionContext({
    contextId: state.contextId,
    timestamp: state.timestamp,
    learningState: state.learningState,
    sessionState: { transportStatus: state.learningState.transportStatus || 'unknown' },
    performanceState: state.learningState,
    robotPresenceState: state.robotPresenceState,
    safetyState: { ...state.safetyState, privacyLock: false },
    userExperienceMode: state.profile
  });
  const companionDecision = {
    intent: 'calm_error',
    tone: 'quiet',
    urgency: 'high',
    reasonCodes: ['event_rejected_by_companion_pipeline'],
    allowedRobotActionFamily: 'neutral',
    shouldSpeak: false,
    shouldMove: false,
    shouldNotify: false
  };
  const safetyDecision = governCompanionDecision(companionDecision, companionContext, state.history);
  const robotIntent = planRobotIntent(safetyDecision.decision, companionContext, state.history);
  const result = {
    accepted: false,
    rejected: true,
    event,
    companionContext,
    companionDecision,
    safetyDecision,
    robotIntent,
    robotEnvelope: null,
    reasonCodes: issues.map(issue => issue.code),
    privacyStatus: 'blocked'
  };
  return {
    result: {
      ...result,
      transcriptEntry: createCompanionTranscriptEntry({ ...result, step })
    },
    state: {
      ...state,
      results: [...state.results, result]
    }
  };
}

export function createInitialCompanionBridgeState(options = {}) {
  const presence = reduceRobotPresenceSignal(options.presenceSignal || {});
  return {
    contextId: options.contextId || 'companion_bridge_simulation',
    timestamp: options.timestamp || '1970-01-01T00:00:00.000Z',
    profile: options.profile || 'calm_companion',
    learningState: {},
    robotPresenceState: presence.state || {},
    safetyState: {
      safetyMode: options.safetyMode || 'motion_disabled',
      privacyLock: options.privacyLock !== false,
      motionAllowed: options.motionAllowed === true,
      childSafeMode: options.childSafeMode !== false
    },
    history: Array.isArray(options.history) ? [...options.history] : [],
    results: []
  };
}

export function processDeviceBridgeEvent(state, event, options = {}) {
  const step = state.results.length + 1;
  const forbidden = collectForbiddenCompanionKeys(event);
  if (forbidden.length > 0) return makeRejected(state, event, forbidden, step);

  const reduced = reduceLearningSignal(event, state.learningState);
  if (!reduced.ok) return makeRejected(state, event, reduced.issues, step);

  const presenceSignal = options.presenceSignal || event?.presenceSignal;
  const presence = presenceSignal
    ? reduceRobotPresenceSignal(presenceSignal, state.robotPresenceState)
    : { ok: true, state: state.robotPresenceState, issues: [] };
  if (!presence.ok) return makeRejected(state, event, presence.issues, step);

  const companionContext = createDefaultCompanionContext({
    contextId: state.contextId,
    timestamp: options.timestamp || state.timestamp,
    learningState: reduced.state,
    sessionState: { transportStatus: reduced.state.transportStatus || state.learningState.transportStatus || 'connected' },
    performanceState: reduced.state,
    robotPresenceState: presence.state,
    safetyState: state.safetyState,
    userExperienceMode: options.profile || state.profile
  });
  const companionDecision = createCompanionDecision(companionContext);
  const safetyDecision = governCompanionDecision(companionDecision, companionContext, state.history);
  const robotIntent = planRobotIntent(safetyDecision.decision, companionContext, state.history);
  const robotEnvelope = createCompanionRobotCommandEnvelope(robotIntent, companionContext, {
    step,
    messageId: options.messageId || `companion_robot_${step}`,
    emittedAt: options.emittedAt || state.timestamp
  });
  const result = {
    accepted: true,
    rejected: false,
    event,
    companionContext,
    companionDecision,
    safetyDecision,
    robotIntent,
    robotEnvelope: robotEnvelope.envelope,
    reasonCodes: [...companionDecision.reasonCodes, ...safetyDecision.reasonCodes, ...robotIntent.reasonCodes],
    privacyStatus: 'redacted_coarse_only'
  };
  const historyEntry = robotIntent.command === 'celebrate' ? 'celebrate' : { actionFamily: robotIntent.command };
  const nextState = {
    ...state,
    learningState: reduced.state,
    robotPresenceState: presence.state,
    history: [...state.history, historyEntry],
    results: [...state.results, result]
  };
  return {
    result: {
      ...result,
      transcriptEntry: createCompanionTranscriptEntry({ ...result, step })
    },
    state: nextState
  };
}

export function processDeviceBridgeEventSequence(events = [], options = {}) {
  let state = createInitialCompanionBridgeState(options);
  const results = [];
  events.forEach((event, index) => {
    const processed = processDeviceBridgeEvent(state, event, {
      ...options,
      presenceSignal: options.presenceSignals?.[index] || options.presenceSignal,
      messageId: `companion_robot_${index + 1}`
    });
    state = processed.state;
    results.push(processed.result);
  });

  return {
    state,
    results,
    report: createCompanionSimulationReport(results)
  };
}

export function getCompanionBridgeSnapshot(state) {
  return {
    contextId: state.contextId,
    profile: state.profile,
    learningState: { ...state.learningState },
    robotPresenceState: { ...state.robotPresenceState },
    safetyState: { ...state.safetyState },
    eventCount: state.results.length,
    report: createCompanionSimulationReport(state.results)
  };
}
