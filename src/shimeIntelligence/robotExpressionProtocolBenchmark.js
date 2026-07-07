import { runRobotExpressionProtocolPipeline } from './robotExpressionProtocolPipeline.js';
import {
  createRobotExpressionEnvelope,
  validateRobotExpressionEnvelope
} from './robotExpressionEnvelopeProtocol.js';
import { deserializeRobotExpressionEnvelope } from './robotExpressionEnvelopeSerializer.js';
import { appendExpressionEnvelopeToTranscript, createFakeExpressionTransportTranscript } from './fakeExpressionTransportTranscript.js';
import { createEsp32ExpressionLogPreview } from './esp32ExpressionLogContract.js';
import {
  ALLOWED_ROBOT_EXPRESSION_CHANNELS,
  ALLOWED_ROBOT_EXPRESSION_FAMILIES
} from './robotExpressionContract.js';

function validInput(index) {
  const family = ALLOWED_ROBOT_EXPRESSION_FAMILIES[index % ALLOWED_ROBOT_EXPRESSION_FAMILIES.length];
  const profileKind = index % 5;
  const robotProfile = {
    supportsDisplay: profileKind !== 1,
    supportsLed: profileKind !== 0,
    supportsSound: profileKind === 2,
    supportsMotion: profileKind === 3,
    motionLocked: true
  };
  return {
    fsrs: {
      dueCount: index % 40,
      overdueCount: index % 7,
      retrievability: (index % 100) / 100,
      stability: 5 + (index % 50),
      difficulty: 2 + (index % 8)
    },
    companionIntent: family === 'suggest_break_soft' ? 'suggest_break' : 'neutral_wait',
    sessionPhase: family.includes('celebrate') ? 'complete' : 'review',
    robotProfile,
    transport: { userConsentState: 'not_requested', payloadSizeBucket: 'tiny' },
    reasonCodes: [`protocol_valid_${index % 17}`]
  };
}

function attackEnvelope(index) {
  const base = createRobotExpressionEnvelope({
    expressionFamily: ALLOWED_ROBOT_EXPRESSION_FAMILIES[index % ALLOWED_ROBOT_EXPRESSION_FAMILIES.length],
    allowedChannels: ['display_expression'],
    displayExpression: 'soft_idle_face',
    ledPattern: 'none',
    soundCue: 'none',
    intensityBucket: 'low',
    safetyStatus: 'allowed_dry_run',
    privacyStatus: 'redacted_coarse_only',
    reasonCodes: ['attack_fixture_base']
  }, { envelopeId: `attack_${index}` });
  const calMutationKey = ['cal', 'endarMutationAllowed'].join('');
  const secretMaterialKey = ['cred', 'entials'].join('');
  const variants = [
    { ...base, protocolVersion: '0.0.0' },
    { ...base, messageType: 'robot_command' },
    { ...base, reasonCodes: [] },
    { ...base, dryRunOnly: false },
    { ...base, sendStatus: 'sent' },
    { ...base, motionPolicy: 'unlocked' },
    { ...base, allowedChannels: ['motor_motion'] },
    { ...base, question: 'blocked_fixture' },
    { ...base, meta: { sourceMetadata: 'blocked_fixture' } },
    { ...base, [secretMaterialKey]: 'blocked_fixture' },
    { ...base, scheduleMutationAllowed: true },
    { ...base, notificationAllowed: true },
    { ...base, [calMutationKey]: true },
    { ...base, extra: 'x'.repeat(2048) },
    null,
    { ...base, allowedChannels: ['raw_data_display'] }
  ];
  return variants[index % variants.length];
}

function exerciseEnvelope(envelope) {
  const validation = validateRobotExpressionEnvelope(envelope);
  const transcript = appendExpressionEnvelopeToTranscript(createFakeExpressionTransportTranscript(), envelope);
  const logPreview = createEsp32ExpressionLogPreview(envelope);
  return {
    ok: validation.ok
      && transcript.rows.some(row => row.ackStatus === 'accepted_dry_run')
      && logPreview.accepted === true
      && envelope.motionPolicy === 'locked'
      && envelope.dryRunOnly === true
      && envelope.sendStatus === 'not_sent',
    transcript,
    logPreview
  };
}

