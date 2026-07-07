import { describe, expect, it } from 'vitest';
import {
  EVENT_TO_ACTION,
  FORBIDDEN_PROTOCOL_KEYS
} from '../../tools/deviceBridge/protocolFixtures.mjs';
import {
  SERIAL_QA_ALLOWED_COMMANDS,
  findForbiddenSerialFixtureKeys,
  getInvalidSerialParserQaFixtures,
  getSerialParserQaLines,
  getValidSerialParserQaFixtures,
  serialParserQaFixtures
} from '../../tools/deviceBridge/serialParserQaFixtures.mjs';

const ALLOWED_EVENTS = Object.keys(EVENT_TO_ACTION);

describe('ESP32 serial parser QA fixtures', () => {
  it('covers all required valid event names', () => {
    const eventTypes = getValidSerialParserQaFixtures()
      .map(fixture => fixture.expected.eventType)
      .filter(Boolean)
      .sort();

    expect(eventTypes).toEqual([...ALLOWED_EVENTS].sort());
  });

  it('covers every allowed command name with either command fixtures or event action mapping', () => {
    const coveredActions = new Set([
      ...Object.values(EVENT_TO_ACTION),
      ...getValidSerialParserQaFixtures().map(fixture => fixture.expected.command).filter(Boolean)
    ]);

    SERIAL_QA_ALLOWED_COMMANDS.forEach(command => {
      expect(coveredActions.has(command)).toBe(true);
    });
  });

  it('valid fixtures contain no forbidden sensitive JSON property keys', () => {
    getValidSerialParserQaFixtures().forEach(fixture => {
      expect(findForbiddenSerialFixtureKeys(fixture), fixture.name).toEqual([]);
    });
  });

  it('allowed event names containing question or answer are valid serial fixtures', () => {
    [
      serialParserQaFixtures.questionPresented,
      serialParserQaFixtures.answerCorrect,
      serialParserQaFixtures.answerWrong
    ].forEach(fixture => {
      expect(fixture.expected.accepted).toBe(true);
      expect(findForbiddenSerialFixtureKeys(fixture)).toEqual([]);
    });
  });

  it('invalid sensitive fixtures intentionally contain forbidden sensitive keys', () => {
    const sensitiveFixtures = [
      serialParserQaFixtures.invalidSensitiveQuestion,
      serialParserQaFixtures.invalidSensitiveAnswer,
      serialParserQaFixtures.invalidSensitiveCorrectAnswer
    ];

    expect(sensitiveFixtures.map(fixture => findForbiddenSerialFixtureKeys(fixture).sort())).toEqual([
      ['question'],
      ['answer'],
      ['correctAnswer']
    ]);
    sensitiveFixtures.forEach(fixture => {
      expect(fixture.expected).toMatchObject({
        accepted: false,
        reason: 'sensitive_payload_detected'
      });
    });
  });

  it('invalid fixtures cover unknown event, unknown command, malformed input, and missing protocol', () => {
    expect(getInvalidSerialParserQaFixtures().map(fixture => fixture.expected.reason).sort()).toEqual([
      'invalid_protocol_version',
      'malformed_message',
      'sensitive_payload_detected',
      'sensitive_payload_detected',
      'sensitive_payload_detected',
      'unknown_command',
      'unknown_event'
    ]);
  });

  it('all copyable serial lines are newline-safe single-line inputs', () => {
    getSerialParserQaLines().forEach(line => {
      expect(line).toEqual(expect.any(String));
      expect(line).not.toContain('\n');
      expect(line).not.toContain('\r');
      expect(line.length).toBeGreaterThan(0);
    });
  });

  it('forbidden key list uses firmware property names', () => {
    expect(FORBIDDEN_PROTOCOL_KEYS).toEqual(expect.arrayContaining([
      'question',
      'answer',
      'correctAnswer',
      'importedDocumentText',
      'libraryItemContent',
      'rawQuizPayload'
    ]));
  });
});
