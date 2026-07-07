import {
  auditCompanionDecisionSequence,
  checkCompanionOutputForSensitiveData,
  checkCompanionReplayInvariants,
  runCompanionReplayScenario
} from '../../companion/index.js';

const BLOCKED_PRIVACY_LABELS = new Set(['blocked', 'đã chặn bởi lớp bảo mật']);

function transcriptStatus(entry = {}) {
  if (entry.status === 'rejected') return 'blocked';
  if (BLOCKED_PRIVACY_LABELS.has(entry.privacyStatus)) return 'blocked';
  return 'accepted';
}

function coarsePayloadForEntry(entry = {}, index) {
  const eventType = entry.eventType || entry.inputEventType || 'unknown_event';
  const payload = {
    progressCount: index + 1,
    totalCount: Number.isFinite(entry.totalCount) ? entry.totalCount : undefined
  };
  if (eventType === 'answer_correct') payload.status = 'correct';
  if (eventType === 'answer_wrong') payload.status = 'wrong';
  if (eventType === 'session_complete') payload.accuracyBucket = entry.robotCommand === 'encourage' ? 'low' : 'high';
  if (eventType === 'review_due') payload.dueCountBucket = '20_plus';
  if (eventType === 'bridge_error') payload.transportStatus = 'disconnected';
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function transcriptToCoarseEvents(transcript = []) {
  return transcript.map((entry, index) => ({
    eventType: entry.eventType || entry.inputEventType || 'unknown_event',
    sessionId: `v2_panel_${index + 1}`,
    payload: coarsePayloadForEntry(entry, index),
    blockedByPanel: transcriptStatus(entry) === 'blocked'
  }));
}

function panelRowFromAuditEntry(entry = {}, index) {
  return {
    step: entry.step ?? index + 1,
    v2Intent: entry.policyIntent || 'neutral_wait',
    v2Tone: entry.safetyDecision === 'blocked' ? 'quiet' : 'calm',
    v2Command: entry.finalRobotIntent || 'neutral',
    v2Safety: entry.safetyDecision || 'allowed',
    v2ReasonCodes: Array.isArray(entry.reasonCodes) ? [...entry.reasonCodes] : ['no_reason'],
    v2QualityScore: null,
    v2InvariantStatus: 'pass',
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

function blockedRow(entry = {}, index) {
  return {
    step: index + 1,
    v2Intent: 'calm_error',
    v2Tone: 'quiet',
    v2Command: 'neutral',
    v2Safety: 'blocked',
    v2ReasonCodes: ['forbidden_companion_key'],
    v2QualityScore: null,
    v2InvariantStatus: 'pass',
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

export function runV2DryRunFromTranscript(transcript = [], options = {}) {
  const rows = Array.isArray(transcript) ? transcript : [];
  if (rows.length === 0) {
    return {
      mode: 'v2_dry_run',
      empty: true,
      dryRunOnly: true,
      sendStatus: 'not_sent',
      rows: [],
      summary: summarizeV2DryRun({ rows: [] }),
      audit: [],
      quality: null,
      invariantStatus: 'pass',
      invariantFailures: []
    };
  }

  const events = transcriptToCoarseEvents(rows);
  const safeEvents = events.filter(event => event.blockedByPanel !== true).map(({ blockedByPanel, ...event }) => event);
  const audit = auditCompanionDecisionSequence(safeEvents, options);
  let auditIndex = 0;
  const panelRows = events.map((event, index) => {
    if (event.blockedByPanel) return blockedRow(event, index);
    const row = panelRowFromAuditEntry(audit[auditIndex], index);
    auditIndex += 1;
    return row;
  });
  const scenario = runCompanionReplayScenario({ name: 'v2 panel transcript', events: safeEvents, options });
  const invariant = checkCompanionReplayInvariants(scenario, options);
  const sensitive = checkCompanionOutputForSensitiveData({ rows: panelRows, quality: scenario.quality });
  const invariantFailures = [...invariant.failures, ...sensitive.failures];
  const qualityScore = scenario.quality?.scores?.average ?? null;
  const rowsWithQuality = panelRows.map(row => ({
    ...row,
    v2QualityScore: qualityScore,
    v2InvariantStatus: invariantFailures.length === 0 ? 'pass' : 'fail'
  }));
  const result = {
    mode: 'v2_dry_run',
    empty: false,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    rows: rowsWithQuality,
    audit,
    quality: scenario.quality,
    invariantStatus: invariantFailures.length === 0 ? 'pass' : 'fail',
    invariantFailures
  };
  return {
    ...result,
    summary: summarizeV2DryRun(result)
  };
}

export function summarizeV2DryRun(result = {}) {
  const rows = result.rows || [];
  const last = rows.at(-1) || {};
  return {
    rowCount: rows.length,
    v2Intent: last.v2Intent || 'none',
    v2Tone: last.v2Tone || 'quiet',
    v2Command: last.v2Command || 'neutral',
    v2Safety: rows.some(row => row.v2Safety === 'blocked') ? 'blocked' : last.v2Safety || 'allowed',
    v2ReasonCodes: last.v2ReasonCodes || [],
    v2QualityScore: result.quality?.scores?.average ?? last.v2QualityScore ?? null,
    v2InvariantStatus: result.invariantStatus || 'pass',
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

export function toV2PanelRows(result = {}) {
  return (result.rows || []).map(row => ({
    step: row.step,
    v2Intent: row.v2Intent,
    v2Tone: row.v2Tone,
    v2Command: row.v2Command,
    v2Safety: row.v2Safety,
    v2ReasonCodes: [...(row.v2ReasonCodes || [])],
    v2QualityScore: row.v2QualityScore,
    v2InvariantStatus: row.v2InvariantStatus,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  }));
}

export function createV2PanelSnapshot(result = {}) {
  const summary = result.summary || summarizeV2DryRun(result);
  return {
    mode: 'v2_dry_run',
    rowCount: summary.rowCount,
    lastIntent: summary.v2Intent,
    lastCommand: summary.v2Command,
    safety: summary.v2Safety,
    qualityScore: summary.v2QualityScore,
    invariantStatus: summary.v2InvariantStatus,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}
