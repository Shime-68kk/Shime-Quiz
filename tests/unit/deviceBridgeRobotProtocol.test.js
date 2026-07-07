import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import {
  createRobotCommandEnvelope,
  createTransportEnvelope,
  ROBOT_COMMAND_NAMES,
  ROBOT_MESSAGE_TYPES,
  ROBOT_PROTOCOL_VERSION
} from '../../src/deviceBridge/transports/TransportContract.js';

const FORBIDDEN_TEXT = [
  'private prompt',
  'private answer',
  'private explanation',
  'private user answer',
  'source metadata',
  'study history',
  'backup payload'
];

function makeEvent(eventType = DEVICE_EVENT_TYPES.SESSION_COMPLETE) {
  const created = createDeviceEvent({
    eventType,
    eventId: 'evt_robot_protocol_test',
    emittedAt: '2026-06-27T00:00:00.000Z',
    sessionId: 'session_robot_protocol_test',
    payload: {
      progressCount: 5,
      totalCount: 5,
      scoreBucket: '80_100',
      accuracyBucket: '80_100'
    }
  });
  expect(created.ok).toBe(true);
  return created.event;
}

describe('Device Bridge robot protocol v0', () => {
  it('creates outbound robot event messages with protocol v0 envelope fields', () => {
    const created = createTransportEnvelope(makeEvent(), {
      messageId: 'robot_msg_protocol_test',
      emittedAt: '2026-06-27T00:00:03.000Z'
    });

    expect(created.ok).toBe(true);
    expect(created.envelope).toMatchObject({
      protocolVersion: ROBOT_PROTOCOL_VERSION,
      messageId: 'robot_msg_protocol_test',
      messageType: ROBOT_MESSAGE_TYPES.ROBOT_EVENT,
      emittedAt: '2026-06-27T00:00:03.000Z',
      source: 'shime-quiz'
    });
  });

  it('keeps robot event examples redacted/coarse', () => {
    const created = createTransportEnvelope(makeEvent(DEVICE_EVENT_TYPES.ANSWER_WRONG), {
      messageId: 'robot_msg_redacted_test',
      emittedAt: '2026-06-27T00:00:04.000Z'
    });

    const serialized = JSON.stringify(created.envelope);
    expect(serialized).toContain('answer_wrong');
    expect(serialized).toContain('scoreBucket');
    FORBIDDEN_TEXT.forEach(text => {
      expect(serialized).not.toContain(text);
    });
  });

  it('supports allowed semantic robot commands only', () => {
    const allowed = [
      ROBOT_COMMAND_NAMES.CELEBRATE,
      ROBOT_COMMAND_NAMES.ENCOURAGE,
      ROBOT_COMMAND_NAMES.NEUTRAL,
      ROBOT_COMMAND_NAMES.FOCUS,
      ROBOT_COMMAND_NAMES.SESSION_COMPLETE,
      ROBOT_COMMAND_NAMES.DUE_REVIEW,
      ROBOT_COMMAND_NAMES.ERROR_SIGNAL
    ];

    allowed.forEach(command => {
      expect(createRobotCommandEnvelope(command, { reasonCode: command }).ok).toBe(true);
    });

    expect(createRobotCommandEnvelope('show_answer', { reasonCode: 'unsafe' }).ok).toBe(false);
  });

  it('documents rate-limit guidance before real physical behavior', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const protocolDoc = fs.readFileSync(path.resolve(root, 'docs/device-bridge-robot-protocol.md'), 'utf8');
    const threatDoc = fs.readFileSync(path.resolve(root, 'docs/device-bridge-threat-model.md'), 'utf8');

    expect(protocolDoc).toContain('rate limiting');
    expect(threatDoc).toContain('Over-frequent events');
  });
});

