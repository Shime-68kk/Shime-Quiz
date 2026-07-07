import { describe, expect, it } from 'vitest';
import { runRobotExpressionProtocolBenchmark } from '../../../src/shimeIntelligence/robotExpressionProtocolBenchmark.js';

describe('robotExpressionProtocolBenchmark', () => {
  it('passes reduced benchmark counts in unit mode', () => {
    const result = runRobotExpressionProtocolBenchmark({ protocolScenarioCount: 120, attackScenarioCount: 64 });
    expect(result.passed).toBe(true);
    expect(result.validPassed).toBe(120);
    expect(result.attackRejectedCount).toBe(64);
    expect(result.noRobotSend).toBe(true);
    expect(result.noMotionUnlock).toBe(true);
  });
});

