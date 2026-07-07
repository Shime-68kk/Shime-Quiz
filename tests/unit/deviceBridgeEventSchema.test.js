import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDeviceEvent,
  DEVICE_EVENT_SCHEMA_VERSION,
  DEVICE_EVENT_SOURCES,
  DEVICE_EVENT_TYPES,
  isDeviceEventType,
  validateDeviceEvent
} from '../../src/deviceBridge/deviceEventSchema.js';

function makeValidInput(overrides = {}) {
  return {
    eventId: 'evt_test_1',
    eventType: DEVICE_EVENT_TYPES.SESSION_STARTED,
    emittedAt: '2026-06-26T16:00:00.000Z',
    sessionId: 'session_test_1',
    payload: {
      progressCount: 0,
      totalCount: 10,
      bridgeStatus: 'mock_enabled'
    },
    ...overrides
  };
}

describe('deviceEventSchema', () => {
  it('creates a valid redacted device event', () => {
    const result = createDeviceEvent(makeValidInput());

    expect(result.ok).toBe(true);
    expect(result.event).toMatchObject({
      schemaVersion: DEVICE_EVENT_SCHEMA_VERSION,
      eventId: 'evt_test_1',
      eventType: DEVICE_EVENT_TYPES.SESSION_STARTED,
      emittedAt: '2026-06-26T16:00:00.000Z',
      sessionId: 'session_test_1',
      source: DEVICE_EVENT_SOURCES.SHIME_QUIZ,
      payload: {
        progressCount: 0,
        totalCount: 10,
        bridgeStatus: 'mock_enabled'
      }
    });
  });

  it('rejects an invalid event type', () => {
    expect(isDeviceEventType('not_real')).toBe(false);

    const result = createDeviceEvent(makeValidInput({ eventType: 'not_real' }));

    expect(result.ok).toBe(false);
    expect(result.issues.map(issue => issue.code)).toContain('invalid_event_type');
  });

  it('rejects forbidden sensitive payload fields', () => {
    const result = createDeviceEvent(makeValidInput({
      payload: {
        progressCount: 1,
        totalCount: 10,
        correctAnswer: 'private'
      }
    }));

    expect(result.ok).toBe(false);
    expect(result.issues.map(issue => issue.code)).toContain('payload_field_not_allowed');
    expect(result.issues.map(issue => issue.code)).toContain('forbidden_sensitive_key');
  });

  it('rejects nested forbidden sensitive payload fields', () => {
    const result = createDeviceEvent(makeValidInput({
      payload: {
        message: {
          prompt: 'private question text'
        }
      }
    }));

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'forbidden_sensitive_key',
          path: '$.payload.message.prompt'
        })
      ])
    );
  });

  it('validates existing event envelopes without throwing', () => {
    const created = createDeviceEvent(makeValidInput()).event;
    const validation = validateDeviceEvent(created);

    expect(validation).toEqual({ ok: true, error: null, issues: [] });
  });

  it('source does not reference localStorage or network APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/deviceEventSchema.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i);
  });
});

