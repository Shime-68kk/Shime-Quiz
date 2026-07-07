import { describe, expect, it } from 'vitest';
import { extractFsrsMemorySignals } from '../../../src/shimeIntelligence/fsrsSignalExtractor.js';

describe('fsrsSignalExtractor', () => {
  it('produces bucketed safe signals with reason codes', () => {
    const result = extractFsrsMemorySignals({ dueCount: 12, overdueCount: 2, retrievability: 0.3, stability: 3, difficulty: 8 });
    expect(result).toMatchObject({ duePressureBucket: 'high', forgettingRiskBucket: 'very_high', recommendedSessionMode: 'review_due' });
    expect(result.reasonCodes.length).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toContain('itemId');
  });

  it('handles missing and weird values safely', () => {
    const result = extractFsrsMemorySignals({ retrievability: Number.NaN, stability: -5, difficulty: Infinity });
    expect(result.retrievabilityBucket).toBe('unknown');
    expect(result.reasonCodes).toContain('fsrs_signal_extracted');
  });

  it('blocks sensitive input without echoing raw content', () => {
    const result = extractFsrsMemorySignals({ question: 'private' });
    expect(result.recommendedSessionMode).toBe('blocked');
    expect(JSON.stringify(result)).not.toContain('private');
  });
});
