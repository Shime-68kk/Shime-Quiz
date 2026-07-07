export function createEsp32ExpressionSerialQaKit(goldenFixtures = {}) {
  const fixtures = goldenFixtures.fixtures || [];
  const validPayloads = fixtures.filter(fixture => fixture.validExpected).map(fixture => ({
    fixtureId: fixture.fixtureId,
    payload: fixture.serialized,
    expected: 'ACCEPT'
  }));
  const invalidPayloads = fixtures.filter(fixture => !fixture.validExpected).map(fixture => ({
    fixtureId: fixture.fixtureId,
    payload: fixture.serialized,
    expected: 'REJECT'
  }));
  return {
    qaKitVersion: 'shime-esp32-expression-serial-qa-kit-v1',
    qaPayloads: [...validPayloads, ...invalidPayloads],
    validPayloads,
    invalidPayloads,
    expectedAcceptCount: validPayloads.length,
    expectedRejectCount: invalidPayloads.length,
    instructions: [
      'Open future log-only monitor.',
      'Paste one payload per line.',
      'Confirm ACCEPT for valid payloads.',
      'Confirm REJECT for invalid payloads.',
      'Confirm no motion.'
    ],
    copyPasteBlocks: {
      validBlock: validPayloads.map(entry => entry.payload).join('\n'),
      invalidBlock: invalidPayloads.map(entry => entry.payload).join('\n')
    },
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_expression_serial_qa_kit_created']
  };
}

