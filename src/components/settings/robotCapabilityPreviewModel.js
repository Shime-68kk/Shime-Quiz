import { summarizeRobotCapabilityHandshake, validateRobotCapabilityHandshake } from '../../shimeIntelligence/index.js';

function yesNo(value) {
  return value ? 'có' : 'không';
}

export function createRobotCapabilityPreviewModel(handshake = {}) {
  const validation = validateRobotCapabilityHandshake(handshake);
  const summary = summarizeRobotCapabilityHandshake(handshake);
  return {
    displaySupportLabel: yesNo(handshake.supportsDisplay),
    ledSupportLabel: yesNo(handshake.supportsLed),
    soundSupportLabel: yesNo(handshake.supportsSound),
    presenceSupportLabel: yesNo(handshake.supportsPresenceSensor),
    wifiSupportLabel: yesNo(handshake.supportsWifi),
    bleSupportLabel: yesNo(handshake.supportsBle),
    softApSupportLabel: yesNo(handshake.supportsSoftAp),
    usbSerialDevSupportLabel: yesNo(handshake.supportsUsbSerial),
    motionSupportLabel: yesNo(handshake.supportsMotion),
    motionLockedLabel: handshake.motionLocked === true ? 'đã khóa' : 'không an toàn',
    capsuleProtocolVersionLabel: summary.capsuleProtocolVersion || 'không rõ',
    expressionContractVersionLabel: summary.expressionContractVersion || 'không rõ',
    privacyModeLabel: handshake.privacyMode === 'redacted_coarse_only' ? 'đã làm mờ/rút gọn' : 'đã chặn',
    safetyModeLabel: handshake.safetyMode || 'motion_disabled',
    dryRunLabel: handshake.dryRunOnly === true && handshake.sendStatus === 'not_sent' ? 'dry-run / không gửi' : 'đã chặn',
    capabilityLabel: validation.ok ? 'schema hợp lệ' : 'schema bị chặn',
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}
