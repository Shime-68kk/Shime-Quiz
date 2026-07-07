export function createRobotExpressionProtocolManualQaModel() {
  const items = [
    'Run Section D Shime fusion first.',
    'Run Robot Shime expression preview after fusion.',
    'Confirm fake robot console is visible.',
    'Confirm protocol pipeline preview remains generated-evidence only until a later UI phase.',
    'Confirm there is no send button.',
    'Confirm there is no connect button.',
    'Confirm motion remains locked.',
    'Confirm no raw learning content appears.',
    'Reload the page and confirm dev-only preview state resets.',
    'Confirm StudyRoom behavior is unaffected.',
    'Confirm Device Bridge behavior is unaffected.',
    'Confirm generated protocol artifacts stay dry-run and log-only.'
  ];
  return {
    manualQaVersion: 'shime-expression-protocol-manual-qa-v1',
    itemCount: items.length,
    items,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['robot_expression_protocol_manual_qa_created']
  };
}

