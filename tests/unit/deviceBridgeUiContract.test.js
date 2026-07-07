import { describe, expect, it } from 'vitest';
import {
  DEVICE_BRIDGE_PRIVACY_MODE,
  DEVICE_BRIDGE_TRANSPORT_KIND_MOCK,
  DEVICE_BRIDGE_TRANSPORT_STATUSES,
  DEVICE_BRIDGE_UI_STATUSES,
  getDeviceBridgePrivacyWarning,
  getDeviceBridgeStatusLabel
} from '../../src/deviceBridge/index.js';

describe('deviceBridgeUiContract', () => {
  it('exports stable privacy and transport constants', () => {
    expect(DEVICE_BRIDGE_PRIVACY_MODE).toBe('redacted');
    expect(DEVICE_BRIDGE_TRANSPORT_KIND_MOCK).toBe('mock');
    expect(DEVICE_BRIDGE_TRANSPORT_STATUSES).toMatchObject({
      NONE: 'none',
      MOCK_CONNECTED: 'mock_connected',
      MOCK_DISCONNECTED: 'mock_disconnected',
      ERROR: 'error'
    });
  });

  it('has labels for all UI statuses', () => {
    Object.values(DEVICE_BRIDGE_UI_STATUSES).forEach(status => {
      expect(getDeviceBridgeStatusLabel(status)).toBeTypeOf('string');
      expect(getDeviceBridgeStatusLabel(status).length).toBeGreaterThan(0);
    });
  });

  it('returns Unknown for unrecognized status labels', () => {
    expect(getDeviceBridgeStatusLabel('not_real')).toBe('Unknown');
  });

  it('privacy warning states private learning content is not sent by default', () => {
    const warning = getDeviceBridgePrivacyWarning();

    expect(warning).toMatch(/prompt/i);
    expect(warning).toMatch(/answers/i);
    expect(warning).toMatch(/explanations/i);
    expect(warning).toMatch(/user answers/i);
    expect(warning).toMatch(/by default/i);
  });
});
