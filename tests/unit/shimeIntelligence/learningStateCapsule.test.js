import { describe, expect, it } from 'vitest';
import { createLearningStateCapsule, summarizeLearningStateCapsule, validateLearningStateCapsule } from '../../../src/shimeIntelligence/learningStateCapsule.js';

describe('learningStateCapsule', () => {
  it('creates and validates safe dry-run capsules', () => {
    const capsule = createLearningStateCapsule({ fsrs: { dueCount: 4, retrievability: 0.6, stability: 8, difficulty: 5 } });
    expect(validateLearningStateCapsule(capsule).ok).toBe(true);
    expect(capsule.dryRunOnly).toBe(true);
    expect(summarizeLearningStateCapsule(capsule).dryRunOnly).toBe(true);
  });

  it('blocks nested sensitive fields without raw summary output', () => {
    const capsule = createLearningStateCapsule({ fsrs: { safe: { correctAnswer: 'private' } } });
    expect(capsule.privacyStatus).toBe('blocked');
    expect(JSON.stringify(summarizeLearningStateCapsule(capsule))).not.toContain('private');
  });
});
