import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDeviceBridgeFacade,
  DEVICE_BRIDGE_TRANSPORT_MODE_MOCK,
  DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN
} from '../../src/deviceBridge/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

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
      this.onclose?.({});
    }

    open() {
      this.onopen?.({});
    }
  }
  return { FakeWebSocket, instances };
}

function makeInput(overrides = {}) {
  return {
    sessionId: 'session_real_gate',
    itemIndex: 0,
    itemType: 'flashcard',
    progressCount: 1,
    totalCount: 4,
    ...overrides
  };
}

describe('Device Bridge real transport facade gate', () => {
  it('default does not create WebSocket and selected mode is safe', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });

    expect(instances).toHaveLength(0);
    expect(facade.getSnapshot()).toMatchObject({
      enabled: false,
      selectedTransportMode: DEVICE_BRIDGE_TRANSPORT_MODE_MOCK,
      transportKind: 'mock',
      realTransportState: 'idle'
    });
  });

  it('selecting real transport does not connect', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });

    const result = facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN);

    expect(result.ok).toBe(true);
    expect(instances).toHaveLength(0);
    expect(result.snapshot).toMatchObject({
      selectedTransportMode: DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN,
      realTransportState: 'idle'
    });
  });

  it('explicit connect creates socket only once', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });

    facade.enable();
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN);
    expect(facade.connectWebSocketTransport({ url: 'ws://127.0.0.1:81' }).ok).toBe(true);
    expect(facade.connectWebSocketTransport({ url: 'ws://127.0.0.1:81' }).ok).toBe(true);

    expect(instances).toHaveLength(1);
  });

  it('facade subscription receives connected snapshot after hello_ack without remount', () => {
    const updates = [];
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });
    facade.subscribe(update => updates.push(update));

    facade.enable();
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN);
    facade.connectWebSocketTransport({ url: 'ws://127.0.0.1:8787' });
    instances[0].open();
    instances[0].onmessage?.({
      data: JSON.stringify({
        protocolVersion: 'shime-ws-robot-v0',
        messageId: 'hello_ack_live_status',
        messageType: 'hello_ack',
        emittedAt: '2026-06-27T00:00:01.000Z',
        source: 'fake-server',
        payload: {
          transportStatus: 'connected',
          message: 'fake_server_ready'
        }
      })
    });

    expect(updates.map(update => update.type)).toContain('facade_websocket_status_changed');
    expect(updates.at(-1).snapshot).toMatchObject({
      selectedTransportMode: DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN,
      connected: true,
      bridgeStatus: 'connected',
      transportStatus: 'websocket_connected',
      transportKind: 'websocket_lan',
      realTransportState: 'connected',
      realTransportHost: '127.0.0.1:8787'
    });
  });

  it('invalid and non-local URLs return safe failures', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN);

    expect(facade.connectWebSocketTransport({ url: 'not-a-url' })).toMatchObject({ ok: false, reason: 'invalid_url' });
    expect(facade.connectWebSocketTransport({ url: 'ws://example.com/device' })).toMatchObject({ ok: false, reason: 'non_local_url_rejected' });
  });

  it('disconnect closes socket', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });
    facade.enable();
    facade.connectWebSocketTransport({ url: 'ws://localhost:81' });

    const result = facade.disconnectTransport();

    expect(result.ok).toBe(true);
    expect(instances[0].closed).toBe(true);
  });

  it('failed socket creation does not throw', () => {
    function FailingWebSocket() {
      throw new Error('blocked');
    }
    const facade = createDeviceBridgeFacade({ webSocketFactory: FailingWebSocket });
    facade.enable();

    expect(() => facade.connectWebSocketTransport({ url: 'ws://localhost:81' })).not.toThrow();
    expect(facade.getSnapshot().lastError.reason).toBe('connect_failed');
  });

  it('snapshot contains safe real transport status without full path', () => {
    const { FakeWebSocket } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });
    facade.enable();
    facade.connectWebSocketTransport({ url: 'ws://192.168.1.23:81/private-path' });

    expect(facade.getSnapshot()).toMatchObject({
      realTransportHost: '192.168.1.23:81',
      realTransportRedactedUrl: 'ws://192.168.1.23:81'
    });
    expect(JSON.stringify(facade.getSnapshot())).not.toContain('private-path');
  });

  it('URL is not persisted in facade or UI source', () => {
    const facadeSource = read('src/deviceBridge/deviceBridgeFacade.js');
    const uiSource = read('src/components/settings/DeviceBridgeUiConcept.jsx');

    expect(facadeSource).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    expect(uiSource).not.toMatch(/localStorage|sessionStorage|indexedDB/);
  });

  it('does not auto reconnect after close', () => {
    const { FakeWebSocket, instances } = createFakeWebSocketFactory();
    const facade = createDeviceBridgeFacade({ webSocketFactory: FakeWebSocket });
    facade.enable();
    facade.connectWebSocketTransport({ url: 'ws://10.0.0.9:81' });
    instances[0].close();

    expect(instances).toHaveLength(1);
    expect(facade.getSnapshot().realTransportState).toBe('disconnected');
  });

  it('StudyRoom adapter path can still emit safely when real transport is disconnected', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN);

    expect(() => facade.emitStudyEvent('question_presented', makeInput())).not.toThrow();
    expect(facade.emitStudyEvent('question_presented', makeInput())).toMatchObject({
      ok: false,
      reason: 'transport_not_connected'
    });
  });

  it('mock flow still works', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_MOCK);
    facade.connectMock();

    const result = facade.emitStudyEvent('answer_correct', makeInput());

    expect(result.ok).toBe(true);
    expect(facade.getDebugEvents()).toHaveLength(1);
  });
});

