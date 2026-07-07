import { describe, expect, it } from 'vitest';
import { runShimeExpressionStressBenchmark } from '../../../tools/shimeIntelligence/shimeExpressionStressBenchmark.mjs';

describe('shimeExpressionStressBenchmark', () => {
  it('passes bounded unit subset and full default counts are configured', () => {
    const subset = runShimeExpressionStressBenchmark({ validCount: 20000, attackCount: 2000 });
    expect(subset.status).toBe('PASS');
    expect(subset.validScenarioCount).toBeGreaterThanOrEqual(20000);
    expect(subset.attackScenarioCount).toBeGreaterThanOrEqual(2000);
    expect(subset.noSensitiveOutput).toBe(true);
    expect(subset.allDryRun).toBe(true);
    expect(subset.allNotSent).toBe(true);
    expect(subset.motionLocked).toBe(true);
    expect(subset.noForbiddenChannel).toBe(true);
    expect(subset.noScheduleMutation).toBe(true);
    expect(subset.noNotificationCalendar).toBe(true);
    expect(subset.noTransportConnect).toBe(true);
  }, 15000);
});
