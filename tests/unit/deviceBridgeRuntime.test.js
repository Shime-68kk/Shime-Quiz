import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDeviceBridge, DEVICE_EVENT_TYPES } from '../../src/deviceBridge/index.js';

function makeInput(overrides = {}) {
  return {
    eventId: 'evt_bridge_1',
    eventType: DEVICE_EVENT_TYPES.QUESTION_PRESENTED,
    emittedAt: '2026-06-26T16:00:00.000Z',
    sessionId: 'session_bridge_1',
    payload: {
      itemIndex: 0,
      itemType: 'flashcard',
      progressCount: 0,
      totalCount: 4
    },
    ...overrides
  };
}

describe('DeviceBridge runtime', () => {
  it('defaults disabled', () => {
    const bridge = createDeviceBridge();

    expect(bridge.getState()).toMatchObject({
      enabled: false,
      connected: false,
      bridgeStatus: 'disabled',
      transportStatus: 'disconnected'
    });
  });

  it('disabled bridge does not send', () => {
    const bridge = createDeviceBridge();

    const result = bridge.emit(makeInput());

    expect(result).toMatchObject({ ok: false, reason: 'bridge_disabled' });
    expect(bridge.getDebugEvents()).toEqual([]);
  });

  it('enabled and connected bridge sends a valid event', () => {
    const bridge = createDeviceBridge();

    expect(bridge.enable().ok).toBe(true);
    expect(bridge.connect().ok).toBe(true);

    const result = bridge.emit(makeInput());

    expect(result.ok).toBe(true);
    expect(result.event).toMatchObject({
      eventType: DEVICE_EVENT_TYPES.QUESTION_PRESENTED,
      sessionId: 'session_bridge_1'
    });
    expect(bridge.getDebugEvents()).toHaveLength(1);
  });

  it('disconnected bridge returns safe failure', () => {
    const bridge = createDeviceBridge({ enabled: true });

    const result = bridge.emit(makeInput());

    expect(result).toMatchObject({ ok: false, reason: 'transport_disconnected' });
    expect(bridge.getDebugEvents()).toEqual([]);
  });

  it('rejects sensitive event input without sending', () => {
    const bridge = createDeviceBridge({ enabled: true });
    bridge.connect();

    const result = bridge.emit(makeInput({
      payload: {
        itemIndex: 0,
        prompt: 'private'
      }
    }));

    expect(result).toMatchObject({ ok: false, reason: 'invalid_event' });
    expect(bridge.getDebugEvents()).toEqual([]);
  });

  it('supports listener subscription and unsubscription', () => {
    const bridge = createDeviceBridge({ enabled: true });
    const updates = [];
    const unsubscribe = bridge.subscribe(update => updates.push(update.type));

    bridge.connect();
    bridge.emit(makeInput());
    unsubscribe();
    bridge.disconnect();

    expect(updates).toContain('bridge_connected');
    expect(updates).toContain('bridge_event_sent');
    expect(updates).not.toContain('bridge_disconnected');
  });

  it('isolates listener errors', () => {
    const bridge = createDeviceBridge({ enabled: true });
    const updates = [];
    bridge.subscribe(() => {
      throw new Error('listener failed');
    });
    bridge.subscribe(update => updates.push(update.type));

    expect(() => bridge.connect()).not.toThrow();
    expect(() => bridge.emit(makeInput())).not.toThrow();
    expect(updates).toContain('bridge_connected');
    expect(updates).toContain('bridge_event_sent');
  });

  it('clears debug events through the bridge API', () => {
    const bridge = createDeviceBridge({ enabled: true });
    bridge.connect();
    bridge.emit(makeInput());

    expect(bridge.clearDebugEvents().ok).toBe(true);
    expect(bridge.getDebugEvents()).toEqual([]);
  });

  it('source does not reference localStorage or raw network APIs', () => {
    const files = [
      'src/deviceBridge/DeviceBridge.js',
      'src/deviceBridge/index.js'
    ];

    files.forEach(file => {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
      expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|new WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i);
    });
  });
});
