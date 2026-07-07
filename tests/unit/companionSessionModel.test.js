import { describe, expect, it } from 'vitest';
import {
  createInitialCompanionSessionState,
  getCompanionSessionSnapshot,
  reduceCompanionSessionEvent,
  resetCompanionSessionState
} from '../../src/companion/companionSessionModel.js';

describe('companionSessionModel', () => {
  it('starts neutral and resets safely', () => {
    expect(createInitialCompanionSessionState()).toMatchObject({ sessionPhase: 'idle', eventCount: 0, correctStreakBucket: 'none' });
    expect(resetCompanionSessionState()).toMatchObject({ eventCount: 0 });
  });

  it('tracks correct/wrong counts, streak, repeated wrong, and completion quality', () => {
    let state = createInitialCompanionSessionState();
    state = reduceCompanionSessionEvent(state, { eventType: 'answer_correct', payload: { status: 'correct' } });
    state = reduceCompanionSessionEvent(state, { eventType: 'answer_correct', payload: { status: 'correct' } });
    state = reduceCompanionSessionEvent(state, { eventType: 'answer_wrong', payload: { status: 'wrong' } });
    state = reduceCompanionSessionEvent(state, { eventType: 'answer_wrong', payload: { status: 'wrong' } });
    state = reduceCompanionSessionEvent(state, { eventType: 'session_complete', payload: {} });

    expect(state.answerCorrectCount).toBe(2);
    expect(state.answerWrongCount).toBe(2);
    expect(state.repeatedWrongCountBucket).toBe('two');
    expect(state.completionQualityBucket).toBe('mixed');
  });

  it('rejects sensitive events and does not store raw payload', () => {
    const state = reduceCompanionSessionEvent(createInitialCompanionSessionState(), { eventType: 'question_presented', payload: { question: 'private text' } });
    const serialized = JSON.stringify(getCompanionSessionSnapshot(state));

    expect(state.rejected).toBe(true);
    expect(state.rejectedReason).toBe('forbidden_companion_key');
    expect(serialized).not.toContain('private text');
  });
});

