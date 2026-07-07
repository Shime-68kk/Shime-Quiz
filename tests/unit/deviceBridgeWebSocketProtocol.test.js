import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import {
  createWebSocketRobotCommandEnvelope,
  createWebSocketRobotEventEnvelope,
  validateInboundWebSocketMessage,
  WEB_SOCKET_PROTOCOL_VERSION
} from '../../src/deviceBridge/transports/WebSocketTransport.js';

function makeOptions() {
  return {
    now: () => '2026-06-27T00:00:00.000Z',
    idFactory: prefix => `${prefix}_test`
  };
}

function makeSafeEvent() {
  const created = createDeviceEvent({
    eventType: DEVICE_EVENT_TYPES.ANSWER_CORRECT,
    eventId: 'evt_ws_protocol',
    emittedAt: '2026-06-27T00:00:00.000Z',
    sessionId: 'session_ws_protocol',
    payload: {
      itemIndex: 1,
      itemType: 'multiple_choice',
      progressCount: 2,
      totalCount: 6,
      status: 'correct'
    }
  });
  expect(created.ok).toBe(true);
  return created.event;
}

describe('WebSocket protocol v0 helpers', () => {
  it('creates a valid robot_event envelope from safe Device Bridge event', () => {
    const created = createWebSocketRobotEventEnvelope(makeSafeEvent(), makeOptions());

    expect(created.ok).toBe(true);
    expect(created.envelope).toMatchObject({
      protocolVersion: WEB_SOCKET_PROTOCOL_VERSION,
      messageId: 'ws_msg_test',
      messageType: 'robot_event',
      source: 'shime-quiz',
      payload: {
        eventType: 'answer_correct',
        sessionId: 'session_ws_protocol',
        itemIndex: 1,
        status: 'correct'
      }
    });
  });

  it('creates a valid robot_command envelope for allowed commands', () => {
    const created = createWebSocketRobotCommandEnvelope('celebrate', {
      reasonCode: 'answer_correct',
      message: 'celebrate'
    }, makeOptions());

    expect(created.ok).toBe(true);
    expect(created.envelope).toMatchObject({
      protocolVersion: WEB_SOCKET_PROTOCOL_VERSION,
      messageType: 'robot_command',
      payload: {
        command: 'celebrate',
        reasonCode: 'answer_correct'
      }
    });
  });

  it('rejects invalid command names', () => {
    const created = createWebSocketRobotCommandEnvelope('show_answer', { message: 'unsafe' }, makeOptions());

    expect(created.ok).toBe(false);
    expect(created.reason).toBe('invalid_robot_command');
  });

  it('rejects invalid inbound message types', () => {
    const validation = validateInboundWebSocketMessage({
      protocolVersion: WEB_SOCKET_PROTOCOL_VERSION,
      messageId: 'msg_bad_type',
      messageType: 'robot_event',
      emittedAt: '2026-06-27T00:00:00.000Z',
      source: 'local-robot',
      payload: { message: 'wrong_direction' }
    });

    expect(validation.ok).toBe(false);
    expect(validation.issues.map(issue => issue.code)).toContain('invalid_message_type');
  });

  it('rejects missing protocolVersion', () => {
    const validation = validateInboundWebSocketMessage({
      messageId: 'msg_missing_protocol',
      messageType: 'ack',
      emittedAt: '2026-06-27T00:00:00.000Z',
      source: 'local-robot',
      payload: { message: 'ack' }
    });

    expect(validation.ok).toBe(false);
    expect(validation.issues.map(issue => issue.code)).toContain('invalid_protocol_version');
  });

  it('rejects missing messageId', () => {
    const validation = validateInboundWebSocketMessage({
      protocolVersion: WEB_SOCKET_PROTOCOL_VERSION,
      messageType: 'ack',
      emittedAt: '2026-06-27T00:00:00.000Z',
      source: 'local-robot',
      payload: { message: 'ack' }
    });

    expect(validation.ok).toBe(false);
    expect(validation.issues.map(issue => issue.code)).toContain('invalid_message_id');
  });

  it('examples contain only redacted/coarse payloads', () => {
    const eventEnvelope = createWebSocketRobotEventEnvelope(makeSafeEvent(), makeOptions()).envelope;
    const commandEnvelope = createWebSocketRobotCommandEnvelope('encourage', {
      reasonCode: 'answer_wrong',
      transportStatus: 'connected'
    }, makeOptions()).envelope;
    const serialized = `${JSON.stringify(eventEnvelope)} ${JSON.stringify(commandEnvelope)}`;

    [
      'private prompt',
      'private answer',
      'private explanation',
      'source metadata',
      'backup payload',
      'study history'
    ].forEach(value => {
      expect(serialized).not.toContain(value);
    });
  });

  it('rejects sensitive keys recursively', () => {
    const unsafeEvent = {
      ...makeSafeEvent(),
      payload: {
        itemIndex: 1,
        nested: {
          userAnswer: 'private'
        }
      }
    };
    const eventResult = createWebSocketRobotEventEnvelope(unsafeEvent, makeOptions());
    const commandResult = createWebSocketRobotCommandEnvelope('celebrate', {
      message: 'safe',
      sourceMetadata: { name: 'private-source' }
    }, makeOptions());

    expect(eventResult.ok).toBe(false);
    expect(eventResult.reason).toBe('invalid_device_event');
    expect(commandResult.ok).toBe(false);
    expect(commandResult.reason).toBe('unsafe_robot_command_payload');
  });
});

