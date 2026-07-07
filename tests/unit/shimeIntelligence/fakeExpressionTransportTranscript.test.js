import { describe, expect, it } from 'vitest';
import { createRobotExpressionEnvelope } from '../../../src/shimeIntelligence/robotExpressionEnvelopeProtocol.js';
import {
  appendExpressionEnvelopeToTranscript,
  createFakeExpressionTransportTranscript,
  summarizeFakeExpressionTransportTranscript
} from '../../../src/shimeIntelligence/fakeExpressionTransportTranscript.js';

describe('fakeExpressionTransportTranscript', () => {
  it('accepts valid envelopes as dry-run ack rows', () => {
    const envelope = createRobotExpressionEnvelope({ reasonCodes: ['fake_transport_fixture'] });
    const transcript = appendExpressionEnvelopeToTranscript(createFakeExpressionTransportTranscript(), envelope);
    expect(summarizeFakeExpressionTransportTranscript(transcript)).toMatchObject({
      rowCount: 2,
      acceptedCount: 1,
      lastAckStatus: 'accepted_dry_run',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    });
  });

  it('rejects invalid envelopes without sending', () => {
    const envelope = { ...createRobotExpressionEnvelope({ reasonCodes: ['fake_transport_bad'] }), sendStatus: 'sent' };
    const transcript = appendExpressionEnvelopeToTranscript(createFakeExpressionTransportTranscript(), envelope);
    expect(summarizeFakeExpressionTransportTranscript(transcript).lastAckStatus).toBe('rejected');
  });
});

