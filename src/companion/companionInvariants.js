import { FORBIDDEN_COMPANION_KEYS, collectForbiddenCompanionKeys } from './companionContextSchema.js';

export const COMPANION_V2_ALLOWED_COMMANDS = Object.freeze([
  'neutral',
  'focus',
  'encourage',
  'celebrate',
  'due_review',
  'session_complete'
]);

export const COMPANION_V2_HIGH_INTENSITY_INTENTS = Object.freeze([
  'celebrate_big',
  'suggest_break'
]);

const EXTRA_FORBIDDEN_KEYS = Object.freeze([
  'libraryItemContent',
  'cameraFrames',
  'audioRecording',
  'audioRecordings',
  'biometricIdentity'
]);

export const COMPANION_V2_FORBIDDEN_OUTPUT_KEYS = Object.freeze([
  ...new Set([...FORBIDDEN_COMPANION_KEYS, ...EXTRA_FORBIDDEN_KEYS])
]);

function visit(value, path = '$', failures = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => visit(entry, `${path}[${index}]`, failures));
    return failures;
  }
  if (!value || typeof value !== 'object') return failures;
  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (COMPANION_V2_FORBIDDEN_OUTPUT_KEYS.includes(key)) {
      failures.push({ code: 'sensitive_key_present', path: nextPath, key });
    }
    visit(entry, nextPath, failures);
  });
  return failures;
}

function uniqueFailures(failures) {
  const seen = new Set();
  return failures.filter(failure => {
    const id = `${failure.code}:${failure.path || ''}:${failure.key || ''}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function checkCompanionOutputForSensitiveData(output, options = {}) {
  const failures = visit(output);
  const forbidden = collectForbiddenCompanionKeys(output);
  forbidden.forEach(issue => failures.push({
    code: 'forbidden_companion_key',
    path: issue.path,
    key: issue.path?.split('.').at(-1)
  }));
  if (options.disallowRawStringScan === true) {
    const serialized = JSON.stringify(output);
    COMPANION_V2_FORBIDDEN_OUTPUT_KEYS.forEach(key => {
      if (serialized.includes(`"${key}"`)) failures.push({ code: 'sensitive_key_string_present', key });
    });
  }
  return {
    ok: failures.length === 0,
    failures: uniqueFailures(failures)
  };
}

export function assertCompanionDecisionInvariants(decision = {}, options = {}) {
  const failures = [];
  const sensitive = checkCompanionOutputForSensitiveData(decision);
  failures.push(...sensitive.failures);

  const intent = decision.adjustedIntent || decision.intent || decision.policyIntent || 'neutral_wait';
  const command = decision.finalRobotIntent || decision.command || decision.recommendedRobotActionFamily || 'neutral';
  const reasonCodes = decision.reasonCodes || [];
  const safetyDecision = decision.safetyDecision || decision.finalSafetyOutcome || 'allowed';
  const privacyStatus = decision.privacyStatus || 'redacted_coarse_only';
  const dryRunOnly = decision.dryRunOnly;

  if (!COMPANION_V2_ALLOWED_COMMANDS.includes(command)) {
    failures.push({ code: 'command_not_allowed', command });
  }
  if (decision.shouldMove === true || decision.motionAllowed === true || decision.motion === true) {
    failures.push({ code: 'motion_not_allowed_by_default' });
  }
  if (!Array.isArray(reasonCodes) || reasonCodes.length === 0) {
    failures.push({ code: 'missing_reason_codes' });
  }
  if (options.transportUnsafe === true && !['neutral'].includes(command) && intent !== 'reconnect_hint') {
    failures.push({ code: 'unsafe_transport_not_neutralized', intent, command });
  }
  if ((options.privacyViolation === true || privacyStatus === 'blocked') && !['calm_error', 'neutral_wait'].includes(intent)) {
    failures.push({ code: 'privacy_violation_not_calm_or_neutral', intent });
  }
  if ((options.profile === 'classroom_safe' || options.safetyMode === 'classroom_safe') && COMPANION_V2_HIGH_INTENSITY_INTENTS.includes(intent)) {
    failures.push({ code: 'classroom_safe_high_intensity', intent });
  }
  if (intent === 'suggest_break' && !['three_plus'].includes(options.repeatedWrongCountBucket)) {
    failures.push({ code: 'premature_break_suggestion', intent });
  }
  if (intent === 'celebrate_big' && options.correctStreakBucket !== 'large') {
    failures.push({ code: 'premature_big_celebration', intent });
  }
  if (options.repeatedIntenseCount >= 3 && COMPANION_V2_HIGH_INTENSITY_INTENTS.includes(intent)) {
    failures.push({ code: 'spammy_repeated_intense_command', intent });
  }
  if (dryRunOnly === false) {
    failures.push({ code: 'external_send_path_present' });
  }
  if (safetyDecision === 'blocked' && !['neutral'].includes(command)) {
    failures.push({ code: 'blocked_safety_not_neutral', command });
  }

  return {
    ok: failures.length === 0,
    failures: uniqueFailures(failures)
  };
}

export function checkCompanionReplayInvariants(replayResult = {}, options = {}) {
  const failures = [];
  const entries = replayResult.audit || replayResult.entries || [];
  const replaySensitive = checkCompanionOutputForSensitiveData(replayResult.snapshot || replayResult.goldenSnapshot || {
    name: replayResult.name,
    eventCount: replayResult.eventCount,
    finalIntent: replayResult.finalIntent,
    finalCommand: replayResult.finalCommand,
    quality: replayResult.quality,
    safetyResult: replayResult.safetyResult,
    privacyResult: replayResult.privacyResult
  });
  failures.push(...replaySensitive.failures);

  entries.forEach((entry, index) => {
    const currentTransportUnsafe = ['disconnected', 'error', 'disabled'].includes(entry.sessionStateSummary?.transportHealth);
    const result = assertCompanionDecisionInvariants(entry, {
      ...options,
      transportUnsafe: currentTransportUnsafe,
      privacyViolation: entry.privacyStatus === 'blocked',
      repeatedWrongCountBucket: entry.sessionStateSummary?.repeatedWrongCountBucket,
      correctStreakBucket: entry.sessionStateSummary?.correctStreakBucket,
      profile: options.profile,
      safetyMode: options.safetyMode
    });
    result.failures.forEach(failure => failures.push({ ...failure, path: `audit[${index}]` }));
    if (entry.dryRunOnly !== true) {
      failures.push({ code: 'audit_not_dry_run', path: `audit[${index}]` });
    }
  });

  return {
    ok: failures.length === 0,
    failures: uniqueFailures(failures)
  };
}

export function summarizeInvariantFailures(failures = []) {
  const counts = failures.reduce((acc, failure) => {
    const code = failure.code || 'unknown';
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});
  return {
    count: failures.length,
    codes: Object.keys(counts).sort(),
    counts
  };
}
