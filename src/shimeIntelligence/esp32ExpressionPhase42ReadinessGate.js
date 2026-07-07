export function createEsp32ExpressionPhase42ReadinessGate(input = {}) {
  const blockers = [];
  const warnings = [];
  const required = [
    'phase39ProtocolBenchmarkPass',
    'phase40HostSimulatorPass',
    'phase41FirmwarePlanningPass',
    'goldenFixturesGenerated',
    'serialQaKitGenerated',
    'expectedLogsGenerated',
    'parserDesignGenerated',
    'rollbackPlanGenerated',
    'firmwareScopeIsolated'
  ];
  required.forEach(key => {
    if (input[key] !== true) blockers.push(`missing_gate:${key}`);
  });
  if (input.phase38ManualQaPass !== true) warnings.push('phase38_manual_qa_pending_or_ack_required');
  if (input.noMotion !== true) blockers.push('motion_gate_not_met');
  if (input.noRadioRequired !== true) blockers.push('radio_requirement_not_allowed');
  if (input.noDeviceBridgeRuntimeRequired !== true) blockers.push('devicebridge_runtime_dependency_not_allowed');
  return {
    readinessStatus: blockers.length === 0 ? 'PASS_WITH_WARNINGS' : 'FAIL',
    blockers,
    warnings,
    allowedPhase42Files: [
      'firmware/esp32-shime-robot/include/ShimeProtocol.h',
      'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
      'firmware/esp32-shime-robot/src/main.cpp',
      'firmware/esp32-shime-robot/protocol.md'
    ],
    forbiddenPhase42Files: [
      'src/routes/StudyRoom.jsx',
      'src/deviceBridge/**',
      'package.json',
      'lockfiles',
      'app_storage_or_scheduler_files'
    ],
    recommendedPhase42PromptSummary: 'Implement isolated log-only expression envelope parser; no motion, no radio transport, no app runtime mutation.',
    recommendation: blockers.length === 0 ? 'SAFE_FOR_LOG_ONLY_FIRMWARE_IMPLEMENTATION_AFTER_MANUAL_QA_ACK' : 'MORE_FIRMWARE_PLANNING_REQUIRED',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_expression_phase42_readiness_gate_created']
  };
}

