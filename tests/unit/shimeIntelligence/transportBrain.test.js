import { describe, expect, it } from 'vitest';
import { planTransportBrain } from '../../../src/shimeIntelligence/transportBrain.js';

describe('transportBrain', () => {
  it('recommends future transports without opening connections', () => {
    expect(planTransportBrain({ deviceCapabilities: { supportsWifi: true, supportsWebSocket: true }, isSameLan: true, wifiHealth: 'good', latencyNeedBucket: 'live', userConsentState: 'explicit_yes' }).recommendation).toBe('wifi_websocket_lan');
    expect(planTransportBrain({ deviceCapabilities: { supportsBle: true }, pairingState: 'new', userConsentState: 'explicit_yes' }).recommendation).toBe('ble_provisioning');
    expect(planTransportBrain({ deviceCapabilities: { supportsSoftAp: true }, softApAvailable: true, userConsentState: 'explicit_yes' }).recommendation).toBe('softap_setup');
    expect(planTransportBrain({ deviceCapabilities: { supportsUsbSerial: true }, appPlatform: 'dev', userConsentState: 'explicit_yes' }).recommendation).toBe('usb_serial_dev');
    expect(planTransportBrain({ question: 'private', userConsentState: 'explicit_yes' }).recommendation).toBe('no_transport_safe');
    expect(planTransportBrain({ deviceCapabilities: { supportsWifi: true }, userConsentState: 'explicit_yes' }).opensConnection).toBe(false);
  });
});
