import { describe, expect, it } from 'vitest';
import { bucketDifficulty, bucketDuePressure, bucketRetrievability, bucketStability } from '../../../src/shimeIntelligence/memoryStateBuckets.js';

describe('memoryStateBuckets', () => {
  it('handles boundary and invalid values deterministically', () => {
    expect(bucketRetrievability(undefined)).toBe('unknown');
    expect(bucketRetrievability(0.34)).toBe('very_low');
    expect(bucketRetrievability(0.9)).toBe('very_high');
    expect(bucketStability(-1)).toBe('unknown');
    expect(bucketStability(0)).toBe('none');
    expect(bucketStability(1000)).toBe('very_high');
    expect(bucketDifficulty(Number.NaN)).toBe('unknown');
    expect(bucketDifficulty(8)).toBe('very_high');
    expect(bucketDuePressure({ dueCount: 31 })).toBe('very_high');
  });
});
