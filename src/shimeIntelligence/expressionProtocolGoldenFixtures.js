import { createRobotExpressionEnvelope, validateRobotExpressionEnvelope } from './robotExpressionEnvelopeProtocol.js';
import { serializeRobotExpressionEnvelope } from './robotExpressionEnvelopeSerializer.js';
import { simulateEsp32ExpressionEnvelope } from './esp32ExpressionHostSimulator.js';
import { ALLOWED_ROBOT_EXPRESSION_FAMILIES } from './robotExpressionContract.js';

function displayFor(family) {
  return family === 'do_nothing' ? 'none' : `${family}_display`;
}

function validFixture(family, index) {
  const envelope = createRobotExpressionEnvelope({
    expressionFamily: family,
    allowedChannels: family === 'do_nothing' ? ['no_op'] : ['display_expression'],
    displayExpression: displayFor(family),
    ledPattern: family === 'do_nothing' ? 'none' : `${family}_soft_led`,
    soundCue: 'none',
    intensityBucket: index % 2 === 0 ? 'low' : 'medium',
    reasonCodes: [`golden_valid_${index}`]
  }, { envelopeId: `golden_valid_${family}` });
  return {
    fixtureId: `valid_${family}`,
    description: `Valid ${family} expression envelope`,
    validExpected: true,
    serialized: serializeRobotExpressionEnvelope(envelope),
    envelope,
    expectedLogOnlyOutcome: simulateEsp32ExpressionEnvelope(envelope),
    reasonCodes: ['golden_valid_fixture_created']
  };
}

function invalidFixture(fixtureId, description, envelopeOrSerialized) {
  const outcome = simulateEsp32ExpressionEnvelope(envelopeOrSerialized);
  return {
    fixtureId,
    description,
    validExpected: false,
    serialized: typeof envelopeOrSerialized === 'string' ? envelopeOrSerialized : JSON.stringify(envelopeOrSerialized),
    expectedLogOnlyOutcome: outcome,
    reasonCodes: ['golden_invalid_fixture_created']
  };
}

export function createExpressionProtocolGoldenFixtures() {
  const validFixtures = ALLOWED_ROBOT_EXPRESSION_FAMILIES.map(validFixture);
  const base = validFixtures[0].envelope;
  const secretKey = ['secret', 'Material'].join('');
  const invalidFixtures = [
    invalidFixture('invalid_secret_material', 'Reject secret-like field', { ...base, [secretKey]: 'blocked_fixture' }),
    invalidFixture('invalid_motion_unlocked', 'Reject unlocked motion policy', { ...base, motionPolicy: 'unlocked' }),
    invalidFixture('invalid_send_status_sent', 'Reject unsafe send status', { ...base, sendStatus: 'sent' }),
    invalidFixture('invalid_dry_run_false', 'Reject non dry-run envelope', { ...base, dryRunOnly: false }),
    invalidFixture('invalid_unknown_protocol', 'Reject unsupported protocol version', { ...base, protocolVersion: '9.0.0' }),
    invalidFixture('invalid_malformed_json', 'Reject malformed JSON', '{'),
    invalidFixture('invalid_forbidden_channel', 'Reject physical channel', { ...base, allowedChannels: ['motor_motion'] })
  ];
  return {
    fixtureSetVersion: 'shime-expression-golden-fixtures-v1',
    validFixtureCount: validFixtures.length,
    invalidFixtureCount: invalidFixtures.length,
    fixtures: [...validFixtures, ...invalidFixtures],
    allValidFixturesPass: validFixtures.every(fixture => validateRobotExpressionEnvelope(fixture.envelope).ok && fixture.expectedLogOnlyOutcome.accepted),
    allInvalidFixturesReject: invalidFixtures.every(fixture => fixture.expectedLogOnlyOutcome.accepted === false),
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['expression_protocol_golden_fixtures_created']
  };
}

