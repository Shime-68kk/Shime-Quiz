import { describe, expect, it } from 'vitest';
import { getProductSurface, shouldShowDeveloperTools } from '../../src/config/productSurface.js';
import { createLearnerTodayDecision, LEARNER_TODAY_DECISIONS } from '../../src/dashboard/learnerTodayDecision.js';

describe('learner-first product surface', () => {
  it('hides developer diagnostics in production by default', () => {
    expect(shouldShowDeveloperTools({ DEV: false })).toBe(false);
    expect(getProductSurface({ DEV: false })).toMatchObject({
      developerToolsVisible: false,
      learnerFirst: true,
      technicalDetailsDefaultOpen: false
    });
  });

  it('allows diagnostics only in dev or an explicit internal build', () => {
    expect(shouldShowDeveloperTools({ DEV: true })).toBe(true);
    expect(shouldShowDeveloperTools({ DEV: false, VITE_SHIME_DEVELOPER_TOOLS: 'enabled' })).toBe(true);
  });
});

describe('single today decision boundary', () => {
  it('prioritizes due review over plan and generic practice', () => {
    const decision = createLearnerTodayDecision({
      itemCount: 30,
      dueCount: 4,
      smartCount: 10,
      firstPlanStep: { routeState: { mode: 'smart-practice' }, estimatedItemCount: 7 }
    });
    expect(decision.type).toBe(LEARNER_TODAY_DECISIONS.REVIEW_DUE);
    expect(decision.count).toBe(4);
  });

  it('keeps algorithm vocabulary out of the learner decision', () => {
    const serialized = JSON.stringify(createLearnerTodayDecision({ itemCount: 12, smartCount: 6 })).toLowerCase();
    expect(serialized).not.toMatch(/fsrs|retrievability|stability|difficulty|schedulerkind|confidencebucket/);
  });

  it('routes an empty library to the one useful next action', () => {
    expect(createLearnerTodayDecision({ itemCount: 0, libraryEmpty: true })).toMatchObject({
      type: LEARNER_TODAY_DECISIONS.OPEN_LIBRARY,
      route: '/library'
    });
  });
});
