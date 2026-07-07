import { describe, expect, it } from 'vitest';
import { createExpressionProtocolGoldenFixtures } from '../../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { createEsp32ExpressionExpectedLogs } from '../../../src/shimeIntelligence/esp32ExpressionExpectedLogs.js';

describe('esp32ExpressionExpectedLogs', () => {
  it('matches fixture expectations', () => {
    const logs = createEsp32ExpressionExpectedLogs(createExpressionProtocolGoldenFixtures());
    expect(logs.acceptCount).toBe(12);
    expect(logs.rejectCount).toBe(7);
    expect(logs.safetyLog).toContain('no motion');
    expect(logs.logs.some(log => log.expectedStatus === 'REJECT')).toBe(true);
  });
});

