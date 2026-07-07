import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import {
  createRobotCommandEnvelope,
  createTransportEnvelope,
  createTransportResult,
  ROBOT_COMMAND_NAMES,
  ROBOT_MESSAGE_TYPES,
  ROBOT_PROTOCOL_VERSION,
  TRANSPORT_KINDS,
  TRANSPORT_STATES,
  validateRobotCommandName,
  validateTransportEvent
} from '../../src/deviceBridge/transports/TransportContract.js';

function makeSafeEvent(overrides = {}) {
  const created = createDeviceEvent({
    eventType: DEVICE_EVENT_TYPES.ANSWER_CORRECT,
    sessionId: 'session_test',
    emittedAt: '2026-06-27T00:00:00.000Z',
    payload: {
      itemIndex: 1,
      itemType: 'multiple_choice',
      progressCount: 2,
      totalCount: 5,
      status: 'correct',
      ...overrides.payload
    },
    ...overrides
  });
  expect(created.ok).toBe(true);
  return created.event;
}

describe('Device Bridge transport contract', () => {
  it('defines only inactive/local transport kinds for Phase 11', () => {
    expect(TRANSPORT_KINDS).toEqual({
      NOOP: 'noop',
      LOOPBACK: 'loopback',
      MOCK: 'mock'
    });
    expect(TRANSPORT_STATES.CONNECTED).toBe('connected');
  });

  it('creates transport result objects without side effects', () => {
    expect(createTransportResult(true, { reason: 'ok' })).toEqual({ ok: true, reason: 'ok' });
    expect(createTransportResult(false, { reason: 'blocked' })).toEqual({ ok: false, reason: 'blocked' });
  });

  it('accepts valid redacted/coarse device events', () => {
    expect(validateTransportEvent(makeSafeEvent())).toEqual({ ok: true, error: null, issues: [] });
  });

  it('rejects sensitive payload keys before creating transport envelopes', () => {
    const unsafeEvent = {
      ...makeSafeEvent(),
      payload: {
        itemIndex: 0,
        prompt: 'private prompt',
        correctAnswer: 'private answer'
      }
    };

    const validation = validateTransportEvent(unsafeEvent);
    expect(validation.ok).toBe(false);
    expect(validation.issues.map(issue => issue.code)).toContain('payload_field_not_allowed');
    expect(validation.issues.map(issue => issue.code)).toContain('forbidden_sensitive_key');

    const envelope = createTransportEnvelope(unsafeEvent);
    expect(envelope.ok).toBe(false);
    expect(envelope.envelope).toBeNull();
  });

  it('creates robot event envelopes from valid device events only', () => {
    const event = makeSafeEvent();
    const created = createTransportEnvelope(event, {
      messageId: 'robot_msg_test',
      emittedAt: '2026-06-27T00:00:01.000Z'
    });

    expect(created.ok).toBe(true);
    expect(created.envelope.protocolVersion).toBe(ROBOT_PROTOCOL_VERSION);
    expect(created.envelope.messageType).toBe(ROBOT_MESSAGE_TYPES.ROBOT_EVENT);
    expect(created.envelope.payload.eventType).toBe(DEVICE_EVENT_TYPES.ANSWER_CORRECT);
    expect(created.envelope.payload.data.status).toBe('correct');
    expect(JSON.stringify(created.envelope)).not.toContain('private prompt');
  });

  it('rejects invalid robot command names', () => {
    expect(validateRobotCommandName(ROBOT_COMMAND_NAMES.CELEBRATE).ok).toBe(true);
    expect(validateRobotCommandName('open_private_answer').ok).toBe(false);
  });

  it('creates robot command envelopes with safe command payload only', () => {
    const created = createRobotCommandEnvelope(ROBOT_COMMAND_NAMES.ENCOURAGE, {
      reasonCode: 'answer_wrong',
      message: 'encourage'
    }, {
      messageId: 'robot_cmd_test',
      emittedAt: '2026-06-27T00:00:02.000Z'
    });

    expect(created.ok).toBe(true);
    expect(created.envelope.messageType).toBe(ROBOT_MESSAGE_TYPES.ROBOT_COMMAND);
    expect(created.envelope.payload.command).toBe(ROBOT_COMMAND_NAMES.ENCOURAGE);
    expect(created.envelope.payload.reasonCode).toBe('answer_wrong');
  });

  it('rejects robot command payloads with sensitive fields', () => {
    const created = createRobotCommandEnvelope(ROBOT_COMMAND_NAMES.CELEBRATE, {
      userAnswer: 'private typed answer'
    });

    expect(created.ok).toBe(false);
    expect(created.error).toBe('unsafe_robot_command_payload');
    expect(created.envelope).toBeNull();
  });
});

