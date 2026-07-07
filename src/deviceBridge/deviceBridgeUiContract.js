export const DEVICE_BRIDGE_UI_STATUSES = Object.freeze({
  DISABLED: 'disabled',
  ENABLED: 'enabled',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
});

export const DEVICE_BRIDGE_TRANSPORT_STATUSES = Object.freeze({
  NONE: 'none',
  MOCK_CONNECTED: 'mock_connected',
  MOCK_DISCONNECTED: 'mock_disconnected',
  ERROR: 'error'
});

export const DEVICE_BRIDGE_PRIVACY_MODE = 'redacted';
export const DEVICE_BRIDGE_TRANSPORT_KIND_MOCK = 'mock';

const STATUS_LABELS = Object.freeze({
  [DEVICE_BRIDGE_UI_STATUSES.DISABLED]: 'Disabled',
  [DEVICE_BRIDGE_UI_STATUSES.ENABLED]: 'Enabled',
  [DEVICE_BRIDGE_UI_STATUSES.CONNECTED]: 'Connected',
  [DEVICE_BRIDGE_UI_STATUSES.DISCONNECTED]: 'Disconnected',
  [DEVICE_BRIDGE_UI_STATUSES.ERROR]: 'Error'
});

export function getDeviceBridgeStatusLabel(status) {
  return STATUS_LABELS[status] || 'Unknown';
}

export function getDeviceBridgePrivacyWarning() {
  return [
    'Device Bridge is optional and redacted by default.',
    'It does not send prompt text, answers, explanations, user answers, imported document content, backups, or full study history by default.'
  ].join(' ');
}
