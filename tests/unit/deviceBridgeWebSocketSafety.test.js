import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import {
  createWebSocketRobotEventEnvelope,
  createWebSocketTransport
} from '../../src/deviceBridge/transports/WebSocketTransport.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const transportPath = resolve(PROJECT_ROOT, 'src/deviceBridge/transports/WebSocketTransport.js');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

describe('WebSocketTransport safety boundaries', () => {
  const source = fs.readFileSync(transportPath, 'utf8');

  it('does not use browser storage in WebSocketTransport source', () => {
    ['localStorage', 'sessionStorage', 'indexedDB'].forEach(pattern => {
      expect(source).not.toContain(pattern);
    });
  });

  it('does not use disallowed request, broker, wireless, board, or cable APIs in WebSocketTransport source', () => {
    ['fetch', 'XMLHttpRequest', 'MQTT', 'Bluetooth', 'Serial', 'ESP32'].forEach(pattern => {
      expect(source).not.toContain(pattern);
    });
  });

  it('keeps raw WebSocket construction isolated away from UI, StudyRoom, facade, and public index', () => {
    [
      'src/routes/StudyRoom.jsx',
      'src/components/settings/DeviceBridgeUiConcept.jsx',
      'src/deviceBridge/index.js',
      'src/deviceBridge/deviceBridgeFacade.js',
      'src/deviceBridge/DeviceBridge.js'
    ].forEach(file => {
      expect(read(file)).not.toContain('new WebSocket');
    });
  });

  it('StudyRoom is not modified to import WebSocketTransport', () => {
    expect(read('src/routes/StudyRoom.jsx')).not.toContain('WebSocketTransport');
    expect(read('src/routes/StudyRoom.jsx')).not.toContain('createWebSocketTransport');
  });

  it('UI is not modified to import WebSocketTransport', () => {
    expect(read('src/components/settings/DeviceBridgeUiConcept.jsx')).not.toContain('WebSocketTransport');
    expect(read('src/components/settings/DeviceBridgeUiConcept.jsx')).not.toContain('createWebSocketTransport');
  });

  it('src/deviceBridge/index.js does not export WebSocketTransport yet', () => {
    const publicIndex = read('src/deviceBridge/index.js');
    expect(publicIndex).not.toContain('WebSocketTransport');
    expect(publicIndex).not.toContain('createWebSocketTransport');
  });

  it('does not serialize raw quiz fields through WebSocketTransport helpers', () => {
    const safe = createDeviceEvent({
      eventType: DEVICE_EVENT_TYPES.ANSWER_WRONG,
      eventId: 'evt_ws_safety',
      emittedAt: '2026-06-27T00:00:00.000Z',
      sessionId: 'session_ws_safety',
      payload: {
        itemIndex: 1,
        itemType: 'short_answer',
        progressCount: 2,
        totalCount: 3,
        status: 'wrong'
      }
    });
    expect(safe.ok).toBe(true);

    const envelope = createWebSocketRobotEventEnvelope(safe.event, {
      now: () => '2026-06-27T00:00:01.000Z',
      idFactory: prefix => `${prefix}_safe`
    });
    const serialized = JSON.stringify(envelope.envelope);

    [
      'prompt',
      'question',
      'correctAnswer',
      'explanation',
      'userAnswer',
      'sourceMetadata',
      'settings',
      'studyHistory',
      'backupPayload'
    ].forEach(field => {
      expect(serialized).not.toContain(field);
    });
  });

  it('constructor does not create a socket without connect', () => {
    let created = 0;
    function FakeWebSocket() {
      created += 1;
    }

    createWebSocketTransport({ webSocketFactory: FakeWebSocket, url: 'ws://127.0.0.1:81' });
    expect(created).toBe(0);
  });
});
