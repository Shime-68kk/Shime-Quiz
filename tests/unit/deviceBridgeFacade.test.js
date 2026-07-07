import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDeviceBridgeFacade,
  DEVICE_BRIDGE_PRIVACY_MODE,
  DEVICE_BRIDGE_TRANSPORT_KIND_MOCK,
  DEVICE_BRIDGE_TRANSPORT_STATUSES,
  DEVICE_BRIDGE_UI_STATUSES
} from '../../src/deviceBridge/index.js';

function makeInput(overrides = {}) {
  return {
    sessionId: 'session_facade_1',
    itemIndex: 0,
    itemType: 'flashcard',
    progressCount: 1,
    totalCount: 4,
    ...overrides
  };
}

describe('deviceBridgeFacade', () => {
  it('defaults disabled and disconnected', () => {
    const facade = createDeviceBridgeFacade();

    expect(facade.getSnapshot()).toEqual({
      enabled: false,
      connected: false,
      bridgeStatus: DEVICE_BRIDGE_UI_STATUSES.DISABLED,
      transportStatus: DEVICE_BRIDGE_TRANSPORT_STATUSES.NONE,
      eventCount: 0,
      lastEventType: null,
      lastError: null,
      privacyMode: DEVICE_BRIDGE_PRIVACY_MODE,
      transportKind: DEVICE_BRIDGE_TRANSPORT_KIND_MOCK,
      selectedTransportMode: 'mock',
      realTransportAvailable: true,
      realTransportState: 'idle',
      realTransportHost: '',
      realTransportRedactedUrl: ''
    });
  });

  it('enable changes the snapshot without connecting', () => {
    const facade = createDeviceBridgeFacade();

    expect(facade.enable().ok).toBe(true);
    expect(facade.getSnapshot()).toMatchObject({
      enabled: true,
      connected: false,
      bridgeStatus: DEVICE_BRIDGE_UI_STATUSES.ENABLED,
      transportStatus: DEVICE_BRIDGE_TRANSPORT_STATUSES.MOCK_DISCONNECTED
    });
  });

  it('connectMock fails safely when disabled', () => {
    const facade = createDeviceBridgeFacade();

    const result = facade.connectMock();

    expect(result).toMatchObject({
      ok: false,
      reason: 'bridge_disabled',
      message: 'Mock bridge connection failed.'
    });
    expect(result.snapshot.lastError).toEqual({
      reason: 'bridge_disabled',
      message: 'Mock bridge connection failed.'
    });
    expect(facade.getDebugEvents()).toEqual([]);
  });

  it('enable plus connectMock succeeds', () => {
    const facade = createDeviceBridgeFacade();

    facade.enable();
    const result = facade.connectMock();

    expect(result.ok).toBe(true);
    expect(facade.getSnapshot()).toMatchObject({
      enabled: true,
      connected: true,
      bridgeStatus: DEVICE_BRIDGE_UI_STATUSES.CONNECTED,
      transportStatus: DEVICE_BRIDGE_TRANSPORT_STATUSES.MOCK_CONNECTED,
      lastError: null
    });
  });

  it('disconnect updates the snapshot', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.connectMock();

    expect(facade.disconnect().ok).toBe(true);

    expect(facade.getSnapshot()).toMatchObject({
      enabled: true,
      connected: false,
      bridgeStatus: DEVICE_BRIDGE_UI_STATUSES.DISCONNECTED,
      transportStatus: DEVICE_BRIDGE_TRANSPORT_STATUSES.MOCK_DISCONNECTED
    });
  });

  it('emitStudyEvent uses a known factory and stores the event', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.connectMock();

    const result = facade.emitStudyEvent('answer_correct', makeInput());

    expect(result.ok).toBe(true);
    expect(result.event.eventType).toBe('answer_correct');
    expect(result.event.payload.status).toBe('correct');
    expect(facade.getSnapshot()).toMatchObject({
      eventCount: 1,
      lastEventType: 'answer_correct'
    });
  });

  it('emitStudyEvent rejects an unknown factory name', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.connectMock();

    const result = facade.emitStudyEvent('raw_event_payload', makeInput());

    expect(result).toMatchObject({
      ok: false,
      reason: 'unknown_study_event_factory',
      message: 'Unknown study event factory.'
    });
    expect(facade.getDebugEvents()).toEqual([]);
  });

  it('emitStudyEvent rejects sensitive input', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.connectMock();

    const result = facade.emitStudyEvent('question_presented', makeInput({
      prompt: 'private prompt',
      sourceMetadata: { sourceName: 'private.pdf' }
    }));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsafe_device_payload');
    expect(facade.getDebugEvents()).toEqual([]);
  });

  it('getDebugEvents returns stored mock events', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.connectMock();
    facade.emitStudyEvent('question_presented', makeInput());

    const events = facade.getDebugEvents();

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('question_presented');
  });

  it('clearDebugEvents clears stored events', () => {
    const facade = createDeviceBridgeFacade();
    facade.enable();
    facade.connectMock();
    facade.emitStudyEvent('question_presented', makeInput());

    expect(facade.clearDebugEvents().ok).toBe(true);

    expect(facade.getDebugEvents()).toEqual([]);
    expect(facade.getSnapshot().eventCount).toBe(0);
  });

  it('subscribe receives snapshot and event updates', () => {
    const facade = createDeviceBridgeFacade();
    const updates = [];
    const unsubscribe = facade.subscribe(update => updates.push(update));

    facade.enable();
    facade.connectMock();
    facade.emitStudyEvent('session_started', makeInput({ progressCount: 0 }));
    unsubscribe();
    facade.disconnect();

    expect(updates.map(update => update.type)).toEqual([
      'facade_enabled',
      'facade_mock_connected',
      'facade_event_sent'
    ]);
    expect(updates[2].event.eventType).toBe('session_started');
    expect(updates[2].snapshot.lastEventType).toBe('session_started');
  });

  it('listener errors are isolated', () => {
    const facade = createDeviceBridgeFacade();
    const updates = [];
    facade.subscribe(() => {
      throw new Error('listener failed');
    });
    facade.subscribe(update => updates.push(update.type));

    expect(() => facade.enable()).not.toThrow();
    expect(() => facade.connectMock()).not.toThrow();

    expect(updates).toEqual(['facade_enabled', 'facade_mock_connected']);
  });

  it('source does not depend on storage or raw network transport APIs', () => {
    const files = [
      'src/deviceBridge/deviceBridgeFacade.js',
      'src/deviceBridge/deviceBridgeUiContract.js'
    ];

    files.forEach(file => {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
      expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|new WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i);
    });
  });
});
