import { describe, expect, it } from 'vitest';
import {
  EVENT_TO_ACTION,
  FORBIDDEN_PROTOCOL_KEYS,
  PROTOCOL_VERSION,
  findForbiddenFixtureKeys,
  getRobotActionForEvent,
  getValidRobotEventFixtures,
  protocolFixtures
} from '../../tools/deviceBridge/protocolFixtures.mjs';

const ALLOWED_EVENTS = [
  'session_started',
  'question_presented',
  'answer_correct',
  'answer_wrong',
  'review_due',
  'session_complete',
  'bridge_error'
];

const FIRMWARE_FORBIDDEN_KEYS = [
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload'
];

function firmwareStyleForbiddenKeyScan(rawJson) {
  return FIRMWARE_FORBIDDEN_KEYS.some(key => new RegExp(`"${key}"\\s*:`).test(rawJson));
}

describe('Device Bridge robot protocol fixtures', () => {
  it('uses the expected skeleton protocol version', () => {
    expect(PROTOCOL_VERSION).toBe('shime-ws-robot-v0');
  });

  it('maps every allowed event to a safe coarse robot action', () => {
    expect(Object.keys(EVENT_TO_ACTION).sort()).toEqual([...ALLOWED_EVENTS].sort());
    expect(EVENT_TO_ACTION).toEqual({
      session_started: 'focus',
      question_presented: 'focus',
      answer_correct: 'celebrate',
      answer_wrong: 'encourage',
      review_due: 'due_review',
      session_complete: 'session_complete',
      bridge_error: 'error_signal'
    });
  });

  it('falls back to error_signal for unknown events', () => {
    expect(getRobotActionForEvent('unknown_event')).toBe('error_signal');
  });

  it('valid robot event fixtures contain no forbidden privacy keys', () => {
    getValidRobotEventFixtures().forEach(fixture => {
      expect(findForbiddenFixtureKeys(fixture)).toEqual([]);
      expect(fixture.protocolVersion).toBe(PROTOCOL_VERSION);
      expect(fixture.messageType).toBe('robot_event');
      expect(ALLOWED_EVENTS).toContain(fixture.payload.eventType);
    });
  });

  it('sensitive fixture is rejected by the forbidden key detector', () => {
    const found = findForbiddenFixtureKeys(protocolFixtures.invalidSensitivePayload);

    expect(found.map(entry => entry.key).sort()).toEqual(['correctAnswer', 'prompt']);
  });

  it('fixture payloads stay redacted and coarse', () => {
    const serialized = JSON.stringify(getValidRobotEventFixtures());

    [
      'private prompt',
      'private answer',
      'private explanation',
      'imported document',
      'library item',
      'raw quiz'
    ].forEach(text => {
      expect(serialized).not.toContain(text);
    });

    FORBIDDEN_PROTOCOL_KEYS.forEach(key => {
      expect(serialized).not.toContain(`"${key}"`);
    });
  });

  it('firmware-style sensitive key scan does not reject allowed event names', () => {
    [
      protocolFixtures.questionPresented,
      protocolFixtures.answerCorrect,
      protocolFixtures.answerWrong
    ].forEach(fixture => {
      expect(firmwareStyleForbiddenKeyScan(JSON.stringify(fixture))).toBe(false);
    });
  });

  it('firmware-style sensitive key scan rejects forbidden payload property names', () => {
    [
      { payload: { question: 'private question' } },
      { payload: { answer: 'private answer' } },
      { payload: { correctAnswer: 'private answer' } },
      { payload: { nested: { question: 'private nested question' } } }
    ].forEach(message => {
      expect(firmwareStyleForbiddenKeyScan(JSON.stringify(message))).toBe(true);
    });
  });
});
