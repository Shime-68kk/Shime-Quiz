import { describe, expect, it } from 'vitest';
import { SAFE_ROBOT_COMMANDS } from '../../src/companion/robotIntentPlanner.js';
import { createCompanionDevTap } from '../../src/companion/companionDevTap.js';

const FORBIDDEN_KEYS = [
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload'
];

describe('companionDevTap privacy', () => {
  it('rejects raw sensitive keys', () => {
    FORBIDDEN_KEYS.forEach(key => {
      const tap = createCompanionDevTap();
      tap.enable();
      const result = tap.observeDeviceBridgeEvent({ eventType: 'question_presented', payload: { [key]: 'private' } });
      expect(result.ok, key).toBe(false);
      expect(tap.getSnapshot().lastRobotCommand).toBe('neutral');
    });
  });

  it('transcript contains no sensitive key names for blocked event', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    tap.observeDeviceBridgeEvent({ eventType: 'question_presented', payload: { correctAnswer: 'private' } });
    const serialized = JSON.stringify(tap.getTranscript());

    FORBIDDEN_KEYS.forEach(key => {
      expect(serialized).not.toContain(`"${key}"`);
    });
  });

  it('accepts valid StudyRoom-style coarse events and emits safe commands only internally', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    tap.observeDeviceBridgeEvent({
      eventType: 'answer_wrong',
      sessionId: 'tap_privacy',
      payload: {
        itemIndex: 1,
        itemType: 'short_answer',
        progressCount: 2,
        totalCount: 5,
        status: 'wrong'
      }
    });

    const snapshot = tap.getSnapshot();
    expect(snapshot.acceptedEventCount).toBe(1);
    expect(SAFE_ROBOT_COMMANDS).toContain(snapshot.lastRobotCommand);
  });
});
