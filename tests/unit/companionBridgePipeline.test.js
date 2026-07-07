import { describe, expect, it } from 'vitest';
import {
  createInitialCompanionBridgeState,
  getCompanionBridgeSnapshot,
  processDeviceBridgeEvent,
  processDeviceBridgeEventSequence
} from '../../src/companion/companionBridgePipeline.js';

describe('companionBridgePipeline', () => {
  it('processes normal Device Bridge event sequence into safe decisions', () => {
    const output = processDeviceBridgeEventSequence([
      { eventType: 'session_started', sessionId: 's1', payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } },
      { eventType: 'question_presented', sessionId: 's1', payload: { itemType: 'multiple_choice', progressCount: 1, totalCount: 3 } },
      { eventType: 'answer_correct', sessionId: 's1', payload: { progressCount: 1, totalCount: 3, status: 'correct' } },
      { eventType: 'answer_correct', sessionId: 's1', payload: { progressCount: 2, totalCount: 3, status: 'correct' } }
    ], { timestamp: '2026-06-27T00:00:00.000Z' });

    expect(output.results).toHaveLength(4);
    expect(output.results.every(result => result.accepted)).toBe(true);
    expect(output.results.at(-1).robotIntent.command).toBe('celebrate');
    expect(output.report.acceptedCount).toBe(4);
  });

  it('rejects unknown and sensitive events safely', () => {
    const unknown = processDeviceBridgeEvent(createInitialCompanionBridgeState(), { eventType: 'show_answer', payload: {} });
    const sensitive = processDeviceBridgeEvent(createInitialCompanionBridgeState(), { eventType: 'question_presented', payload: { prompt: 'private' } });

    expect(unknown.result.accepted).toBe(false);
    expect(unknown.result.reasonCodes).toContain('unknown_learning_event_type');
    expect(sensitive.result.accepted).toBe(false);
    expect(sensitive.result.privacyStatus).toBe('blocked');
    expect(sensitive.result.robotIntent.command).toBe('neutral');
  });

  it('is deterministic with injected timestamps and IDs', () => {
    const events = [{ eventType: 'session_started', payload: { progressCount: 0, totalCount: 2 } }];
    const first = processDeviceBridgeEventSequence(events, { timestamp: '2026-06-27T00:00:00.000Z' });
    const second = processDeviceBridgeEventSequence(events, { timestamp: '2026-06-27T00:00:00.000Z' });

    expect(first).toEqual(second);
    expect(getCompanionBridgeSnapshot(first.state).eventCount).toBe(1);
  });

  it('does not expose raw fields in output', () => {
    const output = processDeviceBridgeEventSequence([
      { eventType: 'answer_wrong', payload: { status: 'wrong', itemType: 'short_answer' } }
    ]);
    const serialized = JSON.stringify(output);

    ['prompt', 'correctAnswer', 'userAnswer', 'sourceMetadata', 'backupPayload', 'rawQuizPayload'].forEach(field => {
      expect(serialized).not.toContain(`"${field}"`);
    });
  });
});
