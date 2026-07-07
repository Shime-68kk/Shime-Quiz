export function createExpressionProtocolFirmwareQaPlan() {
  const steps = [
    'In a later phase, flash log-only parser firmware.',
    'Open a local log monitor.',
    'Send golden valid neutral envelope.',
    'Confirm ACCEPT log.',
    'Send each valid expression family.',
    'Confirm ACCEPT log-only and no motion.',
    'Send invalid sensitive-key fixture from tests.',
    'Confirm REJECT log.',
    'Send motion-unlocked fixture.',
    'Confirm REJECT log.',
    'Send secret-material fixture.',
    'Confirm REJECT log.',
    'Confirm no pins, motors, or servos move.',
    'Confirm no radio link is required.',
    'Confirm the app still does not send real robot commands.'
  ];
  return {
    qaPlanVersion: 'shime-expression-firmware-qa-plan-v1',
    phase: 'future_log_only_parser_validation',
    stepCount: steps.length,
    steps,
    acceptCriteria: [
      'valid_envelopes_log_accept',
      'invalid_envelopes_log_reject',
      'motion_remains_locked',
      'no_app_send_path',
      'no_data_mutation'
    ],
    rollbackPlan: [
      'remove_parser_firmware_build',
      'return_to_host_simulator_only',
      'keep_app_protocol_artifacts_unchanged'
    ],
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['expression_protocol_firmware_qa_plan_created']
  };
}

