import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import {
  createWebSocketTransport,
  WEB_SOCKET_CONNECTION_STATES
} from '../../src/deviceBridge/transports/WebSocketTransport.js';

function createFakeWebSocketFactory() {
  const instances = [];

  class FakeWebSocket {
    constructor(url) {
      this.url = url;
      this.sent = [];
      this.closed = false;
      instances.push(this);
    }

    send(message) {
      this.sent.push(message);
    }

    close() {
      this.closed = true;
      this.onclose?.({ code: 1000 });
    }

    open() {
      this.onopen?.({});
    }

    message(data) {
      this.onmessage?.({ data });
    }

    error() {
      this.onerror?.({});
    }

    closeFromRemote() {
      this.closed = true;
      this.onclose?.({ code: 1006 });
    }
  }

  return { FakeWebSocket, instances };
}

function makeNow() {
  return '2026-06-27T00:00:00.000Z';
}

function makeIdFactory() {
  let count = 0;
  return prefix => `${prefix}_${++count}`;
}

function makeTransport(extra = {}) {
  return createWebSocketTransport({
    now: makeNow,
    idFactory: makeIdFactory(),
    ...extra
  });
}

function makeInbound(messageType, payload = {}) {
  return JSON.stringify({
    protocolVersion: 'shime-ws-robot-v0',
    messageId: `in_${messageType}`,
    messageType,
    emittedAt: '2026-06-27T00:00:01.000Z',
    source: 'local-robot',
    payload
  });
}

function makeSafeEvent() {
  const created = createDeviceEvent({
    eventType: DEVICE_EVENT_TYPES.ANSWER_CORRECT,
    eventId: 'evt_ws_transport',
    emittedAt: '2026-06-27T00:00:00.000Z',
    sessionId: 'session_ws_transport',
    payload: {
      itemIndex: 1,
      itemType: 'multiple_choice',
      progressCount: 2,
      totalCount: 4,
      status: 'correct'
    }
  });
  expect(created.ok).toBe(true);
  return created.event;
}

describe('WebSocketTransport disabled-by-default behavior', () => {
  it('constructor does not connect', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket, url: 'ws://127.0.0.1:81' });

    expect(instances).toHaveLength(0);
    expect(transport.getSnapshot()).toMatchObject({
      state: WEB_SOCKET_CONNECTION_STATES.IDLE,
      connected: false,
      privacyMode: 'redacted'
    });
  });

  it('explicit connect is required', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    expect(instances).toHaveLength(0);
    const result = transport.connect({ url: 'ws://127.0.0.1:81' });
    expect(result.ok).toBe(true);
    expect(instances).toHaveLength(1);
  });

  it('valid local ws URL connects using fake WebSocket', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    const result = transport.connect({ url: 'ws://192.168.1.22:81/device' });
    expect(result.ok).toBe(true);
    expect(instances[0].url).toBe('ws://192.168.1.22:81/device');
    expect(transport.getSnapshot().redactedUrl).toBe('ws://192.168.1.22:81');
  });

  it('invalid URL is rejected', () => {
    const transport = makeTransport();
    expect(transport.connect({ url: 'not-a-url' })).toMatchObject({ ok: false, reason: 'invalid_url' });
  });

  it('http and https URLs are rejected', () => {
    const transport = makeTransport();
    expect(transport.connect({ url: 'http://127.0.0.1:81' })).toMatchObject({ ok: false, reason: 'unsupported_protocol' });
    expect(transport.connect({ url: 'https://127.0.0.1:81' })).toMatchObject({ ok: false, reason: 'unsupported_protocol' });
  });

  it('non-local URL is rejected by default', () => {
    const transport = makeTransport();
    expect(transport.connect({ url: 'ws://example.com/device' })).toMatchObject({ ok: false, reason: 'non_local_url_rejected' });
  });

  it('does not auto-reconnect after socket close', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    transport.connect({ url: 'ws://10.0.0.5:81' });
    instances[0].closeFromRemote();

    expect(instances).toHaveLength(1);
    expect(transport.getSnapshot()).toMatchObject({ state: WEB_SOCKET_CONNECTION_STATES.DISCONNECTED, connected: false });
  });

  it('disconnect closes socket', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    transport.connect({ url: 'ws://device.local:81' });
    const result = transport.disconnect();

    expect(result.ok).toBe(true);
    expect(instances[0].closed).toBe(true);
    expect(transport.getSnapshot().state).toBe(WEB_SOCKET_CONNECTION_STATES.DISCONNECTED);
  });

  it('connect sends hello only after fake open', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    transport.connect({ url: 'ws://localhost:81' });
    expect(instances[0].sent).toHaveLength(0);
    instances[0].open();

    expect(instances[0].sent).toHaveLength(1);
    expect(JSON.parse(instances[0].sent[0])).toMatchObject({
      protocolVersion: 'shime-ws-robot-v0',
      messageType: 'hello',
      source: 'shime-quiz'
    });
  });

  it('valid hello_ack updates state', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    transport.connect({ url: 'ws://localhost:81' });
    instances[0].open();
    instances[0].message(makeInbound('hello_ack', { transportStatus: 'connected', message: 'ready' }));

    expect(transport.getSnapshot()).toMatchObject({
      state: WEB_SOCKET_CONNECTION_STATES.CONNECTED,
      connected: true,
      lastAckMessageId: 'in_hello_ack'
    });
  });

  it('valid hello_ack notifies status change listener', () => {
    const updates = [];
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({
      webSocketFactory: FakeWebSocket,
      onStatusChange(update) {
        updates.push(update);
      }
    });

    transport.connect({ url: 'ws://localhost:81' });
    instances[0].open();
    instances[0].message(makeInbound('hello_ack', { transportStatus: 'connected', message: 'ready' }));

    expect(updates.map(update => update.type)).toContain('websocket_message_received');
    expect(updates.at(-1).snapshot).toMatchObject({
      state: WEB_SOCKET_CONNECTION_STATES.CONNECTED,
      connected: true,
      lastAckMessageId: 'in_hello_ack'
    });
  });

  it('malformed inbound message does not throw', () => {
    const transport = makeTransport();

    expect(() => transport.handleIncomingMessage('{broken')).not.toThrow();
    expect(transport.getSnapshot().droppedCount).toBe(1);
  });

  it('unknown inbound message is ignored safely', () => {
    const transport = makeTransport();
    const result = transport.handleIncomingMessage(makeInbound('unknown_type', { message: 'noop' }));

    expect(result.ok).toBe(false);
    expect(transport.getSnapshot().droppedCount).toBe(1);
  });

  it('send before connect returns safe failure', () => {
    const transport = makeTransport();

    expect(transport.sendDeviceEvent(makeSafeEvent())).toMatchObject({ ok: false, reason: 'transport_not_connected' });
  });

  it('socket error updates safe status', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    transport.connect({ url: 'ws://127.0.0.1:81' });
    instances[0].error();

    expect(transport.getSnapshot()).toMatchObject({
      state: WEB_SOCKET_CONNECTION_STATES.ERROR,
      lastError: { reason: 'socket_error' }
    });
  });

  it('socket close updates safe status', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const transport = makeTransport({ webSocketFactory: FakeWebSocket });

    transport.connect({ url: 'ws://127.0.0.1:81' });
    instances[0].closeFromRemote();

    expect(transport.getSnapshot()).toMatchObject({
      state: WEB_SOCKET_CONNECTION_STATES.DISCONNECTED,
      connected: false
    });
  });
});
