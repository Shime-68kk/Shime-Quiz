import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  classifyClientMessage,
  createFakeWebSocketServer,
  createInvalidJsonResponse,
  createResponseForMessage,
  DEFAULT_FAKE_SERVER_HOST,
  DEFAULT_FAKE_SERVER_PORT,
  FAKE_SERVER_PROTOCOL_VERSION,
  findSensitiveKeys,
  parseClientMessage
} from '../../tools/deviceBridge/fakeWebSocketServer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function makeMessage(messageType = 'robot_event', payload = {}) {
  return {
    protocolVersion: FAKE_SERVER_PROTOCOL_VERSION,
    messageId: `msg_${messageType}`,
    messageType,
    emittedAt: '2026-06-27T00:00:00.000Z',
    source: 'shime-quiz',
    payload
  };
}

describe('Device Bridge fake WebSocket server helpers', () => {
  it('sensitive key detector catches forbidden keys recursively', () => {
    const found = findSensitiveKeys({
      eventType: 'answer_correct',
      nested: {
        sourceMetadata: {
          name: 'private'
        }
      },
      list: [{ userAnswer: 'private typed answer' }]
    });

    expect(found.map(entry => entry.path)).toEqual(['$.nested.sourceMetadata', '$.list[0].userAnswer']);
  });

  it('valid message classification works', () => {
    const classification = classifyClientMessage(makeMessage('robot_event', {
      eventType: 'answer_correct',
      itemIndex: 1,
      itemType: 'multiple_choice',
      progressCount: 2,
      totalCount: 5,
      status: 'correct'
    }));

    expect(classification).toMatchObject({ ok: true, type: 'robot_event', reason: null });
  });

  it('hello response generation works', () => {
    const response = createResponseForMessage(makeMessage('hello', {
      bridgeStatus: 'enabled',
      transportStatus: 'connecting'
    }), {
      messageId: 'fake_hello_ack',
      emittedAt: '2026-06-27T00:00:01.000Z'
    });

    expect(response).toMatchObject({
      protocolVersion: FAKE_SERVER_PROTOCOL_VERSION,
      messageId: 'fake_hello_ack',
      messageType: 'hello_ack',
      payload: {
        transportStatus: 'connected',
        message: 'fake_server_ready'
      }
    });
  });

  it('ack response generation works', () => {
    const response = createResponseForMessage(makeMessage('robot_event', {
      eventType: 'session_complete',
      progressCount: 5,
      totalCount: 5,
      scoreBucket: '80_100'
    }), {
      messageId: 'fake_ack',
      emittedAt: '2026-06-27T00:00:02.000Z'
    });

    expect(response).toMatchObject({
      messageType: 'ack',
      payload: {
        transportStatus: 'connected',
        message: 'robot_event_acknowledged',
        ackFor: 'msg_robot_event'
      }
    });
  });

  it('invalid JSON creates safe error response', () => {
    expect(parseClientMessage('{broken')).toMatchObject({ ok: false, error: 'invalid_json' });
    expect(createInvalidJsonResponse({
      messageId: 'fake_invalid',
      emittedAt: '2026-06-27T00:00:03.000Z'
    })).toMatchObject({
      messageType: 'error',
      payload: {
        reasonCode: 'invalid_json',
        message: 'message_rejected'
      }
    });
  });

  it('no file persistence helpers exist by default', () => {
    const source = fs.readFileSync(resolve(PROJECT_ROOT, 'tools/deviceBridge/fakeWebSocketServer.mjs'), 'utf8');

    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('appendFile');
    expect(source).not.toContain('createWriteStream');
  });

  it('server defaults to localhost', () => {
    const server = createFakeWebSocketServer({ log: () => {} });

    expect(DEFAULT_FAKE_SERVER_HOST).toBe('127.0.0.1');
    expect(DEFAULT_FAKE_SERVER_PORT).toBe(8787);
    expect(server.host).toBe('127.0.0.1');
    expect(server.port).toBe(8787);
  });

  it('sample robot_event payload contains only redacted/coarse fields', () => {
    const sample = makeMessage('robot_event', {
      eventType: 'answer_wrong',
      sessionId: 'studyroom_session_example',
      itemIndex: 2,
      itemType: 'short_answer',
      progressCount: 3,
      totalCount: 10,
      status: 'wrong'
    });
    const serialized = JSON.stringify(sample);

    expect(classifyClientMessage(sample).ok).toBe(true);
    [
      'private prompt',
      'private answer',
      'private explanation',
      'source metadata',
      'study history',
      'backup payload'
    ].forEach(text => {
      expect(serialized).not.toContain(text);
    });
  });
});

