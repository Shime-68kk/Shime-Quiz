export function createEsp32ExpressionParserDesign() {
  return {
    parserDesignVersion: 'shime-esp32-expression-parser-design-v1',
    inputFormat: 'newline_delimited_json',
    maxMessageBytes: 2048,
    requiredFields: [
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
    allowedFamiliesSource: 'app_expression_protocol_v1',
    allowedChannels: ['display_expression', 'led_expression', 'sound_cue', 'idle_presence', 'attention_hint', 'no_op'],
    forbiddenFieldPolicy: 'nested_private_key_and_secret_material_scan',
    unsupportedVersionHandling: 'reject_unknown_major_or_missing_version',
    responseEnvelopeFormat: 'log_only_accept_or_reject_line_plus_json_response',
    safeLogOnlyBehavior: true,
    heapPolicy: 'bounded_line_buffer_preferred_over_unbounded_string_growth',
    dynamicBehaviorPolicy: 'no_dynamic_action_dispatch_beyond_log_labels',
    motionPolicy: 'locked',
    platformioTestPlan: ['compile', 'monitor_valid_vectors', 'monitor_invalid_vectors', 'verify_no_motion'],
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['esp32_expression_parser_design_created']
  };
}