describe('Device Bridge real transport UI gate source checks', () => {
  const source = read('src/components/settings/DeviceBridgeUiConcept.jsx');
  const viCopy = read('src/uiI18n/translations/vi.js');

  it('renders the real transport section and warning text', () => {
    expect(source).toContain('Real LAN / WS');
    expect(source).toContain("t('developer.bridgeConnectedReal')");
    expect(source).toContain("t('developer.bridgeManual')");
    expect(source).toContain("t('developer.bridgeManualBody')");
    expect(viCopy).toContain('Chỉ kết nối thiết bị tin cậy trong mạng cục bộ');
  });

  it('keeps connected mock wording for mock mode', () => {
    expect(source).toContain("t('developer.bridgeConnectedMock')");
  });

  it('uses a generic empty debug placeholder instead of mock-specific copy', () => {
    expect(source).toContain("t('developer.bridgeNoEvents')");
    expect(viCopy).toContain('[Chưa có sự kiện] Kết nối thiết bị để xem nhật ký sự kiện.');
    expect(source).not.toContain('[Chưa có sự kiện] Nhấn "Kết nối thiết bị Mock" để xem nhật ký sự kiện.');
  });

  it('URL input does not connect by itself', () => {
    const effectBlock = source.slice(source.indexOf('useEffect(() => {'), source.indexOf('  const handleToggleBridge'));
    expect(effectBlock).not.toContain('connectRealTransport');
    expect(effectBlock).not.toContain('connectWebSocketTransport');
  });

  it('subscribes to facade updates for live status rendering', () => {
    expect(source).toContain('facade.subscribe');
    expect(source).toContain('setSnapshot(facade.getSnapshot())');
  });

  it('connect button calls public facade API only', () => {
    expect(source).toContain('facade.connectRealTransport({ url: realLanUrl })');
    expect(source).not.toContain('WebSocketTransport');
    expect(source).not.toContain('createWebSocketTransport');
  });

  it('does not call emitStudyEvent or create demo payloads', () => {
    expect(source).not.toContain('emitStudyEvent');
    expect(source).not.toContain('triggerDemoEvent');
    expect(source).not.toContain('demo question_presented');
  });

  it('does not render Invalid Date text', () => {
    expect(source).not.toContain('Invalid Date');
  });
});
