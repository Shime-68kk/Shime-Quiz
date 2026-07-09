import { describe, expect, it } from 'vitest';
import {
  assertSubjectRobotSafeSummary,
  createSubjectRobotSafeSummary
} from '../../src/studyRoom/subjectRobotSafeSummary.js';

describe('subjectRobotSafeSummary', () => {
  it('creates coarse safe buckets only', () => {
    const summary = createSubjectRobotSafeSummary({
      activeSubjectId: 'math',
      subjectSpaces: [
        { subjectId: 'math', subjectLabel: 'Toán', forgettingPressureBucket: 'low' },
        { subjectId: 'physics', subjectLabel: 'Vật lý', forgettingPressureBucket: 'urgent' }
      ]
    });
    expect(summary).toMatchObject({
      subjectCountBucket: '1_2',
      highestPressureBucket: 'urgent',
      suggestedCompanionAction: 'rescue_review_support',
      companionTone: 'urgent_but_soft',
      rawContentIncluded: false,
      privacyClass: 'subject_state_coarse_only'
    });
    expect(assertSubjectRobotSafeSummary(summary)).toBe(true);
  });

  it('does not expose exact subject names or raw study content', () => {
    const summary = createSubjectRobotSafeSummary({
      activeSubjectId: 'secret-subject',
      subjectSpaces: [{ subjectId: 'secret-subject', subjectLabel: 'Private Biology', forgettingPressureBucket: 'high' }]
    });
    expect(JSON.stringify(summary)).not.toMatch(/Private Biology|prompt|question|answer|explanation/i);
  });
});
