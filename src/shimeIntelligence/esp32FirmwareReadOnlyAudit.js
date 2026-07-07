const EXPECTED_FILES = Object.freeze([
  'firmware/esp32-shime-robot/platformio.ini',
  'firmware/esp32-shime-robot/src/main.cpp',
  'firmware/esp32-shime-robot/include/ShimeProtocol.h',
  'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
  'firmware/esp32-shime-robot/include/ShimeRobotActions.h',
  'firmware/esp32-shime-robot/src/ShimeRobotActions.cpp',
  'firmware/esp32-shime-robot/protocol.md'
]);

function textOf(files = {}, path) {
  return files[path] || '';
}

export function createEsp32FirmwareReadOnlyAudit(files = {}) {
  const found = EXPECTED_FILES.filter(path => typeof files[path] === 'string');
  const protocolCpp = textOf(files, 'firmware/esp32-shime-robot/src/ShimeProtocol.cpp');
  const mainCpp = textOf(files, 'firmware/esp32-shime-robot/src/main.cpp');
  const actionsCpp = textOf(files, 'firmware/esp32-shime-robot/src/ShimeRobotActions.cpp');
  const platform = textOf(files, 'firmware/esp32-shime-robot/platformio.ini');
  const currentCapabilities = {
    arduinoEsp32Project: platform.includes('framework = arduino'),
    serialLineParser: mainCpp.includes('processSerialLine'),
    maxLineLength2048: mainCpp.includes('MAX_SERIAL_LINE_LENGTH = 2048'),
    legacyProtocolVersion: protocolCpp.includes('shime-ws-robot-v0'),
    legacyEventPath: protocolCpp.includes('robot_event'),
    legacyCommandPath: protocolCpp.includes('robot_command'),
    propertyNamePrivacyPolicy: protocolCpp.includes('containsJsonPropertyName'),
    actionStubsOnly: actionsCpp.includes('action stub'),
    noWifiDependency: !platform.includes('WebSockets') && !platform.includes('WiFiManager'),
    noPinWriteDetected: !actionsCpp.includes('digitalWrite') && !mainCpp.includes('digitalWrite'),
    noServoDetected: !actionsCpp.includes('Servo') && !mainCpp.includes('Servo')
  };
  const missingForExpressionProtocol = [
    'expression_envelope_message_type',
    'protocol_version_1_0_0',
    'expression_family_validation',
    'allowed_channel_validation',
    'dry_run_and_not_sent_validation',
    'locked_motion_validation',
    'log_only_accept_reject_format'
  ];
  return {
    auditStatus: found.length === EXPECTED_FILES.length ? 'PASS' : 'WARN',
    firmwareFilesFound: found,
    currentCapabilities,
    missingForExpressionProtocol,
    safetyFindings: [
      currentCapabilities.noPinWriteDetected ? 'no_pin_write_detected' : 'pin_write_review_required',
      currentCapabilities.noServoDetected ? 'no_servo_detected' : 'servo_review_required',
      currentCapabilities.actionStubsOnly ? 'actions_are_log_stubs' : 'action_behavior_review_required'
    ],
    privacyFindings: [
      currentCapabilities.propertyNamePrivacyPolicy ? 'property_name_privacy_policy_present' : 'privacy_policy_review_required'
    ],
    recommendedPhase42Scope: [
      'add_expression_envelope_parser',
      'add_log_only_accept_reject_output',
      'keep_action_stubs_unmoved',
      'keep_motion_locked'
    ],
    forbiddenPhase42Scope: [
      'motor_or_servo_behavior',
      'radio_transport',
      'secret_material_storage',
      'app_runtime_dependency',
      'learning_data_mutation'
    ],
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_firmware_readonly_audit_completed']
  };
}

export function summarizeEsp32FirmwareReadOnlyAudit(audit = {}) {
  return {
    auditStatus: audit.auditStatus || 'UNKNOWN',
    fileCount: audit.firmwareFilesFound?.length || 0,
    serialLineParser: audit.currentCapabilities?.serialLineParser === true,
    actionStubsOnly: audit.currentCapabilities?.actionStubsOnly === true,
    noMotionDetected: audit.currentCapabilities?.noPinWriteDetected === true && audit.currentCapabilities?.noServoDetected === true,
    missingCount: audit.missingForExpressionProtocol?.length || 0,
    reasonCodes: [...(audit.reasonCodes || [])]
  };
}

