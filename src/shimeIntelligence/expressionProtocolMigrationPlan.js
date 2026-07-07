function step(goal, allowedChanges, testGate) {
  return {
    goal,
    allowedChanges,
    forbiddenChanges: [
      'raw_learning_content',
      'app_data_mutation',
      'motion_unlock',
      'external_robot_send_without_gate',
      'required_cloud_runtime'
    ],
    testGate,
    manualQaGate: `${goal.replaceAll(' ', '_')}_manual_qa`,
    rollbackPlan: 'return_to_previous_dry_run_artifact_gate',
    safetyStatus: 'dry_run_or_log_only_required'
  };
}

export function createExpressionProtocolMigrationPlan() {
  const steps = [
    step('protocol review', ['host_side_review_reports'], 'protocol_review_pass'),
    step('host simulator', ['host_side_log_only_simulator'], 'host_simulator_pass'),
    step('firmware parser log only', ['isolated_parser_firmware'], 'firmware_log_only_tests_pass'),
    step('serial hardware qa', ['manual_log_monitor_validation'], 'hardware_qa_pass'),
    step('fake server bridge', ['local_fake_bridge_only'], 'fake_bridge_no_send_pass'),
    step('expression only display led', ['display_led_expression_only'], 'expression_only_no_motion_pass'),
    step('lan expression only', ['explicit_local_transport_gate'], 'local_transport_privacy_pass'),
    step('ble provisioning', ['explicit_pairing_prototype'], 'pairing_no_payload_leak_pass'),
    step('presence sensor', ['coarse_presence_signal_only'], 'presence_privacy_pass'),
    step('motion future safety phase', ['planning_only_until_new_gate'], 'motion_safety_review_required')
  ];
  return {
    migrationPlanVersion: 'shime-expression-protocol-migration-plan-v1',
    stepCount: steps.length,
    steps,
    globalRollbackPlan: 'disable_current_phase_and_return_to_host_side_evidence',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['expression_protocol_migration_plan_created']
  };
}

