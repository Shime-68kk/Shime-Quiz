import { describe, expect, it } from 'vitest';
import { createRobotExpressionEnvelope } from '../../../src/shimeIntelligence/robotExpressionEnvelopeProtocol.js';
import {
  createEsp32ExpressionLogPreview,
  summarizeEsp32ExpressionLogPreview,
  validateEsp32ExpressionLogPreview
} from '../../../src/shimeIntelligence/esp32ExpressionLogContract.js';

describe('esp32ExpressionLogContract', () => {
  it('creates accepted log-only previews for valid envelopes', () => {
    const logPreview = createEsp32ExpressionLogPreview(createRobotExpressionEnvelope({ reasonCodes: ['esp32_fixture'] }));
    expect(logPreview.accepted).toBe(true);
    expect(validateEsp32ExpressionLogPreview(logPreview).ok).toBe(true);
    expect(summarizeEsp32ExpressionLogPreview(logPreview).sendStatus).toBe('not_sent');
  });

  it('creates rejected log-only previews for invalid envelopes', () => {
    const logPreview = createEsp32ExpressionLogPreview({ ...createRobotExpressionEnvelope({ reasonCodes: ['bad_esp32'] }), motionPolicy: 'unlocked' });
    expect(logPreview.accepted).toBe(false);
    expect(logPreview.motionPolicy).toBe('locked');
    expect(logPreview.sendStatus).toBe('not_sent');
  });
});

