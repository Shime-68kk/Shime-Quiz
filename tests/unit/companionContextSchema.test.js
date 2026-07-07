import { describe, expect, it } from 'vitest';
import {
  COMPANION_CONTEXT_VERSION,
  collectForbiddenCompanionKeys,
  createDefaultCompanionContext,
  validateCompanionContext
} from '../../src/companion/companionContextSchema.js';

describe('companionContextSchema', () => {
  it('creates normalized safe context with fallbacks', () => {
    const context = createDefaultCompanionContext({
      learningState: { sessionPhase: 'bad', itemType: 'multiple_choice' },
      performanceState: { accuracyBucket: 'high' }
    });

    expect(context.protocolVersion).toBe(COMPANION_CONTEXT_VERSION);
    expect(context.learningState.sessionPhase).toBe('idle');
    expect(context.learningState.itemType).toBe('multiple_choice');
    expect(context.performanceState.accuracyBucket).toBe('high');
  });

  it('rejects forbidden keys recursively', () => {
    const result = validateCompanionContext({
      learningState: {
        nested: {
          correctAnswer: 'private'
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.issues[0]).toMatchObject({ code: 'forbidden_companion_key', path: '$.learningState.nested.correctAnswer' });
  });

  it('collects future sensor privacy fields as forbidden', () => {
    expect(collectForbiddenCompanionKeys({ robot: { cameraFrames: [] } }).map(issue => issue.path)).toEqual(['$.robot.cameraFrames']);
  });
});
