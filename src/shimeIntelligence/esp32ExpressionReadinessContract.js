export function createEsp32ExpressionReadinessContract(input = {}) {
  const blockers = [];
  const warnings = [];
  const gates = {
    envelopeSchemaStable: input.envelopeSchemaStable === true,
    goldenFixturesGenerated: input.goldenFixturesGenerated === true,
    hostSimulatorPasses: input.hostSimulatorPasses === true,
    validatorPasses: input.validatorPasses === true,
    serializerRoundTripPasses: input.serializerRoundTripPasses === true,
    sensitiveAttacksRejected: input.sensitiveAttacksRejected === true,
    secretMaterialRejected: input.secretMaterialRejected === true,
    motionLocked: input.motionLocked !== false,
    noMotorServoCommands: input.noMotorServoCommands !== false,
    noRadioImplementationRequired: input.noRadioImplementationRequired !== false,
    serialQaPlanExists: input.serialQaPlanExists === true,
    hardwareManualQaChecklistExists: input.hardwareManualQaChecklistExists === true,
    rollbackPlanExists: input.rollbackPlanExists === true,
    firmwareScopeIsolated: input.firmwareScopeIsolated === true,
    noRealRobotSendFromApp: input.noRealRobotSendFromApp !== false
  };
  Object.entries(gates).forEach(([key, value]) => {
    if (value !== true) blockers.push(`gate_not_met:${key}`);
  });
  if (input.phase38ManualQaComplete !== true) warnings.push('phase38_manual_qa_may_still_be_pending');
  return {
    readinessVersion: 'shime-esp32-expression-readiness-v1',
    gateStatus: blockers.length === 0 ? 'PASS' : 'FAIL',
    gates,
    blockers,
    warnings,
    requiredFirmwareScope: [
      'parse_expression_envelope',
      'validate_required_fields',
      'print_accept_or_reject_log',
      'keep_motion_locked'
    ],
    forbiddenFirmwareScope: [
      'motor_or_servo_control',
      'network_connection',
      'app_data_mutation',
      'external_command_send',
      'secret_material_storage'
    ],
    manualQaRequirements: [
      'flash_log_only_parser_later',
      'send_valid_golden_fixture',
      'send_invalid_golden_fixtures',
      'confirm_accept_reject_logs',
      'confirm_no_motion'
    ],
    recommendation: blockers.length === 0 ? 'READY_FOR_LOG_ONLY_FIRMWARE_PLANNING_REVIEW' : 'MORE_READINESS_WORK_REQUIRED',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_expression_readiness_contract_created']
  };
}