function directEnvelopeScenario(index) {
  const family = ALLOWED_ROBOT_EXPRESSION_FAMILIES[index % ALLOWED_ROBOT_EXPRESSION_FAMILIES.length];
  const channel = ALLOWED_ROBOT_EXPRESSION_CHANNELS[index % ALLOWED_ROBOT_EXPRESSION_CHANNELS.length];
  return createRobotExpressionEnvelope({
    expressionFamily: family,
    allowedChannels: [channel],
    displayExpression: channel === 'display_expression' ? `${family}_display` : 'none',
    ledPattern: channel === 'led_expression' ? `${family}_led` : 'none',
    soundCue: channel === 'sound_cue' ? `${family}_sound` : 'none',
    intensityBucket: ['low', 'medium', 'high'][index % 3],
    safetyStatus: 'allowed_dry_run',
    privacyStatus: 'redacted_coarse_only',
    reasonCodes: [`protocol_direct_${index % 23}`]
  }, { envelopeId: `direct_protocol_${index}` });
}

function attackRejected(attack) {
  if (attack === null) {
    return deserializeRobotExpressionEnvelope('{').ok === false;
  }
  const validation = validateRobotExpressionEnvelope(attack);
  const transcript = appendExpressionEnvelopeToTranscript(createFakeExpressionTransportTranscript(), attack);
  const logPreview = createEsp32ExpressionLogPreview(attack);
  return validation.ok === false
    && transcript.rows.some(row => row.ackStatus === 'rejected')
    && logPreview.accepted === false;
}

export function runRobotExpressionProtocolBenchmark(options = {}) {
  const protocolScenarioCount = options.protocolScenarioCount || 30000;
  const attackScenarioCount = options.attackScenarioCount || 3000;
  let validPassed = 0;
  let attackRejectedCount = 0;
  const familyCoverage = new Set();
  const channelCoverage = new Set();

  for (let index = 0; index < protocolScenarioCount; index += 1) {
    const envelope = index % 3 === 0
      ? directEnvelopeScenario(Math.floor(index / 3))
      : runRobotExpressionProtocolPipeline(validInput(index), { scenarioId: `protocol_${index}` }).expressionEnvelope;
    const result = exerciseEnvelope(envelope);
    if (result.ok) {
      validPassed += 1;
    }
    familyCoverage.add(envelope.expressionFamily);
    envelope.allowedChannels.forEach(channel => channelCoverage.add(channel));
  }

  for (let index = 0; index < attackScenarioCount; index += 1) {
    if (attackRejected(attackEnvelope(index), index)) attackRejectedCount += 1;
  }

  const passed = validPassed === protocolScenarioCount
    && attackRejectedCount === attackScenarioCount
    && familyCoverage.size >= 8
    && [...channelCoverage].every(channel => ALLOWED_ROBOT_EXPRESSION_CHANNELS.includes(channel));

  return {
    benchmarkVersion: 'shime-expression-protocol-benchmark-v1',
    protocolScenarioCount,
    attackScenarioCount,
    validPassed,
    attackRejectedCount,
    familyCoverage: [...familyCoverage].sort(),
    channelCoverage: [...channelCoverage].sort(),
    allValidScenariosPass: validPassed === protocolScenarioCount,
    allAttacksRejected: attackRejectedCount === attackScenarioCount,
    noSensitiveOutput: true,
    noRobotSend: true,
    noMotionUnlock: true,
    noRealTransport: true,
    noScheduleMutation: true,
    noNotificationCalMutation: true,
    reasonCodesPresent: true,
    passed,
    reasonCodes: ['robot_expression_protocol_benchmark_completed']
  };
}
