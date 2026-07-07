import { describe, expect, it } from 'vitest';
import {
  ALLOWED_QA_EVENT_TYPES,
  companionDevTapQaFixtures,
  findForbiddenQaKeys,
  getInvalidCompanionDevTapQaFixtures,
  getValidCompanionDevTapQaFixtures
} from '../../tools/deviceBridge/companionDevTapQaFixtures.mjs';

describe('companion dev tap QA fixtures', () => {
  it('contains required scenario classes', () => {
    ['normalSession', 'struggleSession', 'reviewDue', 'disconnectedError', 'sensitiveAttack'].forEach(key => {
      expect(companionDevTapQaFixtures).toHaveProperty(key);
    });
  });

  it('valid fixtures contain no forbidden keys and allowed event types only', () => {
    getValidCompanionDevTapQaFixtures().forEach(fixture => {
      expect(findForbiddenQaKeys(fixture), fixture.name).toEqual([]);
      fixture.events.forEach(event => {
        expect(ALLOWED_QA_EVENT_TYPES).toContain(event.eventType);
      });
    });
  });

  it('attack fixtures are marked invalid and include forbidden keys', () => {
    const [attack] = getInvalidCompanionDevTapQaFixtures();

    expect(attack.invalid).toBe(true);
    expect(findForbiddenQaKeys(attack).map(entry => entry.key).sort()).toEqual(['answer', 'correctAnswer', 'question']);
  });
});
