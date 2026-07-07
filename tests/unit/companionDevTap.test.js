import { describe, expect, it } from 'vitest';
import { createCompanionDevTap } from '../../src/companion/companionDevTap.js';

function safeEvent(type = 'question_presented') {
  return {
    eventType: type,
    sessionId: 'tap_session',
    payload: {
      itemType: 'multiple_choice',
      progressCount: 1,
      totalCount: 3,
      transportStatus: 'connected'
    }
  };
}

describe('companionDevTap', () => {
  it('is disabled by default and ignores events', () => {
    const tap = createCompanionDevTap();
    const result = tap.observeDeviceBridgeEvent(safeEvent());

    expect(tap.getSnapshot()).toMatchObject({ enabled: false, state: 'disabled', observedEventCount: 0 });
    expect(result.ignored).toBe(true);
    expect(tap.getTranscript()).toEqual([]);
  });

  it('processes safe events after enable', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    const result = tap.observeDeviceBridgeEvent(safeEvent());

    expect(result.ok).toBe(true);
    expect(tap.getSnapshot()).toMatchObject({
      observedEventCount: 1,
      acceptedEventCount: 1,
      lastInputEventType: 'question_presented',
      lastCompanionIntent: 'focus_gently',
      lastRobotCommand: 'focus'
    });
    expect(tap.getTranscript()).toHaveLength(1);
  });

  it('rejects sensitive events and records blocked transcript', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    const result = tap.observeDeviceBridgeEvent({ eventType: 'question_presented', payload: { question: 'private text' } });

    expect(result.ok).toBe(false);
    expect(tap.getSnapshot()).toMatchObject({ rejectedEventCount: 1, lastRobotCommand: 'neutral' });
    expect(tap.getTranscript()[0].privacyStatus).toBe('blocked');
  });

  it('keeps transcript bounded and clearable', () => {
    const tap = createCompanionDevTap({ maxTranscriptEntries: 2 });
    tap.enable();
    tap.observeDeviceBridgeEvent(safeEvent('session_started'));
    tap.observeDeviceBridgeEvent(safeEvent('question_presented'));
    tap.observeDeviceBridgeEvent(safeEvent('answer_correct'));

    expect(tap.getTranscript()).toHaveLength(2);
    tap.clearTranscript();
    expect(tap.getTranscript()).toEqual([]);
  });

  it('pause and resume control observation without disabling', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    tap.pause();
    tap.observeDeviceBridgeEvent(safeEvent());
    expect(tap.getSnapshot()).toMatchObject({ enabled: true, state: 'paused', observedEventCount: 0 });
    tap.resume();
    tap.observeDeviceBridgeEvent(safeEvent());
    expect(tap.getSnapshot().observedEventCount).toBe(1);
  });
});
