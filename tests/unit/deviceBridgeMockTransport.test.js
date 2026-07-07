import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDeviceEvent, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import { createMockTransport } from '../../src/deviceBridge/transports/MockTransport.js';

function makeEvent(overrides = {}) {
  return createDeviceEvent({
    eventId: 'evt_transport_1',
    eventType: DEVICE_EVENT_TYPES.ANSWER_CORRECT,
    emittedAt: '2026-06-26T16:00:00.000Z',
    sessionId: 'session_transport_1',
    payload: {
      itemIndex: 0,
      itemType: 'multiple_choice',
      progressCount: 1,
      totalCount: 10,
      status: 'correct'
    },
    ...overrides
  }).event;
}

describe('MockTransport', () => {
  it('stores valid events in memory after connect', () => {
    const transport = createMockTransport();
    const event = makeEvent();

    expect(transport.connect().ok).toBe(true);
    expect(transport.send(event).ok).toBe(true);
    expect(transport.getEvents()).toEqual([event]);
    expect(transport.getState()).toMatchObject({ connected: true, eventCount: 1, kind: 'mock' });
  });

  it('rejects invalid events and stores no event', () => {
    const transport = createMockTransport();
    transport.connect();

    const result = transport.send({ eventType: 'bad' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid_event');
    expect(transport.getEvents()).toEqual([]);
  });

  it('returns safe failure when disconnected', () => {
    const transport = createMockTransport();
    const result = transport.send(makeEvent());

    expect(result).toMatchObject({ ok: false, reason: 'transport_disconnected' });
    expect(transport.getEvents()).toEqual([]);
  });

  it('clears stored events in memory', () => {
    const transport = createMockTransport();
    transport.connect();
    transport.send(makeEvent());

    expect(transport.clearEvents().ok).toBe(true);
    expect(transport.getEvents()).toEqual([]);
  });

  it('source does not reference localStorage or network APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/transports/MockTransport.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i);
  });
});

