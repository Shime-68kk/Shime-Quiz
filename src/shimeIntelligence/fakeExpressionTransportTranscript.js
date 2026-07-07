import {
  summarizeRobotExpressionEnvelope,
  validateRobotExpressionEnvelope
} from './robotExpressionEnvelopeProtocol.js';

export function createFakeExpressionTransportTranscript(options = {}) {
  return {
    transcriptProtocol: 'shime_fake_expression_transcript',
    transcriptVersion: '1.0.0',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    maxRows: options.maxRows || 24,
    rows: [],
    reasonCodes: ['fake_expression_transcript_created']
  };
}

function boundedRows(rows, maxRows) {
  return rows.slice(Math.max(0, rows.length - maxRows));
}

export function appendExpressionEnvelopeToTranscript(transcript = createFakeExpressionTransportTranscript(), envelope = {}, options = {}) {
  const maxRows = options.maxRows || transcript.maxRows || 24;
  const validation = validateRobotExpressionEnvelope(envelope);
  const summary = summarizeRobotExpressionEnvelope(envelope);
  const nextStep = transcript.rows.length + 1;
  const appRow = {
    step: nextStep,
    direction: 'app_to_fake_robot',
    envelopeSummary: summary,
    validationStatus: validation.ok ? 'accepted' : 'rejected',
    ackStatus: 'pending',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['fake_expression_transcript_app_row']
  };
  const ackRow = {
    step: nextStep + 1,
    direction: 'fake_robot_ack',
    envelopeSummary: summary,
    validationStatus: validation.ok ? 'accepted' : 'rejected',
    ackStatus: validation.ok ? 'accepted_dry_run' : 'rejected',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: validation.ok
      ? ['fake_expression_ack_accepted']
      : ['fake_expression_ack_rejected', ...validation.failures]
  };
  return {
    ...transcript,
    rows: boundedRows([...(transcript.rows || []), appRow, ackRow], maxRows),
    reasonCodes: [...new Set([...(transcript.reasonCodes || []), 'fake_expression_transcript_appended'])]
  };
}

export function summarizeFakeExpressionTransportTranscript(transcript = {}) {
  const rows = transcript.rows || [];
  return {
    transcriptProtocol: transcript.transcriptProtocol || 'shime_fake_expression_transcript',
    rowCount: rows.length,
    acceptedCount: rows.filter(row => row.ackStatus === 'accepted_dry_run').length,
    rejectedCount: rows.filter(row => row.ackStatus === 'rejected').length,
    dryRunOnly: transcript.dryRunOnly === true,
    sendStatus: transcript.sendStatus || 'not_sent',
    lastAckStatus: rows.length > 0 ? rows[rows.length - 1].ackStatus : 'none',
    reasonCodes: [...(transcript.reasonCodes || [])]
  };
}

