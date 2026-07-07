import { describe, expect, it } from 'vitest';
import {
  createAnswerCorrectEvent,
  createAnswerWrongEvent,
  createBridgeErrorEvent,
  createQuestionPresentedEvent,
  createReviewDueEvent,
  createSessionCompleteEvent,
  createSessionStartedEvent,
  DEVICE_EVENT_TYPES,
  validateDeviceEvent
} from '../../src/deviceBridge/index.js';

function expectValidEvent(result, eventType) {
  expect(result.ok).toBe(true);
  expect(result.event.eventType).toBe(eventType);
  expect(validateDeviceEvent(result.event)).toEqual({ ok: true, error: null, issues: [] });
}

function makeBaseInput(overrides = {}) {
  return {
    sessionId: 'session_factory_1',
    itemIndex: 0,
    itemType: 'flashcard',
    progressCount: 1,
    totalCount: 6,
    ...overrides
  };
}

function collectObjectKeys(value, keys = []) {
  if (Array.isArray(value)) {
    value.forEach(entry => collectObjectKeys(entry, keys));
    return keys;
  }
  if (!value || typeof value !== 'object') return keys;
  Object.entries(value).forEach(([key, entry]) => {
    keys.push(key);
    collectObjectKeys(entry, keys);
  });
  return keys;
}

describe('deviceBridge studyEventFactories', () => {
  it('creates valid session_started events', () => {
    expectValidEvent(
      createSessionStartedEvent(makeBaseInput({ progressCount: 0, bridgeStatus: 'mock_enabled' })),
      DEVICE_EVENT_TYPES.SESSION_STARTED
    );
  });

  it('creates valid question_presented events', () => {
    expectValidEvent(
      createQuestionPresentedEvent(makeBaseInput()),
      DEVICE_EVENT_TYPES.QUESTION_PRESENTED
    );
  });

  it('creates valid answer_correct events with coarse status only', () => {
    const result = createAnswerCorrectEvent(makeBaseInput({ scoreBucket: 'high' }));

    expectValidEvent(result, DEVICE_EVENT_TYPES.ANSWER_CORRECT);
    expect(result.event.payload.status).toBe('correct');
  });

  it('creates valid answer_wrong events with coarse status only', () => {
    const result = createAnswerWrongEvent(makeBaseInput({ scoreBucket: 'low' }));

    expectValidEvent(result, DEVICE_EVENT_TYPES.ANSWER_WRONG);
    expect(result.event.payload.status).toBe('wrong');
  });

  it('creates valid review_due events', () => {
    expectValidEvent(
      createReviewDueEvent(makeBaseInput({ dueCountBucket: '6_10' })),
      DEVICE_EVENT_TYPES.REVIEW_DUE
    );
  });

  it('creates valid session_complete events', () => {
    expectValidEvent(
      createSessionCompleteEvent(makeBaseInput({ accuracyBucket: '80_100', scoreBucket: 'high' })),
      DEVICE_EVENT_TYPES.SESSION_COMPLETE
    );
  });

  it('creates valid bridge_error events', () => {
    expectValidEvent(
      createBridgeErrorEvent(makeBaseInput({
        reasonCode: 'transport_disconnected',
        message: 'Mock transport is disconnected.',
        bridgeStatus: 'enabled',
        transportStatus: 'disconnected'
      })),
      DEVICE_EVENT_TYPES.BRIDGE_ERROR
    );
  });

  it('rejects sensitive factory input', () => {
    const result = createQuestionPresentedEvent(makeBaseInput({
      prompt: 'private prompt',
      sourceMetadata: { sourceName: 'private.pdf' }
    }));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsafe_device_payload');
    expect(result.issues.map(issue => issue.code)).toContain('payload_field_not_allowed');
    expect(result.issues.map(issue => issue.code)).toContain('forbidden_sensitive_key');
  });

  it('never includes private learning content in factory output', () => {
    const result = createAnswerWrongEvent(makeBaseInput({
      accuracyBucket: '0_20',
      message: 'Status only.'
    }));
    const payloadKeys = collectObjectKeys(result.event.payload);

    expect(result.ok).toBe(true);
    expect(payloadKeys).not.toContain('prompt');
    expect(payloadKeys).not.toContain('answer');
    expect(payloadKeys).not.toContain('explanation');
    expect(payloadKeys).not.toContain('userAnswer');
    expect(payloadKeys).not.toContain('sourceMetadata');
  });

  it('public index exports every Phase 3 factory', () => {
    expect(createSessionStartedEvent).toBeTypeOf('function');
    expect(createQuestionPresentedEvent).toBeTypeOf('function');
    expect(createAnswerCorrectEvent).toBeTypeOf('function');
    expect(createAnswerWrongEvent).toBeTypeOf('function');
    expect(createReviewDueEvent).toBeTypeOf('function');
    expect(createSessionCompleteEvent).toBeTypeOf('function');
    expect(createBridgeErrorEvent).toBeTypeOf('function');
  });
});
