import { collectForbiddenCompanionKeys } from './companionContextSchema.js';

export function createCompanionTranscriptEntry(input = {}) {
  const forbidden = collectForbiddenCompanionKeys(input);
  const reasonCodes = [
    ...(input.reasonCodes || []),
    ...(input.companionDecision?.reasonCodes || []),
    ...(input.safetyDecision?.reasonCodes || []),
    ...(input.robotIntent?.reasonCodes || [])
  ].filter(Boolean);

  return {
    step: Number.isFinite(Number(input.step)) ? Number(input.step) : 0,
    inputEventType: input.event?.eventType || input.inputEventType || 'unknown',
    accepted: input.accepted === true,
    rejected: input.rejected === true,
    companionIntent: input.companionDecision?.intent || 'calm_error',
    tone: input.companionDecision?.tone || 'quiet',
    safetyOutcome: input.safetyDecision?.allowed === false ? 'blocked' : 'allowed',
    robotCommand: input.robotIntent?.command || 'neutral',
    reasonCodes: reasonCodes.length ? Array.from(new Set(reasonCodes)) : ['no_reason'],
    privacyStatus: forbidden.length > 0 || input.privacyStatus === 'blocked' ? 'blocked' : 'redacted_coarse_only'
  };
}

export function createCompanionTranscript(entries = []) {
  return entries.map((entry, index) => createCompanionTranscriptEntry({ ...entry, step: entry.step ?? index + 1 }));
}

export function formatCompanionTranscript(entries = []) {
  return createCompanionTranscript(entries).map(entry =>
    `[COMPANION BRIDGE] step=${entry.step} event=${entry.inputEventType} accepted=${entry.accepted ? 'yes' : 'no'} safety=${entry.safetyOutcome} intent=${entry.companionIntent} command=${entry.robotCommand} privacy=${entry.privacyStatus} reasons=${entry.reasonCodes.join('|')}`
  );
}
