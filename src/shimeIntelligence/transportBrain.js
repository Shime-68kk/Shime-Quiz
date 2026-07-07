import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export function planTransportBrain(input = {}) {
  const reasons = ['transport_recommendation_only'];
  let recommendation = 'app_local_only';
  if (findSensitiveKeys(input).length > 0 || input.privacyMode === 'raw') {
    return { recommendation: 'no_transport_safe', opensConnection: false, dryRunOnly: true, reasonCodes: ['sensitive_payload_blocked'] };
  }
  if (input.userConsentState !== 'explicit_yes') {
    return { recommendation: 'no_transport_safe', opensConnection: false, dryRunOnly: true, reasonCodes: ['explicit_consent_required'] };
  }
  const caps = input.deviceCapabilities || {};
  if (caps.supportsWifi && caps.supportsWebSocket && input.isSameLan && input.wifiHealth === 'good' && input.latencyNeedBucket === 'live') {
    recommendation = 'wifi_websocket_lan';
    reasons.push('prefer_wifi_for_session');
  } else if (caps.supportsBle && input.pairingState !== 'paired') {
    recommendation = 'ble_provisioning';
    reasons.push('prefer_ble_for_pairing');
  } else if (caps.supportsBle && input.payloadSizeBucket === 'tiny') {
    recommendation = 'ble_presence';
    reasons.push('ble_for_presence');
  } else if (caps.supportsSoftAp && input.softApAvailable) {
    recommendation = 'softap_setup';
    reasons.push('softap_for_setup_only');
  } else if (caps.supportsUsbSerial && input.appPlatform === 'dev') {
    recommendation = 'usb_serial_dev';
    reasons.push('dev_debug_only');
  }
  if (caps.supportsWifi && caps.supportsBle) reasons.push('avoid_heavy_wifi_ble_parallel');
  return { recommendation, opensConnection: false, dryRunOnly: true, reasonCodes: reasons };
}
