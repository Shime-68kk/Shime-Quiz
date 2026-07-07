const FORBIDDEN_KEYS = [
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload'
];

function safeCommand(entry = {}) {
  if (entry.safetyOutcome === 'blocked' || entry.privacyStatus?.includes('chặn')) return 'neutral';
  return entry.robotCommand || 'neutral';
}

export function createCompanionCommandPreview(transcript = [], options = {}) {
  const maxItems = Number.isFinite(options.maxItems) ? Math.max(0, Math.floor(options.maxItems)) : 20;
  return transcript.slice(-maxItems).map(entry => ({
    step: entry.step ?? 0,
    sourceEvent: entry.eventType || 'unknown',
    plannedCommand: safeCommand(entry),
    reasonCode: Array.isArray(entry.reasonCodes) && entry.reasonCodes.length > 0 ? entry.reasonCodes[0] : 'none',
    safetyOutcome: entry.safetyOutcome || 'unknown',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    notice: 'Không gửi ra robot thật'
  }));
}

export function commandPreviewContainsForbiddenData(preview = []) {
  const serialized = JSON.stringify(preview);
  return FORBIDDEN_KEYS.some(key => serialized.includes(`"${key}"`));
}

