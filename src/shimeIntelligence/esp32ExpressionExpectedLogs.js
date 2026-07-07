import { simulateEsp32ExpressionEnvelope } from './esp32ExpressionHostSimulator.js';

export function createEsp32ExpressionExpectedLogs(goldenFixtures = {}) {
  const fixtures = goldenFixtures.fixtures || [];
  const logs = fixtures.map(fixture => {
    const result = fixture.validExpected
      ? simulateEsp32ExpressionEnvelope(fixture.envelope)
      : simulateEsp32ExpressionEnvelope(fixture.serialized);
    return {
      fixtureId: fixture.fixtureId,
      expectedStatus: result.accepted ? 'ACCEPT' : 'REJECT',
      logLine: result.logLine,
      rejectedReason: result.rejectedReason,
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    };
  });
  return {
    expectedLogsVersion: 'shime-esp32-expression-expected-logs-v1',
    logs,
    acceptCount: logs.filter(log => log.expectedStatus === 'ACCEPT').length,
    rejectCount: logs.filter(log => log.expectedStatus === 'REJECT').length,
    safetyLog: 'motion locked / no motion',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_expression_expected_logs_created']
  };
}

