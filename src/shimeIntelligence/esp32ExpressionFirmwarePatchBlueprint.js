export function createEsp32ExpressionFirmwarePatchBlueprint(options = {}) {
  return {
    blueprintVersion: 'shime-esp32-expression-patch-blueprint-v1',
    targetFilesLikelyToChange: [
      'firmware/esp32-shime-robot/include/ShimeProtocol.h',
      'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
      'firmware/esp32-shime-robot/src/main.cpp',
      'firmware/esp32-shime-robot/protocol.md'
    ],
    newParserResponsibilities: [
      'read_one_json_envelope_per_line',
      'enforce_bounded_message_size',
      'validate_expression_protocol_version',
      'validate_required_expression_fields',
      'validate_allowed_expression_family',
      'validate_allowed_expression_channels',
      'reject_nested_private_keys',
      'print_log_only_accept_or_reject'
    ],
    acceptedEnvelopeFields: [
      'protocol',
      'protocolVersion',
      'envelopeId',
      'messageType',
      'expressionFamily',
      'allowedChannels',
      'displayExpression',
      'ledPattern',
      'soundCue',
      'motionPolicy',
      'dryRunOnly',
      'sendStatus',
      'reasonCodes'
    ],
    rejectedEnvelopeFieldFamilies: [
      'private_learning_content',
      'secret_material',
      'runtime_transport_flags',
      'schedule_mutation_flags',
      'motion_unlock_flags'
    ],
    expectedResponseLogEnvelope: {
      acceptPrefix: 'ACCEPT expression=<family>',
      rejectPrefix: 'REJECT <reason>',
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    },
    serialInputFormat: 'newline_delimited_json_expression_envelope',
    validFixtureExamples: options.validFixtureIds || ['valid_neutral_presence', 'valid_review_due_nudge'],
    invalidFixtureExamples: options.invalidFixtureIds || ['invalid_secret_material', 'invalid_motion_unlocked'],
    requiredSafetyChecks: [
      'bounded_line_length',
      'required_field_check',
      'nested_private_key_scan',
      'secret_material_scan',
      'allowed_channel_check',
      'motion_locked_check',
      'dry_run_check',
      'not_sent_check'
    ],
    noMotionGuarantees: ['no_pin_write', 'no_motor_driver', 'no_servo_attach', 'no_motion_action_dispatch'],
    noRadioRequirement: true,
    noSecretRequirement: true,
    noRawLearningContentRule: true,
    rollbackPlan: ['restore_protocol_files', 'rerun_platformio_build', 'rerun_serial_qa'],
    testPlan: ['compile_parser', 'run_valid_vectors', 'run_invalid_vectors', 'verify_no_motion_logs'],
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_expression_patch_blueprint_created']
  };
}

