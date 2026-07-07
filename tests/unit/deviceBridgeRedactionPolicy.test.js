import { describe, expect, it } from 'vitest';
import {
  ALLOWED_DEVICE_PAYLOAD_KEYS,
  assertSafeDevicePayload,
  containsForbiddenDevicePayloadData,
  createPrivacySafeFailure,
  FORBIDDEN_DEVICE_EVENT_KEYS,
  sanitizeDevicePayload
} from '../../src/deviceBridge/index.js';

describe('deviceBridge redactionPolicy', () => {
  it('detects forbidden top-level keys', () => {
    expect(containsForbiddenDevicePayloadData({ prompt: 'private prompt' })).toBe(true);

    const result = assertSafeDevicePayload({ correctAnswer: 'private answer' });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'payload_field_not_allowed',
          path: '$.payload.correctAnswer'
        }),
        expect.objectContaining({
          code: 'forbidden_sensitive_key',
          path: '$.payload.correctAnswer'
        })
      ])
    );
  });

  it('detects forbidden nested keys', () => {
    const result = sanitizeDevicePayload({
      message: {
        explanation: 'private explanation'
      }
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'forbidden_sensitive_key',
          path: '$.payload.message.explanation'
        })
      ])
    );
  });

  it('does not mutate input while sanitizing', () => {
    const payload = {
      itemIndex: 2,
      itemType: 'flashcard',
      progressCount: 3,
      totalCount: 10,
      message: { text: 'safe status only' }
    };
    const before = structuredClone(payload);

    const result = sanitizeDevicePayload(payload);

    expect(result.ok).toBe(true);
    expect(payload).toEqual(before);
    expect(result.payload).toEqual(before);
    expect(result.payload).not.toBe(payload);
    expect(result.payload.message).not.toBe(payload.message);
  });

  it('strictly rejects unknown top-level payload fields', () => {
    const result = sanitizeDevicePayload({
      itemIndex: 0,
      customPrivateField: 'not part of the contract'
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'payload_field_not_allowed',
          path: '$.payload.customPrivateField'
        })
      ])
    );
  });

  it('allows only contract payload keys', () => {
    const payload = {
      itemIndex: 0,
      itemType: 'multiple_choice',
      progressCount: 1,
      totalCount: 8,
      status: 'correct',
      scoreBucket: 'high',
      accuracyBucket: '80_100',
      dueCountBucket: '1_5',
      bridgeStatus: 'enabled',
      transportStatus: 'mock_connected',
      command: 'idle',
      reasonCode: 'none',
      message: 'safe coarse status'
    };

    const result = assertSafeDevicePayload(payload);

    expect(result).toEqual({ ok: true, payload, issues: [] });
  });

  it('exports the allowed and forbidden contract lists', () => {
    expect(ALLOWED_DEVICE_PAYLOAD_KEYS).toContain('progressCount');
    expect(ALLOWED_DEVICE_PAYLOAD_KEYS).toContain('transportStatus');
    expect(FORBIDDEN_DEVICE_EVENT_KEYS).toContain('prompt');
    expect(FORBIDDEN_DEVICE_EVENT_KEYS).toContain('sourceMetadata');
  });

  it('creates safe failure objects without leaking payload data', () => {
    expect(createPrivacySafeFailure('unsafe_device_payload', 'Rejected.')).toEqual({
      ok: false,
      reason: 'unsafe_device_payload',
      message: 'Rejected.'
    });
  });
});
