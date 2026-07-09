export const ROBOT_HANDOFF_TRANSPORT_IDS = Object.freeze({
  MANUAL_EXPORT: 'manual_export',
  USB_DEV_ONLY: 'usb_dev_only',
  BLE_CANDIDATE: 'ble_candidate',
  WIFI_LAN_CANDIDATE: 'wifi_lan_candidate',
  QR_PAIRING_CANDIDATE: 'qr_pairing_candidate',
  NATIVE_WRAPPER_REQUIRED: 'native_wrapper_required'
});

const FORBIDDEN_PAYLOADS = Object.freeze([
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'rawQuizPayload',
  'importedDocumentText'
]);

function makeMode({
  transportId,
  userExperienceFit,
  privacyRisk,
  implementationStage,
  requiresCable,
  supportsPhoneUse,
  supportsDesktopUse,
  notesCodes
}) {
  return {
    transportId,
    userExperienceFit,
    privacyRisk,
    implementationStage,
    requiresCable,
    supportsPhoneUse,
    supportsDesktopUse,
    dataAllowed: 'safe_capsule_only',
    forbiddenPayloads: [...FORBIDDEN_PAYLOADS],
    notesCodes
  };
}

export function getRobotHandoffTransportModes() {
  return [
    makeMode({
      transportId: ROBOT_HANDOFF_TRANSPORT_IDS.MANUAL_EXPORT,
      userExperienceFit: 'acceptable',
      privacyRisk: 'low',
      implementationStage: 'available_now',
      requiresCable: false,
      supportsPhoneUse: true,
      supportsDesktopUse: true,
      notesCodes: ['SAFE_BASELINE', 'USER_INITIATED_FILE_HANDOFF', 'MOCK_VERIFICATION_READY']
    }),
    makeMode({
      transportId: ROBOT_HANDOFF_TRANSPORT_IDS.USB_DEV_ONLY,
      userExperienceFit: 'poor',
      privacyRisk: 'medium',
      implementationStage: 'lab_only',
      requiresCable: true,
      supportsPhoneUse: false,
      supportsDesktopUse: true,
      notesCodes: ['DEV_DEBUG_ONLY', 'NOT_NORMAL_USER_FLOW', 'CABLE_REQUIRED']
    }),
    makeMode({
      transportId: ROBOT_HANDOFF_TRANSPORT_IDS.BLE_CANDIDATE,
      userExperienceFit: 'good',
      privacyRisk: 'medium',
      implementationStage: 'candidate_research',
      requiresCable: false,
      supportsPhoneUse: true,
      supportsDesktopUse: false,
      notesCodes: ['WIRELESS_CANDIDATE', 'PAIRING_REQUIRED_FUTURE_WORK', 'NOT_ENABLED']
    }),
    makeMode({
      transportId: ROBOT_HANDOFF_TRANSPORT_IDS.WIFI_LAN_CANDIDATE,
      userExperienceFit: 'good',
      privacyRisk: 'medium',
      implementationStage: 'candidate_research',
      requiresCable: false,
      supportsPhoneUse: true,
      supportsDesktopUse: true,
      notesCodes: ['LOCAL_NETWORK_CANDIDATE', 'PAIRING_REQUIRED_FUTURE_WORK', 'NOT_ENABLED']
    }),
    makeMode({
      transportId: ROBOT_HANDOFF_TRANSPORT_IDS.QR_PAIRING_CANDIDATE,
      userExperienceFit: 'acceptable',
      privacyRisk: 'low',
      implementationStage: 'candidate_research',
      requiresCable: false,
      supportsPhoneUse: true,
      supportsDesktopUse: true,
      notesCodes: ['PAIRING_HELPER_ONLY', 'NO_PAYLOAD_BY_DEFAULT', 'NOT_ENABLED']
    }),
    makeMode({
      transportId: ROBOT_HANDOFF_TRANSPORT_IDS.NATIVE_WRAPPER_REQUIRED,
      userExperienceFit: 'best_for_future',
      privacyRisk: 'medium',
      implementationStage: 'requires_native_wrapper',
      requiresCable: false,
      supportsPhoneUse: true,
      supportsDesktopUse: false,
      notesCodes: ['BEST_MOBILE_WIRELESS_UX', 'APP_STORE_REVIEW_REQUIRED', 'NOT_ENABLED']
    })
  ];
}

export function getRobotHandoffTransportMode(transportId) {
  return getRobotHandoffTransportModes().find(mode => mode.transportId === transportId) || null;
}

export function recommendFutureRobotHandoff({ platform = 'pwa_web', userGoal = 'normal_user' } = {}) {
  const normalizedPlatform = String(platform || 'pwa_web');
  const normalizedGoal = String(userGoal || 'normal_user');

  if (normalizedGoal === 'developer_debug') {
    return {
      recommendedTransportId: ROBOT_HANDOFF_TRANSPORT_IDS.USB_DEV_ONLY,
      fallbackTransportId: ROBOT_HANDOFF_TRANSPORT_IDS.MANUAL_EXPORT,
      recommendationCode: 'USB_ACCEPTABLE_FOR_DEV_DEBUG_ONLY',
      realTransportEnabled: false
    };
  }

  if (normalizedPlatform === 'native_mobile_wrapper') {
    return {
      recommendedTransportId: ROBOT_HANDOFF_TRANSPORT_IDS.NATIVE_WRAPPER_REQUIRED,
      fallbackTransportId: ROBOT_HANDOFF_TRANSPORT_IDS.MANUAL_EXPORT,
      candidateTransportIds: [
        ROBOT_HANDOFF_TRANSPORT_IDS.BLE_CANDIDATE,
        ROBOT_HANDOFF_TRANSPORT_IDS.WIFI_LAN_CANDIDATE
      ],
      recommendationCode: 'WIRELESS_NATIVE_WRAPPER_RESEARCH_NEXT',
      realTransportEnabled: false
    };
  }

  return {
    recommendedTransportId: ROBOT_HANDOFF_TRANSPORT_IDS.MANUAL_EXPORT,
    fallbackTransportId: ROBOT_HANDOFF_TRANSPORT_IDS.MANUAL_EXPORT,
    candidateTransportIds: [
      ROBOT_HANDOFF_TRANSPORT_IDS.BLE_CANDIDATE,
      ROBOT_HANDOFF_TRANSPORT_IDS.WIFI_LAN_CANDIDATE,
      ROBOT_HANDOFF_TRANSPORT_IDS.QR_PAIRING_CANDIDATE
    ],
    recommendationCode: 'KEEP_MANUAL_EXPORT_AND_MOCK_VERIFICATION_FOR_CURRENT_WEB',
    realTransportEnabled: false
  };
}
