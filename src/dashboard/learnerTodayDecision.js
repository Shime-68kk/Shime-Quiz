export const LEARNER_TODAY_DECISIONS = Object.freeze({
  OPEN_LIBRARY: 'open_library',
  REVIEW_DUE: 'review_due',
  FOLLOW_PLAN: 'follow_plan',
  SMART_PRACTICE: 'smart_practice',
  CONTINUE: 'continue'
});

function safeCount(value) {
  return Math.max(0, Number(value) || 0);
}

/**
 * Converts scheduler/recommendation output into one learner-facing decision.
 * The UI never needs to understand scheduler kinds, confidence buckets, or FSRS fields.
 */
export function createLearnerTodayDecision(input = {}) {
  const itemCount = safeCount(input.itemCount);
  const dueCount = safeCount(input.dueCount);
  const smartCount = safeCount(input.smartCount);
  const weakCount = safeCount(input.weakCount);
  const firstPlanStep = input.firstPlanStep || null;

  if (!itemCount || input.libraryEmpty === true) {
    return { type: LEARNER_TODAY_DECISIONS.OPEN_LIBRARY, count: 0, route: '/library', routeState: null };
  }

  if (dueCount > 0) {
    return {
      type: LEARNER_TODAY_DECISIONS.REVIEW_DUE,
      count: dueCount,
      route: '/study-room',
      routeState: {
        selection: { mode: 'due-review', source: 'dashboard-today-card', dueCount }
      }
    };
  }

  if (firstPlanStep?.routeState) {
    return {
      type: LEARNER_TODAY_DECISIONS.FOLLOW_PLAN,
      count: safeCount(firstPlanStep.estimatedItemCount),
      route: '/study-room',
      routeState: { selection: firstPlanStep.routeState }
    };
  }

  if (smartCount > 0) {
    const selected = input.weakSelection?.selectedCount ? input.weakSelection : input.smartSelection;
    return {
      type: LEARNER_TODAY_DECISIONS.SMART_PRACTICE,
      count: smartCount,
      weak: weakCount > 0,
      route: '/study-room',
      routeState: {
        selection: {
          mode: 'smart-practice',
          source: 'dashboard-today-card',
          requestedCount: selected?.requestedCount,
          selectedItemIds: selected?.selectedItemIds || []
        }
      }
    };
  }

  return { type: LEARNER_TODAY_DECISIONS.CONTINUE, count: itemCount, route: '/study-room', routeState: null };
}
