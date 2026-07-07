import { createInitialBehaviorMemory, rememberCompanionBehavior } from './companionBehaviorMemory.js';
import { applyCompanionHysteresis } from './companionHysteresis.js';
import { createAdaptiveCompanionDecision } from './companionAdaptivePolicy.js';
import {
  createInitialCompanionSessionState,
  getCompanionSessionSnapshot,
  reduceCompanionSessionEvent
} from './companionSessionModel.js';

function commandFromAction(action) {
  return ['focus', 'encourage', 'celebrate', 'due_review', 'session_complete'].includes(action) ? action : 'neutral';
}

export function auditCompanionDecisionSequence(events = [], options = {}) {
  let session = createInitialCompanionSessionState(options);
  let memory = createInitialBehaviorMemory(options.memoryOptions || {});
  const entries = [];

  events.forEach((event, index) => {
    session = reduceCompanionSessionEvent(session, event, options);
    const sessionSnapshot = getCompanionSessionSnapshot(session);
    const policy = createAdaptiveCompanionDecision(options.context || {}, sessionSnapshot, memory, options);
    const adjusted = applyCompanionHysteresis(policy, memory, sessionSnapshot, options);
    const finalCommand = commandFromAction(adjusted.recommendedRobotActionFamily);
    const accepted = sessionSnapshot.rejected !== true;
    const entry = {
      step: index + 1,
      inputEventType: event?.eventType || 'unknown',
      accepted,
      rejectedReason: accepted ? null : sessionSnapshot.rejectedReason || 'event_rejected',
      sessionStateSummary: {
        sessionPhase: sessionSnapshot.sessionPhase,
        struggleBucket: sessionSnapshot.struggleBucket,
        recoveryBucket: sessionSnapshot.recoveryBucket,
        correctStreakBucket: sessionSnapshot.correctStreakBucket,
        repeatedWrongCountBucket: sessionSnapshot.repeatedWrongCountBucket,
        completionQualityBucket: sessionSnapshot.completionQualityBucket,
        transportHealth: sessionSnapshot.transportHealth
      },
      policyIntent: policy.intent,
      hysteresisAdjustment: adjusted.downgradeApplied ? adjusted.adjustedIntent : 'none',
      safetyDecision: accepted && !adjusted.reasonCodes.includes('transport_unsafe') ? 'allowed' : 'blocked',
      finalRobotIntent: accepted ? finalCommand : 'neutral',
      reasonCodes: [...new Set([...(policy.reasonCodes || []), ...(adjusted.reasonCodes || []), ...(sessionSnapshot.recentReasonCodes || [])])],
      privacyStatus: accepted ? 'redacted_coarse_only' : 'blocked',
      dryRunOnly: true
    };
    entries.push(entry);
    memory = rememberCompanionBehavior(memory, {
      intent: adjusted.adjustedIntent,
      recommendedRobotActionFamily: adjusted.recommendedRobotActionFamily
    });
    session = {
      ...session,
      lastIntent: adjusted.adjustedIntent,
      lastCommand: finalCommand,
      recentReasonCodes: entry.reasonCodes.slice(0, 8)
    };
  });

  return entries;
}

export function auditContainsForbiddenData(entries = []) {
  const serialized = JSON.stringify(entries);
  return ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'backupPayload', 'rawQuizPayload'].some(key => serialized.includes(`"${key}"`));
}

