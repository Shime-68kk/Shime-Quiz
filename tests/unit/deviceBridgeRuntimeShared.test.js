import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ALLOWED_DEVICE_PAYLOAD_KEYS,
  FORBIDDEN_DEVICE_EVENT_KEYS,
  getSharedDeviceBridgeFacade,
  resetSharedDeviceBridgeFacadeForTests,
  validateDeviceEvent
} from '../../src/deviceBridge/index.js';
import { createStudyRoomBridgeAdapter } from '../../src/deviceBridge/studyRoomBridgeAdapter.js';

function makeInput(overrides = {}) {
  return {
    sessionId: 'session_shared_runtime_1',
    itemIndex: 0,
    itemType: 'flashcard',
    progressCount: 1,
    totalCount: 3,
    ...overrides
  };
}

function collectObjectKeys(value, keys = []) {
  if (Array.isArray(value)) {
    value.forEach(entry => collectObjectKeys(entry, keys));
    return keys;
  }
  if (!value || typeof value !== 'object') return keys;
  Object.entries(value).forEach(([key, entry]) => {
    keys.push(key);
    collectObjectKeys(entry, keys);
  });
  return keys;
}

describe('shared Device Bridge runtime', () => {
  beforeEach(() => {
    resetSharedDeviceBridgeFacadeForTests();
  });

  it('shared facade defaults disabled and disconnected', () => {
    expect(getSharedDeviceBridgeFacade().getSnapshot()).toMatchObject({
      enabled: false,
      connected: false,
      bridgeStatus: 'disabled',
      transportStatus: 'none',
      eventCount: 0
    });
  });

  it('repeated getter calls return the same instance', () => {
    const first = getSharedDeviceBridgeFacade();
    const second = getSharedDeviceBridgeFacade();

    expect(second).toBe(first);
  });

  it('resetSharedDeviceBridgeFacadeForTests resets state', () => {
    const first = getSharedDeviceBridgeFacade();
    first.enable();
    first.connectMock();

    const reset = resetSharedDeviceBridgeFacadeForTests();

    expect(reset).not.toBe(first);
    expect(reset.getSnapshot()).toMatchObject({
      enabled: false,
      connected: false,
      eventCount: 0
    });
  });

  it('enabling shared facade affects subsequent getter result', () => {
    getSharedDeviceBridgeFacade().enable();

    expect(getSharedDeviceBridgeFacade().getSnapshot()).toMatchObject({
      enabled: true,
      connected: false,
      bridgeStatus: 'enabled'
    });
  });

  it('does not auto-connect', () => {
    getSharedDeviceBridgeFacade().enable();

    expect(getSharedDeviceBridgeFacade().getSnapshot()).toMatchObject({
      enabled: true,
      connected: false,
      transportStatus: 'mock_disconnected'
    });
  });

  it('shared adapter emits into the shared facade when enabled and connected', () => {
    const facade = getSharedDeviceBridgeFacade();
    const adapter = createStudyRoomBridgeAdapter();
    facade.enable();
    facade.connectMock();

    const result = adapter.questionPresented(makeInput());

    expect(result.ok).toBe(true);
    expect(facade.getDebugEvents()).toHaveLength(1);
    expect(facade.getDebugEvents()[0]).toMatchObject({
      eventType: 'question_presented',
      payload: {
        itemIndex: 0,
        itemType: 'flashcard',
        progressCount: 1,
        totalCount: 3
      }
    });
  });

  it('shared debug events contain only approved coarse fields and validate against schema', () => {
    const facade = getSharedDeviceBridgeFacade();
    const adapter = createStudyRoomBridgeAdapter();
    facade.enable();
    facade.connectMock();

    const result = adapter.sessionComplete({
      sessionId: 'session_shared_runtime_1',
      progressCount: 3,
      totalCount: 3,
      scoreBucket: '80_100',
      accuracyBucket: '80_100'
    });
    const [event] = facade.getDebugEvents();

    expect(result.ok).toBe(true);
    expect(validateDeviceEvent(event)).toEqual({ ok: true, error: null, issues: [] });
    expect(Object.keys(event.payload).sort()).toEqual([
      'accuracyBucket',
      'progressCount',
      'scoreBucket',
      'totalCount'
    ]);
    Object.keys(event.payload).forEach(key => {
      expect(ALLOWED_DEVICE_PAYLOAD_KEYS).toContain(key);
    });
  });

  it('shared debug events never contain forbidden sensitive keys', () => {
    const facade = getSharedDeviceBridgeFacade();
    const adapter = createStudyRoomBridgeAdapter();
    facade.enable();
    facade.connectMock();

    adapter.answerCorrect(makeInput());

    const emittedKeys = collectObjectKeys(facade.getDebugEvents());
    FORBIDDEN_DEVICE_EVENT_KEYS.forEach(key => {
      expect(emittedKeys).not.toContain(key);
    });
  });

  it('disabled shared facade causes safe failures and stores no events', () => {
    const facade = getSharedDeviceBridgeFacade();
    const adapter = createStudyRoomBridgeAdapter();

    const result = adapter.sessionStarted(makeInput({ progressCount: 0 }));

    expect(result).toMatchObject({ ok: false, reason: 'bridge_disabled' });
    expect(facade.getDebugEvents()).toEqual([]);
  });

  it('shared adapter rejects sensitive fields before storing events', () => {
    const facade = getSharedDeviceBridgeFacade();
    const adapter = createStudyRoomBridgeAdapter();
    facade.enable();
    facade.connectMock();

    const result = adapter.answerWrong(makeInput({
      prompt: 'private prompt',
      sourceMetadata: { sourceName: 'private.pdf' }
    }));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsafe_studyroom_bridge_input');
    expect(facade.getDebugEvents()).toEqual([]);
  });

  it('source does not depend on storage or network APIs', () => {
    const files = [
      'src/deviceBridge/deviceBridgeRuntime.js',
      'src/deviceBridge/studyRoomBridgeAdapter.js'
    ];

    files.forEach(file => {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
      expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.bluetooth|navigator\.serial|mqtt|ESP32/i);
    });
  });
});
