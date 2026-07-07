import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import { createLoopbackTransport } from '../../src/deviceBridge/transports/LoopbackTransport.js';
import { createNoopTransport } from '../../src/deviceBridge/transports/NoopTransport.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function makeSafeEvent() {
  const created = createDeviceEvent({
    eventType: DEVICE_EVENT_TYPES.QUESTION_PRESENTED,
    eventId: 'evt_transport_safety_test',
    emittedAt: '2026-06-27T00:00:00.000Z',
    sessionId: 'session_transport_safety_test',
    payload: {
      itemIndex: 0,
      itemType: 'flashcard',
      progressCount: 1,
      totalCount: 3
    }
  });
  expect(created.ok).toBe(true);
  return created.event;
}

describe('Device Bridge transport safety skeleton', () => {
  it('NoopTransport never connects or sends', () => {
    const transport = createNoopTransport();

    expect(transport.getState()).toMatchObject({ kind: 'noop', connected: false, eventCount: 0 });
    expect(transport.connect()).toMatchObject({ ok: false, reason: 'transport_unavailable' });
    expect(transport.send(makeSafeEvent())).toMatchObject({ ok: false, reason: 'transport_unavailable' });
    expect(transport.getEvents()).toEqual([]);
  });

  it('LoopbackTransport is memory-only and requires explicit connect', () => {
    const transport = createLoopbackTransport();
    const event = makeSafeEvent();

    expect(transport.getState()).toMatchObject({ kind: 'loopback', connected: false, eventCount: 0 });
    expect(transport.send(event)).toMatchObject({ ok: false, reason: 'transport_disconnected' });
    expect(transport.connect().ok).toBe(true);
    expect(transport.send(event).ok).toBe(true);
    expect(transport.getEvents()).toHaveLength(1);
    expect(transport.clearEvents().ok).toBe(true);
    expect(transport.getEvents()).toEqual([]);
  });

  it('LoopbackTransport rejects sensitive payload events', () => {
    const transport = createLoopbackTransport({ connected: true });
    const unsafeEvent = {
      ...makeSafeEvent(),
      payload: {
        itemIndex: 0,
        explanation: 'private explanation'
      }
    };

    const result = transport.send(unsafeEvent);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid_event');
    expect(transport.getEvents()).toEqual([]);
  });

  it('transport source files contain no storage, network, hardware, or board-specific APIs', () => {
    const files = [
      'src/deviceBridge/transports/TransportContract.js',
      'src/deviceBridge/transports/NoopTransport.js',
      'src/deviceBridge/transports/LoopbackTransport.js',
      'src/deviceBridge/transports/README.md'
    ];
    const forbidden = [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'fetch',
      'XMLHttpRequest',
      'WebSocket',
      'Bluetooth',
      'Serial',
      'MQTT',
      'ESP32'
    ];

    files.forEach(file => {
      const source = fs.readFileSync(resolve(PROJECT_ROOT, file), 'utf8');
      forbidden.forEach(pattern => {
        expect(source).not.toContain(pattern);
      });
    });
  });
});

