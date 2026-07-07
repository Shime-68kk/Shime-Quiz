import { createInitialCompanionBridgeState, processDeviceBridgeEvent } from './companionBridgePipeline.js';
import { collectForbiddenCompanionKeys } from './companionContextSchema.js';
import {
  COMPANION_DEV_TAP_MODES,
  COMPANION_DEV_TAP_PRIVACY_MODES,
  COMPANION_DEV_TAP_STATES,
  createCompanionDevTapSnapshot
} from './companionDevTapContract.js';

function clampMaxEntries(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 100;
  return Math.min(Math.floor(numeric), 1000);
}

function redactTranscriptEntry(entry) {
  return {
    step: entry.step,
    inputEventType: entry.inputEventType,
    accepted: entry.accepted,
    rejected: entry.rejected,
    companionIntent: entry.companionIntent,
    tone: entry.tone,
    safetyOutcome: entry.safetyOutcome,
    robotCommand: entry.robotCommand,
    reasonCodes: [...entry.reasonCodes],
    privacyStatus: entry.privacyStatus
  };
}

export function createCompanionDevTap(options = {}) {
  const maxTranscriptEntries = clampMaxEntries(options.maxTranscriptEntries);
  let enabled = false;
  let state = COMPANION_DEV_TAP_STATES.DISABLED;
  let mode = options.mode || COMPANION_DEV_TAP_MODES.OBSERVE_ONLY;
  let bridgeState = createInitialCompanionBridgeState(options.pipelineOptions || {});
  let transcript = [];
  let observedEventCount = 0;
  let acceptedEventCount = 0;
  let rejectedEventCount = 0;
  let lastInputEventType = null;
  let lastCompanionIntent = null;
  let lastRobotCommand = null;
  let lastSafetyOutcome = null;
  let lastError = null;

  function pushTranscript(entry) {
    transcript = [...transcript, redactTranscriptEntry(entry)].slice(-maxTranscriptEntries);
  }

  function snapshot() {
    return createCompanionDevTapSnapshot({
      enabled,
      state,
      mode,
      observedEventCount,
      acceptedEventCount,
      rejectedEventCount,
      transcriptCount: transcript.length,
      lastInputEventType,
      lastCompanionIntent,
      lastRobotCommand,
      lastSafetyOutcome,
      lastError
    });
  }

  return {
    enable() {
      enabled = true;
      state = COMPANION_DEV_TAP_STATES.ENABLED;
      lastError = null;
      return snapshot();
    },

    disable() {
      enabled = false;
      state = COMPANION_DEV_TAP_STATES.DISABLED;
      return snapshot();
    },

    pause() {
      if (!enabled) return snapshot();
      state = COMPANION_DEV_TAP_STATES.PAUSED;
      return snapshot();
    },

    resume() {
      if (!enabled) return snapshot();
      state = COMPANION_DEV_TAP_STATES.ENABLED;
      return snapshot();
    },

    observeDeviceBridgeEvent(event) {
      if (!enabled || state !== COMPANION_DEV_TAP_STATES.ENABLED) {
        return { ok: true, ignored: true, snapshot: snapshot() };
      }

      observedEventCount += 1;
      lastInputEventType = event?.eventType || null;

      try {
        const forbidden = collectForbiddenCompanionKeys(event);
        const processed = forbidden.length > 0
          ? processDeviceBridgeEvent(bridgeState, event)
          : processDeviceBridgeEvent(bridgeState, event);
        bridgeState = processed.state;
        const entry = processed.result.transcriptEntry;
        pushTranscript(entry);
        if (processed.result.accepted) acceptedEventCount += 1;
        else rejectedEventCount += 1;
        lastCompanionIntent = entry.companionIntent;
        lastRobotCommand = entry.robotCommand;
        lastSafetyOutcome = entry.safetyOutcome;
        lastError = processed.result.accepted ? null : { reason: processed.result.reasonCodes[0] || 'event_rejected' };
        return { ok: processed.result.accepted, result: processed.result, snapshot: snapshot() };
      } catch {
        state = COMPANION_DEV_TAP_STATES.ERROR;
        lastError = { reason: 'companion_tap_observe_failed' };
        rejectedEventCount += 1;
        return { ok: false, reason: 'companion_tap_observe_failed', snapshot: snapshot() };
      }
    },

    getSnapshot: snapshot,

    getTranscript() {
      return transcript.map(entry => ({ ...entry, reasonCodes: [...entry.reasonCodes] }));
    },

    clearTranscript() {
      transcript = [];
      return snapshot();
    },

    getPrivacyMode() {
      return COMPANION_DEV_TAP_PRIVACY_MODES.REDACTED_ONLY;
    }
  };
}
